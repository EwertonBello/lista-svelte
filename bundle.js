
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.callbacks.push(() => {
                outroing.delete(block);
                if (callback) {
                    block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src\components\Lista.svelte generated by Svelte v3.6.5 */

    const file = "src\\components\\Lista.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.nome = list[i].nome;
    	child_ctx.i = i;
    	return child_ctx;
    }

    // (23:0) {#each itens as {nome}
    function create_each_block(ctx) {
    	var tr, th0, input, t0, td, t1_value = ctx.nome, t1, t2, th1, button, t4, dispose;

    	function click_handler_1() {
    		return ctx.click_handler_1(ctx);
    	}

    	return {
    		c: function create() {
    			tr = element("tr");
    			th0 = element("th");
    			input = element("input");
    			t0 = space();
    			td = element("td");
    			t1 = text(t1_value);
    			t2 = space();
    			th1 = element("th");
    			button = element("button");
    			button.textContent = "Excluir";
    			t4 = space();
    			attr(input, "type", "checkbox");
    			add_location(input, file, 24, 5, 409);
    			add_location(th0, file, 24, 1, 405);
    			attr(td, "class", "svelte-1444hhz");
    			add_location(td, file, 25, 1, 469);
    			attr(button, "class", "button is-danger");
    			add_location(button, file, 26, 5, 514);
    			add_location(th1, file, 26, 1, 510);
    			add_location(tr, file, 23, 0, 398);

    			dispose = [
    				listen(input, "click", ctx.click_handler),
    				listen(button, "click", click_handler_1)
    			];
    		},

    		m: function mount(target, anchor) {
    			insert(target, tr, anchor);
    			append(tr, th0);
    			append(th0, input);
    			append(tr, t0);
    			append(tr, td);
    			append(td, t1);
    			append(tr, t2);
    			append(tr, th1);
    			append(th1, button);
    			append(tr, t4);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.itens) && t1_value !== (t1_value = ctx.nome)) {
    				set_data(t1, t1_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(tr);
    			}

    			run_all(dispose);
    		}
    	};
    }

    function create_fragment(ctx) {
    	var each_1_anchor;

    	var each_value = ctx.itens;

    	var each_blocks = [];

    	for (var i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	return {
    		c: function create() {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			for (var i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert(target, each_1_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (changed.itens) {
    				each_value = ctx.itens;

    				for (var i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach(each_1_anchor);
    			}
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { itens } = $$props;

    	const excluir = (i) => {
    		itens.splice(i, 1);
    		$$invalidate('itens', itens);
    	};

    	const feito = (checkbox) => {
    		let th = checkbox.parentElement;
    		let tr = th.parentElement;
    		tr.querySelector("td").classList.toggle("feito");

    	};

    	const writable_props = ['itens'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Lista> was created with unknown prop '${key}'`);
    	});

    	function click_handler() {
    		return feito(this);
    	}

    	function click_handler_1({ i }) {
    		return excluir(i);
    	}

    	$$self.$set = $$props => {
    		if ('itens' in $$props) $$invalidate('itens', itens = $$props.itens);
    	};

    	return {
    		itens,
    		excluir,
    		feito,
    		click_handler,
    		click_handler_1
    	};
    }

    class Lista extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["itens"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.itens === undefined && !('itens' in props)) {
    			console.warn("<Lista> was created without expected prop 'itens'");
    		}
    	}

    	get itens() {
    		throw new Error("<Lista>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set itens(value) {
    		throw new Error("<Lista>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\components\Home.svelte generated by Svelte v3.6.5 */

    const file$1 = "src\\components\\Home.svelte";

    function create_fragment$1(ctx) {
    	var nav, p, t1, div2, div1, div0, input, t2, button, t4, table, thead, tr, th0, t6, th1, t8, th2, t10, tbody, current, dispose;

    	var lista = new Lista({
    		props: { itens: ctx.itens },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			nav = element("nav");
    			p = element("p");
    			p.textContent = "Lista Svelte";
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Adicionar";
    			t4 = space();
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Feito";
    			t6 = space();
    			th1 = element("th");
    			th1.textContent = "Objetivo";
    			t8 = space();
    			th2 = element("th");
    			th2.textContent = "Ação";
    			t10 = space();
    			tbody = element("tbody");
    			lista.$$.fragment.c();
    			attr(p, "class", "panel-heading");
    			add_location(p, file$1, 25, 1, 415);
    			attr(input, "class", "input is-info");
    			attr(input, "type", "text");
    			attr(input, "placeholder", "Insira o nome do ítem");
    			add_location(input, file$1, 32, 4, 548);
    			attr(div0, "class", "control");
    			add_location(div0, file$1, 31, 3, 521);
    			attr(div1, "class", "field");
    			add_location(div1, file$1, 30, 2, 497);
    			attr(button, "class", "button is-info is-outlined");
    			add_location(button, file$1, 35, 2, 668);
    			attr(div2, "class", "panel-block svelte-ulk3hf");
    			add_location(div2, file$1, 29, 1, 468);
    			add_location(th0, file$1, 41, 4, 811);
    			add_location(th1, file$1, 42, 4, 831);
    			add_location(th2, file$1, 43, 4, 854);
    			add_location(tr, file$1, 40, 3, 801);
    			add_location(thead, file$1, 39, 2, 789);
    			add_location(tbody, file$1, 46, 2, 893);
    			attr(table, "class", "table");
    			add_location(table, file$1, 38, 1, 764);
    			attr(nav, "class", "panel");
    			add_location(nav, file$1, 24, 0, 393);

    			dispose = [
    				listen(input, "input", ctx.input_input_handler),
    				listen(button, "click", ctx.adicionar)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, nav, anchor);
    			append(nav, p);
    			append(nav, t1);
    			append(nav, div2);
    			append(div2, div1);
    			append(div1, div0);
    			append(div0, input);

    			input.value = ctx.item;

    			append(div2, t2);
    			append(div2, button);
    			append(nav, t4);
    			append(nav, table);
    			append(table, thead);
    			append(thead, tr);
    			append(tr, th0);
    			append(tr, t6);
    			append(tr, th1);
    			append(tr, t8);
    			append(tr, th2);
    			append(table, t10);
    			append(table, tbody);
    			mount_component(lista, tbody, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.item && (input.value !== ctx.item)) input.value = ctx.item;

    			var lista_changes = {};
    			if (changed.itens) lista_changes.itens = ctx.itens;
    			lista.$set(lista_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(lista.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(lista.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(nav);
    			}

    			destroy_component(lista, );

    			run_all(dispose);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let item = '';
    	let itens = [{id:1, nome: "Comprar Arroz"},{id:2, nome: "Levar o cachorro pra passear"}];
    	let key = 3;

    	const adicionar = () => {
    		if(item){		
    			$$invalidate('itens', itens = [...itens, {id: key, nome: item}]);
    			$$invalidate('item', item = '');
    			key++;			console.log(itens);
    		}
    	};

    	function input_input_handler() {
    		item = this.value;
    		$$invalidate('item', item);
    	}

    	return {
    		item,
    		itens,
    		adicionar,
    		input_input_handler
    	};
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    	}
    }

    const home = new Home({
    	target: document.body
    });

    return home;

}());
//# sourceMappingURL=bundle.js.map

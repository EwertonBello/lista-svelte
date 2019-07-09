var app=function(){"use strict";function t(){}function n(t){return t()}function e(){return Object.create(null)}function o(t){t.forEach(n)}function r(t){return"function"==typeof t}function i(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function c(t,n){t.appendChild(n)}function a(t,n,e){t.insertBefore(n,e||null)}function s(t){t.parentNode.removeChild(t)}function u(t){return document.createElement(t)}function l(t){return document.createTextNode(t)}function f(){return l(" ")}function d(t,n,e,o){return t.addEventListener(n,e,o),()=>t.removeEventListener(n,e,o)}function p(t,n,e){null==e?t.removeAttribute(n):t.setAttribute(n,e)}let h;function m(t){h=t}const $=[],g=[],v=[],b=[],_=Promise.resolve();let y=!1;function x(t){v.push(t)}function k(){const t=new Set;do{for(;$.length;){const t=$.shift();m(t),E(t.$$)}for(;g.length;)g.pop()();for(let n=0;n<v.length;n+=1){const e=v[n];t.has(e)||(e(),t.add(e))}v.length=0}while($.length);for(;b.length;)b.pop()();y=!1}function E(t){t.fragment&&(t.update(t.dirty),o(t.before_update),t.fragment.p(t.dirty,t.ctx),t.dirty=null,t.after_update.forEach(x))}const w=new Set;let A;function C(t,n){t&&t.i&&(w.delete(t),t.i(n))}function L(t,e,i){const{fragment:c,on_mount:a,on_destroy:s,after_update:u}=t.$$;c.m(e,i),x(()=>{const e=a.map(n).filter(r);s?s.push(...e):o(e),t.$$.on_mount=[]}),u.forEach(x)}function j(t,n){t.$$.fragment&&(o(t.$$.on_destroy),t.$$.fragment.d(n),t.$$.on_destroy=t.$$.fragment=null,t.$$.ctx={})}function N(t,n){t.$$.dirty||($.push(t),y||(y=!0,_.then(k)),t.$$.dirty=e()),t.$$.dirty[n]=!0}function O(n,r,i,c,a,s){const u=h;m(n);const l=r.props||{},f=n.$$={fragment:null,ctx:null,props:s,update:t,not_equal:a,bound:e(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(u?u.$$.context:[]),callbacks:e(),dirty:null};let d=!1;var p;f.ctx=i?i(n,l,(t,e)=>{f.ctx&&a(f.ctx[t],f.ctx[t]=e)&&(f.bound[t]&&f.bound[t](e),d&&N(n,t))}):l,f.update(),d=!0,o(f.before_update),f.fragment=c(f.ctx),r.target&&(r.hydrate?f.fragment.l((p=r.target,Array.from(p.childNodes))):f.fragment.c(),r.intro&&C(n.$$.fragment),L(n,r.target,r.anchor),k()),m(u)}class S{$destroy(){j(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(){}}function q(t,n,e){const o=Object.create(t);return o.nome=n[e].nome,o.i=e,o}function z(t){var n,e,r,i,h,m,$,g,v,b,_,y=t.nome;function x(){return t.click_handler_1(t)}return{c(){n=u("tr"),e=u("th"),r=u("input"),i=f(),h=u("td"),m=l(y),$=f(),g=u("th"),(v=u("button")).textContent="Excluir",b=f(),p(r,"type","checkbox"),p(h,"class","svelte-1444hhz"),p(v,"class","button is-danger"),_=[d(r,"click",t.click_handler),d(v,"click",x)]},m(t,o){a(t,n,o),c(n,e),c(e,r),c(n,i),c(n,h),c(h,m),c(n,$),c(n,g),c(g,v),c(n,b)},p(n,e){var o,r;t=e,n.itens&&y!==(y=t.nome)&&(r=""+(r=y),(o=m).data!==r&&(o.data=r))},d(t){t&&s(n),o(_)}}}function M(n){for(var e,o=n.itens,r=[],i=0;i<o.length;i+=1)r[i]=z(q(n,o,i));return{c(){for(var t=0;t<r.length;t+=1)r[t].c();e=l("")},m(t,n){for(var o=0;o<r.length;o+=1)r[o].m(t,n);a(t,e,n)},p(t,n){if(t.itens){o=n.itens;for(var i=0;i<o.length;i+=1){const c=q(n,o,i);r[i]?r[i].p(t,c):(r[i]=z(c),r[i].c(),r[i].m(e.parentNode,e))}for(;i<r.length;i+=1)r[i].d(1);r.length=o.length}},i:t,o:t,d(t){!function(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}(r,t),t&&s(e)}}}function T(t,n,e){let{itens:o}=n;const r=t=>{o.splice(t,1),e("itens",o)},i=t=>{t.parentElement.parentElement.querySelector("td").classList.toggle("feito")};return t.$set=(t=>{"itens"in t&&e("itens",o=t.itens)}),{itens:o,excluir:r,feito:i,click_handler:function(){return i(this)},click_handler_1:function({i:t}){return r(t)}}}class B extends S{constructor(t){super(),O(this,t,T,M,i,["itens"])}}function F(t){var n,e,r,i,l,h,m,$,g,v,b,_,y,x,k,E,N=new B({props:{itens:t.itens}});return{c(){n=u("nav"),(e=u("p")).textContent="Lista Svelte",r=f(),i=u("div"),l=u("div"),h=u("div"),m=u("input"),$=f(),(g=u("button")).textContent="Adicionar",v=f(),b=u("table"),(_=u("thead")).innerHTML="<tr><th>Feito</th> <th>Objetivo</th> <th>Ação</th></tr>",y=f(),x=u("tbody"),N.$$.fragment.c(),p(e,"class","panel-heading"),p(m,"class","input is-info"),p(m,"type","text"),p(m,"placeholder","Insira o nome do ítem"),p(h,"class","control"),p(l,"class","field"),p(g,"class","button is-info is-outlined"),p(i,"class","panel-block svelte-ulk3hf"),p(b,"class","table"),p(n,"class","panel"),E=[d(m,"input",t.input_input_handler),d(g,"click",t.adicionar)]},m(o,s){a(o,n,s),c(n,e),c(n,r),c(n,i),c(i,l),c(l,h),c(h,m),m.value=t.item,c(i,$),c(i,g),c(n,v),c(n,b),c(b,_),c(b,y),c(b,x),L(N,x,null),k=!0},p(t,n){t.item&&m.value!==n.item&&(m.value=n.item);var e={};t.itens&&(e.itens=n.itens),N.$set(e)},i(t){k||(C(N.$$.fragment,t),k=!0)},o(t){!function(t,n,e){if(t&&t.o){if(w.has(t))return;w.add(t),A.callbacks.push(()=>{w.delete(t),e&&(t.d(1),e())}),t.o(n)}}(N.$$.fragment,t),k=!1},d(t){t&&s(n),j(N),o(E)}}}function H(t,n,e){let o="",r=[{id:1,nome:"Comprar Arroz"},{id:2,nome:"Levar o cachorro pra passear"}],i=3;return{item:o,itens:r,adicionar:()=>{o&&(e("itens",r=[...r,{id:i,nome:o}]),e("item",o=""),i++,console.log(r))},input_input_handler:function(){o=this.value,e("item",o)}}}return new class extends S{constructor(t){super(),O(this,t,H,F,i,[])}}({target:document.body})}();
//# sourceMappingURL=bundle.js.map

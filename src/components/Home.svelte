<script>
	import Lista from './Lista.svelte'

	let item = ''
	let itens = [{id:1, nome: "Comprar Arroz"},{id:2, nome: "Levar o cachorro pra passear"}]
	let key = 3

	const adicionar = () => {
		if(item){		
			itens = [...itens, {id: key, nome: item}]
			item = ''
			key++
			console.log(itens)
		}
	}

</script>

<style>
	.panel-block {
		display: block;
	}
</style>

<nav class="panel">
	<p class="panel-heading">
		Lista Svelte
	</p>

	<div class="panel-block">
		<div class="field">
			<div class="control">
				<input bind:value={item} class="input is-info" type="text" placeholder="Insira o nome do ítem">
			</div>
		</div>
		<button on:click={adicionar} class="button is-info is-outlined">Adicionar</button>
	</div>

	<table class="table">
		<thead>
			<tr>
				<th>Feito</th>
				<th>Objetivo</th>
				<th>Ação</th>
			</tr>
		</thead>
		<tbody>
			<Lista itens={itens}/>
		</tbody>
	</table>
</nav>
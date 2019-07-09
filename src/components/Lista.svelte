<script>
	export let itens;

	const excluir = (i) => {
		itens.splice(i, 1)
		itens = itens;
	}

	const feito = (checkbox) => {
		let th = checkbox.parentElement;
		let tr = th.parentElement;
		tr.querySelector("td").classList.toggle("feito");

	}

</script>

<style>
	/*Riscar itens da lista*/
	.feito { text-decoration: line-through; }
</style>

{#each itens as {nome}, i}
<tr>
	<th><input type="checkbox" on:click={() => feito(this)}></th>
	<td class="svelte-1444hhz">{nome}</td>
	<th><button on:click={() => excluir(i)} class="button is-danger">Excluir</button></th>
</tr>
{/each}
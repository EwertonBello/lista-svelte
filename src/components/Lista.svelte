<script>
	export let itens;

	const excluir = (i) => {
		itens.splice(i, 1)
		itens = itens;
	}

	const feito = (checkbox) => {
		let th = checkbox.parentElement;
		let tr = th.parentElement;
		if(checkbox.checked)
			tr.querySelector("td").style.textDecoration = 'line-through'
		else
			tr.querySelector("td").style.textDecoration = 'none'

	}

</script>

{#each itens as {nome}, i}
<tr>
	<th><input type="checkbox" on:click={() => feito(this)}></th>
	<td>{nome}</td>
	<th><button on:click={() => excluir(i)} class="button is-danger">Excluir</button></th>
</tr>
{/each}
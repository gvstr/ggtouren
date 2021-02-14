<script>
	import { onMount } from 'svelte';

	let name = 'world';

	onMount(async () => {
    let tours = null;
    let res = await fetch(`/api/tour`).then(res => res.json()).then(data => tours = data)
    console.log(tours.message)
	});
</script>

<h1>Hello {name}!</h1>
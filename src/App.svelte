<script>
	import { onMount } from 'svelte';

	let name = 'world';

	onMount(async () => {
		console.log("onmount")
		const res = await fetch(`/api/tour`);
		console.log("fetching")
		tour = await res.json();
		console.log("awaiting")
		console.log(tour.message);
	});
</script>

<h1>Hello {name}!</h1>
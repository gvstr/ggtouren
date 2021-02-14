<script>
	import { onMount } from 'svelte';

	let name = 'world';

	onMount(async () => {
		console.log("onmount")
		//const res = await fetch(`/api/tour`).then(res => res.json()).then(data => console.log(data))
    const res = await fetch(`/api/tour`).then(res => res.json()).then(data => console.log(data))
    console.log(res)
    //const res = await fetch(`/.netlify/backend/tour`).then(res => res.json()).then(data => console.log(data))
	});
</script>

<h1>Hello {name}!</h1>
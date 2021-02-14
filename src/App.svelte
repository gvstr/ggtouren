<script>
  import { onMount } from "svelte";

  let tours = null;

  onMount(async () => {
    let data = await fetch(`/api/tour`).then((res) => res.json());
    tours = data.data;
  });

</script>

{#if tours}
  {#each tours as tour}
    <h1>{tour.name}</h1>
  {/each}
{:else}
  <h1>Loading...</h1>
{/if}

<style>
  h1 {
    color: red;
  }
</style>

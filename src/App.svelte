<script>
  import { onMount } from "svelte";

  let tours = null;
  let rowIds = [];

  onMount(async () => {
    console.log("on mount");
    let data = await fetch(`/api/tour`).then((res) => res.json());
    tours = data.data;
    console.log(tours);
    tours.forEach((x) => rowIds.push({ id: x._id, hidden: true }));
    tours.forEach((year) => {
      year.competitions.forEach((x) =>
        rowIds.push({ id: x._id, hidden: true })
      );
    });
  });

  let toggleId = (id) => {
    rowIds.forEach((x) => {
      if (x.id === id) {
        x.hidden = !x.hidden;
      }
    });
    rowIds = rowIds; // svelte reacts to assignments
    console.log(rowIds);
  };
</script>

<div class="grid">
  {#if tours}
    {#each tours as tour, tourIndex}
      <!-- TOP MOST OBJECT -->
      <span id="tour-header" on:click={() => toggleId(tour._id)}>{tour.name}</span>
      <!-- Sub header starts here -->
      <span class:hidden={rowIds[tourIndex].hidden} id="competition-header">Plats</span>
      <span class:hidden={rowIds[tourIndex].hidden} id="competition-header">Datum</span>
      <span class:hidden={rowIds[tourIndex].hidden} id="competition-header">Status</span>
      <span class:hidden={rowIds[tourIndex].hidden} id="competition-header">Starttid</span>
    {/each}
  {:else}
    <h1>Nothing here</h1>
  {/if}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    border-top: 1px solid black;
    border-right: 1px solid black;
    grid-template-areas: "header header header header";
  }

  .grid > span {
    padding: 8px 4px;
    border-left: 1px solid black;
    border-bottom: 1px solid black;
  }

  #tour-header {
    grid-area: header;
    text-align: center;
  }
  .hidden {
    display: none;
  }
</style>

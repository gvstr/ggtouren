<script>
  import { onMount } from "svelte";

  let tours = null;
  let rowIds = [];

  onMount(async () => {
    let data = await fetch(`/api/tour`).then((res) => res.json());
    tours = data.data;
    console.log(tours)
    tours.forEach((tour) => {
      let temp = [];
      temp.push({ id: tour._id, hidden: true })
        tour.competitions.forEach(competition => {
          temp.push({ id: competition._id, hidden: true })
        })
        rowIds.push(temp);
    });
  });

  let toggleId = (index, id) => {
    console.log("toggle id: "+id)
    rowIds[index].forEach((x) => {
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
      <span id="tour-header" on:click={() => toggleId(tourIndex, rowIds[tourIndex][tourIndex].id)}>{tour.name}</span>
      <!-- Sub header starts here -->
      <span class:hidden={rowIds[tourIndex][tourIndex].hidden} id="competition-header">Plats</span>
      <span class:hidden={rowIds[tourIndex][tourIndex].hidden} id="competition-header">Datum</span>
      <span class:hidden={rowIds[tourIndex][tourIndex].hidden} id="competition-header">Status</span>
      <span class:hidden={rowIds[tourIndex][tourIndex].hidden} id="competition-header">Starttid</span>
      {#each tour.competitions as competition, competitionIndex}
      <!-- Competition rows start here -->
        <span on:click={() => toggleId(tourIndex, rowIds[tourIndex][competitionIndex+1].id)} class:hidden={rowIds[tourIndex][tourIndex].hidden} id="competition-row">{competition.location}</span>
        <span on:click={() => toggleId(tourIndex, rowIds[tourIndex][competitionIndex+1].id)} class:hidden={rowIds[tourIndex][tourIndex].hidden} id="competition-row">{competition.date}</span>
        <span on:click={() => toggleId(tourIndex, rowIds[tourIndex][competitionIndex+1].id)} class:hidden={rowIds[tourIndex][tourIndex].hidden} id="competition-row">{competition.status}</span>
        <span on:click={() => toggleId(tourIndex, rowIds[tourIndex][competitionIndex+1].id)} class:hidden={rowIds[tourIndex][tourIndex].hidden} id="competition-row">{competition.starttime}</span>
        <!-- Individual competition header starts here -->
        <span class:hidden={rowIds[tourIndex][competitionIndex+1].hidden} id="player-row">Namn</span>
        <span class:hidden={rowIds[tourIndex][competitionIndex+1].hidden} id="player-row">Poäng</span>
        <span class:hidden={rowIds[tourIndex][competitionIndex+1].hidden} id="player-row">Extrapoäng</span>
        <span class:hidden={rowIds[tourIndex][competitionIndex+1].hidden} id="player-row">Birdies</span>
        {#each competition.players as player}
          <span class:hidden={rowIds[tourIndex][competitionIndex+1].hidden} id="player-row">{player.name}</span>
          <span class:hidden={rowIds[tourIndex][competitionIndex+1].hidden} id="player-row">{player.points}</span>
          <span class:hidden={rowIds[tourIndex][competitionIndex+1].hidden} id="player-row">{player.extraPoints}</span>
          <span class:hidden={rowIds[tourIndex][competitionIndex+1].hidden} id="player-row">{player.birdies}</span>
        {/each}
      {/each}
    {/each}
  {:else}
    <h1>Nothing here</h1>
  {/if}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-areas: "header header header header";
  }

  .grid > span {
    padding: 4px 2px;
  }

  #tour-header {
    grid-area: header;
    text-align: center;
    background-color: #274C77;
    color: #E7ECEF;
  }
  #competition-header{
    background-color: #478978;
    color: #E7ECEF;
    border-bottom: 1px solid black;
  }
  #competition-row{
    background-color: #6596CD;
    color: #E7ECEF;
    border-bottom: 1px solid black;
  }
  #competition-row{
    background-color: #93B5DC;
    color: #E7ECEF;
    border-bottom: 1px solid black;
  }
  .hidden {
    display: none;
  }
</style>

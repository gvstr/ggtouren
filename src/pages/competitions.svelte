<script>
  import { onMount } from "svelte";
  import Spinner from "../components/Spinner.svelte";

  let tours = null;
  let rowIds = [];

  onMount(async () => {
    let data = await fetch(`/api/tour`).then((res) => res.json());
    tours = data.data;
    tours.forEach((tour) => {
      let temp = [];
      temp.push({ id: tour._id, hidden: !tour.isActive });
      tour.competitions.forEach((competition) => {
        temp.push({ id: competition._id, hidden: true });
      });
      rowIds.push(temp);
    });
  });

  function toggleId(index, id) {
    rowIds[index].forEach((x) => {
      if (x.id === id) {
        x.hidden = !x.hidden;
      }
    });
    rowIds = rowIds; // svelte reacts to assignments
  }

  function toggleHeadlineId(index) {
    rowIds[index].forEach((x, ind) => {
      if (ind == index) {
        x.hidden = !x.hidden;
      } else {
        x.hidden = true;
      }
    });
    rowIds = rowIds; // svelte reacts to assignments
  }

  function sortArray() {}

  function sortByName(tourId, competitionId) {
    console.log("tour id: " + tourId + " competition id: " + competitionId);
    tours.forEach((t) => {
      if (t._id == tourId) {
        t.competitions.forEach((c) => {
          if (c._id == competitionId) {
            console.log("is sorted: " + isSorted(c.players))
            if(isSorted(c.players, "name")){
              c.players.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
            }
            else{
              c.players.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? 0 : -1))
            }
          }
        });
      }
    });
    tours = tours;
  }

  function isSorted(array, property){
    console.log(array)
    return array.sort((a,b) => (a[property] > b[property]) ? 1 : 0)
  }
</script>

<div class="container">
  {#if tours}
    <div class="grid">
      {#each tours as tour, tourIndex}
        <!-- TOP MOST OBJECT -->
        <span class="tour-header" on:click={() => toggleHeadlineId(tourIndex)}
          >{tour.name}</span
        >
        <!-- Sub header starts here -->
        <span
          class:hidden={rowIds[tourIndex][tourIndex].hidden}
          class="competition-header">Plats</span
        >
        <span
          class:hidden={rowIds[tourIndex][tourIndex].hidden}
          class="competition-header">Datum</span
        >
        <span
          class:hidden={rowIds[tourIndex][tourIndex].hidden}
          class="competition-header">Status</span
        >
        <span
          class:hidden={rowIds[tourIndex][tourIndex].hidden}
          class="competition-header">Starttid</span
        >
        {#each tour.competitions as competition, competitionIndex}
          <!-- Competition rows start here -->
          <span
            on:click={() =>
              toggleId(tourIndex, rowIds[tourIndex][competitionIndex + 1].id)}
            class:hidden={rowIds[tourIndex][tourIndex].hidden}
            class="competition-row">{competition.location}</span
          >
          <span
            on:click={() =>
              toggleId(tourIndex, rowIds[tourIndex][competitionIndex + 1].id)}
            class:hidden={rowIds[tourIndex][tourIndex].hidden}
            class="competition-row">{competition.date}</span
          >
          <span
            on:click={() =>
              toggleId(tourIndex, rowIds[tourIndex][competitionIndex + 1].id)}
            class:hidden={rowIds[tourIndex][tourIndex].hidden}
            class="competition-row">{competition.status}</span
          >
          <span
            on:click={() =>
              toggleId(tourIndex, rowIds[tourIndex][competitionIndex + 1].id)}
            class:hidden={rowIds[tourIndex][tourIndex].hidden}
            class="competition-row">{competition.starttime}</span
          >
          <!-- Individual competition header starts here -->
          <span
            class:hidden={rowIds[tourIndex][competitionIndex + 1].hidden}
            class="competition-row-header"
            on:click={() => sortByName(tour._id, competition._id)}>Namn</span
          >
          <span
            class:hidden={rowIds[tourIndex][competitionIndex + 1].hidden}
            class="competition-row-header">Poäng</span
          >
          <span
            class:hidden={rowIds[tourIndex][competitionIndex + 1].hidden}
            class="competition-row-header">Extrapoäng</span
          >
          <span
            class:hidden={rowIds[tourIndex][competitionIndex + 1].hidden}
            class="competition-row-header">Birdies</span
          >
          {#each competition.players as player}
            <span
              class:hidden={rowIds[tourIndex][competitionIndex + 1].hidden}
              class="player-row-name">{player.name}</span
            >
            <span
              class:hidden={rowIds[tourIndex][competitionIndex + 1].hidden}
              class="player-row-points">{player.points}</span
            >
            <span
              class:hidden={rowIds[tourIndex][competitionIndex + 1].hidden}
              class="player-row-extrapoints">{player.extraPoints}</span
            >
            <span
              class:hidden={rowIds[tourIndex][competitionIndex + 1].hidden}
              class="player-row-birdies">{player.birdies}</span
            >
          {/each}
        {/each}
      {/each}
    </div>
  {:else}
    <div class="loading-spinner">
      <Spinner />
    </div>
  {/if}
</div>

<style>
  :global(body) {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  .loading-spinner {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .grid {
    margin-left: auto;
    margin-right: auto;
    min-width: 320px;
    max-width: 500px;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-areas: "header header header header";
  }

  .grid > span {
    padding: 4px 2px;
  }

  .tour-header {
    grid-area: header;
    text-align: center;
    background-color: #274c77;
    color: #e7ecef;
  }
  .competition-header {
    background-color: #478978;
    color: #e7ecef;
    border-bottom: 1px solid black;
  }
  .competition-row {
    background-color: #4f7199;
    color: #e7ecef;
    border-bottom: 1px solid black;
  }
  .competition-row-header {
    background-color: #6591c4;
    color: #e7ecef;
    border-bottom: 1px solid black;
  }
  .hidden {
    display: none;
  }
</style>

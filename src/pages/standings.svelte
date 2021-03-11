<script>
  import { onMount } from "svelte";
  import Spinner from "../components/Spinner.svelte";

  let tours = null;
  let tourResults = [];
  let rowIds = [];
  let playerStats = [];
  let checked = false;

  onMount(async () => {
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({ action: "getAll" }),
    }).then((res) => res.json());
    tours = data.data;
    tours.forEach((tour, index) => {
      console.log(tour);
      rowIds.push({ id: tour._id, hidden: !tour.isActive });
      tour.competitions.forEach((competition) => {
        competition.players.forEach((player) => {
          // Add new player to array of playerStats if name doesnt already exist
          if (!playerStats.find((p) => p.name === player.name))
            playerStats.push({ name: player.name, points: [], sum: null });
          // Add the points of the player to the player stats object
          playerStats.forEach((x) => {
            if (x.name === player.name) {
              x.points.push(player.points + player.extraPoints);
            }
          });
        });
      });
      tourResults.push({ id: tour._id, name: tour.name, result: [] });
      playerStats = setSum(playerStats);
      playerStats = orderArray(playerStats, "sum", true);
      tourResults[index].result = playerStats;
    }); // foreach ends
  });

  function setSum(array) {
    array.forEach((x) => {
      x.sum = x.points.reduce(function (a, b) {
        return a + b;
      }, 0);
    });
    return array;
  }

  function orderArray(array, property, descending) {
    if (descending) {
      array.sort((a, b) => b[property] - a[property]);
    } else {
      array.sort((a, b) => a[property] - b[property]);
    }
    return array;
  }

  function removeSmallestValues(array, numberOfValuesToRemove, property) {
    let temporaryArray = [...array];
    temporaryArray.forEach((x) => {
      //ascending sort, reverse a-b to b-a for descending sort
      x[property] = x[property]
        .sort((a, b) => a - b)
        .slice(numberOfValuesToRemove);
    });
    temporaryArray = setSum(temporaryArray);
    return temporaryArray;
  }

  function copyArray(array) {
    return JSON.parse(JSON.stringify(array));
  }

  function toggleHeadlineId(index) {
    rowIds[index].hidden = !rowIds[index].hidden;
    rowIds = rowIds; // svelte reacts to assignments
  }

  function removeTwoLowestValues(checked, index) {
    if (checked) {
      let arrayCopy = copyArray(playerStats);
      arrayCopy = removeSmallestValues(arrayCopy, 2, "points");
      arrayCopy = orderArray(arrayCopy, "sum", true);
      tourResults[index].result = arrayCopy;
      tourResults = tourResults;
    } else {
      tourResults[index].result = playerStats;
    }
  }
</script>

<div class="container">
  {#if tourResults && tourResults.length > 0}
    <div class="grid">
      {#each tourResults as tr, tourIndex}
        <span class="tour-header" on:click={() => toggleHeadlineId(tourIndex)}
          >{tr.name}</span
        >
        <span class:hidden={rowIds[tourIndex].hidden} class="competition-header"
          >Plats</span
        >
        <span class:hidden={rowIds[tourIndex].hidden} class="competition-header"
          >Spelare</span
        >
        <span class:hidden={rowIds[tourIndex].hidden} class="competition-header"
          >Poäng</span
        >
        {#each tr.result as r, resultIndex}
          <span class:hidden={rowIds[tourIndex].hidden} class="competition-row"
            >{resultIndex + 1}</span
          >
          <span class:hidden={rowIds[tourIndex].hidden} class="competition-row"
            >{r.name}</span
          >
          <span class:hidden={rowIds[tourIndex].hidden} class="competition-row"
            >{r.sum}
          </span>
        {/each}
        <span class:hidden={rowIds[tourIndex].hidden} class="competition-footer"
          ><label
            ><input
              type="checkbox"
              bind:checked
              on:change={() => removeTwoLowestValues(checked, tourIndex)}
            /> Visa med de två lägsta resultaten borttagna</label
          ></span
        >
      {/each}
    </div>
  {:else}
    <div class="loading">
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
    height: 100%;
    max-width: 500px;
    width: 100%;
  }
  .loading {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .grid {
    margin-left: auto;
    margin-right: auto;
    min-width: 320px;
    max-width: 500px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-areas: "header header header";
    border-left: 1px solid black;
    border-right: 1px solid black;
    border-top: 1px solid black;
  }

  .grid > span {
    padding: 4px 2px;
  }

  .tour-header {
    grid-area: header;
    text-align: center;
    background-color: #274c77;
    color: #e7ecef;
    border-bottom: 1px solid black;
  }

  .competition-header {
    background-color: #478978;
    color: #e7ecef;
    border-bottom: 1px solid black;
  }

  .competition-footer {
    background-color: #478978;
    color: #e7ecef;
    border-top: 1px solid black;
    border-bottom: 1px solid black;
    grid-column: auto / span 3;
    text-align: center;
  }

  .hidden {
    display: none;
  }
</style>

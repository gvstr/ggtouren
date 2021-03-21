<script>
  import { onMount } from "svelte";
  import Spinner from "../components/Spinner.svelte";

  let tourStandings = [];

  onMount(async () => {
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({ action: "getAll" }),
    }).then((res) => res.json());
    data.result.forEach((tour, tourIndex) => {
      tourStandings.push({
        id: tour._id,
        name: tour.name,
        expanded: !tour.isActive,
        playerStandings: [],
      });

      tour.competitions.forEach((competition, competitionIndex) => {
        if (competitionIndex == 0) {
          // player doesnt exist in array
          competition.players.forEach((player) => {
            tourStandings[tourIndex].playerStandings.push({
              name: player.name,
              totalPoints: player.points + player.extraPoints,
              extraPoints: player.extraPoints,
              twoLowestRemoved: null,
              points: [player.points],
            });
          });
        } else {
          //player already exists
          competition.players.forEach((player) => {
            tourStandings[tourIndex].playerStandings.forEach((ps) => {
              if (player.name == ps.name) {
                ps.totalPoints += player.points + player.extraPoints;
                ps.points.push(player.points);
              }
            });
          });
        }
      });
    });
    tourStandings.forEach((tour) => {
      tour.playerStandings.forEach((player) => {
        player.twoLowestRemoved = setTwoLowestRemoved(player.points) + player.extraPoints;
      });
      orderArray(tour.playerStandings, "twoLowestRemoved", true);
    });
    tourStandings = tourStandings;
  });

  function setTwoLowestRemoved(array) {
    if (array.length > 2) {
      let copy = array.slice();
      copy.sort();
      copy.splice(0, 2);
      let sum = copy.reduce(function (acc, val) {
        return acc + val;
      }, 0);
      return sum;
    }
    else{
      return array.reduce(function(acc, val) { return acc + val; }, 0)
    }
  }

  function orderArray(array, property, descending) {
    if (descending) {
      array.sort((a, b) => b[property] - a[property]);
    } else {
      array.sort((a, b) => a[property] - b[property]);
    }
    return array;
  }

  function setTourExpanded(tourId) {
    let i = tourStandings.findIndex((x) => x.id == tourId);
    tourStandings[i].expanded = !tourStandings[i].expanded;
    tourStandings = tourStandings;
  }
</script>

{#if tourStandings.length > 0}
  <small>Resultat = Totalpoäng med de två lägsta resultaten borträknade</small>
  {#each tourStandings as tour}
    <table class="tour-table">
      <tr class="tour-header" on:click={setTourExpanded(tour.id)}>
        <th colspan="3">{tour.name}</th>
      </tr>
      <tr class="competition-header" class:hidden={tour.expanded}>
        <th>Namn</th>
        <th>Totala poäng</th>
        <th>Resultat</th>
      </tr>
      {#if tour.playerStandings && tour.playerStandings.length > 0}
        {#each tour.playerStandings as player}
          <tr class="competition" class:hidden={tour.expanded}>
            <td>{player.name}</td>
            <td>{player.totalPoints}</td>
            <td>{player.twoLowestRemoved}</td>
          </tr>
        {/each}
      {/if}
    </table>
  {/each}
{:else}
  <div class="loading">
    <Spinner />
  </div>
{/if}

<style>
  table,
  td,
  tr,
  th {
    margin: 10px;
    border-spacing: 0;
    border-collapse: collapse;
    cursor: pointer;
    text-align: left;
  }
  .loading {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .tour-table {
    max-width: 500px;
    width: 100%;
    /* margin-left: auto;
    margin-right: auto; */
  }
  .tour-header {
    background-color: #6da34d;
    color: white;
    height: 40px;
  }
  .competition {
    background-color: #c5e99b;
    border-bottom: 1px solid #6da34d;
  }
  .hidden {
    display: none;
  }
</style>

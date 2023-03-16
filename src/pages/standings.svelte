<script>
  import { onMount } from "svelte";
  import Spinner from "../components/Spinner.svelte";

  let tourStandings = [];

  onMount(async () => {
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({ action: "getAll" }),
    }).then((res) => res.json());

    tourStandings = sortScores(data);
  });

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

  function sortScores(data) {
    let score = [];
    data.result.forEach((tour, tourIndex) => {
      // If the new array does not already contain a post with this name, add it
      if (!score.some((t) => t.name === tour.name)) {
        score.push({
          id: tour._id,
          name: tour.name,
          expanded: !tour.isActive,
          players: [],
        });
      }
      tour.competitions.forEach((competition) => {
        let played = competition.status == "Spelad";
        competition.players.forEach((player) => {
          // If tour in score array does not contain player name already, add it
          if (!score[tourIndex].players.some((p) => p.name === player.name)) {
            if (played) {
              score[tourIndex].players.push({
                name: player.name,
                totalPoints: player.points + player.extraPoints,
                twoLowestRemoved: 0,
                points: [player.points + player.extraPoints],
              });
            } else {
              score[tourIndex].players.push({
                name: player.name,
                totalPoints: player.points + player.extraPoints,
                twoLowestRemoved: 0,
                //points: [player.points + player.extraPoints],
              });
            }
          } else {
            let currentPlayer = score[tourIndex].players.find(
              (p) => p.name === player.name
            );
            currentPlayer.totalPoints += player.points + player.extraPoints;
            if (played) {
              currentPlayer.points.push(player.points + player.extraPoints);
            }
          }
        }); // end loop
      }); // end loop
    }); // end loop

    score.forEach((tour, index) => {
      tour.players.forEach((player) => {
        if (player.points != null && player.points.length > 2) {
          player.points.sort((a, b) => b - a);
          let t = player.points.filter(
            (element, index) => index < player.points.length - 2
          );
          player.twoLowestRemoved = t.reduce((a, b) => a + b);
        }
      }); // end loop
    }); // end loop

    score.forEach((tour) => {
      orderArray(tour.players, "twoLowestRemoved", true);
    });

    return score;
  }
</script>

{#if tourStandings.length > 0}
  <small
    >Resultat = Totalpoäng med de två lägsta spelade resultaten borträknade</small
  >
  {#each tourStandings as tour}
    <table class="tour-table">
      <tr class="tour-header" on:click={setTourExpanded(tour.id)}>
        <th colspan="3">{tour.name}</th>
      </tr>
      <tr class="competition-header" class:hidden={tour.expanded}>
        <th>Namn</th>
        {#if tour.name == "2022"}
          <th>Total nettoslag</th>
        {:else}
          <th>Totala poäng</th>
        {/if}
        <th>Resultat</th>
      </tr>
      {#if tour.players && tour.players.length > 0}
        {#each tour.players as player}
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

<script>
  import { onMount } from "svelte";
  import Spinner from "../components/Spinner.svelte";

  let tourData = [];

  onMount(async () => {
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({ action: "getAll" }),
    }).then((res) => res.json());
    data.result.forEach((t) => {
      let newTour = {
        id: t._id,
        name: t.name,
        competitions: [],
        expanded: !t.isActive,
      };
      t.competitions.forEach((c) => {
        let newCompetition = {
          id: c._id,
          name: c.location,
          date: c.date,
          status: c.status,
          starttime: c.starttime,
          players: [],
          expanded: true,
        };
        c.players.forEach((p) => {
          let newPlayer = p;
          newPlayer["totalPoints"] = p.points + p.extraPoints;
          newCompetition.players.push(p);
        });
        newTour.competitions.push(newCompetition);
      });
      tourData.push(newTour);
    });
    tourData = tourData;
  });

  function getCompetitionInTour(tourId, competitionId) {
    let competition = null;
    let tour = tourData.filter((tour) => {
      return tour.id === tourId;
    });
    if (tour != null) {
      tour.forEach((t) => {
        let c = t.competitions.filter((tour) => {
          return tour.id === competitionId;
        });
        competition = c;
      });
    }
    return competition;
  }

  function setTourExpanded(tourId) {
    let i = tourData.findIndex((x) => x.id == tourId);
    tourData[i].expanded = !tourData[i].expanded;
    tourData = tourData;
  }

  function setCompetitionExpanded(tourId, competitionId) {
    let ti = tourData.findIndex((x) => x.id == tourId);
    let ci = tourData[ti].competitions.findIndex((x) => x.id == competitionId);
    tourData[ti].competitions[ci].expanded =
      !tourData[ti].competitions[ci].expanded;
    tourData = tourData;
  }
</script>

{#if tourData.length > 0}
  {#each tourData as tour}
    <table class="tour-table">
      <tr class="tour-header" on:click={setTourExpanded(tour.id)}>
        <th colspan="4">{tour.name}</th>
      </tr>
      <tr class="competition-header" class:hidden={tour.expanded}>
        <th>Bana</th>
        <th>Datum</th>
        <th>Status</th>
        <th>Starttid</th>
      </tr>
      {#if tour.competitions && tour.competitions.length > 0}
        {#each tour.competitions as competition}
          <tr
            class="competition"
            class:hidden={tour.expanded}
            on:click={setCompetitionExpanded(tour.id, competition.id)}
          >
            <td>{competition.name}</td>
            <td>{competition.date}</td>
            <td>{competition.status}</td>
            <td>{competition.starttime}</td>
          </tr>
          <tr
            class="player-header"
            class:hidden={competition.expanded || tour.expanded}
          >
            <td>Spelare</td>
            {#if tour.name == "2020" || tour.name == "2021"}
              <td>Poäng</td>
            {:else}
              <td>Nettoslag</td>
            {/if}
            <td>Extrapoäng</td>
            <td>Birdies</td>
          </tr>
          {#each competition.players as player}
            <tr
              class="player"
              class:hidden={competition.expanded || tour.expanded}
            >
              <td>{player.name}</td>
              <td>{player.points}</td>
              <td>{player.extraPoints}</td>
              <td>{player.birdies}</td>
            </tr>
          {/each}
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
    margin-left: auto;
    margin-right: auto;
  }
  .tour-header {
    background-color: #6da34d;
    color: white;
    height: 40px;
  }
  .competition-header {
    /* background-color: #c5e99b; */
    text-align: left;
    border-bottom: 1px solid black;
  }
  .competition {
    background-color: #c5e99b;
    border-bottom: 1px solid #6da34d;
  }
  .player-header {
    background-color: #9cbdd3;
  }
  .player {
    background-color: #f1f7ed;
  }
  .hidden {
    display: none;
  }
</style>

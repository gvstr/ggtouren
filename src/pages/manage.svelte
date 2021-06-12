<script>
  import { onMount } from "svelte";
  import Spinner from "../components/Spinner.svelte";
  import { players } from "../components/players";

  let tourData = [];
  let statuses = ["Preliminär", "Bokad", "Spelad"];
  let emptyCompetitions = [];
  let newTourName = null;
  let waiting = false;

  onMount(async () => {
    await fetchAllTours();
  });

  async function fetchAllTours() {
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({ action: "getAll" }),
    }).then((res) => res.json());
    tourData = data.result;
    tourData.forEach((x) => {
      emptyCompetitions.push({
        location: null,
        date: null,
        status: statuses[0],
        starttime: null,
      });
    });
    tourData = tourData;
  }

  function setTourExpanded(tourId) {
    let i = tourData.findIndex((x) => x._id == tourId);
    tourData[i].expanded = !tourData[i].expanded;
    tourData = tourData;
  }

  function setCompetitionExpanded(tourId, competitionId) {
    let ti = tourData.findIndex((x) => x._id == tourId);
    let ci = tourData[ti].competitions.findIndex((x) => x._id == competitionId);
    tourData[ti].competitions[ci].expanded = !tourData[ti].competitions[ci]
      .expanded;
    tourData = tourData;
  }

  async function addNewTour() {
    waiting = true;
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({
        action: "addNewTour",
        name: newTourName,
        active: false,
      }),
    }).then((res) => res.json());
    await fetchAllTours();
    waiting = false;
    newTourName = null;
  }

  async function deleteTour(id, name) {
    if (confirm(`Vill du ta bort tour ${name}?`)) {
      waiting = true;
      let result = await fetch(`/api/tour`, {
        method: "POST",
        body: JSON.stringify({
          action: "deleteTour",
          id: id,
        }),
      }).then((res) => res.json());
      await fetchAllTours();
      waiting = false;
    }
  }

  async function updateTour(id, name) {
    let tourToUpdate = await getTourById(id)[0];
    if (tourToUpdate) {
      if (confirm(`Vill du uppdatera tour ${name}?`)) {
        waiting = true;
        let result = await fetch(`/api/tour`, {
          method: "POST",
          body: JSON.stringify({
            action: "updateTour",
            id: id,
            document: tourToUpdate,
          }),
        }).then((res) => res.json());
        await fetchAllTours();
        waiting = false;
      }
    }
  }

  function getTourById(id) {
    let tour = tourData.filter((x) => x._id == id);
    tour.map((t) => {
      delete t.enabled;
      return t;
    });
    return tour;
  }

  async function addNewCompetition(tourId, index, name) {
    if (
      emptyCompetitions[index].location &&
      emptyCompetitions[index].date &&
      emptyCompetitions[index].starttime
    ) {
      if (confirm(`Vill du lägga till en tävling i tour ${name}?`)) {
        waiting = true;
        let data = await fetch(`/api/tour`, {
          method: "POST",
          body: JSON.stringify({
            action: "addNewCompetition",
            tourId: tourId,
            location: emptyCompetitions[index].location,
            date: emptyCompetitions[index].date,
            starttime: emptyCompetitions[index].starttime,
            status: emptyCompetitions[index].status,
            players: players,
          }),
        }).then((res) => res.json());
        await fetchAllTours();
        emptyCompetitions[index].location = null;
        emptyCompetitions[index].date = null;
        emptyCompetitions[index].starttime = null;
        emptyCompetitions[index].status = statuses[0];
        waiting = false;
      }
    } else {
      alert("Fyll i alla värden!");
    }
  }

  async function deleteCompetition(tourId, competitionId, name) {
    if (confirm(`Vill du uppdatera tävling i tour ${name}?`)) {
      waiting = true;
      let data = await fetch(`/api/tour`, {
        method: "POST",
        body: JSON.stringify({
          action: "deleteCompetition",
          tourId: tourId,
          competitionId: competitionId,
        }),
      }).then((res) => res.json());
      await fetchAllTours();
      waiting = false;
    }
  }

  async function updateCompetition(tourId, competitionId, name) {
    if (confirm(`Vill du uppdatera tävling i tour ${name}?`)) {
      waiting = true;
      let competition = getCompetitionById(tourId, competitionId);
      console.log(`Date: ${competition.date}`)
      console.log(tourId + " " + competitionId)
      let data = await fetch(`/api/tour`, {
        method: "POST",
        body: JSON.stringify({
          action: "updateCompetition",
          tourId: tourId,
          competitionId: competitionId,
          location: competition.location,
          date: competition.date,
          starttime: competition.starttime,
          status: competition.status,
          players: competition.players
        }),
      }).then((res) => res.json());
      await fetchAllTours();
      waiting = false;
    }
  }

  function getCompetitionById(tourId, competitionId) {
    let result = null;
    tourData.forEach((tour) => {
      if (tour._id == tourId) {
        tour.competitions.forEach((competition) => {
          if (competition._id == competitionId) {
            result = competition;
          }
        });
      }
    });
    return result;
  }

  function resetNewCompetition(tourIndex) {
    emptyCompetitions[tourIndex].location = null;
    emptyCompetitions[tourIndex].date = null;
    emptyCompetitions[tourIndex].starttime = null;
    emptyCompetitions[tourIndex].status = statuses[0];
  }

  async function setTourAsActive(tourId, tourName) {
    if (confirm(`Vill du ändra aktiv tour till ${tourName}?`)) {
      waiting = true;
      let data = await fetch(`/api/tour`, {
        method: "POST",
        body: JSON.stringify({
          action: "setActiveTour",
          tourId: tourId,
        }),
      }).then((res) => res.json());
      await fetchAllTours();
      waiting = false;
    }
  }
</script>

<table class="tour-table">
  <tr class="tour-header">
    <th colspan="3"
      ><input type="text" bind:value={newTourName} placeholder="Namn" /></th
    >
    <th colspan="1"
      ><button class="btn-update" on:click={() => addNewTour()}
        >Lägg till ny tour</button
      ></th
    >
  </tr>
</table>
{#if tourData.length > 0 || waiting}
  {#each tourData as tour, tourIndex}
    <table class="tour-table">
      <tr class="tour-header" on:click={setTourExpanded(tour._id)}>
        <th colspan="3"><input type="text" bind:value={tour.name} /></th>
        <th colspan="1">
          <label>
            <input
              disabled={tour.isActive}
              type="checkbox"
              checked={tour.isActive}
              on:change={() => setTourAsActive(tour._id, tour.name)}
            />
            Aktiv
          </label>
        </th>
        <th colspan="1"
          ><button
            class="btn-update"
            on:click={() => updateTour(tour._id, tour.name)}>Uppdatera</button
          ></th
        >
        <th colspan="1"
          ><button
            class="btn-delete"
            on:click={() => deleteTour(tour._id, tour.name)}>Ta bort</button
          ></th
        >
      </tr>
      <tr class="competition-header" class:hidden={!tour.expanded}>
        <th>Bana</th>
        <th>Datum</th>
        <th>Status</th>
        <th>Starttid</th>
        <th>Ändra</th>
        <th>Ta bort</th>
      </tr>
      {#if tour.competitions && tour.competitions.length > 0}
        {#each tour.competitions as competition}
          <tr
            class="competition"
            class:hidden={!tour.expanded}
            on:click={setCompetitionExpanded(tour._id, competition._id)}
          >
            <td><input type="text" bind:value={competition.location} /></td>
            <td><input type="date" bind:value={competition.date} /></td>
            <td>
              <select bind:value={competition.status}>
                {#each statuses as status}
                  <option value={status}>
                    {status}
                  </option>
                {/each}
              </select>
            </td>
            <td><input type="time" bind:value={competition.starttime} /></td>
            <td>
              <button
                class="btn-update"
                on:click={() =>
                  updateCompetition(tour._id, competition._id, tour.name)}
                >Uppdatera</button
              >
            </td>
            <td>
              <button
                class="btn-delete"
                on:click={() =>
                  deleteCompetition(tour._id, competition._id, tour.name)}
                >Ta bort
              </button>
            </td>
          </tr>
          <tr
            class="player-header"
            class:hidden={!competition.expanded || !tour.expanded}
          >
            <td>Spelare</td>
            <td>Poäng</td>
            <td>Extrapoäng</td>
            <td>Birdies</td>
            <td />
            <td />
          </tr>
          {#each competition.players as player}
            <tr
              class="player"
              class:hidden={!competition.expanded || !tour.expanded}
            >
              <td>{player.name}</td>
              <td
                ><input
                  type="number"
                  min="0"
                  max="9"
                  bind:value={player.points}
                /></td
              >
              <td
                ><input
                  type="number"
                  min="0"
                  max="18"
                  bind:value={player.extraPoints}
                /></td
              >
              <td
                ><input
                  type="number"
                  min="0"
                  max="18"
                  bind:value={player.birdies}
                /></td
              >
              <td />
              <td />
            </tr>
          {/each}
        {/each}
      {/if}
      <tr class="competition" class:hidden={!tour.expanded}>
        <td
          ><input
            type="text"
            bind:value={emptyCompetitions[tourIndex].location}
            placeholder="Bana"
          /></td
        >
        <td
          ><input
            type="date"
            bind:value={emptyCompetitions[tourIndex].date}
          /></td
        >
        <td>
          <select bind:value={emptyCompetitions[tourIndex].status}>
            {#each statuses as status}
              <option value={status}>
                {status}
              </option>
            {/each}
          </select>
        </td>
        <td
          ><input
            type="time"
            bind:value={emptyCompetitions[tourIndex].starttime}
          /></td
        >
        <td>
          <button
            class="btn-update"
            on:click={() => addNewCompetition(tour._id, tourIndex, tour.name)}
            >Lägg till</button
          >
        </td>
        <td>
          <button
            class="btn-delete"
            on:click={() => resetNewCompetition(tourIndex)}>Rensa</button
          >
        </td>
        <td />
      </tr>
    </table>
  {/each}
{:else}
  <div class="loading">
    <Spinner />
  </div>
{/if}

<style>
  :global(body) {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
  input {
    margin: 0;
    padding: 2px;
  }
  input[type="text"] {
    width: 8em;
  }
  input[type="date"] {
    width: 9em;
  }
  select {
    margin: 0;
    padding: 2px;
  }
  .btn-update {
    background-color: green;
    color: white;
    margin: 0;
  }
  .btn-delete {
    background-color: red;
    color: white;
    margin: 0;
  }
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
    max-width: 750px;
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

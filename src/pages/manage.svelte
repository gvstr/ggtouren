<script>
  import { onMount } from "svelte";
  import Spinner from "../components/Spinner.svelte";
  import Competitions from "./competitions.svelte";
  import { players } from "../components/players";

  let tours = null;
  let newTourName = null;
  let addNewTourEnabled = false;
  let waiting = false;
  let statuses = ["Preliminär", "Bokad", "Spelad"];
  let emptyCompetitions = [];

  onMount(async () => {
    await fetchAllTours();
  });

  async function fetchAllTours() {
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({ action: "getAll" }),
    }).then((res) => res.json());
    tours = data.result;

    tours.map((t) => {
      t.enabled = false;
      emptyCompetitions.push({
        location: null,
        date: null,
        startTime: null,
        status: statuses[0],
        players: players,
      });
    });

    console.log(tours);
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

  function checkTourName() {
    for (let i = 0; i < tours.length; i++) {
      if (tours[i].name == newTourName) {
        addNewTourEnabled = true;
        break;
      } else {
        addNewTourEnabled = false;
      }
    }
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
    let tour = tours.filter((x) => x._id == id);
    tour.map((t) => {
      delete t.enabled;
      return t;
    });
    return tour;
  }

  async function setActiveTour(id) {
    waiting = true;
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({
        action: "setActiveTour",
        isActive: newTourName,
      }),
    }).then((res) => res.json());
    await fetchAllTours();
    waiting = false;
  }

  function toggleEnabled(id) {
    tours.forEach((x) => {
      if (x._id === id) {
        x.enabled = !x.enabled;
      }
    });
    tours = tours;
  }

  async function updateCompetition(
    tourId,
    competitionId,
    location,
    date,
    startTime,
    status
  ) {
    waiting = true;
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({
        action: "updateCompetition",
        tourId: tourId,
        competitionId: competitionId,
        location: location,
        date: date,
        starttime: startTime,
        status: status,
      }),
    }).then((res) => res.json());
    await fetchAllTours();
    waiting = false;
  }

  async function addNewCompetition(
    tourId,
    competitionId,
    location,
    date,
    startTime,
    status,
    players,
    index
  ) {
    waiting = true;
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({
        action: "addNewCompetition",
        tourId: tourId,
        competitionId: competitionId,
        location: location,
        date: date,
        starttime: startTime,
        status: status,
        players: players,
      }),
    }).then((res) => res.json());
    await fetchAllTours();

    emptyCompetitions[index].location = null;
    emptyCompetitions[index].date = null;
    emptyCompetitions[index].startTime = null;
    emptyCompetitions[index].status = statuses[0];

    waiting = false;
  }

  function deleteCompetition(tourId, tourName, competitionId) {}
</script>

{#if tours && tours.length > 0}
  <div class="container">
    {#each tours as tour, tourIndex}
      <div class="tour-row">
        <button
          class:expanded={tour.enabled}
          on:click={() => toggleEnabled(tour._id)}>Expandera</button
        >
        <input bind:value={tour.name} />
        <button class="btn-ok" on:click={() => updateTour(tour._id, tour.name)}
          >Uppdatera</button
        >
        <button
          class="btn-delete"
          on:click={() => deleteTour(tour._id, tour.name)}>Ta bort</button
        >
      </div>
      {#if tour.competitions && tour.competitions.length > 0}
        {#each tour.competitions as competition}
          <div class="competition-row" class:hidden={!tour.enabled}>
            <input class="location-input" bind:value={competition.location} />
            <input class="date-input" type="date" bind:value={competition.date} />
            <input class="starttime-input" type="time" bind:value={competition.starttime} />
            <select bind:value={competition.status}>
              {#each statuses as item}
                <option value={item}>{item}</option>
              {/each}
            </select>
            <button
              class="btn-ok"
              on:click={() =>
                updateCompetition(
                  tour._id,
                  competition._id,
                  competition.location,
                  competition.date,
                  competition.starttime,
                  competition.status
                )}>Uppdatera</button
            >
            <button
              class="btn-delete"
              on:click={() =>
                deleteCompetition(tour._id, tour.name, competition._id)}
              >Ta bort</button
            >
          </div>
        {/each}
        <div class="competition-row" class:hidden={!tour.enabled}>
          <input bind:value={emptyCompetitions[tourIndex].location} />
          <input type="date" bind:value={emptyCompetitions[tourIndex].date} />
          <input
            type="time"
            bind:value={emptyCompetitions[tourIndex].starttime}
          />
          <select bind:value={emptyCompetitions[tourIndex].status}>
            {#each statuses as item}
              <option value={item}>{item}</option>
            {/each}
          </select>
          <button
            class="btn-ok"
            on:click={() =>
              addNewCompetition(
                tour._id,
                emptyCompetitions[0]._id,
                emptyCompetitions[0].location,
                emptyCompetitions[0].date,
                emptyCompetitions[0].starttime,
                emptyCompetitions[0].status,
                emptyCompetitions[0],
                tourIndex
              )}>Lägg till ny tävling</button
          >
        </div>
      {/if}
    {/each}
  </div>
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
  .container {
    width: 100%;
    max-width: 500px;
  }
  input{
    height: 25px;
  }
  select{
    padding: 0;
    height: 25px;
  }
  button{
    padding: 0px 2px 0px 2px;
    height: 25px;
  }
  .btn-delete {
    background-color: #ba2926;
    color: white;
  }
  .btn-ok {
    background-color: #0b6e4f;
    color: white;
  }
  .hidden {
    display: none;
  }
  input {
    max-width: 125px;
  }
  .location-input{
    width: 8em;
  } 
  .date-input{
    width: 120em;
  } 
  .competition-row {
    background-color: #888;
    margin-bottom: 10px;
  }
</style>

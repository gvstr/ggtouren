<script>
  import { onMount } from "svelte";
  import Spinner from "../components/Spinner.svelte";

  let tours = null;
  let enabled = [];
  let newTourName = null;
  let addNewTourEnabled = false;
  let waiting = false;

  onMount(async () => {
    await fetchAllTours();
  });

  async function fetchAllTours() {
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({ action: "getAll" }),
    }).then((res) => res.json());
    tours = data.result;

    tours.forEach((t) => {
      enabled.push({ id: t._id, enabled: t.isActive });
      t.competitions.forEach((c) =>
        enabled.push({ id: c._id, enabled: false })
      );
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
      console.log("deleted");
      console.log(result);
      waiting = false;
    }
  }

  async function updateTour(id, name) {
    console.log("tour");
    console.log(await getTourById(id));
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
        console.log("deleted");
        console.log(result);
        waiting = false;
      }
    }
  }

  function getTourById(id) {
    return tours.filter((x) => x._id == id);
  }

  async function setActiveTour(id){
    waiting = true;
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({
        action: "setActiveTour",
        isActive: newTourName
      }),
    }).then((res) => res.json());
    await fetchAllTours();
    waiting = false;
  }
</script>

{#if tours && tours.length > 0}
  <h3>Lägg till ny tour</h3>
  <form on:submit|preventDefault={addNewTour}>
    <input
      bind:value={newTourName}
      on:input={checkTourName}
      class:error={addNewTourEnabled}
    />
    <button type="submit" disabled={addNewTourEnabled}>Skapa ny tour</button>
    <p
      class:hideAddNewTourError={!addNewTourEnabled}
      class:error={addNewTourEnabled}
    >
      Tour med namn {newTourName} finns redan!
    </p>
  </form>
  {#if tours && tours.length > 0 && !waiting}
    {#each tours as tour}
      <table class="table">
        <tr>
          <td><input bind:value={tour.name} /></td>
          <td>
            <label>
              <input type="checkbox" checked={tour.isActive} on:change="{() => setActiveTour(tour.id)}" />
              Aktiv
            </label>
          </td>
          <td>
            <button
              class="btn-ok"
              on:click={() => updateTour(tour._id, tour.name)}>Uppdatera</button
            >
          </td>
          <td>
            <button
              class="btn-delete"
              on:click={() => deleteTour(tour._id, tour.name)}>Ta bort</button
            >
          </td>
        </tr>
      </table>
    {/each}
  {:else}
    <div class="loading">
      <Spinner />
    </div>
  {/if}
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
  h3 {
    margin-bottom: 5px;
    padding: 0px;
  }
  p {
    margin: 0;
    padding: 0;
  }
  .error {
    color: red;
  }
  .hideAddNewTourError {
    display: none;
  }
  .container {
    max-width: 500px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  .loading {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
  td {
    padding: 5px;
  }
  td > * {
    vertical-align: middle;
  }
  table {
    margin: 0;
    max-width: 500px;
    width: 100%;
    border-bottom: 1px solid black;
  }
  tr {
    background-color: #8baaad;
  }
  button {
    margin: 0;
  }
  .btn-delete {
    background-color: #ba2926;
    color: white;
  }
  .btn-ok {
    background-color: #0b6e4f;
    color: white;
  }
</style>

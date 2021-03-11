<script>
  import { onMount } from "svelte";
  import Spinner from "../components/Spinner.svelte";

  let tours = null;
  let newTourName = null;
  let addNewTourEnabled = false;

  onMount(async () => {
    await fetchAllTours();
  });

  async function fetchAllTours() {
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({ action: "getAll" }),
    }).then((res) => res.json());
    tours = data.data;
  }

  async function addNewTour() {
    console.log("adding new tour: " + newTourName);
    let data = await fetch(`/api/tour`, {
      method: "POST",
      body: JSON.stringify({
        action: "addNewTour",
        name: newTourName,
        active: false,
      }),
    }).then((res) => res.json());
    console.log(data);
    //await fetchAllTours();
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
</script>

<div class="container">
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
  .loading-spinner {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>

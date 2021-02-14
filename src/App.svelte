<script>
  import { onMount } from "svelte";

  let tours = null;
  onMount(async () => {
    let data = await fetch(`/api/tour`).then((res) => res.json());
    tours = data.data;
    tours.competitions.forEach(x => {
			rows.push(startCollapsed);
			//rows = [...rows, true]; // Other way of assigning, other way is more readable for me
		});
		rows = rows; // Svelte reacts to assignments
  });

  let authenticated = false;
  let startCollapsed = true;
  let rows = [];
  let sortOuterAscending = null;
  let sortInnerAscending = null;

  function expandRow(index) {
    rows[index] = !rows[index];
  }

  function sortOuterTable(property){
		if(sortOuterAscending == null || sortOuterAscending === false){
			data.competitions = data.competitions.sort((a, b) => a[property].localeCompare(b[property])); //Asc
			sortOuterAscending = true;
		} else {
			data.competitions = data.competitions.sort((a, b) => b[property].localeCompare(a[property])); // Desc
			sortOuterAscending = false;
		}
	}

  function sortInnerTable(property, index, string) {
    if (string) {
      if (sortInnerAscending == null || sortInnerAscending === false) {
        data.competitions.players = data.competitions[
          index
        ].players.sort((a, b) => a[property].localeCompare(b[property])); //Asc
        sortInnerAscending = true;
      } else {
        data.competitions.players = data.competitions[
          index
        ].players.sort((a, b) => b[property].localeCompare(a[property])); // Desc
        sortInnerAscending = false;
      }
    } else {
      if (sortInnerAscending == null || sortInnerAscending === false) {
        data.competitions.players = data.competitions[index].players.sort(
          (a, b) => a[property] - b[property]
        ); // Asc
        sortInnerAscending = true;
      } else {
        data.competitions.players = data.competitions[index].players.sort(
          (a, b) => b[property] - a[property]
        ); // Desc
        sortInnerAscending = false;
      }
    }
  }

  function selectionChanged(id){
		console.log(id);
	}
</script>

{#if tours}
  {#each tours as tour}
    <table class="outer-table">
      <tr class="outer-table-rows">
        <th
          class="outer-table-headers"
          on:click={() => sortOuterTable("location")}>Plats</th
        >
        <th
          class="outer-table-headers"
          on:click={() => sortOuterTable("status")}>Status</th
        >
        <th class="outer-table-headers" on:click={() => sortOuterTable("date")}
          >Datum</th
        >
      </tr>
      {#each tour.competitions as d, i}
        <tr class="outer-table-rows">
          <td class="outer-table-data" on:click={() => expandRow(i)}
            >{d.location}</td
          >
          {#if authenticated}
            <select on:blur={() => selectionChanged(i)}>
              <option value="preliminary">Preliminär</option>
              <option value="booked">Bokad</option>
              <option value="played">Spelad</option>
            </select>
          {:else}
            <td class="outer-table-data">{d.status}</td>
          {/if}
          <td class="outer-table-data" on:click={() => expandRow(i)}
            >{d.date}</td
          >
        </tr>
        <td colspan="3">
          <table class:hidden={rows[i]} class="inner-table">
            <tr class="inner-table-rows">
              <th
                class="inner-table-headers"
                on:click={() => sortInnerTable("name", i, true)}>Namn</th
              >
              <th
                class="inner-table-headers"
                on:click={() => sortInnerTable("points", i, false)}>Poäng</th
              >
              <th
                class="inner-table-headers"
                on:click={() => sortInnerTable("extraPoints", i, false)}
                >Extrapoäng</th
              >
              <th
                class="inner-table-headers"
                on:click={() => sortInnerTable("birdies", i, false)}>Birdies</th
              >
            </tr>
            {#each d.players as p}
              <tr class="inner-table-rows">
                <td class="inner-table-data">{p.name}</td>
                <td class="inner-table-data">{p.points}</td>
                <td class="inner-table-data">{p.extraPoints}</td>
                <td class="inner-table-data">{p.birdies}</td>
              </tr>
            {/each}
          </table>
        </td>
      {/each}
    </table>
  {/each}
{:else}
  <h1>Loading...</h1>
{/if}

<style>
  /* Colors */
  :root {
    --outer-table-headers: #43c59e;
    --outer-table-rows: #d0f0e8;
    --outer-table-border: 1px solid #0e2f25;
    --inner-table-headers: #48beff;
    --inner-table-rows: #ebf8ff;
    --inner-table-border: 1px solid #00507a;
  }

  /* Outer table, expandable rows that shows competitions */
  .outer-table {
    min-width: 100%;
    text-align: left;
    cursor: default;
    border-collapse: collapse;
  }
  .outer-table-rows {
    min-width: 100%;
    background-color: var(--outer-table-rows);
    padding: 2px 10px 2px 10px;
    border-bottom: var(--outer-table-border);
  }
  .outer-table-headers {
    cursor: pointer;
    background-color: var(--outer-table-headers);
    color: #fff;
    padding: 2px 10px 2px 10px;
  }
  .outer-table-data {
    padding: 0px 10px 0px 10px;
    margin: 0;
  }

  /* Inner table, expands and shows players */
  .inner-table {
    width: 98%;
    margin-left: auto;
    margin-right: auto;
    text-align: left;
    cursor: default;
    border-collapse: collapse;
  }
  .inner-table-rows {
    min-width: 100%;
    background-color: var(--inner-table-rows);
    padding: 2px 10px 2px 10px;
    border-bottom: var(--inner-table-border);
  }
  .inner-table-headers {
    cursor: pointer;
    background-color: var(--inner-table-headers);
    color: #fff;
    padding: 2px 10px 2px 10px;
  }
  .inner-table-data {
    padding: 0px 10px 0px 10px;
    margin: 0;
  }

  /* Other css */
  td {
    padding: 0;
  }
  .hidden {
    display: none;
  }
  select {
    background-color: var(--outer-table-rows);
    border: none;
    border-bottom: var(--outer-table-border);
  }
</style>

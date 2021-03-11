<script>
  import { onMount } from "svelte";
  import Competitions from "./pages/competitions.svelte"
  import Standings from "./pages/standings.svelte"
  import Manage from "./pages/manage.svelte"
  import error from "./pages/error.svelte";

  // Only to handle page refreshing.
  onMount(async () => {
    hashChange();
  });
  // All routes with the component to be loaded here, place error/404 last
  let routes = [
    { url: "", component: Competitions },
    { url: "/", component: Competitions },
    { url: "/competitions", component: Competitions },
    { url: "/standings", component: Standings },
    // { url: "/manage", component: Manage },
    { url: "/error", component: error }
  ];
  let route = routes[0].component;
  function setComponent(url) {
    let page = routes.filter(obj => {
      return obj.url === url;
    });
    page.length > 0
      ? (route = page[0].component)
      : (route = routes[routes.length - 1].component);
  }
  let hashChange = () => setComponent(location.hash.replace("#", ""));
  window.onhashchange = hashChange;
</script>

<style>
  .container {
    background-color: #fff;
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  nav{
    max-width: 500px;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }
</style>

<div class="container">
  <nav>
    <button on:click={() => (location.hash = '/')}>Tävlingar</button>
    <!-- <button on:click={() => (location.hash = '/competitions')}>Tävlingar</button> -->
    <button on:click={() => (location.hash = '/standings')}>Ställning</button>
    <!-- <button on:click={() => (location.hash = '/manage')}>Administrera</button> -->
  </nav>
  <svelte:component this={route} />
</div>
<script>
  import { page } from '$app/state';
  import { auth } from '$lib/stores/auth';
</script>

<div class="app">
  <header>
    <nav>
      <div class="name">
        <p>Hotel Booking</p>
      </div>
      <ul class="nav-links">
        <li class={page.url.pathname === '/' ? 'active' : ''}>
          <a href="/">Home</a>
        </li>
        <li class={page.url.pathname === '/hotels' ? 'active' : ''}>
          <a href="/hotels">Hotels</a>
        </li>
        <li class={page.url.pathname === '/rooms' ? 'active' : ''}>
          <a href="/rooms">Rooms</a>
        </li>
        {#if $auth.isAuthenticated}
          <li class={page.url.pathname === '/profile' ? 'active' : ''}>
            <a href="/profile">Profile</a>
          </li>
        {:else}
          <li class={page.url.pathname === '/login' ? 'active' : ''}>
            <a href="/login">Login</a>
          </li>
        {/if}
      </ul>
    </nav>
  </header>
  <main>
    <slot/>
  </main>
</div>

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  header {
    background-color: #1C6EA4;
    color: white;
  }

  nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .name p {
    color: white;
    font-size: 2rem;
    font-weight: bold;
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-links li {
    margin-left: 1.5rem;
  }

  .nav-links a {
    color: white;
    text-decoration: none;
    padding: 0.5rem;
  }

  .nav-links li.active a {
    border-bottom: 2px solid white;
  }

  main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  @media (max-width: 768px) {
    nav {
      flex-direction: column;
    }

    .nav-links {
      margin-top: 1rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    .nav-links li {
      margin: 0.5rem;
    }
  }
</style>
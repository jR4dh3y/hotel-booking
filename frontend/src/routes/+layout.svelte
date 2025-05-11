<script>
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import '../app.css';
  
  $: isAdmin = $auth.user?.role === 'admin';

  function handleLogout() {
    auth.logout();
    goto('/login');
  }
  </script>
  
  {#if isAdmin}
  <div class="app">
    <header class="header">
      <nav class="nav container">
        <div class="logo">
          <a href="/" class="logo-link">Hotel Booking</a>
        </div>
        <ul class="nav-links">
          <li class={page.url.pathname === '/admin/dashboard' ? 'active' : ''}>
            <a href="/admin/dashboard">Dashboard</a>
          </li>
          <li class={page.url.pathname === '/admin/hotels' ? 'active' : ''}>
            <a href="/admin/hotels">Hotels</a>
          </li>
          <li class={page.url.pathname === '/admin/rooms' ? 'active' : ''}>
            <a href="/admin/rooms">Rooms</a>
          </li>
          <li class={page.url.pathname === '/admin/bookings' ? 'active' : ''}>
            <a href="/admin/bookings">Bookings</a>
          </li>
          <li class={page.url.pathname === '/admin/users' ? 'active' : ''}>
            <a href="/admin/users">Users</a>
          </li>
          <li class="logout">
            <a href="#" on:click={handleLogout}>Logout</a>
          </li>
        </ul>
      </nav>
    </header>
    <main class="main">
      <slot/>
    </main>
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>Hotel Booking</h3>
            <p>Find your perfect stay with us</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/admin/dashboard">Admin</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Contact</h4>
            <p>Email: info@hotelbooking.com</p>
            <p>Phone: +1234567890</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
{:else}
  <div class="app">
    <header class="header">
      <nav class="nav container">
        <div class="logo">
          <a href="/" class="logo-link">Hotel Booking</a>
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
            {#if $auth.user?.role === 'admin'}
              <li class={page.url.pathname === '/admin/dashboard' ? 'active' : ''}>
                <a href="/admin/dashboard">Admin</a>
              </li>
            {/if}
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
    <main class="main">
      <slot/>
    </main>
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>Hotel Booking</h3>
            <p>Find your perfect stay with us</p>
          </div>
          <div class="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <!-- <li><a href="/hotels">Hotels</a></li> -->
              <!-- <li><a href="/rooms">Rooms</a></li> -->
              <li><a href="/admin/dashboard">Admin</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h4>Contact</h4>
            <p>Email: info@hotelbooking.com</p>
            <p>Phone: +1234567890</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
{/if}

<style>
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .header {
    background-color: var(--primary);
    color: var(--text-white);
    box-shadow: var(--shadow-md);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md) 0;
  }

  .logo {
    font-size: var(--font-size-xl);
    font-weight: 700;
  }

  .logo-link {
    color: var(--text-white);
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    list-style: none;
    gap: var(--spacing-lg);
    margin: 0;
    padding: 0;
  }

  .nav-links a {
    color: var(--text-white);
    text-decoration: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    transition: background-color var(--transition-fast);
  }

  .nav-links a:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .nav-links .active a {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .main {
    flex: 1;
    padding: var(--spacing-xl) 0;
  }

  .footer {
    background-color: var(--primary);
    color: var(--text-white);
    padding: var(--spacing-xl) 0 var(--spacing-md);
  }

  .footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
  }

  .footer-section h3, .footer-section h4 {
    color: var(--text-white);
    margin-bottom: var(--spacing-md);
  }

  .footer-section ul {
    list-style: none;
    padding: 0;
  }

  .footer-section ul li {
    margin-bottom: var(--spacing-sm);
  }

  .footer-section a {
    color: var(--text-white);
    opacity: 0.8;
    transition: opacity var(--transition-fast);
  }

  .footer-section a:hover {
    opacity: 1;
  }

  @media (max-width: 768px) {
    .nav {
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .nav-links {
      flex-wrap: wrap;
      justify-content: center;
    }

    .footer-content {
      grid-template-columns: 1fr;
      text-align: center;
    }
  }

</style>
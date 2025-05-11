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
    background-color: var(--card-bg);
    color: var(--text-white);
    box-shadow: var(--shadow-lg);
    position: sticky;
    top: 0;
    z-index: 100;
    border-bottom: 1px solid var(--border-color);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
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
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
  }

  .logo-link {
    color: var(--text-white);
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    transition: transform var(--transition-fast);
  }

  .logo-link:hover {
    transform: translateY(-2px);
  }

  .nav-links {
    display: flex;
    list-style: none;
    gap: var(--spacing-md);
    margin: 0;
    padding: 0;
    align-items: center;
  }

  .nav-links a {
    color: var(--text-white);
    text-decoration: none;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
    font-weight: 500;
    position: relative;
  }

  .nav-links a::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background-color: var(--primary);
    transition: all var(--transition-fast);
    transform: translateX(-50%);
  }

  .nav-links a:hover::after {
    width: 80%;
  }

  .nav-links a:hover {
    color: var(--primary);
  }

  .nav-links .active a {
    color: var(--primary);
  }

  .nav-links .active a::after {
    width: 80%;
  }

  .main {
    flex: 1;
    background: linear-gradient(to bottom, var(--background), var(--card-bg));
  }

  .footer {
    background-color: var(--card-bg);
    color: var(--text-white);
    padding: var(--spacing-xl) 0 var(--spacing-md);
    border-top: 1px solid var(--border-color);
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
    font-weight: 600;
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
    transition: all var(--transition-fast);
    display: inline-block;
  }

  .footer-section a:hover {
    opacity: 1;
    color: var(--primary);
    transform: translateX(5px);
  }

  .logout a {
    color: var(--error);
  }

  .logout a:hover {
    color: var(--error);
    background-color: rgba(243, 139, 168, 0.1);
  }

  @media (max-width: 768px) {
    .nav {
      flex-direction: column;
      gap: var(--spacing-md);
      padding: var(--spacing-md);
    }

    .nav-links {
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--spacing-sm);
    }

    .nav-links a {
      padding: var(--spacing-xs) var(--spacing-sm);
    }

    .footer-content {
      grid-template-columns: 1fr;
      text-align: center;
      gap: var(--spacing-lg);
    }

    .footer-section a:hover {
      transform: none;
    }
  }
</style>
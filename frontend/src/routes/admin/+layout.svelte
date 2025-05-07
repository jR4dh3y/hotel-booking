<script lang="ts">
  import { page } from '$app/stores';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  let user: any = null;
  let isSidebarOpen = false;

  onMount(() => {
    const unsubscribe = auth.subscribe((state) => {
      if (state.isAuthenticated && state.user) {
        user = state.user;
      }
    });
    
    return unsubscribe;
  });

  // Toggle sidebar on mobile
  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
  }

  // Close sidebar when clicking outside on mobile
  function handleClickOutside(e: MouseEvent) {
    if (isSidebarOpen && e.target instanceof HTMLElement) {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && !sidebar.contains(e.target) && 
          !e.target.closest('.sidebar-toggle')) {
        isSidebarOpen = false;
      }
    }
  }

  // Handle logout
  async function handleLogout() {
    try {
      const response = await fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        auth.logout();
        goto('/admin/login');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Navigation items
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Hotels', path: '/admin/hotels', icon: '🏨' },
    { name: 'Rooms', path: '/admin/rooms', icon: '🛏️' },
    { name: 'Bookings', path: '/admin/bookings', icon: '📆' },
    { name: 'Users', path: '/admin/users', icon: '👥' }
  ];
  
  // Check if current path is active
  function isActive(path: string) {
    return $page.url.pathname === path || $page.url.pathname.startsWith(`${path}/`);
  }
</script>

<svelte:window on:click={handleClickOutside} />

<div class="admin-layout">
  <!-- Sidebar (desktop) / Off-canvas (mobile) -->
  <aside class="sidebar {isSidebarOpen ? 'open' : ''}" id="sidebar" aria-label="Sidebar navigation">
    <div class="sidebar-header">
      <h2>Admin Panel</h2>
      <button class="sidebar-close" on:click={toggleSidebar} aria-label="Close sidebar">
        &times;
      </button>
    </div>
    
    <nav class="sidebar-nav">
      <ul>
        {#each navItems as item}
          <li class:active={isActive(item.path)}>
            <a href={item.path}>
              <span class="nav-icon">{item.icon}</span>
              <span class="nav-text">{item.name}</span>
            </a>
          </li>
        {/each}
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <a href="/" class="view-site-link">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">View Site</span>
      </a>
      
      <button class="logout-button" on:click={handleLogout}>
        <span class="nav-icon">⬅️</span>
        <span class="nav-text">Logout</span>
      </button>
    </div>
  </aside>
  
  <!-- Main content area -->
  <div class="main-content">
    <header class="admin-header">
      <button class="sidebar-toggle" on:click={toggleSidebar} aria-label="Toggle sidebar">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <div class="header-title">
        {#each navItems as item}
          {#if isActive(item.path)}
            <h1>{item.name}</h1>
          {/if}
        {/each}
      </div>
      
      {#if user}
        <div class="user-info">
          <span class="user-name">{user.name}</span>
          <span class="user-role badge">{user.role}</span>
        </div>
      {/if}
    </header>
    
    <main>
      <!-- Page content -->
      <slot></slot>
    </main>
    
    <footer class="admin-footer">
      <p>Hotel Booking Admin © {new Date().getFullYear()}</p>
    </footer>
  </div>
</div>

<style>
  .admin-layout {
    display: flex;
    min-height: 100vh;
    background-color: #f5f7fa;
  }
  
  /* Sidebar */
  .sidebar {
    width: 260px;
    background-color: #1C6EA4;
    color: white;
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    top: 0;
    left: 0;
    z-index: 1000;
    transition: transform 0.3s ease;
  }
  
  .sidebar-header {
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .sidebar-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: bold;
  }
  
  .sidebar-close {
    display: none;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
  }
  
  .sidebar-nav {
    padding: 1rem 0;
    flex: 1;
  }
  
  .sidebar-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .sidebar-nav li {
    margin-bottom: 0.25rem;
  }
  
  .sidebar-nav a {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: background-color 0.2s, color 0.2s;
  }
  
  .sidebar-nav li.active a {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    font-weight: 500;
    border-left: 4px solid white;
    padding-left: calc(1.5rem - 4px);
  }
  
  .sidebar-nav a:hover {
    background-color: rgba(255, 255, 255, 0.05);
    color: white;
  }
  
  .nav-icon {
    margin-right: 0.75rem;
    width: 24px;
    text-align: center;
  }
  
  .sidebar-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .view-site-link, .logout-button {
    display: flex;
    align-items: center;
    padding: 0.75rem;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.2s;
    font-size: 0.95rem;
    font-weight: 500;
  }
  
  .view-site-link {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .logout-button {
    background-color: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
    border: none;
    cursor: pointer;
    width: 100%;
    text-align: left;
  }
  
  .view-site-link:hover, .logout-button:hover {
    background-color: rgba(255, 255, 255, 0.15);
  }
  
  /* Main content */
  .main-content {
    flex: 1;
    margin-left: 260px;
    display: flex;
    flex-direction: column;
    transition: margin-left 0.3s ease;
  }
  
  .admin-header {
    background-color: white;
    padding: 1rem 2rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 10;
  }
  
  .sidebar-toggle {
    display: none;
    flex-direction: column;
    justify-content: space-between;
    width: 30px;
    height: 21px;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-right: 1.5rem;
  }
  
  .sidebar-toggle span {
    height: 3px;
    width: 100%;
    background-color: #333;
    border-radius: 3px;
    transition: all 0.3s ease;
  }
  
  .header-title {
    flex: 1;
  }
  
  .header-title h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .user-name {
    font-weight: 500;
  }
  
  .user-role.badge {
    background-color: #1C6EA4;
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    font-size: 0.75rem;
    text-transform: uppercase;
  }
  
  main {
    padding: 2rem;
    flex: 1;
  }
  
  .admin-footer {
    background-color: white;
    border-top: 1px solid #eaeaea;
    padding: 1rem 2rem;
    text-align: center;
    color: #666;
    font-size: 0.875rem;
  }
  
  /* Mobile styles */
  @media (max-width: 768px) {
    .sidebar {
      transform: translateX(-100%);
      width: 240px;
    }
    
    .sidebar.open {
      transform: translateX(0);
      box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
    }
    
    .sidebar-close {
      display: block;
    }
    
    .main-content {
      margin-left: 0;
    }
    
    .sidebar-toggle {
      display: flex;
    }
  }
</style>
<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  
  let activeSection = 'dashboard';
  
  // Check if user is admin
  onMount(() => {
    auth.subscribe((state) => {
      if (!state.isAuthenticated || state.user?.role !== 'admin') {
        goto('/login');
      }
    });
  });

  function setActiveSection(section: string) {
    activeSection = section;
  }
</script>

<div class="admin-dashboard">
  <div class="sidebar">
    <h3>Admin Panel</h3>
    <nav class="admin-nav">
      <button 
        class={activeSection === 'dashboard' ? 'active' : ''} 
        on:click={() => setActiveSection('dashboard')}>Dashboard</button>
      <button 
        class={activeSection === 'hotels' ? 'active' : ''} 
        on:click={() => setActiveSection('hotels')}>Hotels</button>
      <button 
        class={activeSection === 'rooms' ? 'active' : ''} 
        on:click={() => setActiveSection('rooms')}>Rooms</button>
      <button 
        class={activeSection === 'bookings' ? 'active' : ''} 
        on:click={() => setActiveSection('bookings')}>Bookings</button>
      <button 
        class={activeSection === 'users' ? 'active' : ''} 
        on:click={() => setActiveSection('users')}>Users</button>
    </nav>
  </div>
  
  <div class="content">
    {#if activeSection === 'dashboard'}
      <div class="dashboard-section">
        <h2>Dashboard</h2>
        <div class="stat-cards">
          <div class="stat-card">
            <h3>Bookings</h3>
            <p class="stat">--</p>
            <p class="label">Total</p>
          </div>
          <div class="stat-card">
            <h3>Revenue</h3>
            <p class="stat">₹--</p>
            <p class="label">Total</p>
          </div>
          <div class="stat-card">
            <h3>Occupancy</h3>
            <p class="stat">--%</p>
            <p class="label">Rooms booked</p>
          </div>
          <div class="stat-card">
            <h3>Users</h3>
            <p class="stat">--</p>
            <p class="label">Registered</p>
          </div>
        </div>
      </div>
    {:else if activeSection === 'hotels'}
      <div class="hotels-section">
        <h2>Manage Hotels</h2>
        <p>Hotel management interface will be implemented here.</p>
      </div>
    {:else if activeSection === 'rooms'}
      <div class="rooms-section">
        <h2>Manage Rooms</h2>
        <p>Room management interface will be implemented here.</p>
      </div>
    {:else if activeSection === 'bookings'}
      <div class="bookings-section">
        <h2>Manage Bookings</h2>
        <p>Booking management interface will be implemented here.</p>
      </div>
    {:else if activeSection === 'users'}
      <div class="users-section">
        <h2>Manage Users</h2>
        <p>User management interface will be implemented here.</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .admin-dashboard {
    display: flex;
    min-height: calc(100vh - 200px);
  }

  .sidebar {
    width: 250px;
    background-color: #f5f5f5;
    padding: 1.5rem;
    border-right: 1px solid #ddd;
  }

  .sidebar h3 {
    color: var(--primary);
    margin-bottom: 1.5rem;
  }

  .admin-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .admin-nav button {
    text-align: left;
    padding: 0.75rem 1rem;
    background-color: transparent;
    color: var(--text-dark);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .admin-nav button:hover {
    background-color: rgba(28, 110, 164, 0.1);
    transform: none;
  }

  .admin-nav button.active {
    background-color: var(--primary);
    color: white;
  }

  .content {
    flex: 1;
    padding: 2rem;
  }

  h2 {
    color: var(--primary);
    margin-bottom: 1.5rem;
  }

  .stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background-color: white;
    border-radius: var(--radius-md);
    padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    text-align: center;
  }

  .stat-card h3 {
    font-size: 1.1rem;
    color: var(--text-light);
    margin-bottom: 0.5rem;
  }

  .stat-card .stat {
    font-size: 2rem;
    font-weight: bold;
    color: var(--primary);
    margin-bottom: 0.25rem;
  }

  .stat-card .label {
    font-size: 0.9rem;
    color: var(--text-light);
  }

  @media (max-width: 768px) {
    .admin-dashboard {
      flex-direction: column;
    }
    
    .sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #ddd;
    }
    
    .admin-nav {
      flex-direction: row;
      flex-wrap: wrap;
    }
    
    .admin-nav button {
      flex: 1;
      min-width: 120px;
    }
  }
</style>
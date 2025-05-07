<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  
  // Dashboard statistics
  let stats = {
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    totalCustomers: 0
  };
  
  // Recent bookings
  let recentBookings = [];
  let loading = true;
  let error = '';
  
  onMount(async () => {
    // Check if user is admin
    const unsubscribe = auth.subscribe((state) => {
      if (!state.isAuthenticated || state.user?.role !== 'admin') {
        goto('/admin/login');
      }
    });
    
    try {
      // Fetch dashboard statistics
      const response = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      stats = data.stats;
      recentBookings = data.recentBookings;
      
    } catch (err) {
      console.error('Dashboard error:', err);
      error = 'Failed to load dashboard data. Please try again.';
    } finally {
      loading = false;
    }
    
    return unsubscribe;
  });
  
  // Format currency
  function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  // Format date
  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  }
</script>

<div class="admin-dashboard">
  <header class="dashboard-header">
    <h1>Admin Dashboard</h1>
    <div class="date-info">
      <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
    </div>
  </header>
  
  {#if loading}
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading dashboard data...</p>
    </div>
  {:else if error}
    <div class="error-message">
      <p>{error}</p>
      <button on:click={() => window.location.reload()}>Try Again</button>
    </div>
  {:else}
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-icon bookings-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="stat-info">
          <h3>Total Bookings</h3>
          <p class="stat-value">{stats.totalBookings}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon revenue-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="stat-info">
          <h3>Total Revenue</h3>
          <p class="stat-value">{formatCurrency(stats.totalRevenue)}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon occupancy-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="stat-info">
          <h3>Occupancy Rate</h3>
          <p class="stat-value">{stats.occupancyRate}%</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon customers-icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div class="stat-info">
          <h3>Total Customers</h3>
          <p class="stat-value">{stats.totalCustomers}</p>
        </div>
      </div>
    </div>
    
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Recent Bookings</h2>
        <a href="/admin/bookings" class="view-all">View All</a>
      </div>
      
      <div class="recent-bookings">
        {#if recentBookings.length === 0}
          <div class="no-data">
            <p>No recent bookings found.</p>
          </div>
        {:else}
          <table class="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each recentBookings as booking}
                <tr>
                  <td>{booking._id.substring(0, 8)}...</td>
                  <td>{booking.customer.firstName} {booking.customer.lastName}</td>
                  <td>{booking.room.roomNumber}</td>
                  <td>{formatDate(booking.checkInDate)}</td>
                  <td>{formatDate(booking.checkOutDate)}</td>
                  <td>
                    <span class="status-badge status-{booking.status.toLowerCase()}">
                      {booking.status}
                    </span>
                  </td>
                  <td>{formatCurrency(booking.totalPrice)}</td>
                  <td class="actions">
                    <a href="/admin/bookings/{booking._id}" class="view-btn">View</a>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .admin-dashboard {
    padding: 1.5rem;
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .dashboard-header h1 {
    font-size: 1.75rem;
    font-weight: 600;
    color: #1a202c;
    margin: 0;
  }
  
  .date-info {
    color: #64748b;
    font-size: 0.95rem;
  }
  
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }
  
  .stat-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.25rem;
    display: flex;
    align-items: center;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .stat-icon {
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    margin-right: 1rem;
  }
  
  .stat-icon svg {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .bookings-icon {
    background-color: #e0f2fe;
    color: #0284c7;
  }
  
  .revenue-icon {
    background-color: #dcfce7;
    color: #16a34a;
  }
  
  .occupancy-icon {
    background-color: #fef3c7;
    color: #ca8a04;
  }
  
  .customers-icon {
    background-color: #ede9fe;
    color: #7c3aed;
  }
  
  .stat-info h3 {
    font-size: 0.875rem;
    color: #64748b;
    margin: 0 0 0.25rem;
    font-weight: 500;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin: 0;
  }
  
  .dashboard-section {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
  }
  
  .section-header h2 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: #1a202c;
  }
  
  .view-all {
    color: #1C6EA4;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
  }
  
  .view-all:hover {
    text-decoration: underline;
  }
  
  .bookings-table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .bookings-table th {
    text-align: left;
    padding: 0.75rem 1rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-weight: 600;
    color: #64748b;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .bookings-table td {
    padding: 1rem;
    font-size: 0.875rem;
    color: #334155;
    border-bottom: 1px solid #e5e7eb;
    white-space: nowrap;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .status-confirmed {
    background-color: #dcfce7;
    color: #16a34a;
  }
  
  .status-completed {
    background-color: #dbeafe;
    color: #2563eb;
  }
  
  .status-cancelled {
    background-color: #fee2e2;
    color: #dc2626;
  }
  
  .status-pending {
    background-color: #fef3c7;
    color: #ca8a04;
  }
  
  .view-btn {
    display: inline-block;
    background-color: #e0f2fe;
    color: #0284c7;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 0.25rem;
    text-decoration: none;
    font-weight: 500;
    transition: background-color 0.15s;
  }
  
  .view-btn:hover {
    background-color: #bae6fd;
  }
  
  .no-data {
    padding: 2rem;
    text-align: center;
    color: #64748b;
    font-style: italic;
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
  }
  
  .loading-spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid #e2e8f0;
    border-top-color: #1C6EA4;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 1rem;
  }
  
  .error-message {
    background-color: #fee2e2;
    color: #b91c1c;
    padding: 1.5rem;
    border-radius: 0.5rem;
    text-align: center;
  }
  
  .error-message button {
    background-color: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-weight: 500;
    margin-top: 1rem;
    cursor: pointer;
  }
  
  .error-message button:hover {
    background-color: #dc2626;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .stat-cards {
      grid-template-columns: 1fr 1fr;
    }
    
    .bookings-table {
      display: block;
      overflow-x: auto;
    }
  }
  
  @media (max-width: 480px) {
    .dashboard-header {
      flex-direction: column;
      align-items: flex-start;
    }
    
    .date-info {
      margin-top: 0.5rem;
    }
    
    .stat-cards {
      grid-template-columns: 1fr;
    }
  }
</style>
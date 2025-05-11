<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import type { Unsubscriber } from 'svelte/store';

  type Booking = {
    _id: string;
    customer: { firstName: string; lastName: string };
    room: { roomNumber: string };
    checkInDate: string;
    checkOutDate: string;
    status: string;
    totalPrice: number;
  };

  type Customer = {
    _id: string;
    firstName: string;
    lastName: string;
  };

  let stats = {
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    totalCustomers: 0
  };

  let recentBookings: Booking[] = [];
  let loading = true;
  let error = '';
  let unsubscribe: Unsubscriber | null = null;

  onMount(() => {
    unsubscribe = auth.subscribe((state) => {
      if (!state.isAuthenticated || state.user?.role !== 'admin') {
        goto('/admin/login');
      }
    });

    (async () => {
      try {
        // Fetch dashboard stats
        console.log('Fetching dashboard stats...');
        const statsResponse = await fetch('http://localhost:3000/api/bookings/stats');
        if (!statsResponse.ok) {
          const errorData = await statsResponse.json();
          throw new Error(`Failed to fetch stats: ${errorData.error || statsResponse.statusText}`);
        }
        stats = await statsResponse.json();
        console.log('Stats fetched successfully:', stats);

        // Fetch recent bookings
        console.log('Fetching recent bookings...');
        const bookingsResponse = await fetch('http://localhost:3000/api/bookings');
        if (!bookingsResponse.ok) {
          const errorData = await bookingsResponse.json();
          throw new Error(`Failed to fetch bookings: ${errorData.error || bookingsResponse.statusText}`);
        }
        const bookings = await bookingsResponse.json();
        console.log('Bookings fetched successfully:', bookings);

        // Transform bookings data to match the frontend format
        recentBookings = bookings
          .map((booking: any) => ({
            _id: booking.booking_id.toString(),
            customer: {
              firstName: booking.user_name?.split(' ')[0] || 'Unknown',
              lastName: booking.user_name?.split(' ')[1] || ''
            },
            room: {
              roomNumber: booking.room_number?.toString() || 'N/A'
            },
            checkInDate: new Date(booking.check_in_date).toISOString(),
            checkOutDate: new Date(booking.check_out_date).toISOString(),
            status: booking.payment_status === 'paid' ? 'Confirmed' : 'Pending',
            totalPrice: booking.total_price || 0
          }))
          .sort((a: Booking, b: Booking) => new Date(b.checkInDate).getTime() - new Date(a.checkInDate).getTime())
          .slice(0, 5);

      } catch (err) {
        console.error('Dashboard error:', err);
        error = err instanceof Error ? err.message : 'Failed to load dashboard data. Please try again.';
      } finally {
        loading = false;
      }
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  });

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function formatDate(dateString: string) {
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
                    <span class="status-badge status-{booking.status ? booking.status.toLowerCase() : ''}">
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
    width: 100%;
  }
  
  .dashboard-header {
    margin-bottom: var(--spacing-xl);
  }
  
  .dashboard-header h1 {
    color: var(--text-white);
    font-size: var(--font-size-2xl);
    font-weight: 600;
    margin-bottom: var(--spacing-sm);
  }
  
  .date-info {
    color: var(--text-light);
    font-size: var(--font-size-base);
  }
  
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }
  
  .stat-card {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
    transition: all var(--transition-fast);
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--spacing-md);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
  }
  
  .stat-info h3 {
    color: var(--text-light);
    font-size: var(--font-size-base);
    font-weight: 500;
    margin-bottom: var(--spacing-xs);
  }
  
  .stat-value {
    color: var(--text-white);
    font-size: var(--font-size-2xl);
    font-weight: 600;
    margin: 0;
  }
  
  .dashboard-section {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
  }
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }
  
  .section-header h2 {
    color: var(--text-white);
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0;
  }
  
  .view-all {
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
    transition: all var(--transition-fast);
  }
  
  .view-all:hover {
    color: var(--primary-dark);
    text-decoration: underline;
  }
  
  .bookings-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
  }
  
  .bookings-table th {
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    font-weight: 600;
    text-align: left;
    padding: var(--spacing-md);
    border-bottom: 2px solid var(--border-color);
    white-space: nowrap;
  }
  
  .bookings-table td {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
    color: var(--text-white);
    vertical-align: middle;
  }
  
  .bookings-table tr:last-child td {
    border-bottom: none;
  }
  
  .bookings-table tr:hover td {
    background-color: rgba(137, 180, 250, 0.1);
  }
  
  .status-badge {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 500;
    text-transform: capitalize;
    white-space: nowrap;
  }
  
  .status-confirmed {
    background-color: rgba(166, 227, 161, 0.2);
    color: var(--success);
    border: 1px solid var(--success);
  }
  
  .status-cancelled {
    background-color: rgba(243, 139, 168, 0.2);
    color: var(--error);
    border: 1px solid var(--error);
  }
  
  .status-pending {
    background-color: rgba(250, 219, 20, 0.2);
    color: var(--warning);
    border: 1px solid var(--warning);
  }
  
  .view-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    text-decoration: none;
    display: inline-block;
  }
  
  .view-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    color: var(--text-light);
  }
  
  .error-message {
    background-color: rgba(243, 139, 168, 0.1);
    color: var(--error);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin: var(--spacing-lg) 0;
    border: 1px solid var(--error);
  }
  
  .no-data {
    text-align: center;
    padding: var(--spacing-xl);
    color: var(--text-light);
  }
  
  @media (max-width: 768px) {
    .stat-cards {
      grid-template-columns: 1fr;
    }
    
    .dashboard-section {
      padding: var(--spacing-lg);
    }
    
    .bookings-table {
      display: block;
      overflow-x: auto;
    }
  }
</style>
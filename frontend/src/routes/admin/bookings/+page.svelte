<script lang="ts">
  import { onMount } from 'svelte';
  
  type AdminBooking = {
    booking_id: number;
    user_id: number;
    room_id: number;
    check_in_date: string;
    check_out_date: string;
    payment_status: 'paid' | 'unpaid';
    user_name: string;
    user_email: string;
    room_number: number;
    hotel_id: number;
    hotel_name: string;
    location: string;
    room_type_id: number;
    room_type: string;
    payment_amount: number;
    duration_days: number;
  };

  let bookings: AdminBooking[] = [];
  let loading = true;
  let error = '';
  
  // For filtering
  let filterStatus: 'all' | 'paid' | 'unpaid' = 'all';
  let searchQuery = '';
  let dateRange: { from: string; to: string } = { from: '', to: '' };
  
  // For sorting
  let sortField: keyof AdminBooking = 'booking_id';
  let sortDirection: 'asc' | 'desc' = 'desc';
  
  onMount(async () => {
    await loadBookings();
  });
  
  async function loadBookings() {
    try {
      loading = true;
      error = '';
      
      const response = await fetch('http://localhost:3000/api/admin/bookings');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load bookings');
      }
      
      bookings = await response.json();
      
      // Convert dates for filtering
      bookings = bookings.map(booking => ({
        ...booking,
        check_in_date: new Date(booking.check_in_date).toISOString().split('T')[0],
        check_out_date: new Date(booking.check_out_date).toISOString().split('T')[0]
      }));
      
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      error = err.message || 'Failed to load bookings';
    } finally {
      loading = false;
    }
  }
  
  function filteredBookings() {
    return sortedBookings().filter(booking => {
      // Filter by payment status
      if (filterStatus !== 'all' && booking.payment_status !== filterStatus) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableFields = [
          booking.user_name,
          booking.user_email,
          booking.hotel_name,
          booking.room_type,
          booking.location,
          String(booking.room_number),
          String(booking.booking_id)
        ];
        
        if (!searchableFields.some(field => field.toLowerCase().includes(query))) {
          return false;
        }
      }
      
      // Filter by date range
      if (dateRange.from && new Date(booking.check_in_date) < new Date(dateRange.from)) {
        return false;
      }
      
      if (dateRange.to && new Date(booking.check_out_date) > new Date(dateRange.to)) {
        return false;
      }
      
      return true;
    });
  }
  
  function sortedBookings() {
    return [...bookings].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle date comparisons
      if (sortField === 'check_in_date' || sortField === 'check_out_date') {
        const dateA = new Date(String(aValue)).getTime();
        const dateB = new Date(String(bValue)).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      // Handle numeric comparisons
      if (
        sortField === 'booking_id' || 
        sortField === 'room_id' || 
        sortField === 'user_id' || 
        sortField === 'payment_amount' ||
        sortField === 'duration_days' ||
        sortField === 'room_number'
      ) {
        return sortDirection === 'asc' ? 
          Number(aValue) - Number(bValue) : 
          Number(bValue) - Number(aValue);
      }
      
      // Handle string comparisons
      return sortDirection === 'asc' ?
        String(aValue).localeCompare(String(bValue)) :
        String(bValue).localeCompare(String(aValue));
    });
  }
  
  function handleSort(field: keyof AdminBooking) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'asc';
    }
  }
  
  function resetFilters() {
    filterStatus = 'all';
    searchQuery = '';
    dateRange = { from: '', to: '' };
  }
  
  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
  
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }
  
  async function handleCancelBooking(bookingId: number) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }
    
    try {
      loading = true;
      
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel booking');
      }
      
      // Reload bookings after cancellation
      await loadBookings();
      
    } catch (err: any) {
      console.error(err);
      error = err.message || 'Failed to cancel booking';
      loading = false;
    }
  }
</script>

<div class="admin-bookings">
  <!-- Filters Section -->
  <div class="filters-section">
    <div class="filters-header">
      <h3>Booking Filters</h3>
      <button class="reset-button" on:click={resetFilters}>Reset</button>
    </div>
    
    <div class="filters-grid">
      <div class="filter-group">
        <label for="search">Search</label>
        <input 
          type="text" 
          id="search" 
          bind:value={searchQuery} 
          placeholder="Search by name, email, hotel..." 
        />
      </div>
      
      <div class="filter-group">
        <label for="status">Payment Status</label>
        <select id="status" bind:value={filterStatus}>
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label for="date-from">Check-in Date (From)</label>
        <input 
          type="date" 
          id="date-from" 
          bind:value={dateRange.from} 
        />
      </div>
      
      <div class="filter-group">
        <label for="date-to">Check-out Date (To)</label>
        <input 
          type="date" 
          id="date-to" 
          bind:value={dateRange.to} 
        />
      </div>
    </div>
  </div>
  
  <!-- Results Section -->
  {#if loading}
    <div class="loading">Loading bookings data...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button class="retry-button" on:click={loadBookings}>Retry</button>
    </div>
  {:else if filteredBookings().length === 0}
    <div class="no-data">
      {#if searchQuery || filterStatus !== 'all' || dateRange.from || dateRange.to}
        No bookings match the current filters.
      {:else}
        No bookings found in the system.
      {/if}
    </div>
  {:else}
    <div class="results-header">
      <h3>Showing {filteredBookings().length} of {bookings.length} bookings</h3>
    </div>
    
    <div class="table-container">
      <table class="bookings-table">
        <thead>
          <tr>
            <th on:click={() => handleSort('booking_id')}>
              ID {sortField === 'booking_id' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th on:click={() => handleSort('user_name')}>
              Guest {sortField === 'user_name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th on:click={() => handleSort('hotel_name')}>
              Hotel {sortField === 'hotel_name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th on:click={() => handleSort('room_number')}>
              Room {sortField === 'room_number' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th on:click={() => handleSort('check_in_date')}>
              Check-in {sortField === 'check_in_date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th on:click={() => handleSort('check_out_date')}>
              Check-out {sortField === 'check_out_date' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th on:click={() => handleSort('duration_days')}>
              Nights {sortField === 'duration_days' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th on:click={() => handleSort('payment_status')}>
              Status {sortField === 'payment_status' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th on:click={() => handleSort('payment_amount')}>
              Payment {sortField === 'payment_amount' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredBookings() as booking}
            <tr>
              <td>#{booking.booking_id}</td>
              <td class="user-info">
                <div>{booking.user_name}</div>
                <div class="small-text">{booking.user_email}</div>
              </td>
              <td>{booking.hotel_name}</td>
              <td>{booking.room_number} ({booking.room_type})</td>
              <td>{formatDate(booking.check_in_date)}</td>
              <td>{formatDate(booking.check_out_date)}</td>
              <td>{booking.duration_days}</td>
              <td>
                <span class="status-badge {booking.payment_status}">
                  {booking.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
                </span>
              </td>
              <td>{formatCurrency(booking.payment_amount)}</td>
              <td class="actions-cell">
                <button 
                  class="action-button delete"
                  on:click={() => handleCancelBooking(booking.booking_id)}
                >
                  Cancel
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .admin-bookings {
    width: 100%;
  }
  
  /* Filters Section */
  .filters-section {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
  }
  
  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .filters-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
  }
  
  .reset-button {
    padding: 0.4rem 1rem;
    background-color: #f5f5f5;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-group label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
  }
  
  .filter-group input,
  .filter-group select {
    padding: 0.6rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.95rem;
  }
  
  /* Results Section */
  .results-header {
    margin-bottom: 1rem;
  }
  
  .results-header h3 {
    font-size: 1rem;
    color: #666;
    margin: 0;
  }
  
  .table-container {
    overflow-x: auto;
    margin-bottom: 2rem;
  }
  
  .bookings-table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .bookings-table th, 
  .bookings-table td {
    padding: 0.85rem;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
    font-size: 0.95rem;
  }
  
  .bookings-table th {
    background-color: #f9f9f9;
    font-weight: 600;
    color: #333;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .bookings-table th:hover {
    background-color: #f0f0f0;
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
  }
  
  .small-text {
    font-size: 0.85rem;
    color: #666;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .status-badge.paid {
    background-color: #d4edda;
    color: #155724;
  }
  
  .status-badge.unpaid {
    background-color: #f8d7da;
    color: #721c24;
  }
  
  .actions-cell {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-button {
    padding: 0.4rem 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    white-space: nowrap;
  }
  
  .action-button.delete {
    background-color: #f44336;
    color: white;
  }
  
  .loading, .error, .no-data {
    padding: 2rem;
    text-align: center;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .error {
    color: #721c24;
    background-color: #f8d7da;
  }
  
  .retry-button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #1C6EA4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    .filters-grid {
      grid-template-columns: 1fr;
    }
    
    .bookings-table {
      font-size: 0.85rem;
    }
    
    .actions-cell {
      flex-direction: column;
    }
  }
</style>
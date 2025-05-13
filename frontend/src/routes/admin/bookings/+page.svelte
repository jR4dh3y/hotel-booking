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
      
      const response = await fetch('http://localhost:3000/api/bookings/admin');
      
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
              <td class="booking-id">#{booking.booking_id.toString().padStart(6, '0')}</td>
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
                <div class="action-buttons">
                  <button 
                    class="action-button delete"
                    on:click={() => handleCancelBooking(booking.booking_id)}
                  >
                    Cancel
                  </button>
                </div>
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
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .filters-section {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
  }
  
  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }
  
  .filters-header h3 {
    color: var(--text-white);
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0;
  }
  
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .filter-group label {
    color: var(--text-light);
    font-weight: 500;
  }
  
  .filter-group input,
  .filter-group select {
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--background);
    color: var(--text-white);
    font-size: var(--font-size-base);
    transition: all var(--transition-fast);
  }
  
  .filter-group input:focus,
  .filter-group select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.15);
  }
  
  .table-container {
    overflow-x: auto;
    margin-bottom: var(--spacing-xl);
    border-radius: var(--radius-lg);
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-lg);
  }
  
  .bookings-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    min-width: 1200px;
  }
  
  .bookings-table th {
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    font-weight: 600;
    text-align: left;
    padding: var(--spacing-md);
    border-bottom: 2px solid var(--border-color);
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  
  .bookings-table td {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
    color: var(--text-white);
    vertical-align: middle;
    white-space: nowrap;
  }
  
  .bookings-table tr:last-child td {
    border-bottom: none;
  }
  
  .bookings-table tr:hover td {
    background-color: rgba(137, 180, 250, 0.1);
  }
  
  .booking-id {
    font-family: monospace;
    font-size: var(--font-size-sm);
    color: var(--text-light);
  }
  
  .user-info {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }
  
  .small-text {
    font-size: var(--font-size-sm);
    color: var(--text-light);
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
  
  .status-paid {
    background-color: rgba(166, 227, 161, 0.2);
    color: var(--success);
    border: 1px solid var(--success);
  }
  
  .status-unpaid {
    background-color: rgba(243, 139, 168, 0.2);
    color: var(--error);
    border: 1px solid var(--error);
  }
  
  .action-buttons {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: flex-end;
  }
  
  .action-button {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
  }
  
  .action-button.delete {
    background: linear-gradient(45deg, var(--error), var(--error-dark));
    color: var(--background);
  }
  
  .action-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .reset-button {
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .reset-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .loading, .error, .no-data {
    padding: var(--spacing-xl);
    text-align: center;
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    color: var(--text-white);
  }
  
  .error {
    color: var(--error);
    background-color: rgba(243, 139, 168, 0.1);
    border-color: var(--error);
  }
  
  .retry-button {
    margin-top: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 500;
    transition: all var(--transition-fast);
  }
  
  .retry-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .results-header {
    margin-bottom: var(--spacing-lg);
  }
  
  .results-header h3 {
    color: var(--text-white);
    font-size: var(--font-size-lg);
    font-weight: 500;
    margin: 0;
  }
    @media (max-width: 768px) {
    .admin-bookings {
      padding: var(--spacing-md);
    }
    
    .filters-section {
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }
    
    .filters-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }
    
    .bookings-table {
      display: block;
      overflow-x: auto;
      font-size: var(--font-size-sm);
    }
    
    .bookings-table th,
    .bookings-table td {
      padding: var(--spacing-sm);
    }
    
    .action-buttons {
      flex-direction: column;
    }
    
    .action-button {
      width: 100%;
    }
  }
</style>
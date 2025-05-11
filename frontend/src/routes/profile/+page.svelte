<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getBookings, cancelBooking } from '$lib/api';
  import { auth } from '$lib/stores/auth';

  type Booking = {
    booking_id: number;
    check_in_date: string;
    check_out_date: string;
    room_number: number;
    hotel_name: string;
    room_type: string;
    payment_status: 'paid' | 'unpaid';
  };

  let bookings: Booking[] = [];
  let loading = true;
  let error = '';
  let userId: number | null = null;
  let userEmail: string = '';
  let userName: string = '';
  let cancelingBookingId: number | null = null;
  let cancelError = '';

  onMount(async () => {
    // Check if user is authenticated
    auth.subscribe((state) => {
      if (!state.isAuthenticated) {
        goto('/login');
        return;
      }
      userId = state.user?.user_id || null;
      userName = state.user?.name || '';
      userEmail = state.user?.email || '';
    });

    if (userId) {
      try {
        bookings = await getBookings(userId);
      } catch (err) {
        error = 'Failed to load your bookings. Please try again later.';
        console.error(err);
      } finally {
        loading = false;
      }
    }
  });

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function handleLogout() {
    auth.logout();
    goto('/login');
  }

  function calculateNights(checkIn: string, checkOut: string) {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  async function handleCancelBooking(bookingId: number) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      console.log('Cancellation cancelled by user');
      return;
    }
    
    try {
      console.log('Starting booking cancellation for ID:', bookingId);
      cancelingBookingId = bookingId;
      cancelError = '';
      
      const result = await cancelBooking(bookingId);
      console.log('Cancellation API response:', result);
      
      // Refresh bookings after cancellation
      if (userId) {
        console.log('Refreshing bookings list for user:', userId);
        const updatedBookings = await getBookings(userId);
        console.log('Updated bookings:', updatedBookings);
        bookings = updatedBookings;
      } else {
        console.warn('No userId available to refresh bookings');
      }
    } catch (err) {
      console.error('Error in handleCancelBooking:', err);
      cancelError = 'Failed to cancel booking. Please try again.';
    } finally {
      cancelingBookingId = null;
    }
  }
</script>

<div class="profile-container">
  <div class="profile-header">
    <div class="user-info">
      <h1>Welcome, {userName}!</h1>
      <p class="email">{userEmail}</p>
    </div>
    <div class="header-actions">
      <button on:click={handleLogout} class="logout-button">Logout</button>
    </div>
  </div>

  <div class="stats-section">
    <div class="stat-card">
      <h3>Total Bookings</h3>
      <p class="stat-value">{bookings.length}</p>
    </div>
    <div class="stat-card">
      <h3>Upcoming Stays</h3>
      <p class="stat-value">
        {bookings.filter(b => new Date(b.check_in_date) > new Date()).length}
      </p>
    </div>
    <div class="stat-card">
      <h3>Completed Stays</h3>
      <p class="stat-value">
        {bookings.filter(b => new Date(b.check_out_date) < new Date()).length}
      </p>
    </div>
  </div>

  <div class="bookings-section">
    <h2>Your Bookings</h2>
    {#if error}
      <div class="error">
        <p>{error}</p>
      </div>
    {/if}

    {#if loading}
      <div class="loading">
        <p>Loading your bookings...</p>
      </div>
    {:else if bookings.length === 0}
      <div class="no-bookings">
        <p>You don't have any bookings yet.</p>
        <a href="/rooms" class="book-now-button">Book a Room Now</a>
      </div>
    {:else}
      <div class="bookings-list">
        {#each bookings as booking}
          <div class="booking-card">
            <div class="booking-header">
              <h3>{booking.hotel_name}</h3>
              <span class="status {booking.payment_status}">
                {booking.payment_status === 'paid' ? 'Paid' : 'Unpaid'}
              </span>
            </div>
            <div class="booking-details">
              <p><strong>Room:</strong> {booking.room_number} ({booking.room_type})</p>
              <p><strong>Check-in:</strong> {formatDate(booking.check_in_date)}</p>
              <p><strong>Check-out:</strong> {formatDate(booking.check_out_date)}</p>
              <p><strong>Duration:</strong> {calculateNights(booking.check_in_date, booking.check_out_date)} nights</p>
              <p><strong>Booking ID:</strong> #{booking.booking_id}</p>
            </div>
            <div class="booking-actions">
              {#if booking.payment_status === 'unpaid'}
                <div class="action-buttons">
                  <a href="/payment/{booking.booking_id}" class="pay-button">Pay Now</a>
                  <button 
                    class="cancel-button" 
                    on:click={() => handleCancelBooking(booking.booking_id)}
                    disabled={cancelingBookingId === booking.booking_id}
                  >
                    {cancelingBookingId === booking.booking_id ? 'Canceling...' : 'Cancel'}
                  </button>
                </div>
              {:else}
                <button 
                  class="cancel-button" 
                  on:click={() => handleCancelBooking(booking.booking_id)}
                  disabled={cancelingBookingId === booking.booking_id}
                >
                  {cancelingBookingId === booking.booking_id ? 'Canceling...' : 'Cancel Booking'}
                </button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}

    {#if cancelError}
      <div class="error">
        <p>{cancelError}</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .profile-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
  }

  .user-info h1 {
    color: var(--text-dark);
    margin: 0;
    font-size: var(--font-size-3xl);
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .email {
    color: var(--text-light);
    margin: var(--spacing-xs) 0 0;
  }

  .logout-button {
    color: var(--text-light);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: var(--error);
    color: var(--background);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 500;
    transition: all var(--transition-fast);
  }

  .logout-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
  }

  .stat-card {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
    text-align: center;
    transition: all var(--transition-fast);
  }

  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
    border-color: var(--primary);
  }

  .stat-card h3 {
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

  .bookings-section {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
  }

  .bookings-section h2 {
    color: var(--text-white);
    font-size: var(--font-size-2xl);
    font-weight: 600;
    margin-bottom: var(--spacing-lg);
  }

  .bookings-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--spacing-lg);
  }

  .booking-card {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: all var(--transition-fast);
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .booking-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary);
  }

  .booking-header {
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    padding: var(--spacing-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .booking-header h3 {
    margin: 0;
    color: var(--text-dark);
    font-size: var(--font-size-lg);
    font-weight: 600;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);

  }

  .status {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .status.paid {
    background-color: var(--success);
    color: var(--text-black);
  }

  .status.unpaid {
    background-color: var(--error);
    color: var(--text-white);
  }

  .booking-details {
    padding: var(--spacing-xl);
    flex: 1;
  }

  .booking-details p {
    margin: var(--spacing-xs) 0;
    color: var(--text-white);
    font-size: var(--font-size-base);
  }

  .booking-details strong {
    color: var(--text-light);
  }

  .booking-actions {
    padding: var(--spacing-lg);
    background-color: var(--card-bg);
    text-align: center;
    border-top: 1px solid var(--border-color);
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
  }

  .pay-button, .cancel-button {
    align-items: center;
    justify-content: center;
    padding: var(--spacing-sm) var(--spacing-lg);
    min-width: 120px;
    display: inline-block;
    width: 100%;
    padding: var(--spacing-md);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--text-black);
    text-align: center;
    text-decoration: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: all var(--transition-fast);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .pay-button {
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--text-dark);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  }

  .pay-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(137, 180, 250, 0.4);
    background: linear-gradient(45deg, var(--primary-dark), var(--primary));
    color: var(--success);
  }

  .cancel-button {
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);

  }

  .cancel-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(137, 180, 250, 0.4);
    background: linear-gradient(45deg, var(--primary-dark), var(--primary));
    color: var(--error);
  }


  .cancel-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .error {
    background-color: rgba(243, 139, 168, 0.1);
    color: var(--error);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-lg);
    border: 1px solid var(--error);
  }

  .loading, .no-bookings {
    text-align: center;
    padding: var(--spacing-2xl);
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    margin-top: var(--spacing-xl);
    color: var(--text-light);
  }

  .book-now-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-top: var(--spacing-md);
    padding: var(--spacing-sm) var(--spacing-lg);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    text-decoration: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: all var(--transition-fast);
  }

  .book-now-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  @media (max-width: 768px) {
    .profile-header {
      flex-direction: column;
      text-align: center;
      gap: var(--spacing-md);
    }

    .stats-section {
      grid-template-columns: 1fr;
    }

    .booking-header {
      flex-direction: column;
      gap: var(--spacing-sm);
      text-align: center;
    }

    .bookings-list {
      grid-template-columns: 1fr;
    }
  }

  .profile-card {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    transition: all var(--transition-fast);
  }

  .profile-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }

  .profile-header {
    padding: var(--spacing-lg);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--text-black);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .profile-header h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
  }

  .profile-body {
    padding: var(--spacing-lg);
  }

  .profile-info {
    margin-bottom: var(--spacing-sm);
    color: var(--text-light);
    font-size: var(--font-size-base);
  }

  .profile-value {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--primary);
  }

  .profile-footer {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
  }

  .edit-btn {
    display: inline-block;
    width: 100%;
    padding: var(--spacing-md);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--text-black);
    text-align: center;
    text-decoration: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: all var(--transition-fast);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .edit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(137, 180, 250, 0.4);
    background: linear-gradient(45deg, var(--primary-dark), var(--primary));
  }

  .booking-card {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    transition: all var(--transition-fast);
  }

  .booking-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }

  .booking-header {
    padding: var(--spacing-lg);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--text-black);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .booking-header h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
  }

  .booking-status {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .booking-status.confirmed {
    background-color: var(--success);
    color: var(--text-black);
  }

  .booking-status.pending {
    background-color: var(--warning);
    color: var(--text-black);
  }

  .booking-status.cancelled {
    background-color: var(--error);
    color: var(--text-white);
  }

  .booking-body {
    padding: var(--spacing-lg);
  }

  .booking-info {
    margin-bottom: var(--spacing-sm);
    color: var(--text-light);
    font-size: var(--font-size-base);
  }

  .booking-value {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--primary);
  }

  .booking-footer {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
  }

  .cancel-btn {
    display: inline-block;
    width: 100%;
    padding: var(--spacing-md);
    background: linear-gradient(45deg, var(--error), var(--error));
    color: var(--text-white);
    text-align: center;
    text-decoration: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: all var(--transition-fast);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .cancel-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(255, 85, 85, 0.4);
    background: linear-gradient(45deg, var(--error), var(--error));
  }
</style> 
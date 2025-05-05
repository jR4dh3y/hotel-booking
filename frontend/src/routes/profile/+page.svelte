<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getBookings } from '$lib/api';
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
                <a href="/payment/{booking.booking_id}" class="pay-button">Pay Now</a>
              {:else}
                <button class="cancel-button">Cancel Booking</button>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .profile-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
  }

  .user-info h1 {
    color: #1C6EA4;
    margin: 0;
    font-size: 2rem;
  }

  .email {
    color: #666;
    margin: 0.5rem 0 0;
  }

  .logout-button {
    padding: 0.5rem 1rem;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .logout-button:hover {
    background-color: #c82333;
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    text-align: center;
  }

  .stat-card h3 {
    color: #666;
    margin: 0 0 0.5rem;
    font-size: 1rem;
  }

  .stat-value {
    color: #1C6EA4;
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
  }

  .bookings-section {
    margin-top: 2rem;
  }

  .bookings-section h2 {
    color: #333;
    margin-bottom: 1.5rem;
  }

  .bookings-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
  }

  .booking-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
  }

  .booking-card:hover {
    transform: translateY(-5px);
  }

  .booking-header {
    background-color: #1C6EA4;
    color: white;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .booking-header h3 {
    margin: 0;
  }

  .status {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .status.paid {
    background-color: #d4edda;
    color: #155724;
  }

  .status.unpaid {
    background-color: #f8d7da;
    color: #721c24;
  }

  .booking-details {
    padding: 1.5rem;
  }

  .booking-details p {
    margin: 0.5rem 0;
  }

  .booking-actions {
    padding: 1rem;
    background-color: #f9f9f9;
    text-align: center;
  }

  .pay-button, .cancel-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: 600;
    text-decoration: none;
    transition: background-color 0.3s ease;
  }

  .pay-button {
    background-color: #28a745;
    color: white;
  }

  .pay-button:hover {
    background-color: #218838;
  }

  .cancel-button {
    background-color: #dc3545;
    color: white;
    border: none;
    cursor: pointer;
  }

  .cancel-button:hover {
    background-color: #c82333;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }

  .loading, .no-bookings {
    text-align: center;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-top: 2rem;
  }

  .book-now-button {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #1C6EA4;
    color: white;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s ease;
  }

  .book-now-button:hover {
    background-color: #155888;
  }
</style> 
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

  onMount(async () => {
    // Check if user is authenticated
    auth.subscribe((state) => {
      if (!state.isAuthenticated) {
        goto('/login');
        return;
      }
      userId = state.user?.user_id || null;
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
</script>

<div class="profile-container">
  <div class="profile-header">
    <h1>My Profile</h1>
    <button on:click={handleLogout} class="logout-button">Logout</button>
  </div>
  <p class="subtitle">Welcome back! Here are your bookings</p>

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
            <p><strong>Booking ID:</strong> #{booking.booking_id}</p>
          </div>
          {#if booking.payment_status === 'unpaid'}
            <a href="/payment/{booking.booking_id}" class="pay-button">Pay Now</a>
          {:else}
            <button class="cancel-button">Cancel Booking</button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
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
    margin-bottom: 1rem;
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

  h1 {
    color: #1C6EA4;
    margin: 0;
  }

  .subtitle {
    color: #666;
    margin-bottom: 2rem;
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
    padding: 1rem;
  }

  .booking-details p {
    margin: 0.5rem 0;
  }

  .pay-button, .cancel-button {
    display: block;
    width: 100%;
    padding: 0.75rem;
    text-align: center;
    text-decoration: none;
    font-weight: bold;
    border: none;
    cursor: pointer;
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
    padding: 0.5rem 1rem;
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
<script lang="ts">
  import { onMount } from 'svelte';
  import { getBookings } from '$lib/api';
  
  type Booking = {
    booking_id: number;
    user_id: number;
    room_id: number;
    check_in_date: string;
    check_out_date: string;
    payment_status: string;
    room_number: number;
    hotel_name: string;
    room_type: string;
  };

  let bookings: Booking[] = [];
  let loading = true;
  let error = '';
  let userId = 1; // In a real app, this would come from an auth store

  onMount(async () => {
    try {
      bookings = await getBookings(userId);
    } catch (err) {
      error = 'Failed to load bookings. Please try again later.';
      console.error(err);
    } finally {
      loading = false;
    }
  });

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<div class="bookings-container">
  <h1>My Bookings</h1>
  <p class="subtitle">View and manage your hotel reservations</p>

  {#if loading}
    <div class="loading">
      <p>Loading your bookings...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
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
  .bookings-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  h1 {
    color: #1C6EA4;
    margin-bottom: 0.5rem;
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
    background-color: #f5f5f5;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .booking-header h3 {
    margin: 0;
    color: #333;
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

  .pay-button, .cancel-button, .book-now-button {
    display: block;
    text-align: center;
    padding: 0.75rem;
    font-weight: bold;
    transition: background-color 0.3s ease;
  }

  .pay-button {
    background-color: #1C6EA4;
    color: white;
    text-decoration: none;
  }

  .pay-button:hover {
    background-color: #155888;
  }

  .cancel-button {
    background-color: #f8d7da;
    color: #721c24;
    border: none;
    cursor: pointer;
    width: 100%;
  }

  .cancel-button:hover {
    background-color: #e5c3c6;
  }

  .book-now-button {
    background-color: #1C6EA4;
    color: white;
    text-decoration: none;
    max-width: 200px;
    margin: 1rem auto;
    border-radius: 4px;
  }

  .loading, .error, .no-bookings {
    text-align: center;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-top: 2rem;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
  }
</style>
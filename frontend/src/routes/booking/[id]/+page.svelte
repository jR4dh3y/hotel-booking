<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { createBooking, getRooms } from '$lib/api';
  import { auth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  
  type Room = {
    room_id: number;
    room_number: number;
    hotel_id: number;
    room_type_id: number;
    price: number;
    availability: string;
    hotel_name: string;
    room_type: string;
  };

  const roomId = parseInt(page.params.id);
  let room: Room | null = null;
  let loading = true;
  let error = '';
  let checkInDate = '';
  let checkOutDate = '';
  let bookingSuccess = false;
  let userId: number | null = null;
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
    });

    if (!userId) return;

    try {
      // Get the specific room details
      const rooms = await getRooms();
      room = rooms.find((r: Room) => r.room_id === roomId) || null;
      
      if (!room) {
        error = 'Room not found';
      } else if (room.availability === 'booked') {
        error = 'This room is already booked';
      }
      
      // Set default dates (today and tomorrow)
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      checkInDate = formatDateForInput(today);
      checkOutDate = formatDateForInput(tomorrow);
    } catch (err) {
      error = 'Failed to load room details. Please try again later.';
      console.error(err);
    } finally {
      loading = false;
    }
  });

  function formatDateForInput(date: Date) {
    return date.toISOString().split('T')[0];
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }

  async function handleBooking() {
    if (!room || !userId) return;
    
    // Validate dates
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    
    if (inDate >= outDate) {
      error = 'Check-out date must be after check-in date';
      return;
    }
    
    try {
      loading = true;
      error = '';
      
      const bookingData = {
        user_id: userId,
        room_id: roomId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate
      };
      
      await createBooking(bookingData);
      bookingSuccess = true;
    } catch (err) {
      console.error(err);
      error = 'Failed to create booking. Please try again.';
    } finally {
      loading = false;
    }
  }

  function calculateTotalPrice() {
    if (!room) return 0;
    
    const inDate = new Date(checkInDate);
    const outDate = new Date(checkOutDate);
    const nights = Math.max(1, Math.floor((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    return room.price * nights;
  }
</script>

<div class="booking-container">
  {#if loading}
    <div class="loading">
      <p>Loading room details...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <a href="/rooms" class="back-button">Back to Rooms</a>
    </div>
  {:else if bookingSuccess}
    <div class="success">
      <h2>Booking Successful!</h2>
      <p>Your room has been booked successfully.</p>
      <div class="success-actions">
        <a href="/profile" class="view-bookings-button">View My Bookings</a>
        <a href="/rooms" class="back-button">Browse More Rooms</a>
      </div>
    </div>
  {:else if room}
    <h1>Book Room {room.room_number}</h1>
    <div class="room-summary">
      <h2>{room.hotel_name}</h2>
      <p class="room-type">{room.room_type} Room</p>
      <p class="room-price">{formatPrice(room.price)} per night</p>
    </div>
    
    <div class="user-info">
      <h3>Booking for: {userName}</h3>
    </div>
    
    <form on:submit|preventDefault={handleBooking} class="booking-form">
      <div class="form-group">
        <label for="check-in">Check-in Date</label>
        <input 
          type="date" 
          id="check-in" 
          bind:value={checkInDate} 
          min={formatDateForInput(new Date())}
          required
        />
      </div>
      
      <div class="form-group">
        <label for="check-out">Check-out Date</label>
        <input 
          type="date" 
          id="check-out" 
          bind:value={checkOutDate} 
          min={checkInDate}
          required
        />
      </div>
      
      <div class="booking-summary">
        <h3>Booking Summary</h3>
        <div class="summary-row">
          <span>Room Type:</span>
          <span>{room.room_type}</span>
        </div>
        <div class="summary-row">
          <span>Price per night:</span>
          <span>{formatPrice(room.price)}</span>
        </div>
        <div class="summary-row total">
          <span>Total:</span>
          <span>{formatPrice(calculateTotalPrice())}</span>
        </div>
      </div>
      
      <button type="submit" class="book-button" disabled={loading}>
        {loading ? 'Processing...' : 'Confirm Booking'}
      </button>
    </form>
  {/if}
</div>

<style>
  .booking-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  h1 {
    color: #1C6EA4;
    margin-bottom: 1.5rem;
  }

  .room-summary {
    background-color: #f5f5f5;
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .room-summary h2 {
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .room-type {
    color: #666;
    margin-bottom: 0.5rem;
  }

  .room-price {
    font-size: 1.25rem;
    font-weight: bold;
    color: #1C6EA4;
  }

  .user-info {
    background-color: #e8f4f8;
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
  }

  .user-info h3 {
    margin: 0;
    color: #1C6EA4;
  }

  .booking-form {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .booking-summary {
    background-color: #f9f9f9;
    padding: 1.5rem;
    border-radius: 8px;
    margin: 2rem 0;
  }

  .booking-summary h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #333;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .summary-row.total {
    font-weight: bold;
    font-size: 1.1rem;
    border-top: 1px solid #ddd;
    padding-top: 0.75rem;
    margin-top: 0.75rem;
  }

  .book-button {
    width: 100%;
    padding: 1rem;
    background-color: #1C6EA4;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .book-button:hover {
    background-color: #155888;
  }

  .book-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .loading, .error, .success {
    text-align: center;
    padding: 2rem;
    border-radius: 8px;
    margin-top: 2rem;
  }

  .loading {
    background-color: #f9f9f9;
  }

  .error {
    background-color: #f8d7da;
    color: #721c24;
  }

  .success {
    background-color: #d4edda;
    color: #155724;
    padding: 3rem;
  }

  .success h2 {
    margin-top: 0;
  }

  .success-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
  }

  .view-bookings-button, .back-button {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    text-decoration: none;
    font-weight: 600;
    transition: background-color 0.3s ease;
  }

  .view-bookings-button {
    background-color: #1C6EA4;
    color: white;
  }

  .view-bookings-button:hover {
    background-color: #155888;
  }

  .back-button {
    background-color: #f5f5f5;
    color: #333;
  }

  .back-button:hover {
    background-color: #e5e5e5;
  }
</style>
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
    padding: var(--spacing-xl) var(--spacing-md);
  }

  h1 {
    color: var(--text-white);
    margin-bottom: var(--spacing-xl);
    font-size: var(--font-size-3xl);
    font-weight: 600;
  }

  .room-summary {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
  }

  .room-summary h2 {
    margin: 0 0 var(--spacing-sm) 0;
    color: var(--text-white);
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }

  .room-type {
    color: var(--text-light);
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-lg);
  }

  .room-price {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--primary);
  }

  .user-info {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
  }

  .user-info h3 {
    margin: 0;
    color: var(--text-white);
    font-size: var(--font-size-lg);
    font-weight: 500;
  }

  .booking-form {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    padding: var(--spacing-xl);
  }

  .form-group {
    margin-bottom: var(--spacing-lg);
  }

  .form-group label {
    display: block;
    margin-bottom: var(--spacing-sm);
    color: var(--text-light);
    font-weight: 500;
  }

  .form-group input {
    width: 100%;
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--background);
    color: var(--text-white);
    font-size: var(--font-size-base);
    transition: all var(--transition-fast);
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.15);
  }

  .booking-summary {
    background: linear-gradient(145deg, var(--background), var(--card-bg));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    margin: var(--spacing-xl) 0;
  }

  .booking-summary h3 {
    color: var(--text-white);
    margin: 0 0 var(--spacing-md) 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: var(--spacing-sm);
    color: var(--text-light);
  }

  .summary-row.total {
    margin-top: var(--spacing-md);
    padding-top: var(--spacing-md);
    border-top: 1px solid var(--border-color);
    color: var(--text-white);
    font-size: var(--font-size-lg);
    font-weight: 600;
  }

  .book-button {
    width: 100%;
    padding: var(--spacing-md);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--text-black);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .book-button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(137, 180, 250, 0.4);
    background: linear-gradient(45deg, var(--primary-dark), var(--primary));
  }

  .book-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .loading, .error, .success {
    text-align: center;
    padding: var(--spacing-2xl);
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    margin: var(--spacing-xl) 0;
  }

  .error {
    color: var(--error);
    background-color: rgba(243, 139, 168, 0.1);
    border-color: var(--error);
  }

  .success {
    color: var(--success);
    background-color: rgba(166, 227, 161, 0.1);
    border-color: var(--success);
  }

  .success h2 {
    color: var(--success);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }

  .success-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
    margin-top: var(--spacing-xl);
  }

  .view-bookings-button, .back-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-sm) var(--spacing-lg);
    border-radius: var(--radius-md);
    text-decoration: none;
    font-weight: 600;
    transition: all var(--transition-fast);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .view-bookings-button {
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--text-black);
  }

  .view-bookings-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(137, 180, 250, 0.4);
    background: linear-gradient(45deg, var(--primary-dark), var(--primary));
  }

  .back-button {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    color: var(--text-white);
    border: 1px solid var(--border-color);
  }

  .back-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary);
  }

  @media (max-width: 768px) {
    .booking-container {
      padding: var(--spacing-lg) var(--spacing-sm);
    }

    .success-actions {
      flex-direction: column;
    }

    .view-bookings-button, .back-button {
      width: 100%;
    }
  }
</style>
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { getHotels, getRooms } from '$lib/api';

  const hotelId = parseInt(page.params.id);

  type Hotel = {
    hotel_id: number;
    hotel_name: string;
    location: string;
    rating: number;
  };

  type Room = {
    room_id: number;
    room_number: number;
    hotel_id: number;
    room_type_id: number;
    price: number;
    availability: 'available' | 'booked';
    room_type?: string;
  };

  let hotel: Hotel | null = null;
  let rooms: Room[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      // Get hotel details
      const hotels = await getHotels();
      hotel = hotels.find((h: { hotel_id: number; }) => h.hotel_id === hotelId) || null;
      
      if (!hotel) {
        error = 'Hotel not found';
        return;
      }

      // Get rooms for this hotel
      rooms = await getRooms(hotelId);
    } catch (err) {
      error = 'Failed to load hotel details. Please try again later.';
      console.error(err);
    } finally {
      loading = false;
    }
  });

  function getRatingStars(rating: number) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }
</script>

<div class="hotel-detail-container">
  {#if loading}
    <div class="loading">
      <p>Loading hotel details...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <a href="/" class="back-btn">Back to Hotels</a>
    </div>
  {:else if hotel}
    <div class="hotel-header">
      <a href="/" class="back-btn">← Back to Hotels</a>
      <h1>{hotel.hotel_name}</h1>
      <div class="hotel-info">
        <p class="location"><span class="icon">📍</span> {hotel.location}</p>
        <p class="rating">{getRatingStars(hotel.rating)} <span class="rating-text">({hotel.rating} Stars)</span></p>
      </div>
    </div>

    <div class="rooms-section">
      <h2>Available Rooms</h2>
      
      {#if rooms.length === 0}
        <p class="no-rooms">No rooms available at this hotel.</p>
      {:else}
        <div class="room-grid">
          {#each rooms as room}
            <div class="room-card {room.availability === 'booked' ? 'booked' : ''}">
              <div class="room-header">
                <h3>Room {room.room_number}</h3>
                <span class="availability {room.availability}">
                  {room.availability === 'available' ? 'Available' : 'Booked'}
                </span>
              </div>
              <div class="room-body">
                <p class="room-type">Type: {room.room_type || 'Standard'}</p>
                <p class="price">{formatPrice(room.price)} <span class="per-night">per night</span></p>
              </div>
              <div class="room-footer">
                {#if room.availability === 'available'}
                  <a href="/booking/{room.room_id}" class="book-btn">Book Now</a>
                {:else}
                  <span class="booked-message">Currently Booked</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .hotel-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .loading, .error {
    text-align: center;
    padding: var(--spacing-2xl);
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    margin-bottom: var(--spacing-xl);
  }

  .error {
    color: var(--error);
    background-color: rgba(243, 139, 168, 0.1);
    border-color: var(--error);
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    color: var(--text-white);
    text-decoration: none;
    margin-bottom: var(--spacing-md);
    font-weight: 500;
    transition: all var(--transition-fast);
  }

  .back-btn:hover {
    color: var(--primary);
    transform: translateX(-4px);
  }

  .hotel-header {
    margin-bottom: var(--spacing-xl);
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
  }

  h1 {
    font-size: var(--font-size-3xl);
    color: var(--text-white);
    margin: var(--spacing-sm) 0;
    font-weight: 600;
  }

  .hotel-info {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-md);
    align-items: center;
    margin-top: var(--spacing-sm);
  }

  .location {
    display: flex;
    align-items: center;
    color: var(--text-light);
    font-size: var(--font-size-lg);
  }

  .icon {
    margin-right: var(--spacing-sm);
    color: var(--primary);
  }

  .rating {
    color: var(--primary);
    font-size: var(--font-size-lg);
  }

  .rating-text {
    color: var(--text-light);
    margin-left: var(--spacing-sm);
  }

  h2 {
    font-size: var(--font-size-2xl);
    color: var(--text-white);
    margin-bottom: var(--spacing-lg);
    font-weight: 600;
  }

  .no-rooms {
    text-align: center;
    padding: var(--spacing-2xl);
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    color: var(--text-light);
  }

  .room-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--spacing-xl);
  }

  .room-card {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    transition: all var(--transition-fast);
  }

  .room-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl);
  }

  .room-card.booked {
    opacity: 0.7;
  }

  .room-header {
    padding: var(--spacing-lg);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--text-black);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .room-header h3 {
    margin: 0;
    font-size: var(--font-size-lg);
    font-weight: 600;
  }

  .availability {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .availability.available {
    background-color: var(--success);
    color: var(--text-black);
  }

  .availability.booked {
    background-color: var(--error);
    color: var(--text-white);
  }

  .room-body {
    padding: var(--spacing-lg);
  }

  .room-type {
    margin-bottom: var(--spacing-sm);
    color: var(--text-light);
    font-size: var(--font-size-base);
  }

  .price {
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--primary);
  }

  .per-night {
    font-size: var(--font-size-sm);
    color: var(--text-light);
    font-weight: normal;
  }

  .room-footer {
    padding: var(--spacing-lg);
    border-top: 1px solid var(--border-color);
  }

  .book-btn {
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

  .book-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(137, 180, 250, 0.4);
    background: linear-gradient(45deg, var(--primary-dark), var(--primary));
  }

  .booked-message {
    display: block;
    text-align: center;
    color: var(--text-light);
    font-size: var(--font-size-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  @media (max-width: 768px) {
    .hotel-detail-container {
      padding: var(--spacing-lg) var(--spacing-sm);
    }

    .room-grid {
      grid-template-columns: 1fr;
    }

    .hotel-info {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
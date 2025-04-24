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
    padding: 1rem;
  }

  .loading, .error {
    text-align: center;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 2rem;
  }

  .error {
    color: #d9534f;
    background-color: #f9f2f2;
  }

  .back-btn {
    display: inline-block;
    color: #1C6EA4;
    text-decoration: none;
    margin-bottom: 1rem;
  }

  .hotel-header {
    margin-bottom: 2rem;
  }

  h1 {
    font-size: 2rem;
    color: #1C6EA4;
    margin: 0.5rem 0;
  }

  .hotel-info {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
    margin-top: 0.5rem;
  }

  .location {
    display: flex;
    align-items: center;
  }

  .icon {
    margin-right: 0.5rem;
  }

  .rating {
    color: #FFD700;
  }

  .rating-text {
    color: #666;
  }

  h2 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1rem;
  }

  .no-rooms {
    text-align: center;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }

  .room-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  .room-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .room-card.booked {
    opacity: 0.7;
  }

  .room-header {
    padding: 1rem;
    background-color: #1C6EA4;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .room-header h3 {
    margin: 0;
    font-size: 1.2rem;
  }

  .availability {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
  }

  .availability.available {
    background-color: #5cb85c;
  }

  .availability.booked {
    background-color: #d9534f;
  }

  .room-body {
    padding: 1rem;
  }

  .room-type {
    margin-bottom: 0.5rem;
  }

  .price {
    font-size: 1.2rem;
    font-weight: bold;
    color: #1C6EA4;
  }

  .per-night {
    font-size: 0.8rem;
    font-weight: normal;
    color: #666;
  }

  .room-footer {
    padding: 1rem;
    background-color: #f9f9f9;
    text-align: center;
  }

  .book-btn {
    display: inline-block;
    background-color: #5cb85c;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.3s ease;
  }

  .book-btn:hover {
    background-color: #4cae4c;
  }

  .booked-message {
    color: #d9534f;
  }

  @media (max-width: 768px) {
    .room-grid {
      grid-template-columns: 1fr;
    }

    .hotel-info {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }
</style>
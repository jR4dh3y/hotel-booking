<script lang="ts">
  import { onMount } from 'svelte';
  import { getRooms, getHotels } from '$lib/api';
  
  type Room = {
    room_id: number;
    room_number: number;
    hotel_id: number;
    room_type_id: number;
    price: number;
    availability: string;
    hotel_name: string;
    room_type: string;
    amenities: string;
  };

  type Hotel = {
    hotel_id: number;
    hotel_name: string;
    location: string;
    rating: number;
  };

  let rooms: Room[] = [];
  let hotels: Hotel[] = [];
  let loading = true;
  let error = '';
  let selectedHotelId: number | null = null;
  let selectedAmenities: string[] = [];
  let availableAmenities: string[] = [];

  onMount(async () => {
    try {
      // Load hotels for filter dropdown
      hotels = await getHotels();
      // Load all rooms initially
      rooms = await getRooms();
      // Extract unique amenities
      availableAmenities = [...new Set(rooms.flatMap(room => room.amenities.split(',')))].filter(Boolean);
    } catch (err) {
      error = 'Failed to load data. Please try again later.';
      console.error(err);
    } finally {
      loading = false;
    }
  });

  async function filterRoomsByHotel() {
    try {
      loading = true;
      rooms = await getRooms(selectedHotelId || undefined);
      // Update available amenities based on filtered rooms
      availableAmenities = [...new Set(rooms.flatMap(room => room.amenities.split(',')))].filter(Boolean);
      // Reset selected amenities when hotel changes
      selectedAmenities = [];
    } catch (err) {
      error = 'Failed to filter rooms. Please try again later.';
      console.error(err);
    } finally {
      loading = false;
    }
  }

  function toggleAmenity(amenity: string) {
    if (selectedAmenities.includes(amenity)) {
      selectedAmenities = selectedAmenities.filter(a => a !== amenity);
    } else {
      selectedAmenities = [...selectedAmenities, amenity];
    }
  }

  function filterRoomsByAmenities(room: Room) {
    if (selectedAmenities.length === 0) return true;
    const roomAmenities = room.amenities.split(',');
    return selectedAmenities.every(amenity => roomAmenities.includes(amenity));
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }
</script>

<div class="rooms-container">
  <h1>Available Rooms</h1>
  <p class="subtitle">Browse and book rooms from our selection</p>

  <div class="filter-section">
    <div class="hotel-filter">
      <label for="hotel-filter">Filter by Hotel:</label>
      <select 
        id="hotel-filter" 
        bind:value={selectedHotelId} 
        on:change={filterRoomsByHotel}
      >
        <option value={null}>All Hotels</option>
        {#each hotels as hotel}
          <option value={hotel.hotel_id}>{hotel.hotel_name}</option>
        {/each}
      </select>
    </div>

    <div class="amenities-filter">
      <label>Filter by Amenities:</label>
      <div class="amenities-pills">
        {#each availableAmenities as amenity}
          <button 
            class="amenity-pill {selectedAmenities.includes(amenity) ? 'selected' : ''}"
            on:click={() => toggleAmenity(amenity)}
          >
            {amenity}
          </button>
        {/each}
      </div>
    </div>
  </div>

  {#if loading}
    <div class="loading">
      <p>Loading rooms...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
    </div>
  {:else if rooms.length === 0}
    <div class="no-rooms">
      <p>No rooms available with the selected filters.</p>
    </div>
  {:else}
    <div class="room-grid">
      {#each rooms.filter(filterRoomsByAmenities) as room}
        <div class="room-card {room.availability === 'booked' ? 'booked' : ''}">
          <div class="room-header">
            <h3>Room {room.room_number}</h3>
            <span class="availability {room.availability}">
              {room.availability === 'available' ? 'Available' : 'Booked'}
            </span>
          </div>
          <div class="room-details">
            <p><strong>Hotel:</strong> {room.hotel_name}</p>
            <p><strong>Type:</strong> {room.room_type}</p>
            <p><strong>Price:</strong> {formatPrice(room.price)}/night</p>
            <div class="room-amenities">
              {#each room.amenities.split(',').filter(Boolean) as amenity}
                <span class="amenity-pill">{amenity}</span>
              {/each}
            </div>
          </div>
          {#if room.availability === 'available'}
            <a href="/booking/{room.room_id}" class="book-button">Book Now</a>
          {:else}
            <button disabled class="book-button disabled">Not Available</button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .rooms-container {
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

  .filter-section {
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .hotel-filter, .amenities-filter {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .amenities-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .amenity-pill {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .amenity-pill.selected {
    background-color: #1C6EA4;
    color: white;
    border-color: #1C6EA4;
  }

  .room-amenities {
    margin-top: 1rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .room-amenities .amenity-pill {
    cursor: default;
    font-size: 0.8rem;
  }

  select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    font-size: 1rem;
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
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
  }

  .room-card:hover {
    transform: translateY(-5px);
  }

  .room-card.booked {
    opacity: 0.7;
  }

  .room-header {
    background-color: #f5f5f5;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .room-header h3 {
    margin: 0;
    color: #333;
  }

  .availability {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .availability.available {
    background-color: #d4edda;
    color: #155724;
  }

  .availability.booked {
    background-color: #f8d7da;
    color: #721c24;
  }

  .room-details {
    padding: 1rem;
  }

  .room-details p {
    margin: 0.5rem 0;
  }

  .book-button {
    display: block;
    background-color: #1C6EA4;
    color: white;
    text-align: center;
    padding: 0.75rem;
    text-decoration: none;
    font-weight: bold;
    transition: background-color 0.3s ease;
  }

  .book-button:hover {
    background-color: #155888;
  }

  .book-button.disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .loading, .error, .no-rooms {
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
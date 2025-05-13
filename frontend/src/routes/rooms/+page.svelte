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
  <div class="page-header">
    <h1>Available Rooms</h1>
    <p class="subtitle">Browse and book rooms from our selection</p>
  </div>

  <div class="filter-section">
    <div class="hotel-filter">
      <label for="hotel-filter">Filter by Hotel:</label>
      <div class="select-wrapper">
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
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="select-icon"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>

    <div class="amenities-filter">
      <label for="amenities-filter">Filter by Amenities:</label>
      <div id="amenities-filter" class="amenities-pills" role="group" aria-labelledby="amenities-filter">
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
      <div class="loading-spinner"></div>
      <p>Loading rooms...</p>
    </div>
  {:else if error}
    <div class="error">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="error-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p>{error}</p>
    </div>
  {:else if rooms.length === 0}
    <div class="no-rooms">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="no-rooms-icon"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
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
            <div class="detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>{room.hotel_name}</span>
            </div>
            <div class="detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>{room.room_type}</span>
            </div>
            <div class="detail-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="detail-icon"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>{formatPrice(room.price)}/night</span>
            </div>
            <div class="room-amenities">
              {#each room.amenities.split(',').filter(Boolean) as amenity}
              <span class="amenity-tag">{amenity}</span>
              
              {/each}
            </div>
          </div>
          <div class="room-footer">
            {#if room.availability === 'available'}
            <a href="/booking/{room.room_id}" class="book-button">
              <span>Book Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            {:else}
            <button disabled class="book-button disabled">
              <span>Not Available</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .rooms-container {
    max-width: 1280px;
    margin: 0 auto;
    padding: var(--spacing-xl) var(--spacing-md);
  }

  .page-header {
    text-align: center;
    margin-bottom: var(--spacing-2xl);
  }

  h1 {
    color: var(--text-white);
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-sm);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .subtitle {
    color: var(--text-light);
    font-size: var(--font-size-lg);
  }

  .filter-section {
    margin-bottom: var(--spacing-2xl);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    background-color: var(--card-bg);
    padding: var(--spacing-lg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
  }

  .hotel-filter, .amenities-filter {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  label {
    color: var(--text-white);
    font-weight: 500;
  }

  .select-wrapper {
    position: relative;
  }

  .select-icon {
    position: absolute;
    right: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-light);
    pointer-events: none;
  }

  select {
    width: 100%;
    padding: var(--spacing-md);
    padding-right: calc(var(--spacing-md) * 2 + 24px);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    background-color: var(--background);
    color: var(--text-white);
    appearance: none;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.15);
  }

  .amenities-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .amenity-pill {
    padding: var(--spacing-xs) var(--spacing-md);
    border-radius: var(--radius-full);
    background-color: var(--background);
    border: 1px solid var(--border-color);
    color: var(--text-white);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: var(--font-size-sm);
  }

  .amenity-pill:hover {
    border-color: var(--primary);
    transform: translateY(-1px);
  }

  .amenity-pill.selected {
    background-color: var(--primary);
    color: var(--background);
    border-color: var(--primary);
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
    color: var(--text-black);
    font-size: var(--font-size-lg);
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
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
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);

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

  .room-details {
    padding: var(--spacing-lg);
  }

  .detail-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    color: var(--text-white);
  }

  .detail-icon {
    color: var(--primary);
  }

  .room-amenities {
    margin-top: var(--spacing-md);
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-sm);
  }

  .amenity-tag {
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    background-color: rgba(137, 180, 250, 0.1);
    color: var(--primary);
    font-size: var(--font-size-sm);
  }

  .book-button {
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

  .book-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(137, 180, 250, 0.4);
    background: linear-gradient(45deg, var(--primary-dark), var(--primary))
  }

  .book-button.disabled {
    background-color: var(--border-color);
    color: var(--text-light);
    cursor: not-allowed;
  }

  .loading, .error, .no-rooms {
    text-align: center;
    padding: var(--spacing-2xl);
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error {
    color: var(--error);
    background-color: rgba(243, 139, 168, 0.1);
  }

  .error-icon, .no-rooms-icon {
    color: var(--text-light);
  }
  @media (max-width: 768px) {
    .room-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-md);
    }

    .rooms-container {
      padding: var(--spacing-lg) var(--spacing-sm);
    }

    h1 {
      font-size: var(--font-size-xl);
      margin-bottom: var(--spacing-md);
    }
    
    .subtitle {
      font-size: var(--font-size-base);
      margin-bottom: var(--spacing-lg);
    }

    .filter-section {
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
      gap: var(--spacing-md);
    }
    
    .filter-section label {
      font-size: var(--font-size-sm);
    }
    
    .hotel-filter, .amenities-filter {
      gap: var(--spacing-xs);
    }
    
    .amenities-list {
      gap: var(--spacing-xs);
    }
    
    .amenity-pill {
      font-size: var(--font-size-sm);
      padding: var(--spacing-xs) var(--spacing-sm);
    }
    
    .room-card {
      margin-bottom: var(--spacing-md);
    }
    
    .room-header h3 {
      font-size: var(--font-size-base);
    }
  }
</style>
<script lang="ts">
  import { onMount } from 'svelte';
  import { getHotels } from '$lib/api';
  

  type Hotel = {
    hotel_id: number;
    hotel_name: string;
    location: string;
    rating: number;
  };

  let hotels: Hotel[] = [];
  let loading = true;
  let error = '';

  onMount(async () => {
    try {
      hotels = await getHotels();
    } catch (err) {
      error = 'Failed to load hotels. Please try again later.';
      console.error(err);
    } finally {
      loading = false;
    }
  });

  function getRatingStars(rating: number) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
</script>

<div class="hotels-container">
  <h1>Welcome to Hotel Booking System</h1>
  <p class="subtitle">Find and book the perfect hotel for your stay</p>

  {#if loading}
    <div class="loading">
      <p>Loading hotels...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
    </div>
  {:else if hotels.length === 0}
    <div class="no-hotels">
      <p>No hotels available at the moment.</p>
    </div>
  {:else}
    <div class="hotel-grid">
      {#each hotels as hotel}
        <div class="hotel-card">
          <div class="hotel-header">
            <h2>{hotel.hotel_name}</h2>
            <div class="rating">{getRatingStars(hotel.rating)}</div>
          </div>
          <div class="hotel-body">
            <p class="location"><span class="icon">📍</span> {hotel.location}</p>
            <p class="rating-text">{hotel.rating} Star Hotel</p>
          </div>
          <div class="hotel-footer">
            <a href="/hotels/{hotel.hotel_id}" class="view-rooms-btn">View Rooms</a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .hotels-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }

  h1 {
    font-size: 2rem;
    color: #1C6EA4;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    text-align: center;
    color: #666;
    margin-bottom: 2rem;
  }

  .loading, .error, .no-hotels {
    text-align: center;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }

  .error {
    color: #d9534f;
    background-color: #f9f2f2;
  }

  .hotel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  .hotel-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .hotel-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }

  .hotel-header {
    padding: 1rem;
    background-color: #1C6EA4;
    color: white;
  }

  .hotel-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  .rating {
    color: #FFD700;
    font-size: 1.2rem;
    margin-top: 0.5rem;
  }

  .hotel-body {
    padding: 1rem;
  }

  .location {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .icon {
    margin-right: 0.5rem;
  }

  .rating-text {
    color: #666;
  }

  .hotel-footer {
    padding: 1rem;
    background-color: #f9f9f9;
    text-align: center;
  }

  .view-rooms-btn {
    display: inline-block;
    background-color: #1C6EA4;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
    transition: background-color 0.3s ease;
  }

  .view-rooms-btn:hover {
    background-color: #0d5a8f;
  }

  @media (max-width: 768px) {
    .hotel-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
  
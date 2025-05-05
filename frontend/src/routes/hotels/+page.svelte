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
  let searchQuery = '';

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

  function filterHotels(hotel: Hotel) {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      hotel.hotel_name.toLowerCase().includes(query) ||
      hotel.location.toLowerCase().includes(query)
    );
  }
</script>

<div class="hotels-container">
  <div class="page-header">
    <h1>Our Hotels</h1>
    <p class="subtitle">Find the perfect hotel for your stay</p>
  </div>

  <div class="search-section">
    <input
      type="text"
      bind:value={searchQuery}
      placeholder="Search hotels by name or location..."
      class="search-input"
    />
  </div>

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
      {#each hotels.filter(filterHotels) as hotel}
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
    padding: 2rem 1rem;
  }

  .page-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  h1 {
    color: #1C6EA4;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #666;
    font-size: 1.2rem;
  }

  .search-section {
    margin-bottom: 2rem;
  }

  .search-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  .search-input:focus {
    outline: none;
    border-color: #1C6EA4;
    box-shadow: 0 0 0 2px rgba(28, 110, 164, 0.2);
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

  @media (max-width: 768px) {
    .hotel-grid {
      grid-template-columns: 1fr;
    }
  }
</style> 
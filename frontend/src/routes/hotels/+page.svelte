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
    <div class="search-wrapper">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="search-icon"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search hotels by name or location..."
        class="search-input"
      />
    </div>
  </div>

  {#if loading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Loading hotels...</p>
    </div>
  {:else if error}
    <div class="error">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="error-icon"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <p>{error}</p>
    </div>
  {:else if hotels.length === 0}
    <div class="no-hotels">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="no-hotels-icon"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
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
            <p class="location">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="location-icon"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {hotel.location}
            </p>
            <p class="rating-text">{hotel.rating} Star Hotel</p>
          </div>
          <div class="hotel-footer">
            <a href="/hotels/{hotel.hotel_id}" class="view-rooms-btn">
              <span>View Rooms</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .hotels-container {
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

  .search-section {
    margin-bottom: var(--spacing-2xl);
  }

  .search-wrapper {
    position: relative;
    max-width: 600px;
    margin: 0 auto;
  }

  .search-icon {
    position: absolute;
    left: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-light);
  }

  .search-input {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) calc(var(--spacing-md) * 2 + 24px);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-lg);
    font-size: var(--font-size-base);
    background-color: var(--card-bg);
    color: var(--text-white);
    transition: all var(--transition-fast);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.15);
    background-color: var(--background);
  }

  .hotel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: var(--spacing-xl);
  }

  .hotel-card {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: all var(--transition-normal);
  }

  .hotel-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary);
  }

  .hotel-header {
    padding: var(--spacing-lg);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .hotel-header h2 {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: 600;
    color: var(--text-dark);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .rating {
    color: var(--text-dark);
    font-size: var(--font-size-lg);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .hotel-body {
    padding: var(--spacing-lg);
  }

  .location {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-sm);
    color: var(--text-white);
  }

  .location-icon {
    color: var(--primary);
  }

  .rating-text {
    color: var(--text-light);
  }

  .hotel-footer {
    padding: var(--spacing-lg);
    background-color: var(--card-bg);
    text-align: center;
    border-top: 1px solid var(--border-color);
  }

  .view-rooms-btn {
    display: inline-block;
    width: 100%;
    padding: var(--spacing-md);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--text-black);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    text-align: center;
    text-decoration: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: all var(--transition-fast);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .view-rooms-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 0 15px rgba(137, 180, 250, 0.4);
    background: linear-gradient(45deg, var(--primary-dark), var(--primary))
  }

  .loading, .error, .no-hotels {
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

  .error-icon, .no-hotels-icon {
    color: var(--text-light);
  }
  @media (max-width: 768px) {
    .hotel-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }

    .hotels-container {
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
    
    .filter-container {
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }
    
    .hotel-card {
      margin-bottom: var(--spacing-md);
    }
    
    .hotel-header h2 {
      font-size: var(--font-size-lg);
    }
    
    .hotel-body {
      padding: var(--spacing-md);
    }
  }
</style> 
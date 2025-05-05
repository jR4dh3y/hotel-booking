<script lang="ts">
  import { onMount } from 'svelte';
  import { getHotels } from '$lib/api';
  import { auth } from '$lib/stores/auth';

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

<div class="home-container container">
  <section class="hero">
    <div class="hero-content">
      <h1>Find Your Perfect Stay</h1>
      <p>Discover and book the best hotels for your next adventure</p>
      <div class="hero-buttons">
        <a href="/hotels" class="button primary-button">Browse Hotels</a>
        <a href="/rooms" class="button secondary-button">View All Rooms</a>
      </div>
    </div>
  </section>

  <section class="featured-hotels">
    <h2>Featured Hotels</h2>
    {#if loading}
      <div class="loading card">
        <p>Loading featured hotels...</p>
      </div>
    {:else if error}
      <div class="error card">
        <p>{error}</p>
      </div>
    {:else if hotels.length === 0}
      <div class="no-hotels card">
        <p>No hotels available at the moment.</p>
      </div>
    {:else}
      <div class="hotel-grid">
        {#each hotels.slice(0, 3) as hotel}
          <div class="hotel-card card">
            <div class="hotel-header">
              <h3>{hotel.hotel_name}</h3>
              <div class="rating">{getRatingStars(hotel.rating)}</div>
            </div>
            <div class="hotel-body">
              <p class="location"><span class="icon">📍</span> {hotel.location}</p>
              <p class="rating-text">{hotel.rating} Star Hotel</p>
            </div>
            <div class="hotel-footer">
              <a href="/hotels/{hotel.hotel_id}" class="button view-rooms-btn">View Rooms</a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <section class="features">
    <h2>Why Choose Us</h2>
    <div class="features-grid">
      <div class="feature-card card">
        <div class="feature-icon">🏨</div>
        <h3>Wide Selection</h3>
        <p>Choose from a variety of hotels and room types to suit your needs</p>
      </div>
      <div class="feature-card card">
        <div class="feature-icon">💰</div>
        <h3>Best Prices</h3>
        <p>Get the best deals and competitive rates for your stay</p>
      </div>
      <div class="feature-card card">
        <div class="feature-icon">⭐</div>
        <h3>Quality Service</h3>
        <p>Experience top-notch service and comfortable accommodations</p>
      </div>
    </div>
  </section>
</div>

<style>
  .home-container {
    padding: 0;
  }

  .hero {
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
    background-size: cover;
    background-position: center;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--text-white);
    margin: -2rem -1rem 2rem;
    position: relative;
  }

  .hero-content {
    max-width: 800px;
    padding: 0 var(--spacing-md);
    position: relative;
    z-index: 1;
  }

  .hero h1 {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-md);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .hero p {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-xl);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .hero-buttons {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
  }

  .primary-button {
    background-color: var(--primary);
    color: var(--text-white);
  }

  .secondary-button {
    background-color: var(--text-white);
    color: var(--primary);
    border: 2px solid var(--primary);
  }

  .secondary-button:hover {
    background-color: var(--primary);
    color: var(--text-white);
  }

  .featured-hotels, .features {
    margin: var(--spacing-2xl) 0;
  }

  .hotel-grid, .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-xl);
  }

  .hotel-card {
    display: flex;
    flex-direction: column;
  }

  .hotel-header {
    padding: var(--spacing-md);
    background-color: var(--primary);
    color: var(--text-white);
  }

  .hotel-header h3 {
    margin: 0;
    font-size: var(--font-size-xl);
  }

  .rating {
    color: var(--secondary);
    font-size: var(--font-size-lg);
    margin-top: var(--spacing-sm);
  }

  .hotel-body {
    padding: var(--spacing-md);
    flex: 1;
  }

  .location {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-sm);
  }

  .icon {
    margin-right: var(--spacing-sm);
  }

  .rating-text {
    color: var(--text-light);
  }

  .hotel-footer {
    padding: var(--spacing-md);
    background-color: var(--background);
    text-align: center;
  }

  .view-rooms-btn {
    width: 100%;
  }

  .feature-card {
    text-align: center;
    padding: var(--spacing-xl);
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: var(--spacing-md);
  }

  .feature-card h3 {
    color: var(--primary);
    margin-bottom: var(--spacing-md);
  }

  .feature-card p {
    color: var(--text-light);
    line-height: 1.5;
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: var(--font-size-3xl);
    }

    .hero p {
      font-size: var(--font-size-lg);
    }

    .hero-buttons {
      flex-direction: column;
    }

    .hotel-grid, .features-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
  
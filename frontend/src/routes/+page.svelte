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
  
    onMount(async () => {
      hotels = await getHotels();
    });
  </script>
  
  <h1 class="text-2xl font-bold mb-4">Available Hotels</h1>
  
  {#if hotels.length > 0}
    <ul>
      {#each hotels as hotel}
        <li class="mb-4 border p-4 rounded shadow">
          <h2 class="text-xl font-semibold">{hotel.hotel_name}</h2>
          <p>Location: {hotel.location}</p>
          <p>Rating: {hotel.rating} stars</p>
        </li>
      {/each}
    </ul>
  {:else}
    <p>Loading hotels...</p>
  {/if}
  
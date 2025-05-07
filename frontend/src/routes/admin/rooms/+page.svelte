<script lang="ts">
  import { onMount } from 'svelte';
  
  type Room = {
    room_id: number;
    room_number: number;
    hotel_id: number;
    room_type_id: number;
    price: number;
    availability: 'available' | 'booked';
    hotel_name: string;
    room_type: string;
    amenities: string;
  };
  
  type Hotel = {
    hotel_id: number;
    hotel_name: string;
  };
  
  type RoomType = {
    room_type_id: number;
    room_type: string;
  };
  
  let rooms: Room[] = [];
  let hotels: Hotel[] = [];
  let roomTypes: RoomType[] = [];
  let loading = true;
  let error = '';
  
  // For add/edit form
  let formMode: 'add' | 'edit' | null = null;
  let currentRoom: Partial<Room> = {};
  let formError = '';
  let formSuccess = '';
  
  // For filtering
  let filterHotelId: number | null = null;
  let filterRoomType: number | null = null;
  let filterAvailability: 'all' | 'available' | 'booked' = 'all';
  let searchQuery = '';
  
  onMount(async () => {
    try {
      loading = true;
      
      // Load all hotels for filter dropdown
      const hotelsResponse = await fetch('http://localhost:3000/api/hotels');
      if (!hotelsResponse.ok) throw new Error('Failed to load hotels');
      hotels = await hotelsResponse.json();
      
      // Load all room types
      const roomTypesResponse = await fetch('http://localhost:3000/api/room-types');
      if (!roomTypesResponse.ok) throw new Error('Failed to load room types');
      roomTypes = await roomTypesResponse.json();
      
      // Load all rooms with details
      await loadRooms();
      
    } catch (err: any) {
      console.error(err);
      error = err.message || 'Failed to load initial data';
    } finally {
      loading = false;
    }
  });
  
  async function loadRooms() {
    try {
      loading = true;
      error = '';
      
      const response = await fetch('http://localhost:3000/api/rooms');
      if (!response.ok) throw new Error('Failed to load rooms');
      
      rooms = await response.json();
    } catch (err: any) {
      console.error(err);
      error = err.message || 'Failed to load rooms';
    } finally {
      loading = false;
    }
  }
  
  function showAddForm() {
    formMode = 'add';
    currentRoom = {
      availability: 'available',
      price: 100
    };
    formError = '';
    formSuccess = '';
  }
  
  function showEditForm(room: Room) {
    formMode = 'edit';
    // Create a copy without the amenities field which is read-only
    const { amenities, hotel_name, room_type, ...roomData } = room;
    currentRoom = { ...roomData };
    formError = '';
    formSuccess = '';
  }
  
  function cancelForm() {
    formMode = null;
  }
  
  async function handleSubmit() {
    try {
      formError = '';
      
      // Validate form
      if (!currentRoom.hotel_id || !currentRoom.room_type_id || 
          !currentRoom.room_number || currentRoom.price === undefined) {
        formError = 'All fields are required';
        return;
      }
      
      let response: Response;
      
      if (formMode === 'add') {
        // Create new room
        response = await fetch('http://localhost:3000/api/admin/rooms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(currentRoom)
        });
      } else {
        // Update existing room
        response = await fetch(`http://localhost:3000/api/admin/rooms/${currentRoom.room_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(currentRoom)
        });
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }
      
      formSuccess = formMode === 'add' ? 'Room added successfully' : 'Room updated successfully';
      
      // Reload rooms list
      await loadRooms();
      
      // Close form after short delay
      setTimeout(() => {
        formMode = null;
        formSuccess = '';
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      formError = err.message || 'Failed to save room';
    }
  }
  
  async function handleDeleteRoom(id: number) {
    if (!confirm('Are you sure you want to delete this room?')) {
      return;
    }
    
    try {
      loading = true;
      
      const response = await fetch(`http://localhost:3000/api/admin/rooms/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete room');
      }
      
      // Reload rooms list
      await loadRooms();
      
    } catch (err: any) {
      console.error(err);
      error = err.message || 'Failed to delete room';
      loading = false;
    }
  }
  
  function filteredRooms() {
    return rooms.filter(room => {
      // Filter by hotel
      if (filterHotelId && room.hotel_id !== filterHotelId) {
        return false;
      }
      
      // Filter by room type
      if (filterRoomType && room.room_type_id !== filterRoomType) {
        return false;
      }
      
      // Filter by availability
      if (filterAvailability !== 'all' && room.availability !== filterAvailability) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableFields = [
          String(room.room_number),
          room.hotel_name,
          room.room_type,
          room.amenities
        ];
        
        return searchableFields.some(field => field.toLowerCase().includes(query));
      }
      
      return true;
    });
  }
  
  function resetFilters() {
    filterHotelId = null;
    filterRoomType = null;
    filterAvailability = 'all';
    searchQuery = '';
  }
  
  function formatCurrency(price: number) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }
  
  function getHotelName(hotelId: number) {
    return hotels.find(h => h.hotel_id === hotelId)?.hotel_name || '';
  }
  
  function getRoomTypeName(roomTypeId: number) {
    return roomTypes.find(rt => rt.room_type_id === roomTypeId)?.room_type || '';
  }
</script>

<div class="admin-rooms">
  <!-- Header Section with Filters -->
  <div class="filters-section">
    <div class="filters-header">
      <h3>Rooms Management</h3>
      <div class="header-actions">
        <button class="reset-button" on:click={resetFilters}>Reset Filters</button>
        <button class="add-button" on:click={showAddForm}>
          <span class="icon">➕</span> Add Room
        </button>
      </div>
    </div>
    
    <div class="filters-grid">
      <div class="filter-group">
        <label for="search">Search</label>
        <input 
          type="text" 
          id="search" 
          bind:value={searchQuery} 
          placeholder="Search rooms..." 
        />
      </div>
      
      <div class="filter-group">
        <label for="hotel-filter">Hotel</label>
        <select id="hotel-filter" bind:value={filterHotelId}>
          <option value={null}>All Hotels</option>
          {#each hotels as hotel}
            <option value={hotel.hotel_id}>{hotel.hotel_name}</option>
          {/each}
        </select>
      </div>
      
      <div class="filter-group">
        <label for="room-type-filter">Room Type</label>
        <select id="room-type-filter" bind:value={filterRoomType}>
          <option value={null}>All Types</option>
          {#each roomTypes as roomType}
            <option value={roomType.room_type_id}>{roomType.room_type}</option>
          {/each}
        </select>
      </div>
      
      <div class="filter-group">
        <label for="availability-filter">Availability</label>
        <select id="availability-filter" bind:value={filterAvailability}>
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="booked">Booked</option>
        </select>
      </div>
    </div>
  </div>
  
  <!-- Room Form Modal -->
  {#if formMode}
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{formMode === 'add' ? 'Add New Room' : 'Edit Room'}</h3>
          <button class="close-button" on:click={cancelForm}>×</button>
        </div>
        
        {#if formError}
          <div class="form-error">{formError}</div>
        {/if}
        
        {#if formSuccess}
          <div class="form-success">{formSuccess}</div>
        {/if}
        
        <form on:submit|preventDefault={handleSubmit}>
          <div class="form-group">
            <label for="hotel-id">Hotel</label>
            <select 
              id="hotel-id"
              bind:value={currentRoom.hotel_id}
              required
            >
              <option value="">-- Select Hotel --</option>
              {#each hotels as hotel}
                <option value={hotel.hotel_id}>{hotel.hotel_name}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-group">
            <label for="room-number">Room Number</label>
            <input 
              type="number" 
              id="room-number"
              bind:value={currentRoom.room_number}
              required
            />
          </div>
          
          <div class="form-group">
            <label for="room-type-id">Room Type</label>
            <select 
              id="room-type-id"
              bind:value={currentRoom.room_type_id}
              required
            >
              <option value="">-- Select Room Type --</option>
              {#each roomTypes as roomType}
                <option value={roomType.room_type_id}>{roomType.room_type}</option>
              {/each}
            </select>
          </div>
          
          <div class="form-group">
            <label for="price">Price per Night (₹)</label>
            <input 
              type="number" 
              id="price"
              bind:value={currentRoom.price}
              min="1"
              step="0.01"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="availability">Availability</label>
            <select 
              id="availability"
              bind:value={currentRoom.availability}
              required
            >
              <option value="available">Available</option>
              <option value="booked">Booked</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-button" on:click={cancelForm}>Cancel</button>
            <button type="submit" class="submit-button">
              {formMode === 'add' ? 'Add Room' : 'Update Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
  
  <!-- Rooms List/Grid -->
  {#if loading}
    <div class="loading">Loading rooms data...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button class="retry-button" on:click={loadRooms}>Retry</button>
    </div>
  {:else if filteredRooms().length === 0}
    <div class="no-data">
      {#if searchQuery || filterHotelId || filterRoomType || filterAvailability !== 'all'}
        No rooms matching the current filters.
      {:else}
        No rooms found in the system. Add your first room!
      {/if}
    </div>
  {:else}
    <div class="results-header">
      <h3>Showing {filteredRooms().length} of {rooms.length} rooms</h3>
    </div>
    
    <div class="rooms-grid">
      {#each filteredRooms() as room}
        <div class="room-card {room.availability === 'booked' ? 'booked' : ''}">
          <div class="room-header">
            <div class="room-title">
              <h3>Room {room.room_number}</h3>
              <span class="room-type">{room.room_type}</span>
            </div>
            <span class="availability-badge {room.availability}">
              {room.availability === 'available' ? 'Available' : 'Booked'}
            </span>
          </div>
          
          <div class="room-details">
            <p><strong>Hotel:</strong> {room.hotel_name}</p>
            <p><strong>Price:</strong> {formatCurrency(room.price)}/night</p>
            
            {#if room.amenities}
              <div class="amenities-section">
                <h4>Amenities:</h4>
                <div class="amenities-pills">
                  {#each room.amenities.split(',') as amenity}
                    {#if amenity.trim()}
                      <span class="amenity-pill">{amenity.trim()}</span>
                    {/if}
                  {/each}
                </div>
              </div>
            {/if}
          </div>
          
          <div class="room-actions">
            <button class="action-button edit" on:click={() => showEditForm(room)}>
              ✏️ Edit
            </button>
            <button class="action-button delete" on:click={() => handleDeleteRoom(room.room_id)}>
              🗑️ Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .admin-rooms {
    width: 100%;
  }
  
  /* Filters Section */
  .filters-section {
    background-color: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 2rem;
  }
  
  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .filters-header h3 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
  }
  
  .header-actions {
    display: flex;
    gap: 1rem;
  }
  
  .reset-button {
    padding: 0.4rem 1rem;
    background-color: #f5f5f5;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }
  
  .add-button {
    padding: 0.4rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
  }
  
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filter-group label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
  }
  
  .filter-group input,
  .filter-group select {
    padding: 0.6rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.95rem;
  }
  
  /* Results Header */
  .results-header {
    margin-bottom: 1rem;
  }
  
  .results-header h3 {
    font-size: 1rem;
    color: #666;
    margin: 0;
  }
  
  /* Rooms Grid */
  .rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .room-card {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .room-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  .room-card.booked {
    opacity: 0.8;
  }
  
  .room-header {
    padding: 1rem;
    background-color: #1C6EA4;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .room-title {
    display: flex;
    flex-direction: column;
  }
  
  .room-title h3 {
    margin: 0;
    font-size: 1.1rem;
  }
  
  .room-type {
    font-size: 0.85rem;
    opacity: 0.9;
  }
  
  .availability-badge {
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.3rem 0.6rem;
    border-radius: 999px;
    text-transform: uppercase;
  }
  
  .availability-badge.available {
    background-color: #4CAF50;
    color: white;
  }
  
  .availability-badge.booked {
    background-color: #f44336;
    color: white;
  }
  
  .room-details {
    padding: 1rem;
  }
  
  .room-details p {
    margin: 0.5rem 0;
  }
  
  .amenities-section {
    margin-top: 0.75rem;
  }
  
  .amenities-section h4 {
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
    font-weight: 600;
  }
  
  .amenities-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  
  .amenity-pill {
    font-size: 0.8rem;
    background-color: #f0f0f0;
    border-radius: 999px;
    padding: 0.2rem 0.5rem;
    white-space: nowrap;
  }
  
  .room-actions {
    display: flex;
    gap: 0.5rem;
    padding: 1rem;
    background-color: #f9f9f9;
    border-top: 1px solid #f0f0f0;
  }
  
  .action-button {
    flex: 1;
    padding: 0.6rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
  }
  
  .action-button.edit {
    background-color: #FFC107;
    color: #333;
  }
  
  .action-button.delete {
    background-color: #f44336;
    color: white;
  }
  
  /* Modal styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    padding: 1.5rem;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .modal-header h3 {
    margin: 0;
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  .form-group input, 
  .form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  .cancel-button, .submit-button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .cancel-button {
    background-color: #f5f5f5;
    color: #333;
  }
  
  .submit-button {
    background-color: #1C6EA4;
    color: white;
  }
  
  .form-error {
    padding: 0.75rem;
    background-color: #f8d7da;
    color: #721c24;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .form-success {
    padding: 0.75rem;
    background-color: #d4edda;
    color: #155724;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .loading, .error, .no-data {
    padding: 2rem;
    text-align: center;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .error {
    color: #721c24;
    background-color: #f8d7da;
  }
  
  .retry-button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background-color: #1C6EA4;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    .filters-header {
      flex-direction: column;
      align-items: stretch;
      gap: 1rem;
    }
    
    .header-actions {
      flex-direction: column;
    }
    
    .filters-grid {
      grid-template-columns: 1fr;
    }
    
    .rooms-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
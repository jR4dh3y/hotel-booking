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
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .filters-section {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
  }
  
  .filters-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }
  
  .filters-header h3 {
    color: var(--text-white);
    font-size: var(--font-size-xl);
    font-weight: 600;
    margin: 0;
  }
  
  .filters-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--spacing-lg);
  }
  
  .table-container {
    overflow-x: auto;
    margin-bottom: var(--spacing-xl);
    border-radius: var(--radius-lg);
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-lg);
  }
  
  .rooms-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    min-width: 1200px;
  }
  
  .rooms-table th {
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    font-weight: 600;
    text-align: left;
    padding: var(--spacing-md);
    border-bottom: 2px solid var(--border-color);
    white-space: nowrap;
    position: sticky;
    top: 0;
    z-index: 1;
  }
  
  .rooms-table td {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
    color: var(--text-white);
    vertical-align: middle;
    white-space: nowrap;
  }
  
  .rooms-table tr:last-child td {
    border-bottom: none;
  }
  
  .rooms-table tr:hover td {
    background-color: rgba(137, 180, 250, 0.1);
  }
  
  .room-id {
    font-family: monospace;
    font-size: var(--font-size-sm);
    color: var(--text-light);
  }
  
  .status-badge {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .status-available {
    background-color: rgba(166, 227, 161, 0.2);
    color: var(--success);
    border: 1px solid var(--success);
  }
  
  .status-occupied {
    background-color: rgba(243, 139, 168, 0.2);
    color: var(--error);
    border: 1px solid var(--error);
  }
  
  .status-maintenance {
    background-color: rgba(250, 219, 20, 0.2);
    color: var(--warning);
    border: 1px solid var(--warning);
  }
  
  .action-buttons {
    display: flex;
    gap: var(--spacing-sm);
  }
  
  .view-btn,
  .edit-btn,
  .delete-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: none;
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .view-btn {
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
  }
  
  .edit-btn {
    background: linear-gradient(45deg, var(--warning), var(--warning-dark));
    color: var(--background);
  }
  
  .delete-btn {
    background: linear-gradient(45deg, var(--error), var(--error-dark));
    color: var(--background);
  }
  
  .view-btn:hover,
  .edit-btn:hover,
  .delete-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .modal-content {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    width: 100%;
    max-width: 500px;
    box-shadow: var(--shadow-xl);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
  }
  
  .modal-header h2 {
    color: var(--text-white);
    font-size: var(--font-size-xl);
    font-weight: 600;
  }
  
  .close-btn {
    background: none;
    border: none;
    color: var(--text-light);
    cursor: pointer;
    font-size: var(--font-size-xl);
    transition: all var(--transition-fast);
  }
  
  .close-btn:hover {
    color: var(--text-white);
  }
  
  .form-group {
    margin-bottom: var(--spacing-lg);
  }
  
  .form-group label {
    display: block;
    margin-bottom: var(--spacing-sm);
    color: var(--text-light);
    font-weight: 500;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--background);
    color: var(--text-white);
    font-size: var(--font-size-base);
    transition: all var(--transition-fast);
  }
  
  .form-group input:focus,
  .form-group select:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.15);
  }
  
  .form-group textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  .submit-btn {
    width: 100%;
    padding: var(--spacing-md);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .error-message {
    background-color: rgba(243, 139, 168, 0.1);
    color: var(--error);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-lg);
    border: 1px solid var(--error);
  }
  
  .success-message {
    background-color: rgba(166, 227, 161, 0.1);
    color: var(--success);
    padding: var(--spacing-md);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-lg);
    border: 1px solid var(--success);
  }
  
  .loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    color: var(--text-light);
  }
  
  .results-header {
    margin-bottom: 1rem;
  }
  
  .results-header h3 {
    font-size: 1rem;
    color: var(--text-white);
    margin: 0;
  }
  
  .rooms-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .room-card {
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-fast) ease, box-shadow var(--transition-fast) ease;
  }
  
  .room-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-lg);
  }
  
  .room-card.booked {
    opacity: 0.8;
  }
  
  .room-header {
    padding: var(--spacing-xl);
    background-color: var(--primary);
    color: var(--background);
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
    font-size: var(--font-size-xl);
  }
  
  .room-type {
    font-size: var(--font-size-base);
    opacity: 0.9;
  }
  
  .availability-badge {
    font-size: var(--font-size-sm);
    font-weight: 600;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    text-transform: uppercase;
  }
  
  .availability-badge.available {
    background-color: var(--success);
    color: var(--background);
  }
  
  .availability-badge.booked {
    background-color: var(--error);
    color: var(--background);
  }
  
  .room-details {
    padding: var(--spacing-xl);
  }
  
  .room-details p {
    margin: 0.5rem 0;
  }
  
  .amenities-section {
    margin-top: var(--spacing-lg);
  }
  
  .amenities-section h4 {
    margin: 0 0 var(--spacing-sm) 0;
    font-size: var(--font-size-base);
    font-weight: 600;
  }
  
  .amenities-pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--spacing-xs);
  }
  
  .amenity-pill {
    font-size: var(--font-size-sm);
    background-color: var(--background);
    border-radius: var(--radius-full);
    padding: var(--spacing-xs) var(--spacing-sm);
    white-space: nowrap;
  }
  
  .room-actions {
    display: flex;
    gap: var(--spacing-sm);
    padding: var(--spacing-xl);
    background-color: var(--background);
    border-top: 1px solid var(--border-color);
  }
  
  .action-button {
    flex: 1;
    padding: var(--spacing-md);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-size-base);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-xs);
  }
  
  .action-button.edit {
    background-color: var(--warning);
    color: var(--background);
  }
  
  .action-button.delete {
    background-color: var(--error);
    color: var(--background);
  }
  
  .reset-button {
    padding: var(--spacing-md);
    background-color: var(--primary);
    color: var(--background);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-size-base);
  }
  
  .add-button {
    padding: var(--spacing-md);
    background-color: var(--primary);
    color: var(--background);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    font-size: var(--font-size-base);
  }
  
  .close-button {
    background: none;
    border: none;
    font-size: var(--font-size-xl);
    cursor: pointer;
    padding: 0;
  }
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
  }
  
  .cancel-button, .submit-button {
    padding: var(--spacing-md);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: var(--font-size-base);
  }
  
  .cancel-button {
    background-color: var(--background);
    color: var(--text-light);
  }
  
  .submit-button {
    background-color: var(--primary);
    color: var(--background);
  }
  
  .loading, .error, .no-data {
    padding: var(--spacing-xl);
    text-align: center;
    background-color: var(--card-bg);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }
  
  .error {
    color: var(--error);
    background-color: var(--error-bg);
  }
  
  .retry-button {
    margin-top: var(--spacing-md);
    padding: var(--spacing-md);
    background-color: var(--primary);
    color: var(--background);
    border: none;
    border-radius: var(--radius-md);
    cursor: pointer;
  }
  
  @media (max-width: 768px) {
    .admin-rooms {
      padding: var(--spacing-md);
    }
    
    .filters-section {
      padding: var(--spacing-lg);
    }
    
    .filters-grid {
      grid-template-columns: 1fr;
    }
    
    .rooms-grid {
      grid-template-columns: 1fr;
    }
    
    .action-buttons {
      flex-direction: column;
    }
    
    .modal-content {
      margin: var(--spacing-md);
      padding: var(--spacing-lg);
    }
  }
</style>
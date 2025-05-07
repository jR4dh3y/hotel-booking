<script lang="ts">
  import { onMount } from 'svelte';
  
  type Hotel = {
    hotel_id: number;
    hotel_name: string;
    location: string;
    rating: number;
  };

  let hotels: Hotel[] = [];
  let loading = true;
  let error = '';
  
  // For add/edit form
  let formMode: 'add' | 'edit' | null = null;
  let currentHotel: Partial<Hotel> = { rating: 3 };
  let formError = '';
  let formSuccess = '';
  
  // For search and sort
  let searchQuery = '';
  let sortField: keyof Hotel = 'hotel_name';
  let sortDirection: 'asc' | 'desc' = 'asc';
  
  onMount(async () => {
    await loadHotels();
  });
  
  async function loadHotels() {
    try {
      loading = true;
      const response = await fetch('http://localhost:3000/api/hotels');
      
      if (!response.ok) {
        throw new Error('Failed to load hotels');
      }
      
      hotels = await response.json();
    } catch (err: any) {
      console.error(err);
      error = err.message || 'An error occurred while loading hotels';
    } finally {
      loading = false;
    }
  }
  
  function showAddForm() {
    formMode = 'add';
    currentHotel = { rating: 3 };
    formError = '';
    formSuccess = '';
  }
  
  function showEditForm(hotel: Hotel) {
    formMode = 'edit';
    currentHotel = { ...hotel };
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
      if (!currentHotel.hotel_name || !currentHotel.location || !currentHotel.rating) {
        formError = 'All fields are required';
        return;
      }
      
      let response: Response;
      
      if (formMode === 'add') {
        // Create new hotel
        response = await fetch('http://localhost:3000/api/admin/hotels', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(currentHotel)
        });
      } else {
        // Update existing hotel
        response = await fetch(`http://localhost:3000/api/admin/hotels/${currentHotel.hotel_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(currentHotel)
        });
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }
      
      formSuccess = formMode === 'add' ? 'Hotel added successfully' : 'Hotel updated successfully';
      
      // Reload hotels list
      await loadHotels();
      
      // Close form after short delay
      setTimeout(() => {
        formMode = null;
        formSuccess = '';
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      formError = err.message || 'Failed to save hotel';
    }
  }
  
  async function handleDeleteHotel(id: number) {
    if (!confirm('Are you sure you want to delete this hotel? This will also delete all associated rooms and bookings.')) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/api/admin/hotels/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete hotel');
      }
      
      // Reload hotels list
      await loadHotels();
      
    } catch (err: any) {
      console.error(err);
      error = err.message || 'Failed to delete hotel';
    }
  }
  
  function filteredHotels() {
    if (!searchQuery) return sortedHotels();
    
    const query = searchQuery.toLowerCase();
    return sortedHotels().filter(hotel => 
      hotel.hotel_name.toLowerCase().includes(query) ||
      hotel.location.toLowerCase().includes(query)
    );
  }
  
  function sortedHotels() {
    return [...hotels].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (sortField === 'rating') {
        // Numeric sort
        return sortDirection === 'asc' ? 
          (aValue as number) - (bValue as number) : 
          (bValue as number) - (aValue as number);
      } else {
        // String sort
        return sortDirection === 'asc' ?
          String(aValue).localeCompare(String(bValue)) :
          String(bValue).localeCompare(String(aValue));
      }
    });
  }
  
  function handleSort(field: keyof Hotel) {
    if (field === sortField) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'asc';
    }
  }
  
  function getRatingStars(rating: number) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
</script>

<div class="admin-hotels">
  <!-- Header Section -->
  <div class="header-actions">
    <div class="search-sort">
      <div class="search-box">
        <input 
          type="text" 
          bind:value={searchQuery} 
          placeholder="Search hotels..." 
          class="search-input" 
        />
      </div>
      
      <div class="sort-box">
        <label for="sort">Sort by:</label>
        <select id="sort" bind:value={sortField}>
          <option value="hotel_name">Name</option>
          <option value="location">Location</option>
          <option value="rating">Rating</option>
        </select>
        <button class="sort-direction" on:click={() => sortDirection = sortDirection === 'asc' ? 'desc' : 'asc'}>
          {sortDirection === 'asc' ? '↑' : '↓'}
        </button>
      </div>
    </div>
    
    <button class="add-button" on:click={showAddForm}>
      <span class="icon">➕</span> Add New Hotel
    </button>
  </div>

  <!-- Hotel Form Modal -->  
  {#if formMode}
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{formMode === 'add' ? 'Add New Hotel' : 'Edit Hotel'}</h3>
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
            <label for="hotel-name">Hotel Name</label>
            <input 
              type="text" 
              id="hotel-name"
              bind:value={currentHotel.hotel_name}
              required
            />
          </div>
          
          <div class="form-group">
            <label for="location">Location</label>
            <input 
              type="text" 
              id="location"
              bind:value={currentHotel.location}
              required
            />
          </div>
          
          <div class="form-group">
            <label for="rating">Rating (1-5)</label>
            <div class="rating-input">
              <input 
                type="range" 
                id="rating"
                bind:value={currentHotel.rating}
                min="1" 
                max="5" 
                step="1"
              />
              <span class="rating-display">{currentHotel.rating} - {getRatingStars(currentHotel.rating || 0)}</span>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-button" on:click={cancelForm}>Cancel</button>
            <button type="submit" class="submit-button">
              {formMode === 'add' ? 'Add Hotel' : 'Update Hotel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
  
  <!-- Hotels Table -->
  {#if loading}
    <div class="loading">Loading hotels...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button class="retry-button" on:click={loadHotels}>Retry</button>
    </div>
  {:else if filteredHotels().length === 0}
    <div class="no-data">
      {searchQuery ? 
        `No hotels matching "${searchQuery}"` : 
        'No hotels found. Add your first hotel!'}
    </div>
  {:else}
    <div class="table-container">
      <table class="hotels-table">
        <thead>
          <tr>
            <th on:click={() => handleSort('hotel_id')}>
              ID {sortField === 'hotel_id' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th on:click={() => handleSort('hotel_name')}>
              Name {sortField === 'hotel_name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th on:click={() => handleSort('location')}>
              Location {sortField === 'location' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th on:click={() => handleSort('rating')}>
              Rating {sortField === 'rating' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredHotels() as hotel}
            <tr>
              <td>{hotel.hotel_id}</td>
              <td>{hotel.hotel_name}</td>
              <td>{hotel.location}</td>
              <td class="rating-cell">
                <span class="rating-stars">{getRatingStars(hotel.rating)}</span>
                <span class="rating-number">({hotel.rating}/5)</span>
              </td>
              <td class="actions-cell">
                <button class="action-button edit" on:click={() => showEditForm(hotel)}>
                  ✏️ Edit
                </button>
                <a href="/admin/hotels/{hotel.hotel_id}" class="action-button view">
                  🔍 View Rooms
                </a>
                <button class="action-button delete" on:click={() => handleDeleteHotel(hotel.hotel_id)}>
                  🗑️ Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .admin-hotels {
    width: 100%;
  }
  
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .search-sort {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }
  
  .search-input {
    padding: 0.5rem 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    min-width: 250px;
  }
  
  .sort-box {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .sort-box select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  .sort-direction {
    background: none;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 0.5rem;
    cursor: pointer;
  }
  
  .add-button {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .add-button:hover {
    background-color: #45a049;
  }
  
  /* Table styles */
  .table-container {
    overflow-x: auto;
    margin-bottom: 2rem;
  }
  
  .hotels-table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  .hotels-table th, .hotels-table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }
  
  .hotels-table th {
    background-color: #f9f9f9;
    font-weight: 600;
    color: #333;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .hotels-table th:hover {
    background-color: #f0f0f0;
  }
  
  .rating-cell {
    white-space: nowrap;
  }
  
  .rating-stars {
    color: #FFD700;
    margin-right: 0.5rem;
  }
  
  .rating-number {
    color: #666;
    font-size: 0.9rem;
  }
  
  .actions-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .action-button {
    padding: 0.4rem 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  .action-button.view {
    background-color: #1C6EA4;
    color: white;
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
  
  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .rating-input {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .rating-input input[type="range"] {
    flex: 1;
  }
  
  .rating-display {
    white-space: nowrap;
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
    .header-actions {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-sort {
      flex-direction: column;
      align-items: stretch;
    }
    
    .search-input {
      width: 100%;
      min-width: auto;
    }
    
    .actions-cell {
      flex-direction: column;
    }
    
    .action-button {
      width: 100%;
      justify-content: center;
    }
  }
</style>
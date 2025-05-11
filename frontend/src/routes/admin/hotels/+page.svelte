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
    padding: var(--spacing-xl);
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-xl);
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
  }
  
  .header-actions h1 {
    color: var(--text-white);
    font-size: var(--font-size-2xl);
    font-weight: 600;
  }
  
  .search-sort {
    display: flex;
    gap: var(--spacing-md);
  }
  
  .search-input {
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--background);
    color: var(--text-white);
    font-size: var(--font-size-base);
    min-width: 200px;
    transition: all var(--transition-fast);
  }
  
  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.15);
  }
  
  .sort-select {
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--background);
    color: var(--text-white);
    font-size: var(--font-size-base);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .sort-select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.15);
  }
  
  .add-hotel-btn {
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .add-hotel-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .hotels-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
  }
  
  .hotels-table th {
    background: linear-gradient(45deg, var(--primary), var(--primary-dark));
    color: var(--background);
    font-weight: 600;
    text-align: left;
    padding: var(--spacing-md);
    border-bottom: 2px solid var(--border-color);
  }
  
  .hotels-table td {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
    color: var(--text-white);
  }
  
  .hotels-table tr:last-child td {
    border-bottom: none;
  }
  
  .hotels-table tr:hover td {
    background-color: rgba(137, 180, 250, 0.1);
  }
  
  .rating {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    color: var(--background);
  }
  
  .rating svg {
    color: var(--background);
  }
  
  .action-buttons {
    display: flex;
    gap: var(--spacing-sm);
  }
  
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
  
  .edit-btn {
    background: linear-gradient(45deg, var(--warning), var(--warning-dark));
    color: var(--background);
  }
  
  .delete-btn {
    background: linear-gradient(45deg, var(--error), var(--error-dark));
    color: var(--background);
  }
  
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
  
  @media (max-width: 768px) {
    .admin-hotels {
      padding: var(--spacing-md);
    }
    
    .header-actions {
      flex-direction: column;
      gap: var(--spacing-lg);
      padding: var(--spacing-lg);
    }
    
    .search-sort {
      width: 100%;
      flex-direction: column;
    }
    
    .search-input,
    .sort-select {
      width: 100%;
    }
    
    .hotels-table {
      display: block;
      overflow-x: auto;
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
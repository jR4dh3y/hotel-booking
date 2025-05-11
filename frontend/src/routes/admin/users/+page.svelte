<script lang="ts">
  import { onMount } from 'svelte';
  
  type User = {
    user_id: number;
    name: string;
    email: string;
    role: 'admin' | 'user';
  };
  
  let users: User[] = [];
  let loading = true;
  let error = '';
  
  // For add/edit form
  let formMode: 'add' | 'edit' | null = null;
  let currentUser: Partial<User & {password?: string}> = {};
  let formError = '';
  let formSuccess = '';
  
  // For filtering
  let searchQuery = '';
  let filterRole: 'all' | 'admin' | 'user' = 'all';
  
  onMount(async () => {
    await loadUsers();
  });
  
  async function loadUsers() {
    try {
      loading = true;
      error = '';
      
      const response = await fetch('http://localhost:3000/api/auth/admin/users');
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load users');
      }
      
      users = await response.json();
    } catch (err: any) {
      console.error(err);
      error = err.message || 'Failed to load users';
    } finally {
      loading = false;
    }
  }
  
  function showAddForm() {
    formMode = 'add';
    currentUser = {
      role: 'user'
    };
    formError = '';
    formSuccess = '';
  }
  
  function showEditForm(user: User) {
    formMode = 'edit';
    currentUser = { ...user, password: '' };
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
      if (!currentUser.name || !currentUser.email || !currentUser.role) {
        formError = 'Name, email and role are required';
        return;
      }
      
      if (formMode === 'add' && !currentUser.password) {
        formError = 'Password is required for new users';
        return;
      }
      
      let response: Response;
      
      if (formMode === 'add') {
        // Create new user
        response = await fetch('http://localhost:3000/api/auth/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(currentUser)
        });
      } else {
        // Update existing user
        const userData = { ...currentUser };
        // Only send password if it's provided (not empty)
        if (!userData.password) {
          delete userData.password;
        }
        
        response = await fetch(`http://localhost:3000/api/auth/admin/users/${currentUser.user_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userData)
        });
      }
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Something went wrong');
      }
      
      formSuccess = formMode === 'add' ? 'User added successfully' : 'User updated successfully';
      
      // Reload users list
      await loadUsers();
      
      // Close form after short delay
      setTimeout(() => {
        formMode = null;
        formSuccess = '';
      }, 1500);
      
    } catch (err: any) {
      console.error(err);
      formError = err.message || 'Failed to save user';
    }
  }
  
  async function handleDeleteUser(id: number) {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      return;
    }
    
    try {
      loading = true;
      
      const response = await fetch(`http://localhost:3000/api/auth/admin/users/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }
      
      // Reload users list
      await loadUsers();
      
    } catch (err: any) {
      console.error(err);
      error = err.message || 'Failed to delete user';
      loading = false;
    }
  }
  
  function filteredUsers() {
    return users.filter(user => {
      // Filter by role
      if (filterRole !== 'all' && user.role !== filterRole) {
        return false;
      }
      
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchableFields = [
          user.name,
          user.email
        ];
        
        return searchableFields.some(field => field.toLowerCase().includes(query));
      }
      
      return true;
    });
  }
  
  function resetFilters() {
    filterRole = 'all';
    searchQuery = '';
  }
</script>

<div class="admin-users">
  <!-- Header Section with Filters -->
  <div class="filters-section">
    <div class="filters-header">
      <h3>Users Management</h3>
      <div class="header-actions">
        <button class="reset-button" on:click={resetFilters}>Reset Filters</button>
        <button class="add-button" on:click={showAddForm}>
          <span class="icon">➕</span> Add User
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
          placeholder="Search by name or email..." 
        />
      </div>
      
      <div class="filter-group">
        <label for="role-filter">Role</label>
        <select id="role-filter" bind:value={filterRole}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>
    </div>
  </div>
  
  <!-- User Form Modal -->
  {#if formMode}
    <div class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{formMode === 'add' ? 'Add New User' : 'Edit User'}</h3>
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
            <label for="name">Name</label>
            <input 
              type="text" 
              id="name"
              bind:value={currentUser.name}
              required
            />
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email"
              bind:value={currentUser.email}
              required
            />
          </div>
          
          <div class="form-group">
            <label for="password">
              {formMode === 'add' ? 'Password' : 'Password (leave blank to keep current)'}
            </label>
            <input 
              type="password" 
              id="password"
              bind:value={currentUser.password}
              required={formMode === 'add'}
            />
          </div>
          
          <div class="form-group">
            <label for="role">Role</label>
            <select 
              id="role"
              bind:value={currentUser.role}
              required
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button type="button" class="cancel-button" on:click={cancelForm}>Cancel</button>
            <button type="submit" class="submit-button">
              {formMode === 'add' ? 'Add User' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}
  
  <!-- Users List -->
  {#if loading}
    <div class="loading">Loading user data...</div>
  {:else if error}
    <div class="error">
      <p>{error}</p>
      <button class="retry-button" on:click={loadUsers}>Retry</button>
    </div>
  {:else if filteredUsers().length === 0}
    <div class="no-data">
      {#if searchQuery || filterRole !== 'all'}
        No users matching the current filters.
      {:else}
        No users found in the system.
      {/if}
    </div>
  {:else}
    <div class="results-header">
      <h3>Showing {filteredUsers().length} of {users.length} users</h3>
    </div>
    
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredUsers() as user}
            <tr>
              <td class="user-id">#{user.user_id.toString().padStart(6, '0')}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td><span class="role-badge {user.role}">{user.role}</span></td>
              <td class="actions-cell">
                <button class="action-button edit" on:click={() => showEditForm(user)}>
                  ✏️
                </button>
                <button class="action-button delete" on:click={() => handleDeleteUser(user.user_id)}>
                  🗑️
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
  .admin-users {
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
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  .filter-group label {
    color: var(--text-light);
    font-weight: 500;
  }
  
  .filter-group input,
  .filter-group select {
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--background);
    color: var(--text-white);
    font-size: var(--font-size-base);
    transition: all var(--transition-fast);
  }
  
  .filter-group input:focus,
  .filter-group select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.15);
  }
  
  .table-container {
    overflow-x: auto;
    margin-bottom: var(--spacing-xl);
    border-radius: var(--radius-lg);
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-lg);
  }
  
  .users-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    min-width: 1200px;
  }
  
  .users-table th {
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
  
  .users-table td {
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-color);
    color: var(--text-white);
    vertical-align: middle;
    white-space: nowrap;
  }
  
  .users-table tr:last-child td {
    border-bottom: none;
  }
  
  .users-table tr:hover td {
    background-color: rgba(137, 180, 250, 0.1);
  }
  
  .user-id {
    font-family: monospace;
    font-size: var(--font-size-sm);
    color: var(--text-light);
  }
  
  .role-badge {
    display: inline-block;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    font-size: var(--font-size-sm);
    font-weight: 500;
    text-transform: capitalize;
  }
  
  .role-admin {
    background-color: rgba(137, 180, 250, 0.2);
    color: var(--primary);
    border: 1px solid var(--primary);
  }
  
  .role-user {
    background-color: rgba(166, 227, 161, 0.2);
    color: var(--success);
    border: 1px solid var(--success);
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
  .form-group select {
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
  .form-group select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.15);
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
    color: #666;
    margin: 0;
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
    .admin-users {
      padding: var(--spacing-md);
    }
    
    .filters-section {
      padding: var(--spacing-lg);
    }
    
    .filters-grid {
      grid-template-columns: 1fr;
    }
    
    .users-table {
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
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
    
    <div class="users-table">
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
              <td>{user.user_id}</td>
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
  
  /* Users Table */
  .users-table {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
  }
  
  th {
    background-color: #f9f9f9;
    font-weight: 600;
    color: #333;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
  
  tr:hover {
    background-color: #f9f9f9;
  }
  
  .role-badge {
    display: inline-block;
    padding: 0.3rem 0.6rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .role-badge.admin {
    background-color: #FFC107;
    color: #333;
  }
  
  .role-badge.user {
    background-color: #1C6EA4;
    color: white;
  }
  
  .actions-cell {
    display: flex;
    gap: 0.5rem;
  }
  
  .action-button {
    padding: 0.4rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
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
    
    table, thead, tbody, th, td, tr {
      display: block;
    }
    
    thead tr {
      position: absolute;
      top: -9999px;
      left: -9999px;
    }
    
    tr {
      margin-bottom: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
    }
    
    td {
      border: none;
      border-bottom: 1px solid #eee;
      position: relative;
      padding-left: 50%;
    }
    
    td:before {
      position: absolute;
      top: 50%;
      left: 1rem;
      transform: translateY(-50%);
      width: 45%;
      padding-right: 10px;
      white-space: nowrap;
      font-weight: bold;
    }
    
    td:nth-of-type(1):before { content: "ID"; }
    td:nth-of-type(2):before { content: "Name"; }
    td:nth-of-type(3):before { content: "Email"; }
    td:nth-of-type(4):before { content: "Role"; }
    td:nth-of-type(5):before { content: "Actions"; }
  }
</style>
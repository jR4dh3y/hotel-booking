<script lang="ts">
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';
  
  onMount(() => {
    // Check if already logged in as admin
    const unsubscribe = auth.subscribe((state) => {
      if (state.isAuthenticated && state.user?.role === 'admin') {
        goto('/admin/dashboard');
      }
    });
    
    return unsubscribe;
  });

  async function handleSubmit() {
    if (!email || !password) {
      error = 'Please enter both email and password';
      return;
    }
    
    loading = true;
    error = '';
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        error = data.message || 'Login failed';
        return;
      }
      
      // Check if the user is an admin
      if (data.user.role !== 'admin') {
        error = 'Access denied. You need admin privileges to access this area.';
        return;
      }
      
      // Update auth store
      auth.login({
        token: data.token,
        user: data.user
      });
      
      // Redirect to admin dashboard
      goto('/admin/dashboard');
      
    } catch (err) {
      console.error('Login error:', err);
      error = 'An error occurred during login. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="admin-login-page">
  <div class="login-container">
    <div class="login-header">
      <h1>Admin Login</h1>
      <p>Enter your credentials to access the admin panel</p>
    </div>
    
    <form on:submit|preventDefault={handleSubmit}>
      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}
      
      <div class="form-group">
        <label for="email">Email Address</label>
        <input
          type="email"
          id="email"
          bind:value={email}
          placeholder="Enter your email"
          required
          disabled={loading}
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          bind:value={password}
          placeholder="Enter your password"
          required
          disabled={loading}
        />
      </div>
      
      <button type="submit" class="login-button" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
    
    <div class="back-link">
      <a href="/">Return to Website</a>
    </div>
  </div>
</div>

<style>
  .admin-login-page {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
    padding: 1rem;
  }
  
  .login-container {
    width: 100%;
    max-width: 400px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
  
  .login-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .login-header h1 {
    color: #1C6EA4;
    font-size: 1.75rem;
    margin-bottom: 0.5rem;
  }
  
  .login-header p {
    color: #666;
    font-size: 0.95rem;
  }
  
  .form-group {
    margin-bottom: 1.25rem;
  }
  
  label {
    display: block;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #444;
  }
  
  input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    transition: border-color 0.2s;
  }
  
  input:focus {
    outline: none;
    border-color: #1C6EA4;
    box-shadow: 0 0 0 2px rgba(28, 110, 164, 0.1);
  }
  
  .login-button {
    width: 100%;
    padding: 0.875rem 1rem;
    background-color: #1C6EA4;
    color: white;
    font-size: 1rem;
    font-weight: 500;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    margin-top: 1rem;
  }
  
  .login-button:hover {
    background-color: #155c8b;
  }
  
  .login-button:disabled {
    background-color: #7caecd;
    cursor: not-allowed;
  }
  
  .error-message {
    background-color: #fee2e2;
    color: #b91c1c;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }
  
  .back-link {
    margin-top: 2rem;
    text-align: center;
  }
  
  .back-link a {
    color: #1C6EA4;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s;
  }
  
  .back-link a:hover {
    color: #155c8b;
    text-decoration: underline;
  }
  
  @media (max-width: 480px) {
    .login-container {
      padding: 1.5rem;
    }
  }
</style>
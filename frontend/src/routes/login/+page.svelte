<script lang="ts">
  import { goto } from '$app/navigation';
  import { login } from '$lib/api';
  
  let email = '';
  let password = '';
  let name = '';
  let isLogin = true;
  let loading = false;
  let error = '';
  let success = '';
  
  async function handleSubmit() {
    error = '';
    success = '';
    loading = true;
    
    try {
      if (isLogin) {
        const response = await login(email, password);
        success = 'Login successful!';
        // Store user info in localStorage or a store
        localStorage.setItem('user', JSON.stringify(response.user));
        // Redirect to profile page
        goto('/profile');
      } else {
        if (!name) {
          error = 'Name is required for registration';
          loading = false;
          return;
        }
        const response = await register(name, email, password);
        success = 'Registration successful! You can now log in.';
        isLogin = true;
      }
    } catch (err) {
      console.error(err);
      error = isLogin ? 'Invalid credentials' : 'Registration failed';
    } finally {
      loading = false;
    }
  }
  
  function toggleForm() {
    isLogin = !isLogin;
    error = '';
    success = '';
  }
</script>

<div class="auth-container">
  <div class="auth-card">
    <h1>{isLogin ? 'Login' : 'Register'}</h1>
    
    {#if error}
      <div class="error-message">
        {error}
      </div>
    {/if}
    
    {#if success}
      <div class="success-message">
        {success}
      </div>
    {/if}
    
    <form on:submit|preventDefault={handleSubmit}>
      {#if !isLogin}
        <div class="form-group">
          <label for="name">Name</label>
          <input 
            type="text" 
            id="name" 
            bind:value={name} 
            placeholder="Enter your name"
            required
          />
        </div>
      {/if}
      
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email} 
          placeholder="Enter your email"
          required
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
        />
      </div>
      
      <button type="submit" class="submit-button" disabled={loading}>
        {#if loading}
          Loading...
        {:else}
          {isLogin ? 'Login' : 'Register'}
        {/if}
      </button>
    </form>
    
    <div class="toggle-form">
      <p>
        {isLogin ? 'Don\'t have an account?' : 'Already have an account?'}
        <button type="button" on:click={toggleForm} class="toggle-button">
          {isLogin ? 'Register' : 'Login'}
        </button>
      </p>
    </div>
  </div>
</div>

<style>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 200px);
    padding: 2rem;
  }
  
  .auth-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    width: 100%;
    max-width: 400px;
  }
  
  h1 {
    color: #1C6EA4;
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  input:focus {
    outline: none;
    border-color: #1C6EA4;
    box-shadow: 0 0 0 2px rgba(28, 110, 164, 0.2);
  }
  
  .submit-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #1C6EA4;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  
  .submit-button:hover {
    background-color: #155888;
  }
  
  .submit-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
  
  .toggle-form {
    margin-top: 1.5rem;
    text-align: center;
  }
  
  .toggle-button {
    background: none;
    border: none;
    color: #1C6EA4;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    font-size: 1rem;
  }
  
  .toggle-button:hover {
    text-decoration: underline;
  }
  
  .error-message {
    background-color: #f8d7da;
    color: #721c24;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
  
  .success-message {
    background-color: #d4edda;
    color: #155724;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1.5rem;
  }
</style>
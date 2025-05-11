<script lang="ts">
  import { goto } from '$app/navigation';
  import { login, register } from '$lib/api';
  import { auth } from '$lib/stores/auth';
  
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
        // Store user info in localStorage and auth store
        localStorage.setItem('user', JSON.stringify(response.user));
        auth.login(response.user);
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
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-xl);
    background: linear-gradient(145deg, var(--card-bg), var(--background));
  }
  
  .auth-card {
    width: 100%;
    max-width: 400px;
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-2xl);
    box-shadow: var(--shadow-lg);
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
  
  .form-group input {
    width: 100%;
    padding: var(--spacing-md);
    border: 2px solid var(--border-color);
    border-radius: var(--radius-md);
    background-color: var(--background);
    color: var(--text-white);
    font-size: var(--font-size-base);
    transition: all var(--transition-fast);
  }
  
  .form-group input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(137, 180, 250, 0.15);
  }
  
  .submit-button {
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
  
  .submit-button:hover {
    background: linear-gradient(45deg, var(--primary-light), var(--primary));
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  .toggle-form {
    text-align: center;
    margin-top: var(--spacing-lg);
    color: var(--text-light);
  }
  
  .toggle-form button {
    background: none;
    border: none;
    color: var(--primary);
    font-weight: 500;
    cursor: pointer;
    padding: var(--spacing-xs);
    transition: all var(--transition-fast);
  }
  
  .toggle-form button:hover {
    color: var(--primary-light);
    text-decoration: underline;
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
  
  @media (max-width: 768px) {
    .auth-container {
      padding: var(--spacing-md);
    }
    
    .auth-card {
      padding: var(--spacing-xl);
    }
  }
</style>
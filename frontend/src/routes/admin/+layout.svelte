<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let user: any = null;

  onMount(() => {
    const unsubscribe = auth.subscribe((state) => {
      if (state.isAuthenticated && state.user) {
        user = state.user;
      } else {
        goto('/login');
      }
    });
    return unsubscribe;
  });
</script>

<main>
  <div class="admin-container">
    <div class="admin-content">
      <slot />
    </div>
  </div>
</main>

<style>
  main {
    min-height: 100vh;
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    padding: var(--spacing-xl);
  }

  .admin-container {
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  .admin-header {
    margin-bottom: var(--spacing-xl);
    padding-bottom: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
  }


  .admin-nav {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
  }
  .admin-content {
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-lg);
    width: 100%;
  }

  @media (max-width: 768px) {
    main {
      padding: var(--spacing-md);
    }

    .admin-header {
      margin-bottom: var(--spacing-lg);
    }

    .admin-nav {
      gap: var(--spacing-sm);
    }
    .admin-content {
      padding: var(--spacing-lg);
    }
  }
</style>
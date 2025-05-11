<script lang="ts">
  import { auth } from '$lib/stores/auth';
  import { onMount } from 'svelte';

  let user: any = null;

  onMount(() => {
    const unsubscribe = auth.subscribe((state) => {
      if (state.isAuthenticated && state.user) {
        user = state.user;
      }
    });
    return unsubscribe;
  });
</script>
  
    <main>
      <slot></slot>
    </main>
    
<style>
  main {
    padding: 2rem;
    flex: 1;
  }
</style>
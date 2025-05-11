<div class="home-container container">
  <section class="hero">
    <div class="hero-content">
      <h1>Find Your Perfect Stay</h1>
      <p>Discover and book the best hotels for your next adventure</p>
      <div class="hero-buttons">
        <a href="/hotels" class="button primary-button">
          <span>Browse Hotels</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="/rooms" class="button secondary-button">
          <span>View All Rooms</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </a>
      </div>
    </div>
    <div class="hero-overlay"></div>
  </section>

  <section class="features">
    <h2>Why Choose Us</h2>
    <div class="features-grid">
      <div class="feature-card card">
        <div class="feature-icon">🏨</div>
        <h3>Wide Selection</h3>
        <p>Choose from a variety of hotels and room types to suit your needs</p>
      </div>
      <div class="feature-card card">
        <div class="feature-icon">💰</div>
        <h3>Best Prices</h3>
        <p>Get the best deals and competitive rates for your stay</p>
      </div>
      <div class="feature-card card">
        <div class="feature-icon">⭐</div>
        <h3>Quality Service</h3>
        <p>Experience top-notch service and comfortable accommodations</p>
      </div>
    </div>
  </section>
</div>

<style>
  .home-container {
    padding: 0;
  }

  .hero {
    background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
    background-size: cover;
    background-position: center;
    height: 600px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--text-white);
    margin: -2rem -1rem 2rem;
    position: relative;
    overflow: hidden;
  }

  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, rgba(137, 180, 250, 0.2), rgba(180, 190, 254, 0.2));
    z-index: 1;
  }

  .hero-content {
    max-width: 800px;
    padding: 0 var(--spacing-md);
    position: relative;
    z-index: 2;
  }

  .hero h1 {
    font-size: var(--font-size-4xl);
    margin-bottom: var(--spacing-md);
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .hero p {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-xl);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    opacity: 0.9;
  }

  .hero-buttons {
    display: flex;
    gap: var(--spacing-md);
    justify-content: center;
  }

  .primary-button, .secondary-button {
    display: inline-flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: 1rem 2rem;
    border-radius: var(--radius-lg);
    font-weight: 600;
    transition: all var(--transition-fast);
  }

  .primary-button {
    background-color: var(--primary);
    color: var(--background);
  }

  .primary-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    background-color: var(--primary-light);
  }

  .secondary-button {
    background-color: rgba(255, 255, 255, 0.1);
    color: var(--text-white);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .secondary-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }

  .features {
    margin: var(--spacing-2xl) 0;
    text-align: center;
  }

  .features h2 {
    font-size: var(--font-size-3xl);
    margin-bottom: var(--spacing-xl);
    color: var(--text-white);
    font-weight: 700;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-xl);
  }

  .feature-card {
    text-align: center;
    padding: var(--spacing-xl);
    background: linear-gradient(145deg, var(--card-bg), var(--background));
    border: 1px solid var(--border-color);
    transition: all var(--transition-normal);
  }

  .feature-card:hover {
    transform: translateY(-5px);
    border-color: var(--primary);
  }

  .feature-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
    display: inline-block;
    padding: var(--spacing-md);
    background: rgba(137, 180, 250, 0.1);
    border-radius: var(--radius-full);
  }

  .feature-card h3 {
    color: var(--primary);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-size-xl);
    font-weight: 600;
  }

  .feature-card p {
    color: var(--text-light);
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    .hero {
      height: 500px;
    }

    .hero h1 {
      font-size: var(--font-size-3xl);
    }

    .hero p {
      font-size: var(--font-size-lg);
    }

    .hero-buttons {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .features-grid {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
    }

    .feature-card {
      padding: var(--spacing-lg);
    }
  }
</style>
  
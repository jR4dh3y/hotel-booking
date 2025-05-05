<div class="home-container">
  <section class="hero">
    <div class="hero-content">
      <h1>Find Your Perfect Stay</h1>
      <p>Discover and book the best hotels for your next adventure</p>
      <div class="hero-buttons">
        <a href="/hotels" class="primary-button">Browse Hotels</a>
        <a href="/rooms" class="secondary-button">View All Rooms</a>
      </div>
    </div>
  </section>

  <section class="features">
    <h2>Why Choose Us</h2>
    <div class="features-grid">
      <div class="feature-card">
        <div class="feature-icon">🏨</div>
        <h3>Wide Selection</h3>
        <p>Choose from a variety of hotels and room types to suit your needs</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">💰</div>
        <h3>Best Prices</h3>
        <p>Get the best deals and competitive rates for your stay</p>
      </div>
      <div class="feature-card">
        <div class="feature-icon">⭐</div>
        <h3>Quality Service</h3>
        <p>Experience top-notch service and comfortable accommodations</p>
      </div>
    </div>
  </section>
</div>

<style>
  .home-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .hero {
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80');
    background-size: cover;
    background-position: center;
    height: 500px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    margin: -2rem -1rem 2rem;
    position: relative;
  }

  .hero-content {
    max-width: 800px;
    padding: 0 1rem;
    position: relative;
    z-index: 1;
  }

  .hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  .hero p {
    font-size: 1.4rem;
    margin-bottom: 2rem;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  }

  .hero-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
  }

  .primary-button, .secondary-button {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .primary-button {
    background-color: #1C6EA4;
    color: white;
  }

  .primary-button:hover {
    background-color: #155888;
    transform: translateY(-2px);
  }

  .secondary-button {
    background-color: white;
    color: #1C6EA4;
    border: 2px solid #1C6EA4;
  }

  .secondary-button:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
  }

  .features {
    margin: 4rem 0;
  }

  .features h2 {
    text-align: center;
    color: #333;
    margin-bottom: 2rem;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
  }

  .feature-card {
    text-align: center;
    padding: 2rem;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-5px);
  }

  .feature-icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .feature-card h3 {
    color: #1C6EA4;
    margin-bottom: 1rem;
  }

  .feature-card p {
    color: #666;
    line-height: 1.5;
  }

  .loading, .error, .no-hotels {
    text-align: center;
    padding: 2rem;
    background-color: #f9f9f9;
    border-radius: 8px;
  }

  .error {
    color: #d9534f;
    background-color: #f9f2f2;
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: 2rem;
    }

    .hero p {
      font-size: 1rem;
    }

    .hero-buttons {
      flex-direction: column;
    }

    .hotel-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
  
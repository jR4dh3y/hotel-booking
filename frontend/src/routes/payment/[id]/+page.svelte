<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import { getBookings } from '$lib/api';

  let bookingId = parseInt(page.params.id);
  let booking: any = null;
  let loading = true;
  let error = '';
  let cardNumber = '';
  let cardName = '';
  let expiry = '';
  let cvc = '';
  let paymentSuccess = false;

  onMount(async () => {
    try {
      // For demo, fetch all bookings and find the one with this ID
      const allBookings = await getBookings();
      booking = allBookings.find((b: any) => b.booking_id === bookingId);
      if (!booking) error = 'Booking not found.';
    } catch (err) {
      error = 'Failed to load booking.';
    } finally {
      loading = false;
    }
  });

  function calculateTotalPrice() {
    if (!booking) return 0;
    
    const inDate = new Date(booking.check_in_date);
    const outDate = new Date(booking.check_out_date);
    const nights = Math.max(1, Math.floor((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    return nights * 100; // Assuming fixed price per night for demo
  }

  async function handlePayment() {
    if (!booking) return;
    
    try {
      loading = true;
      error = '';
      
      const paymentData = {
        booking_id: booking.booking_id,
        amount: calculateTotalPrice(),
        payment_date: new Date().toISOString().split('T')[0]
      };
      
      console.log('Sending payment:', paymentData);
      
      // Process payment
      const response = await fetch('http://localhost:3000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment failed:', errorData);
        throw new Error(errorData.error || 'Payment failed');
      }

      const result = await response.json();
      console.log('Payment result:', result);
      
      // Update local booking status
      booking.payment_status = result.payment_status;
      paymentSuccess = true;
    } catch (err: any) {
      console.error('Payment error:', err);
      error = err.message || 'Failed to process payment. Please try again.';
    } finally {
      loading = false;
    }
  }
</script>

<div class="payment-container">
  <h1>Payment</h1>
  {#if loading}
    <div class="loading card">
      <p>Loading booking details...</p>
    </div>
  {:else if error}
    <div class="error card">
      <p>{error}</p>
    </div>
  {:else if paymentSuccess}
    <div class="success card">
      <h2>Payment Successful!</h2>
      <p>Your payment for booking #{bookingId} was successful.</p>
      <a href="/profile" class="button primary-button">Go to Profile</a>
    </div>
  {:else if booking}
    <div class="summary card">
      <h2>Booking Summary</h2>
      <p><strong>Hotel:</strong> {booking.hotel_name}</p>
      <p><strong>Room:</strong> {booking.room_number} ({booking.room_type})</p>
      <p><strong>Check-in:</strong> {booking.check_in_date}</p>
      <p><strong>Check-out:</strong> {booking.check_out_date}</p>
      <p><strong>Total Amount:</strong> ${calculateTotalPrice()}</p>
      <p><strong>Booking ID:</strong> #{booking.booking_id}</p>
    </div>
    <form class="payment-form card" on:submit|preventDefault={handlePayment}>
      <h2>Card Details</h2>
      <div class="form-group">
        <label for="cardName">Name on Card</label>
        <input id="cardName" type="text" bind:value={cardName} required />
      </div>
      <div class="form-group">
        <label for="cardNumber">Card Number</label>
        <input id="cardNumber" type="text" maxlength="16" bind:value={cardNumber} required />
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="expiry">Expiry</label>
          <input id="expiry" type="text" placeholder="MM/YY" maxlength="5" bind:value={expiry} required />
        </div>
        <div class="form-group">
          <label for="cvc">CVC</label>
          <input id="cvc" type="text" maxlength="4" bind:value={cvc} required />
        </div>
      </div>
      <button type="submit" class="button primary-button" style="margin-top:1rem;" disabled={loading}>
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  {/if}
</div>

<style>
  .payment-container {
    max-width: 500px;
    margin: 2rem auto;
    padding: 1rem;
  }
  h1 {
    text-align: center;
    margin-bottom: 2rem;
  }
  .summary {
    margin-bottom: 2rem;
  }
  .payment-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .form-row {
    display: flex;
    gap: 1rem;
  }
  .form-row .form-group {
    flex: 1;
  }
  input {
    font-size: 1rem;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
  }
  .success {
    text-align: center;
    color: var(--success);
  }  .error {
    color: var(--error);
    text-align: center;
  }
  
  @media (max-width: 768px) {
    .payment-container {
      padding: var(--spacing-md);
      max-width: 100%;
    }
    
    h1 {
      font-size: var(--font-size-xl);
      margin-bottom: var(--spacing-lg);
    }
    
    .form-row {
      flex-direction: column;
      gap: var(--spacing-sm);
    }
    
    .payment-form {
      gap: var(--spacing-sm);
    }
    
    .form-group {
      margin-bottom: var(--spacing-sm);
    }
    
    input {
      padding: var(--spacing-sm);
    }
  }
</style>
export async function getHotels() {
    const res = await fetch('http://localhost:3000/api/hotels');
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to get hotels' }));
        throw new Error(errorData.error || 'Failed to get hotels');
    }
    return await res.json();
}

export async function getRooms(hotelId?: number) {
    const url = hotelId 
        ? `http://localhost:3000/api/hotels/${hotelId}/rooms` 
        : 'http://localhost:3000/api/rooms';
    const res = await fetch(url);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to get rooms' }));
        throw new Error(errorData.error || 'Failed to get rooms');
    }
    return await res.json();
}

export async function getRoomTypes() {
    const res = await fetch('http://localhost:3000/api/room-types');
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to get room types' }));
        throw new Error(errorData.error || 'Failed to get room types');
    }
    return await res.json();
}

export async function getRoomAmenities(roomTypeId: number) {
    const res = await fetch(`http://localhost:3000/api/room-types/${roomTypeId}`);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to get room amenities' }));
        throw new Error(errorData.error || 'Failed to get room amenities');
    }
    return await res.json();
}

export async function getBookings(userId?: number) {
    const url = userId 
        ? `http://localhost:3000/api/bookings/user/${userId}` 
        : 'http://localhost:3000/api/bookings';
    const res = await fetch(url);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to get bookings' }));
        throw new Error(errorData.error || 'Failed to get bookings');
    }
    return await res.json();
}

// Define interfaces for API data types
export interface BookingData {
    user_id: number;
    room_id: number;
    check_in_date: string;
    check_out_date: string;
}

export async function createBooking(bookingData: BookingData) {
    const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to create booking' }));
        throw new Error(errorData.error || 'Failed to create booking');
    }
    return await res.json();
}

export async function login(email: string, password: string) {
    const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to login' }));
        throw new Error(errorData.error || 'Failed to login');
    }
    return await res.json();
}

export async function register(name: string, email: string, password: string) {
    const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to register' }));
        throw new Error(errorData.error || 'Failed to register');
    }
    return await res.json();
}

export async function cancelBooking(bookingId: number) {
    console.log('Sending cancel request for booking:', bookingId);
    const res = await fetch(`http://localhost:3000/api/bookings/${bookingId}`, {
        method: 'DELETE'
    });
    console.log('Cancel booking response status:', res.status);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to cancel booking' }));
        console.error('Cancel booking error:', errorData);
        throw new Error(errorData.error || 'Failed to cancel booking');
    }
    const data = await res.json();
    console.log('Cancel booking success:', data);
    return data;
}
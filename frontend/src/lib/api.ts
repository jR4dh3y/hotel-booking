export async function getHotels() {
    const res = await fetch('http://localhost:3000/api/hotels');
    if (!res.ok) throw new Error('failed to get hotels');
    return await res.json();
}

export async function getRooms(hotelId?: number) {
    const url = hotelId 
        ? `http://localhost:3000/api/hotels/${hotelId}/rooms` 
        : 'http://localhost:3000/api/rooms';
    const res = await fetch(url);
    if (!res.ok) throw new Error('failed to get rooms');
    return await res.json();
}

export async function getRoomTypes() {
    const res = await fetch('http://localhost:3000/api/room-types');
    if (!res.ok) throw new Error('failed to get room types');
    return await res.json();
}

export async function getBookings(userId?: number) {
    const url = userId 
        ? `http://localhost:3000/api/users/${userId}/bookings` 
        : 'http://localhost:3000/api/bookings';
    const res = await fetch(url);
    if (!res.ok) throw new Error('failed to get bookings');
    return await res.json();
}

export async function createBooking(bookingData: any) {
    const res = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
    });
    if (!res.ok) throw new Error('failed to create booking');
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
    if (!res.ok) throw new Error('failed to login');
    return await res.json();
}

export async function register(userData: any) {
    const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
    if (!res.ok) throw new Error('failed to register');
    return await res.json();
}
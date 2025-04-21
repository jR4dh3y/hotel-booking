export async function getHotels(){
    const res = await fetch('http://localhost:3000/api/hotels');
    if (!res.ok) throw new Error('failed to get hotels');
    return await res.json();
}
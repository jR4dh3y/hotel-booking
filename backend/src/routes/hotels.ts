import { Router } from 'express';
import { db } from '../db';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Define interfaces for type safety
interface HotelRow extends RowDataPacket {
  hotel_id: number;
  hotel_name: string;
  location: string;
  rating: number;
}

interface RoomRow extends RowDataPacket {
  room_id: number;
  room_number: number;
  hotel_id: number;
  room_type_id: number;
  price: number;
  availability: 'available' | 'booked';
  room_type: string;
}

// Get all hotels
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query<HotelRow[]>('SELECT * FROM hotels');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// a specific hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const hotelId = req.params.id;
    const [rows] = await db.query<HotelRow[]>('SELECT * FROM hotels WHERE hotel_id = ?', [hotelId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.json(rows[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// rooms for a specific hotel
router.get('/:id/rooms', async (req, res) => {
  try {
    const hotelId = req.params.id;
    const [rows] = await db.query<RoomRow[]>(
      'SELECT r.*, rt.room_type FROM rooms r JOIN room_types rt ON r.room_type_id = rt.room_type_id WHERE r.hotel_id = ?',
      [hotelId]
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

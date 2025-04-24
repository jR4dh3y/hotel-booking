import { Router } from 'express';
import { db } from '../db';
import { RowDataPacket } from 'mysql2';

const router = Router();

interface RoomRow extends RowDataPacket {
  room_id: number;
  room_number: number;
  hotel_id: number;
  room_type_id: number;
  price: number;
  availability: 'available' | 'booked';
  hotel_name?: string;
  room_type?: string;
}

// all rooms
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query<RoomRow[]>(
      'SELECT r.*, h.hotel_name, rt.room_type FROM rooms r JOIN hotels h ON r.hotel_id = h.hotel_id JOIN room_types rt ON r.room_type_id = rt.room_type_id'
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// rooms by hotel ID
router.get('/hotel/:id', async (req, res) => {
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
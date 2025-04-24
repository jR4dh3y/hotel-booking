import { Router, } from 'express';
import { db } from '../db';
import { RowDataPacket } from 'mysql2';

const router = Router();

// Define interfaces for type safety
interface RoomTypeRow extends RowDataPacket {
  room_type_id: number;
  room_type: string;
  amenity_id?: number;
  amenity_name?: string;
}

interface RoomTypeWithAmenities {
  room_type_id: number;
  room_type: string;
  amenities: Array<{
    amenity_id: number;
    amenity_name: string;
  }>;
}

// Get all room types
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query<RoomTypeRow[]>('SELECT * FROM room_types');
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get room type by ID with amenities
router.get('/:id', async (req, res) => {
  try {
    const roomTypeId = req.params.id;
    const [results] = await db.query<RoomTypeRow[]>(
      'SELECT rt.*, a.amenity_id, a.amenity_name FROM room_types rt LEFT JOIN room_type_amenities rta ON rt.room_type_id = rta.room_type_id LEFT JOIN amenities a ON rta.amenity_id = a.amenity_id WHERE rt.room_type_id = ?',
      [roomTypeId]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Room type not found' });
    }
    
    // Format the response to group amenities
    const roomType: RoomTypeWithAmenities = {
      room_type_id: results[0].room_type_id,
      room_type: results[0].room_type,
      amenities: results[0].amenity_id ? results.map(row => ({
        amenity_id: row.amenity_id!,
        amenity_name: row.amenity_name!
      })) : []
    };
    
    res.json(roomType);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
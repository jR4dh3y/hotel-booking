import { Router, } from 'express';
import { db } from '../db';
import { RowDataPacket } from 'mysql2';

const router = Router();

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
router.get('/', async (_req, res) => {
	try {
		const [rows] = await db.query<RoomTypeRow[]>('SELECT * FROM room_types');
		res.json(rows);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Get room type by ID with amenities
router.get('/:id', async (req, res) => {
	const sql_query = 'SELECT rt.*, a.amenity_id, a.amenity_name FROM room_types rt LEFT JOIN room_type_amenities rta ON rt.room_type_id = rta.room_type_id LEFT JOIN amenities a ON rta.amenity_id = a.amenity_id WHERE rt.room_type_id = ?';
	const { id } = req.params;

	const roomTypeId = parseInt(id, 10);

	const results = (await db.query<RoomTypeRow[]>(sql_query, [roomTypeId]));

	const rows = results[0];

	if (rows.length === 0) {
		res.status(404).json({ error: "Room Type not Found" });
	}


	const roomType: RoomTypeWithAmenities = {
		room_type_id: rows[0].room_type_id,
		room_type: rows[0].room_type,
		amenities: rows.map(row => ({
			amenity_id: row.amenity_id ? row.amenity_id : 0,
			amenity_name: row.amenity_name ? row.amenity_name : "",

		}))
	}




});

export default router;

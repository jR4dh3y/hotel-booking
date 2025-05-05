import { Router } from 'express';
import { db } from '../db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { Request, Response } from 'express';

const router = Router();

// Define interfaces for type safety
interface BookingRow extends RowDataPacket {
	booking_id: number;
	user_id: number;
	room_id: number;
	check_in_date: Date;
	check_out_date: Date;
	payment_status: 'paid' | 'unpaid';
	room_number?: number;
	hotel_name?: string;
	user_name?: string;
	room_type?: string;
}

interface RoomRow extends RowDataPacket {
	room_id: number;
	availability: 'available' | 'booked';
}

// Get all bookings
router.get('/', async (req: Request, res: Response) => {
	try {
		const [rows] = await db.query<BookingRow[]>(
			'SELECT b.*, r.room_number, h.hotel_name, u.name as user_name FROM booking b JOIN rooms r ON b.room_id = r.room_id JOIN hotels h ON r.hotel_id = h.hotel_id JOIN users u ON b.user_id = u.user_id'
		);
		res.json(rows);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Get bookings by user ID
router.get('/user/:id', async (req: Request, res: Response) => {
	try {
		const userId = req.params.id;
		const [rows] = await db.query<BookingRow[]>(
			'SELECT b.booking_id, b.check_in_date, b.check_out_date, r.room_number, h.hotel_name, rt.room_type FROM booking b JOIN rooms r ON b.room_id = r.room_id JOIN hotels h ON r.hotel_id = h.hotel_id JOIN room_types rt ON r.room_type_id = rt.room_type_id WHERE b.user_id = 1',
			[userId]
		);
		res.json(rows);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Create a new booking     
router.post('/', async (req: Request, res: Response) => {
	try {
		const { user_id, room_id, check_in_date, check_out_date } = req.body;

		// Validate required fields
		if (!user_id || !room_id || !check_in_date || !check_out_date) {
			res.status(400).json({ error: 'Missing required fields' });
			return;
		}

		// Check if room is available
		const [roomResults] = await db.query<RoomRow[]>(
			'SELECT availability FROM rooms WHERE room_id = ?',
			[room_id]
		);

		if (roomResults.length === 0) {
			res.status(404).json({ error: 'Room not found' });
			return;
		}

		if (roomResults[0].availability === 'booked') {
			res.status(400).json({ error: 'Room is already booked' });
			return;
		}

		// Create booking
		const [result] = await db.query<ResultSetHeader>(
			'INSERT INTO booking (user_id, room_id, check_in_date, check_out_date, payment_status) VALUES (?, ?, ?, ?, ?)',
			[user_id, room_id, check_in_date, check_out_date, 'unpaid']
		);
		// Delete booking
		

		// Update room availability
		await db.query(
			'UPDATE rooms SET availability = ? WHERE room_id = ?',
			['booked', room_id]
		);

		res.status(201).json({
			booking_id: result.insertId,
			user_id,
			room_id,
			check_in_date,
			check_out_date,
			payment_status: 'unpaid'
		});
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

export default router;

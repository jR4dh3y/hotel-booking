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
router.get('/', async (req: Request, res: Response): Promise<void> => {
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
router.get('/user/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.params.id;
		const [rows] = await db.query<BookingRow[]>(
			'SELECT b.booking_id, b.check_in_date, b.check_out_date, r.room_number, h.hotel_name, rt.room_type, b.payment_status FROM booking b JOIN rooms r ON b.room_id = r.room_id JOIN hotels h ON r.hotel_id = h.hotel_id JOIN room_types rt ON r.room_type_id = rt.room_type_id WHERE b.user_id = ?',
			[userId]
		);
		res.json(rows);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Create a new booking
router.post('/', async (req: Request, res: Response): Promise<void> => {
	try {
		const { user_id, room_id, check_in_date, check_out_date } = req.body;

		// Validate required fields
		if (!user_id || !room_id || !check_in_date || !check_out_date) {
			res.status(400).json({ error: 'Missing required fields' });
			return;
		}

		// Call the stored procedure
		const [result] = await db.query<RowDataPacket[]>(
			'CALL CreateBooking(?, ?, ?, ?)',
			[user_id, room_id, check_in_date, check_out_date]
		);

		res.status(201).json({
			booking_id: result[0].booking_id,
			user_id,
			room_id,
			check_in_date,
			check_out_date,
			payment_status: 'unpaid'
		});
	} catch (err: any) {
		console.error('Error in create booking:', err);
		res.status(500).json({ error: err.message });
	}
});

// Delete booking
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
	const bookingId = req.params.id;
	console.log('Attempting to delete booking:', bookingId);

	try {
		// Start transaction
		await db.query('START TRANSACTION');

		// First delete any payments
		await db.query('DELETE FROM payment WHERE booking_id = ?', [bookingId]);

		// Get the room_id before deleting the booking
		const [bookingRows] = await db.query<BookingRow[]>(
			'SELECT room_id FROM booking WHERE booking_id = ?',
			[bookingId]
		);

		if (bookingRows.length === 0) {
			await db.query('ROLLBACK');
			res.status(404).json({ error: 'Booking not found' });
			return;
		}

		const roomId = bookingRows[0].room_id;

		// Delete the booking
		await db.query('DELETE FROM booking WHERE booking_id = ?', [bookingId]);

		// Update room availability
		await db.query(
			'UPDATE rooms SET availability = ? WHERE room_id = ?',
			['available', roomId]
		);

		// Commit transaction
		await db.query('COMMIT');
		res.json({ message: 'Booking cancelled successfully' });
	} catch (err: any) {
		// Rollback transaction on error
		await db.query('ROLLBACK');
		console.error('Error in delete booking:', err);
		res.status(500).json({ 
			error: err.message,
			details: err.sqlMessage || 'Unknown error occurred'
		});
	}
});

export default router;

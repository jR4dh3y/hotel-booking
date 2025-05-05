import { Router } from 'express';
import { db } from '../db';
import { Request, Response } from 'express';

const router = Router();

// Process a payment
router.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const { booking_id, amount, payment_date } = req.body;
        console.log('Processing payment:', { booking_id, amount, payment_date });

        // Validate required fields
        if (!booking_id || !amount || !payment_date) {
            console.log('Missing required fields:', { booking_id, amount, payment_date });
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Call the stored procedure
        console.log('Calling ProcessPayment procedure');
        await db.query(
            'CALL ProcessPayment(?, ?, ?)',
            [booking_id, amount, payment_date]
        );

        // Get updated booking status
        console.log('Calling SyncPaymentStatus procedure');
        const [result] = await db.query(
            'CALL SyncPaymentStatus(?)',
            [booking_id]
        ) as any[][];

        console.log('Payment processed successfully:', result[0][0]);
        res.json({
            message: 'Payment processed successfully',
            payment_status: result[0][0].new_status
        });
    } catch (err: any) {
        console.error('Error processing payment:', err);
        res.status(500).json({ 
            error: err.message,
            details: err.sqlMessage || 'Unknown error occurred'
        });
    }
});

// Get payment status for a booking
router.get('/booking/:id', async (req: Request, res: Response): Promise<void> => {
    try {
        const bookingId = req.params.id;
        console.log('Getting payment status for booking:', bookingId);

        // Call the sync procedure to ensure status is up to date
        const [result] = await db.query(
            'CALL SyncPaymentStatus(?)',
            [bookingId]
        ) as any[][];

        console.log('Payment status result:', result[0][0]);
        res.json({
            payment_status: result[0][0].new_status
        });
    } catch (err: any) {
        console.error('Error getting payment status:', err);
        res.status(500).json({ 
            error: err.message,
            details: err.sqlMessage || 'Unknown error occurred'
        });
    }
});

export default router; 
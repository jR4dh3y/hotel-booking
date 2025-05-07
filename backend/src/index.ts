import express from 'express';
import cors from 'cors';
import hotelRoutes from './routes/hotels';
import roomRoutes from './routes/rooms';
import roomTypeRoutes from './routes/room-types';
import bookingRoutes from './routes/bookings';
import authRoutes from './routes/auth';
import paymentRoutes from './routes/payments';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/room-types', roomTypeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

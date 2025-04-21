import express from 'express';
import cors from 'cors';
import hotelRoutes from './routes/hotels';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/hotels', hotelRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import { Router } from 'express';
import { db } from '../db';

const router = Router();

router.get('/', (req, res) => {
  db.query('SELECT * FROM hotels', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

export default router;

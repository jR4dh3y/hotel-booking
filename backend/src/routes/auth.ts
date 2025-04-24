import { Router } from 'express';
import { db } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// Define interfaces for type safety
interface UserRow extends RowDataPacket {
  user_id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  password: string;
}

// // Login route
// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
    
//     if (!email || !password) {
//       return res.status(400).json({ error: 'Email and password are required' });
//     }
    
//     const [results] = await db.query<UserRow[]>(
//       'SELECT * FROM users WHERE email = ? AND password = ?',
//       [email, password]
//     );
    
//     if (results.length === 0) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }
    
//     const user = { ...results[0] };
//     // Don't send password back to client
//     delete user.password;
    
//     res.json({
//       message: 'Login successful',
//       user
//     });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Register route
// router.post('/register', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
    
//     if (!name || !email || !password) {
//       return res.status(400).json({ error: 'Name, email and password are required' });
//     }
    
//     // Check if user already exists
//     const [existingUsers] = await db.query<UserRow[]>(
//       'SELECT * FROM users WHERE email = ?',
//       [email]
//     );
    
//     if (existingUsers.length > 0) {
//       return res.status(409).json({ error: 'User already exists' });
//     }
    
//     // Create new user
//     const [result] = await db.query<ResultSetHeader>(
//       'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
//       [name, email, password, 'user']
//     );
    
//     res.status(201).json({
//       message: 'User registered successfully',
//       user_id: result.insertId,
//       name,
//       email,
//       role: 'user'
//     });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// });

export default router;
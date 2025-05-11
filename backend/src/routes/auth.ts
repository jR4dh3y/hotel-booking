import { Router } from 'express';
import { db } from '../db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { Request, Response } from 'express';

const router = Router();

// Define interfaces for type safety
interface UserRow extends RowDataPacket {
	user_id: number;
	name: string;
	email: string;
	role: 'admin' | 'user';
	password: string;
}

// Login route
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			res.status(400).json({ error: 'Email and password are required' });
			return;
		}

		const [results] = await db.query<UserRow[]>(
			'SELECT * FROM users WHERE email = ? AND password = ?',
			[email, password]
		);

		if (results.length === 0) {
			res.status(401).json({ error: 'Invalid credentials' });
			return;
		}

		const user = { ...results[0] };
		// @ts-ignore
		delete user.password;

		res.json({
			message: 'Login successful',
			user
		});
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Register route
router.post('/register', async (req, res) => {
	try {
		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			res.status(400).json({ error: 'Name, email and password are required' });
			return;
		}

		// Check if user already exists
		const [existingUsers] = await db.query<UserRow[]>(
			'SELECT * FROM users WHERE email = ?',
			[email]
		);

		if (existingUsers.length > 0) {
			res.status(409).json({ error: 'User already exists' });
			return;
		}

		// Create new user
		const [result] = await db.query<ResultSetHeader>(
			'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
			[name, email, password, 'user']
		);

		res.status(201).json({
			message: 'User registered successfully',
			user_id: result.insertId,
			name,
			email,
			role: 'user'
		});
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Get all users (admin only)
router.get('/admin/users', async (req: Request, res: Response): Promise<void> => {
	try {
		const [rows] = await db.query<UserRow[]>(
			'SELECT user_id, name, email, role FROM users'
		);
		res.json(rows);
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Create new user (admin only)
router.post('/admin/users', async (req: Request, res: Response): Promise<void> => {
	try {
		const { name, email, password, role } = req.body;

		if (!name || !email || !password || !role) {
			res.status(400).json({ error: 'All fields are required' });
			return;
		}

		// Check if user already exists
		const [existingUsers] = await db.query<UserRow[]>(
			'SELECT * FROM users WHERE email = ?',
			[email]
		);

		if (existingUsers.length > 0) {
			res.status(409).json({ error: 'User already exists' });
			return;
		}

		// Create new user
		const [result] = await db.query<ResultSetHeader>(
			'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
			[name, email, password, role]
		);

		res.status(201).json({
			user_id: result.insertId,
			name,
			email,
			role
		});
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Update user (admin only)
router.put('/admin/users/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.params.id;
		const { name, email, password, role } = req.body;

		if (!name || !email || !role) {
			res.status(400).json({ error: 'Name, email and role are required' });
			return;
		}

		// Check if user exists
		const [existingUsers] = await db.query<UserRow[]>(
			'SELECT * FROM users WHERE user_id = ?',
			[userId]
		);

		if (existingUsers.length === 0) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		// Update user
		if (password) {
			await db.query(
				'UPDATE users SET name = ?, email = ?, password = ?, role = ? WHERE user_id = ?',
				[name, email, password, role, userId]
			);
		} else {
			await db.query(
				'UPDATE users SET name = ?, email = ?, role = ? WHERE user_id = ?',
				[name, email, role, userId]
			);
		}

		res.json({
			user_id: parseInt(userId),
			name,
			email,
			role
		});
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

// Delete user (admin only)
router.delete('/admin/users/:id', async (req: Request, res: Response): Promise<void> => {
	try {
		const userId = req.params.id;

		// Check if user exists
		const [existingUsers] = await db.query<UserRow[]>(
			'SELECT * FROM users WHERE user_id = ?',
			[userId]
		);

		if (existingUsers.length === 0) {
			res.status(404).json({ error: 'User not found' });
			return;
		}

		// Delete user
		await db.query('DELETE FROM users WHERE user_id = ?', [userId]);

		res.json({ message: 'User deleted successfully' });
	} catch (err: any) {
		res.status(500).json({ error: err.message });
	}
});

export default router;

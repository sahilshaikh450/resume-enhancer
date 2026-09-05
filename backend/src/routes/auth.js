import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';
const MONGO_URI = process.env.MONGODB_URI;

let db;
async function getDB() {
  if (db) return db;
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db('resume-enhancer');
  return db;
}

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const db = await getDB();
    if (await db.collection('users').findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const result = await db.collection('users').insertOne({ name, email, password: hashed, provider: 'email', createdAt: new Date() });
    const token = jwt.sign({ userId: result.insertedId, email, name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { name, email, id: result.insertedId } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const db = await getDB();
    const user = await db.collection('users').findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password))
      return res.status(401).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { name: user.name, email: user.email, id: user._id } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/google', async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const db = await getDB();
    let user = await db.collection('users').findOne({ email });
    if (!user) {
      const result = await db.collection('users').insertOne({ name, email, googleId, avatar, provider: 'google', createdAt: new Date() });
      user = { _id: result.insertedId, name, email };
    }
    const token = jwt.sign({ userId: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { name: user.name, email: user.email, id: user._id } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const db = await getDB();
    const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.userId) }, { projection: { password: 0 } });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/history', authMiddleware, async (req, res) => {
  try {
    const db = await getDB();
    await db.collection('history').insertOne({ userId: new ObjectId(req.user.userId), ...req.body, createdAt: new Date() });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/history', authMiddleware, async (req, res) => {
  try {
    const db = await getDB();
    const history = await db.collection('history').find({ userId: new ObjectId(req.user.userId) }).sort({ createdAt: -1 }).limit(20).toArray();
    res.json({ success: true, data: history });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;

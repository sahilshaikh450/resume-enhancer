import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const MONGO_URI = process.env.MONGODB_URI;

let db;
async function getDB() {
  if (db) return db;
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db('resume-enhancer');
  return db;
}

// Save scan to history
router.post('/save', async (req, res) => {
  try {
    const { userId, resumeName, atsScore, sectionScores, matchedKeywords, missingKeywords, suggestions } = req.body;
    if (!userId || !atsScore) return res.status(400).json({ error: 'userId and atsScore required' });

    const db = await getDB();
    const result = await db.collection('resume_history').insertOne({
      userId,
      resumeName: resumeName || 'Untitled Resume',
      atsScore,
      sectionScores: sectionScores || {},
      matchedKeywords: matchedKeywords || [],
      missingKeywords: missingKeywords || [],
      suggestions: suggestions || [],
      createdAt: new Date()
    });

    res.json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error('Save history error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get user history
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await getDB();
    const history = await db.collection('resume_history')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    res.json({ success: true, data: history });
  } catch (err) {
    console.error('Get history error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete a scan
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDB();
    await db.collection('resume_history').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
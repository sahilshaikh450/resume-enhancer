import express from 'express';
import { indexResume, queryResume, clearSession } from '../services/ragService.js';

const router = express.Router();

router.post('/index', async (req, res) => {
  try {
    const { resumeText, sessionId, metadata } = req.body;
    if (!resumeText || !sessionId) {
      return res.status(400).json({ error: 'resumeText and sessionId are required' });
    }
    const result = await indexResume(sessionId, resumeText, metadata || {});
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('RAG index error:', err);
    res.status(500).json({ error: 'Failed to index resume', message: err.message });
  }
});

router.post('/query', async (req, res) => {
  try {
    const { query, sessionId, topK } = req.body;
    if (!query || !sessionId) {
      return res.status(400).json({ error: 'query and sessionId are required' });
    }
    const result = await queryResume(sessionId, query, topK || 3);
    res.json({ success: true, data: { answer: result } });
  } catch (err) {
    console.error('RAG query error:', err);
    res.status(500).json({ error: 'RAG query failed', message: err.message });
  }
});

router.delete('/session/:sessionId', async (req, res) => {
  try {
    await clearSession(req.params.sessionId);
    res.json({ success: true, message: 'Session cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear session', message: err.message });
  }
});

export default router;

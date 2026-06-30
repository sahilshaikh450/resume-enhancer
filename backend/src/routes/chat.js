import express from 'express';
import { chatWithAI } from '../services/groqService.js';

const router = express.Router();
const sessions = new Map();

router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, resumeContext } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });
    const sid = sessionId || 'default';
    if (!sessions.has(sid)) sessions.set(sid, []);
    const history = sessions.get(sid);
    history.push({ role: 'user', content: message });
    const recentHistory = history.slice(-20);
    const reply = await chatWithAI(recentHistory, resumeContext || '');
    history.push({ role: 'assistant', content: reply });
    res.json({ success: true, data: { reply, sessionId: sid } });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Chat failed', message: err.message });
  }
});

router.delete('/session/:sessionId', (req, res) => {
  sessions.delete(req.params.sessionId);
  res.json({ success: true });
});

export default router;

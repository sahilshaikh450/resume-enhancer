import express from 'express';
import { generateInterviewQuestions } from '../services/groqService.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { profile, jobRole } = req.body;
    if (!profile) return res.status(400).json({ error: 'profile is required' });
    const questions = await generateInterviewQuestions(profile, jobRole || 'Software Engineer');
    res.json({ success: true, data: questions });
  } catch (err) {
    console.error('Interview gen error:', err);
    res.status(500).json({ error: 'Failed to generate questions', message: err.message });
  }
});

export default router;

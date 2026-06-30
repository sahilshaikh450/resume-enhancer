import express from 'express';
import multer from 'multer';
import { enhanceResume, analyzeResumeForRAG, analyzeATSScore } from '../services/groqService.js';
import { indexResume } from '../services/ragService.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Enhance resume text with job description
router.post('/enhance', async (req, res) => {
  try {
    const { resumeContent, jobDescription, sessionId } = req.body;
    if (!resumeContent || !jobDescription) {
      return res.status(400).json({ error: 'resumeContent and jobDescription are required' });
    }
    const result = await enhanceResume(resumeContent, jobDescription);
    res.json({ success: true, data: result, sessionId });
  } catch (err) {
    console.error('Enhance error:', err);
    res.status(500).json({ error: 'Failed to enhance resume', message: err.message });
  }
});

// NEW: Upload PDF and get full ATS report
router.post('/ats-check', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription, sessionId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract text from PDF. Make sure it is not a scanned image.' });
    }

    // Run ATS analysis + index for RAG in parallel
    const [atsResult] = await Promise.all([
      analyzeATSScore(resumeText, jobDescription || ''),
      indexResume(sessionId || 'default', resumeText).catch(() => {})
    ]);

    res.json({ success: true, data: { ...atsResult, resumeText: resumeText.slice(0, 300) } });
  } catch (err) {
    console.error('ATS check error:', err);
    res.status(500).json({ error: 'Failed to analyze resume', message: err.message });
  }
});

// Upload PDF resume and index for RAG
router.post('/upload', upload.single('resume'), async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;
    const [analysis, indexResult] = await Promise.all([
      analyzeResumeForRAG(resumeText),
      indexResume(sessionId || 'default', resumeText, { filename: req.file.originalname })
    ]);
    res.json({ success: true, data: { analysis, indexResult, rawText: resumeText.slice(0, 500) + '...' } });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Failed to process resume', message: err.message });
  }
});

// Analyze resume text
router.post('/analyze', async (req, res) => {
  try {
    const { resumeText, sessionId } = req.body;
    if (!resumeText) return res.status(400).json({ error: 'resumeText is required' });
    const [analysis, indexResult] = await Promise.all([
      analyzeResumeForRAG(resumeText),
      indexResume(sessionId || 'default', resumeText)
    ]);
    res.json({ success: true, data: { analysis, indexResult } });
  } catch (err) {
    console.error('Analyze error:', err);
    res.status(500).json({ error: 'Failed to analyze resume', message: err.message });
  }
});

export default router;
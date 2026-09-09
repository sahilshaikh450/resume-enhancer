import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

router.post('/generate', async (req, res) => {
  try {
    const { resumeText, jobDescription, companyName, jobTitle, tone } = req.body;
    if (!resumeText || !jobDescription) {
      return res.status(400).json({ error: 'Resume and job description are required' });
    }

    const groq = getGroq();
    const response = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert career coach and professional writer. Generate a compelling, personalized cover letter. Always respond with valid JSON only.`
        },
        {
          role: 'user',
          content: `Generate a professional cover letter based on:

Resume: ${resumeText}

Job Description: ${jobDescription}

Company: ${companyName || 'the company'}
Job Title: ${jobTitle || 'the position'}
Tone: ${tone || 'professional'}

Return JSON:
{
  "subject": "Application for [Job Title] Position",
  "coverLetter": "Full cover letter text here with proper paragraphs...",
  "keyPoints": ["point1", "point2", "point3"],
  "wordCount": 320,
  "matchScore": 85
}`
        }
      ]
    });

    const data = JSON.parse(response.choices[0].message.content);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Cover letter error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
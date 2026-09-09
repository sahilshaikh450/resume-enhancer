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

    // Generate cover letter as plain text
    const letterRes = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 800,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: `You are an expert career coach. Write a ${tone || 'professional'} cover letter. Return only the cover letter text, nothing else.`
        },
        {
          role: 'user',
          content: `Write a cover letter for:
Company: ${companyName || 'the company'}
Job Title: ${jobTitle || 'the position'}
Tone: ${tone || 'professional'}

Resume Summary: ${resumeText.slice(0, 800)}
Job Description: ${jobDescription.slice(0, 600)}

Write 3-4 paragraphs. Start with "Dear Hiring Manager," and end with "Sincerely, [Your Name]"`
        }
      ]
    });

    const coverLetter = letterRes.choices[0].message.content.trim();

    // Generate key points separately
    const pointsRes = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 200,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'Extract 3 key strengths from this resume for this job. Return only 3 bullet points, one per line, no numbering.'
        },
        {
          role: 'user',
          content: `Resume: ${resumeText.slice(0, 500)}\nJob: ${jobDescription.slice(0, 300)}`
        }
      ]
    });

    const pointsText = pointsRes.choices[0].message.content.trim();
    const keyPoints = pointsText.split('\n').filter(p => p.trim()).slice(0, 3).map(p => p.replace(/^[-•*]\s*/, '').trim());

    // Calculate match score based on keyword overlap
    const resumeWords = new Set(resumeText.toLowerCase().split(/\W+/));
    const jobWords = jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 4);
    const matched = jobWords.filter(w => resumeWords.has(w)).length;
    const matchScore = Math.min(95, Math.max(45, Math.round((matched / Math.max(jobWords.length, 1)) * 100 * 2.5)));

    res.json({
      success: true,
      data: {
        subject: `Application for ${jobTitle || 'the position'} at ${companyName || 'the company'}`,
        coverLetter,
        keyPoints: keyPoints.length > 0 ? keyPoints : ['Strong technical skills', 'Relevant project experience', 'Team collaboration'],
        wordCount: coverLetter.split(' ').length,
        matchScore
      }
    });

  } catch (err) {
    console.error('Cover letter error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
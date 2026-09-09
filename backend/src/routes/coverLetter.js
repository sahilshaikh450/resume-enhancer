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
      messages: [
        {
          role: 'system',
          content: `You are an expert career coach. Generate a cover letter and return ONLY a valid JSON object with no extra text, no markdown, no backticks. Just raw JSON.`
        },
        {
          role: 'user',
          content: `Generate a cover letter based on:

Resume: ${resumeText.slice(0, 1500)}

Job Description: ${jobDescription.slice(0, 1000)}

Company: ${companyName || 'the company'}
Job Title: ${jobTitle || 'the position'}
Tone: ${tone || 'professional'}

Return ONLY this JSON with no extra text:
{"subject":"Application for ${jobTitle || 'the position'} at ${companyName || 'the company'}","coverLetter":"Dear Hiring Manager,\\n\\n[3-4 paragraphs here]\\n\\nSincerely,\\n[Candidate Name]","keyPoints":["key strength 1","key strength 2","key strength 3"],"wordCount":300,"matchScore":80}`
        }
      ]
    });

    let text = response.choices[0].message.content.trim();
    
    // Clean up any markdown or extra text
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find JSON in response
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.slice(jsonStart, jsonEnd + 1);
    }

    const data = JSON.parse(text);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Cover letter error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
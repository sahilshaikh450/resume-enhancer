import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function enhanceResume(resumeContent, jobDescription) {
  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 2000,
    system: `You are an expert ATS resume optimizer and career coach. Your task is to:
1. Rewrite resume bullets with strong action verbs and quantifiable achievements
2. Align content with the job description keywords
3. Improve ATS compatibility and keyword density
4. Return a structured JSON response only — no markdown, no preamble.`,
    messages: [{
      role: 'user',
      content: `Resume Content:\n${resumeContent}\n\nJob Description:\n${jobDescription}\n\nReturn JSON with this exact structure:
{
  "enhanced_bullets": ["bullet1", "bullet2", ...],
  "ats_score": 85,
  "keyword_score": 78,
  "impact_score": 82,
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword3", "keyword4"],
  "suggestions": ["suggestion1", "suggestion2"]
}`
    }]
  });

  const text = message.content[0].text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

export async function generateInterviewQuestions(profile, jobRole) {
  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 3000,
    system: `You are an expert interviewer and career coach. Generate realistic, personalized interview questions with detailed sample answers. Tailor questions to the candidate's specific experience and skills. Return JSON only.`,
    messages: [{
      role: 'user',
      content: `Candidate Profile:\n${profile}\nJob Role: ${jobRole}\n\nReturn JSON:
{
  "technical": [
    {"question": "...", "sample_answer": "...", "key_points": ["point1","point2"], "difficulty": "medium"}
  ],
  "behavioral": [
    {"question": "...", "sample_answer": "...", "key_points": ["point1","point2"], "difficulty": "easy"}
  ],
  "situational": [
    {"question": "...", "sample_answer": "...", "key_points": ["point1","point2"], "difficulty": "hard"}
  ]
}`
    }]
  });

  const text = message.content[0].text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

export async function chatWithAI(messages, resumeContext = '') {
  const systemPrompt = `You are an expert career coach and AI interview preparation assistant. 
${resumeContext ? `The candidate's resume context:\n${resumeContext}\n\n` : ''}
Help with:
- Resume improvement advice
- Interview preparation and practice
- Project explanations
- Career guidance
- Answering tough interview questions

Be concise, practical, and encouraging. Format responses clearly.`;

  const response = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1500,
    system: systemPrompt,
    messages: messages
  });

  return response.content[0].text;
}

export async function analyzeResumeForRAG(resumeText) {
  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1000,
    system: 'Extract structured information from the resume. Return JSON only.',
    messages: [{
      role: 'user',
      content: `Resume:\n${resumeText}\n\nReturn JSON:
{
  "name": "...",
  "skills": ["skill1","skill2"],
  "experience": [{"role":"...","company":"...","duration":"...","highlights":["..."]}],
  "projects": [{"name":"...","tech":["..."],"description":"..."}],
  "education": [{"degree":"...","institution":"...","year":"..."}],
  "summary": "2-3 sentence professional summary"
}`
    }]
  });

  const text = message.content[0].text.replace(/```json|```/g, '').trim();
  return JSON.parse(text);
}

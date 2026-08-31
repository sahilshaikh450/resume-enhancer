import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const MODEL = 'llama-3.1-8b-instant';
function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

async function chat(systemPrompt, userPrompt, jsonMode = false) {
  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    max_tokens: 2000,
    response_format: jsonMode ? { type: 'json_object' } : undefined,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });
  return response.choices[0].message.content;
}

export async function enhanceResume(resumeContent, jobDescription) {
  const text = await chat(
    `You are an expert ATS resume optimizer. Rewrite resume bullets with strong action verbs, quantifiable achievements, and job-aligned keywords. Always respond with valid JSON only.`,
    `Resume Content:\n${resumeContent}\n\nJob Description:\n${jobDescription}\n\nReturn JSON:
{
  "enhanced_bullets": ["bullet1", "bullet2"],
  "ats_score": 85,
  "keyword_score": 78,
  "impact_score": 82,
  "matched_keywords": ["kw1", "kw2"],
  "missing_keywords": ["kw3"],
  "suggestions": ["tip1", "tip2"]
}`, true);
  return JSON.parse(text);
}

export async function analyzeATSScore(resumeText, jobDescription) {
  const text = await chat(
    `You are an expert ATS (Applicant Tracking System) analyst and career coach. Analyze the resume deeply and provide detailed ATS compatibility report. Always respond with valid JSON only.`,
    `Resume:\n${resumeText}\n\nJob Description:\n${jobDescription || 'General software engineering role'}\n\nAnalyze and return JSON:
{
  "candidate_name": "extracted name or Unknown",
  "overall_ats_score": 72,
  "section_scores": {
    "contact_info": 90,
    "work_experience": 75,
    "skills": 80,
    "education": 85,
    "formatting": 70,
    "keywords": 65
  },
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword3", "keyword4"],
  "skills_found": ["skill1", "skill2"],
  "experience_years": 3,
  "education_level": "Bachelor's",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "critical_fixes": ["fix1", "fix2"],
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "rewritten_summary": "A powerful 2-3 sentence professional summary rewritten for ATS"
}`, true);
  return JSON.parse(text);
}

export async function generateInterviewQuestions(profile, jobRole) {
  const text = await chat(
    `You are an expert interviewer. Generate personalized interview questions with detailed sample answers. Always respond with valid JSON only.`,
    `Candidate: ${profile}\nRole: ${jobRole}\n\nReturn JSON:
{
  "technical": [{"question":"...","sample_answer":"...","key_points":["..."],"difficulty":"medium"}],
  "behavioral": [{"question":"...","sample_answer":"...","key_points":["..."],"difficulty":"easy"}],
  "situational": [{"question":"...","sample_answer":"...","key_points":["..."],"difficulty":"hard"}]
}`, true);
  return JSON.parse(text);
}

export async function chatWithAI(messages, resumeContext = '') {
  const groq = getGroq();
  const systemPrompt = `You are an expert career coach and interview preparation assistant.
${resumeContext ? `Candidate resume context:\n${resumeContext}\n` : ''}
Help with resume improvement, interview prep, project explanations, and career guidance. Be concise and practical.`;

  const response = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.5,
    max_tokens: 1000,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages
    ]
  });
  return response.choices[0].message.content;
}

export async function analyzeResumeForRAG(resumeText) {
  const text = await chat(
    `Extract structured information from resume. Always respond with valid JSON only.`,
    `Resume:\n${resumeText}\n\nReturn JSON:
{
  "name": "...",
  "skills": ["skill1"],
  "experience": [{"role":"...","company":"...","duration":"...","highlights":["..."]}],
  "projects": [{"name":"...","tech":["..."],"description":"..."}],
  "education": [{"degree":"...","institution":"...","year":"..."}],
  "summary": "2-3 sentence professional summary"
}`, true);
  return JSON.parse(text);
}

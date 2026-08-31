import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const MODEL = process.env.GROQ_MODEL || 'llama3-8b-8192';
const store = new Map();

function getGroq() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

function splitText(text, chunkSize = 400, overlap = 50) {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

function embed(text) {
  const words = text.toLowerCase().split(/\W+/);
  const freq = {};
  words.forEach(w => { if (w.length > 2) freq[w] = (freq[w] || 0) + 1; });
  return freq;
}

function similarity(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  let dot = 0, normA = 0, normB = 0;
  keys.forEach(k => {
    const va = a[k] || 0, vb = b[k] || 0;
    dot += va * vb; normA += va * va; normB += vb * vb;
  });
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

export async function indexResume(sessionId, resumeText) {
  const chunks = splitText(resumeText).map(text => ({ text, embedding: embed(text) }));
  store.set(sessionId, chunks);
  return { chunksIndexed: chunks.length };
}

export async function queryResume(sessionId, query, topK = 3) {
  const chunks = store.get(sessionId) || [];
  if (!chunks.length) return 'Resume not indexed yet. Please upload your resume in the Analyzer tab first.';

  const queryEmb = embed(query);
  const context = chunks
    .map(c => ({ text: c.text, score: similarity(queryEmb, c.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(c => c.text)
    .join('\n\n');

  const groq = getGroq();
  const response = await groq.chat.completions.create({
    model: MODEL,
    max_tokens: 800,
    messages: [
      { role: 'system', content: `You are a career coach. Use this resume context:\n\n${context}` },
      { role: 'user', content: query }
    ]
  });
  return response.choices[0].message.content;
}

export async function clearSession(sessionId) {
  store.delete(sessionId);
}

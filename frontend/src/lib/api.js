import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  res => res.data,
  err => {
    const msg = err.response?.data?.message || err.message || 'Something went wrong';
    throw new Error(msg);
  }
);

export const resumeAPI = {
  enhance: (resumeContent, jobDescription, sessionId) =>
    api.post('/resume/enhance', { resumeContent, jobDescription, sessionId }),
  analyze: (resumeText, sessionId) =>
    api.post('/resume/analyze', { resumeText, sessionId }),
  atsCheck: (file, jobDescription, sessionId) => {
    const form = new FormData();
    form.append('resume', file);
    form.append('jobDescription', jobDescription || '');
    form.append('sessionId', sessionId || 'default');
    return api.post('/resume/ats-check', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 90000,
    });
  },
};

export const interviewAPI = {
  generate: (profile, jobRole) =>
    api.post('/interview/generate', { profile, jobRole }),
};

export const chatAPI = {
  send: (message, sessionId, resumeContext) =>
    api.post('/chat/message', { message, sessionId, resumeContext }),
  clearSession: (sessionId) =>
    api.delete(`/chat/session/${sessionId}`),
};

export const ragAPI = {
  query: (query, sessionId) =>
    api.post('/rag/query', { query, sessionId }),
};

export default api;
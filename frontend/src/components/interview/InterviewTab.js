'use client';
import { useState } from 'react';
import { MessageSquare, ChevronDown, ChevronUp, AlertCircle, Cpu, Heart, Lightbulb } from 'lucide-react';
import { interviewAPI } from '../../lib/api';

const DIFFICULTY_COLORS = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-red-100 text-red-700',
};

function QuestionCard({ q, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start gap-3">
          <span className="text-brand font-bold text-sm shrink-0 mt-0.5">Q{index + 1}</span>
          <p className="text-sm font-medium text-gray-800">{q.question}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          {q.difficulty && (
            <span className={`badge text-xs ${DIFFICULTY_COLORS[q.difficulty] || 'bg-gray-100 text-gray-600'}`}>
              {q.difficulty}
            </span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
          <div>
            <p className="label mb-2">Sample Answer</p>
            <p className="text-sm text-gray-700 leading-relaxed">{q.sample_answer}</p>
          </div>
          {q.key_points?.length > 0 && (
            <div>
              <p className="label mb-2">Key Points to Cover</p>
              <ul className="space-y-1">
                {q.key_points.map((pt, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-brand shrink-0">✓</span> {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const CATEGORY_ICONS = {
  technical: Cpu,
  behavioral: Heart,
  situational: Lightbulb,
};

export default function InterviewTab({ sessionId, resumeContext }) {
  const [profile, setProfile] = useState(
    'Full-stack developer with 2 years experience. Skills: React, Node.js, Express, REST APIs, LangChain, RAG pipelines, PostgreSQL, Docker. Built AI-powered applications and microservices.'
  );
  const [jobRole, setJobRole] = useState('Senior Software Engineer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleGenerate() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await interviewAPI.generate(
        resumeContext ? `${profile}\n\nResume context: ${resumeContext.slice(0, 800)}` : profile,
        jobRole
      );
      setResult(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const totalQ = result ? Object.values(result).flat().length : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <label className="label">Your Profile & Skills</label>
          <textarea
            className="textarea h-28"
            value={profile}
            onChange={e => setProfile(e.target.value)}
            placeholder="Describe your skills, years of experience, tech stack..."
          />
        </div>
        <div className="space-y-2">
          <label className="label">Target Job Role</label>
          <input
            className="input"
            value={jobRole}
            onChange={e => setJobRole(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
          />
          {resumeContext && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span>✓</span> Resume context loaded from Enhance tab
            </p>
          )}
        </div>
      </div>

      <button className="btn-primary" onClick={handleGenerate} disabled={loading}>
        {loading ? (
          <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> Generating Q&A...</>
        ) : (
          <><MessageSquare className="w-4 h-4" /> Generate Interview Q&A</>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <p className="text-sm text-gray-500">{totalQ} questions generated across {Object.keys(result).length} categories</p>
          {Object.entries(result).map(([category, questions]) => {
            if (!Array.isArray(questions) || !questions.length) return null;
            const Icon = CATEGORY_ICONS[category] || MessageSquare;
            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-brand" />
                  <h3 className="text-sm font-semibold text-gray-800 capitalize">{category} Questions</h3>
                  <span className="badge bg-brand-light text-brand">{questions.length}</span>
                </div>
                <div className="space-y-2">
                  {questions.map((q, i) => <QuestionCard key={i} q={q} index={i} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

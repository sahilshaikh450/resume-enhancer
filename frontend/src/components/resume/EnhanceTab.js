'use client';
import { useState } from 'react';
import { Sparkles, Upload, CheckCircle, AlertCircle, Target, TrendingUp, Key } from 'lucide-react';
import { resumeAPI } from '../../lib/api';

export default function EnhanceTab({ sessionId, onResumeIndexed }) {
  const [resumeContent, setResumeContent] = useState(
    `• Developed web application using React and Node.js
• Built REST APIs for user authentication and data management
• Worked on database optimization and performance improvements
• Created frontend components for the dashboard
• Collaborated with team on various features`
  );
  const [jobDesc, setJobDesc] = useState(
    `We are looking for a Senior Software Engineer with 3+ years experience in React, Node.js, REST APIs, AWS cloud infrastructure, and CI/CD pipelines. Strong problem-solving skills and Agile methodology experience required.`
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleEnhance() {
    if (!resumeContent.trim() || !jobDesc.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      // Index resume for RAG in parallel
      resumeAPI.analyze(resumeContent, sessionId).then(r => {
        if (onResumeIndexed && r?.data?.analysis?.summary) {
          onResumeIndexed(resumeContent);
        }
      }).catch(() => {});

      const response = await resumeAPI.enhance(resumeContent, jobDesc, sessionId);
      setResult(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = (val) => {
    if (val >= 80) return 'text-green-600';
    if (val >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="label">Your Resume Content</label>
          <textarea
            className="textarea h-52"
            value={resumeContent}
            onChange={e => setResumeContent(e.target.value)}
            placeholder="Paste your resume bullets, summary, or full content..."
          />
          <p className="text-xs text-gray-400">{resumeContent.length} characters</p>
        </div>
        <div className="space-y-2">
          <label className="label">Job Description</label>
          <textarea
            className="textarea h-52"
            value={jobDesc}
            onChange={e => setJobDesc(e.target.value)}
            placeholder="Paste the job description to align your resume..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="btn-primary" onClick={handleEnhance} disabled={loading}>
          {loading ? (
            <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> Enhancing...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Enhance with AI</>
          )}
        </button>
        <span className="text-xs text-gray-400">This also indexes your resume for the AI Coach</span>
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-5 animate-in fade-in duration-300">
          {/* Scores */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'ATS Score', val: result.ats_score, icon: Target },
              { label: 'Keyword Match', val: result.keyword_score, icon: Key },
              { label: 'Impact Score', val: result.impact_score, icon: TrendingUp },
            ].map(({ label, val, icon: Icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4 text-center">
                <Icon className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                <p className={`text-2xl font-bold ${scoreColor(val)}`}>{val}%</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Enhanced bullets */}
          <div>
            <p className="label mb-3">Enhanced Resume Bullets</p>
            <div className="space-y-2">
              {result.enhanced_bullets?.map((bullet, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-800">{bullet}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          {result.matched_keywords?.length > 0 && (
            <div>
              <p className="label mb-2">Matched Keywords</p>
              <div className="flex flex-wrap gap-2">
                {result.matched_keywords.map(k => (
                  <span key={k} className="badge bg-green-100 text-green-700">{k}</span>
                ))}
              </div>
            </div>
          )}

          {result.missing_keywords?.length > 0 && (
            <div>
              <p className="label mb-2">Missing Keywords — consider adding</p>
              <div className="flex flex-wrap gap-2">
                {result.missing_keywords.map(k => (
                  <span key={k} className="badge bg-amber-100 text-amber-700">{k}</span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div>
              <p className="label mb-2">AI Suggestions</p>
              <ul className="space-y-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-brand font-bold shrink-0">→</span> {s}
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

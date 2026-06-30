'use client';
import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, AlertCircle, Target, Zap, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { resumeAPI } from '../../lib/api';

function ScoreCircle({ score, size = 'lg' }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const bg = score >= 80 ? 'bg-green-50' : score >= 60 ? 'bg-amber-50' : 'bg-red-50';
  const r = size === 'lg' ? 52 : 36;
  const cx = size === 'lg' ? 60 : 44;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center ${bg} rounded-2xl p-5`}>
      <svg width={cx * 2} height={cx * 2}>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx={cx} cy={cx} r={r} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cx})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x={cx} y={cx + 6} textAnchor="middle" fontSize={size === 'lg' ? '22' : '16'} fontWeight="700" fill={color}>
          {score}%
        </text>
      </svg>
      <p className="text-xs text-gray-500 mt-1 font-medium">Overall ATS Score</p>
    </div>
  );
}

function SectionScore({ label, score }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-400' : 'bg-red-400';
  const textColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-500';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 font-medium">{label}</span>
        <span className={`font-bold ${textColor}`}>{score}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const SECTION_LABELS = {
  contact_info: 'Contact Info',
  work_experience: 'Work Experience',
  skills: 'Skills Section',
  education: 'Education',
  formatting: 'Formatting',
  keywords: 'Keyword Match',
};

export default function ATSAnalyzer({ sessionId, onResumeAnalyzed }) {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const fileRef = useRef();

  function handleDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
    else setError('Please upload a PDF file only!');
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await resumeAPI.atsCheck(file, jobDesc, sessionId);
      setResult(response.data);
      if (onResumeAnalyzed) onResumeAnalyzed(response.data.resumeText || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <label className="label">Upload Resume (PDF)</label>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              file ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-brand hover:bg-brand-light/20'
            }`}
          >
            <input ref={fileRef} type="file" accept=".pdf" className="hidden"
              onChange={e => { if (e.target.files[0]) { setFile(e.target.files[0]); setError(''); } }} />
            {file ? (
              <div className="space-y-2">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto" />
                <p className="text-sm font-semibold text-green-700">{file.name}</p>
                <p className="text-xs text-green-500">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-medium text-gray-500">Drag & drop PDF here</p>
                <p className="text-xs text-gray-400">or click to browse</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="label">Job Description <span className="text-gray-400 normal-case font-normal">(optional but recommended)</span></label>
          <textarea
            className="textarea h-40"
            value={jobDesc}
            onChange={e => setJobDesc(e.target.value)}
            placeholder="Paste the job description here for a more accurate ATS score and keyword match..."
          />
        </div>
      </div>

      <button className="btn-primary" onClick={handleAnalyze} disabled={!file || loading}>
        {loading ? (
          <><span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" /> Analyzing Resume...</>
        ) : (
          <><Target className="w-4 h-4" /> Check ATS Score</>
        )}
      </button>

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-in fade-in">

          {/* Top row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ScoreCircle score={result.overall_ats_score} />

            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{result.candidate_name}</h3>
                  <p className="text-sm text-gray-500">{result.experience_years} years experience · {result.education_level}</p>
                </div>
                <span className={`badge text-sm px-3 py-1.5 font-semibold ${
                  result.overall_ats_score >= 80 ? 'bg-green-100 text-green-700' :
                  result.overall_ats_score >= 60 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-600'
                }`}>
                  {result.overall_ats_score >= 80 ? '✅ ATS Friendly' :
                   result.overall_ats_score >= 60 ? '⚠️ Needs Work' : '❌ Not ATS Ready'}
                </span>
              </div>

              {/* Section scores */}
              <div className="space-y-2">
                {Object.entries(result.section_scores || {}).map(([key, val]) => (
                  <SectionScore key={key} label={SECTION_LABELS[key] || key} score={val} />
                ))}
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {result.matched_keywords?.length > 0 && (
              <div className="bg-green-50 rounded-2xl p-4 space-y-2">
                <p className="label text-green-700 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Matched Keywords ({result.matched_keywords.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.matched_keywords.map(k => (
                    <span key={k} className="badge bg-green-100 text-green-700 text-xs">{k}</span>
                  ))}
                </div>
              </div>
            )}
            {result.missing_keywords?.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-4 space-y-2">
                <p className="label text-red-600 flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Missing Keywords ({result.missing_keywords.length})</p>
                <div className="flex flex-wrap gap-1.5">
                  {result.missing_keywords.map(k => (
                    <span key={k} className="badge bg-red-100 text-red-600 text-xs">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          {result.skills_found?.length > 0 && (
            <div>
              <p className="label mb-2">Skills Found in Resume</p>
              <div className="flex flex-wrap gap-2">
                {result.skills_found.map(s => (
                  <span key={s} className="badge bg-brand-light text-brand">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {result.strengths?.length > 0 && (
              <div className="space-y-2">
                <p className="label text-green-700">✅ Strengths</p>
                {result.strengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />{s}
                  </div>
                ))}
              </div>
            )}
            {result.weaknesses?.length > 0 && (
              <div className="space-y-2">
                <p className="label text-red-600">❌ Weaknesses</p>
                {result.weaknesses.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />{w}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Critical Fixes */}
          {result.critical_fixes?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <p className="label text-amber-700 flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> Critical Fixes (Do These First!)</p>
              {result.critical_fixes.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-amber-800">
                  <span className="font-bold shrink-0">{i + 1}.</span>{f}
                </div>
              ))}
            </div>
          )}

          {/* AI Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="space-y-2">
              <p className="label flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> AI Suggestions</p>
              {result.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700 p-3 bg-gray-50 rounded-xl">
                  <span className="text-brand font-bold shrink-0">→</span>{s}
                </div>
              ))}
            </div>
          )}

          {/* Rewritten Summary */}
          {result.rewritten_summary && (
            <div>
              <button
                onClick={() => setShowSummary(!showSummary)}
                className="flex items-center gap-2 label text-brand hover:text-brand-dark transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                AI Rewritten Summary
                {showSummary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {showSummary && (
                <div className="mt-2 p-4 bg-brand-light/30 border border-brand/20 rounded-xl text-sm text-gray-800 leading-relaxed">
                  {result.rewritten_summary}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
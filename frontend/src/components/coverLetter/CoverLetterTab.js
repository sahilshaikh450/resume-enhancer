'use client';
import { useState, useRef } from 'react';
import { FileText, Sparkles, Copy, Download, CheckCircle, AlertCircle, Building2, Briefcase, Loader, RefreshCw, Target } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const TONES = [
  { id: 'professional', label: 'Professional', emoji: '👔' },
  { id: 'enthusiastic', label: 'Enthusiastic', emoji: '🔥' },
  { id: 'confident', label: 'Confident', emoji: '💪' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
];

export default function CoverLetterTab({ resumeContext }) {
  const [form, setForm] = useState({
    resumeText: resumeContext || '',
    jobDescription: '',
    companyName: '',
    jobTitle: '',
    tone: 'professional',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const letterRef = useRef();

  async function handleGenerate() {
    if (!form.resumeText || !form.jobDescription) {
      setError('Please fill in your resume and job description');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`${API}/api/cover-letter/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResult(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(result.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([result.coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cover-letter-${form.companyName || 'company'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const scoreColor = (s) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = (s) => s >= 80 ? 'bg-green-500/10 border-green-500/20' : s >= 60 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Cover Letter Generator</h2>
          <p className="text-xs text-white/40">AI-powered personalized cover letters in seconds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left — Inputs */}
        <div className="space-y-4">
          {/* Company + Job Title */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="label flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Company Name
              </label>
              <input
                className="input"
                placeholder="e.g. Google, TCS..."
                value={form.companyName}
                onChange={e => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="label flex items-center gap-1.5">
                <Briefcase className="w-3 h-3" /> Job Title
              </label>
              <input
                className="input"
                placeholder="e.g. Software Engineer"
                value={form.jobTitle}
                onChange={e => setForm({ ...form, jobTitle: e.target.value })}
              />
            </div>
          </div>

          {/* Tone selector */}
          <div className="space-y-2">
            <label className="label">Tone</label>
            <div className="grid grid-cols-4 gap-2">
              {TONES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setForm({ ...form, tone: t.id })}
                  className={`py-2 px-2 rounded-xl text-xs font-medium transition-all border ${
                    form.tone === t.id
                      ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                      : 'bg-white/5 border-white/10 text-white/50 hover:border-white/30'
                  }`}
                >
                  <div>{t.emoji}</div>
                  <div>{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Resume */}
          <div className="space-y-1.5">
            <label className="label">Your Resume Content</label>
            <textarea
              className="textarea h-32"
              placeholder="Paste your resume content here..."
              value={form.resumeText}
              onChange={e => setForm({ ...form, resumeText: e.target.value })}
            />
            {resumeContext && !form.resumeText && (
              <button
                onClick={() => setForm({ ...form, resumeText: resumeContext })}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                ✓ Use resume from ATS Analyzer
              </button>
            )}
          </div>

          {/* Job Description */}
          <div className="space-y-1.5">
            <label className="label">Job Description</label>
            <textarea
              className="textarea h-32"
              placeholder="Paste the job description here..."
              value={form.jobDescription}
              onChange={e => setForm({ ...form, jobDescription: e.target.value })}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary w-full justify-center py-3"
          >
            {loading
              ? <><Loader className="w-4 h-4 animate-spin" /> Generating...</>
              : <><Sparkles className="w-4 h-4" /> Generate Cover Letter</>
            }
          </button>
        </div>

        {/* Right — Result */}
        <div className="space-y-4">
          {!result && !loading && (
            <div className="h-full min-h-[400px] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-center p-8">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-purple-400/50" />
              </div>
              <p className="text-white/30 text-sm">Your cover letter will appear here</p>
              <p className="text-white/20 text-xs">Fill in the details and click Generate</p>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[400px] border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-white/40 text-sm">Writing your cover letter...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className={`border rounded-xl p-3 text-center ${scoreBg(result.matchScore)}`}>
                  <p className={`text-xl font-bold ${scoreColor(result.matchScore)}`}>{result.matchScore}%</p>
                  <p className="text-xs text-white/40 mt-0.5">Match Score</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">{result.wordCount}</p>
                  <p className="text-xs text-white/40 mt-0.5">Words</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-purple-400">{form.tone}</p>
                  <p className="text-xs text-white/40 mt-0.5">Tone</p>
                </div>
              </div>

              {/* Subject line */}
              {result.subject && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <p className="label mb-1">Email Subject</p>
                  <p className="text-sm text-white/80">{result.subject}</p>
                </div>
              )}

              {/* Cover letter */}
              <div className="relative">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap" ref={letterRef}>
                    {result.coverLetter}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                  <button onClick={handleCopy} className="btn-outline flex-1 justify-center py-2.5 text-xs">
                    {copied
                      ? <><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Copied!</>
                      : <><Copy className="w-3.5 h-3.5" /> Copy</>
                    }
                  </button>
                  <button onClick={handleDownload} className="btn-outline flex-1 justify-center py-2.5 text-xs">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <button onClick={handleGenerate} className="btn-outline py-2.5 px-3 text-xs">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Key Points */}
              {result.keyPoints?.length > 0 && (
                <div className="space-y-2">
                  <p className="label flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> Key Highlights
                  </p>
                  {result.keyPoints.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                      {pt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
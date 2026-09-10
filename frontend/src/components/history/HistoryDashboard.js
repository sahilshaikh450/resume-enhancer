'use client';
import { useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown, Trash2, RefreshCw, Target, ChevronDown, ChevronUp, Calendar, Award, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function MiniGraph({ scores }) {
  if (!scores || scores.length < 2) return null;
  const max = 100;
  const min = 0;
  const W = 200;
  const H = 60;
  const pad = 8;

  const points = scores.map((s, i) => {
    const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
    const y = H - pad - ((s - min) / (max - min)) * (H - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const lastScore = scores[scores.length - 1];
  const firstScore = scores[0];
  const improved = lastScore >= firstScore;
  const color = improved ? '#22c55e' : '#ef4444';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-12">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {scores.map((s, i) => {
        const x = pad + (i / (scores.length - 1)) * (W - pad * 2);
        const y = H - pad - ((s - min) / (max - min)) * (H - pad * 2);
        return (
          <circle key={i} cx={x} cy={y} r="3" fill={color} />
        );
      })}
    </svg>
  );
}

function ScoreBar({ label, value }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/50">{label}</span>
        <span className="text-white/70 font-medium">{value}%</span>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function HistoryCard({ scan, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = scan.atsScore >= 80 ? 'text-green-400' : scan.atsScore >= 60 ? 'text-amber-400' : 'text-red-400';
  const scoreBg = scan.atsScore >= 80 ? 'bg-green-500/10' : scan.atsScore >= 60 ? 'bg-amber-500/10' : 'bg-red-500/10';
  const date = new Date(scan.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
      <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        {/* Score circle */}
        <div className={`w-14 h-14 rounded-xl ${scoreBg} flex flex-col items-center justify-center shrink-0`}>
          <span className={`text-lg font-bold ${scoreColor}`}>{scan.atsScore}%</span>
          <span className="text-white/30 text-xs">ATS</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm truncate">{scan.resumeName}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-white/40 text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {date}
            </span>
            {scan.matchedKeywords?.length > 0 && (
              <span className="text-green-400 text-xs">{scan.matchedKeywords.length} keywords matched</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={e => { e.stopPropagation(); onDelete(scan._id); }}
            className="p-2 text-white/20 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {expanded ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-4 bg-white/2">
          {/* Section scores */}
          {scan.sectionScores && Object.keys(scan.sectionScores).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Section Scores</p>
              {Object.entries(scan.sectionScores).map(([key, val]) => (
                <ScoreBar key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} value={val} />
              ))}
            </div>
          )}

          {/* Keywords */}
          <div className="grid grid-cols-2 gap-3">
            {scan.matchedKeywords?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-green-400/70 uppercase tracking-wider mb-2">Matched</p>
                <div className="flex flex-wrap gap-1.5">
                  {scan.matchedKeywords.slice(0, 6).map(k => (
                    <span key={k} className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">{k}</span>
                  ))}
                </div>
              </div>
            )}
            {scan.missingKeywords?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-400/70 uppercase tracking-wider mb-2">Missing</p>
                <div className="flex flex-wrap gap-1.5">
                  {scan.missingKeywords.slice(0, 6).map(k => (
                    <span key={k} className="text-xs bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">{k}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          {scan.suggestions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">AI Suggestions</p>
              {scan.suggestions.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-white/50 mb-1">
                  <span className="text-purple-400 shrink-0">→</span> {s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HistoryDashboard() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) fetchHistory();
  }, [user]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/history/${user.id}`);
      const data = await res.json();
      if (data.success) setHistory(data.data);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    try {
      await fetch(`${API}/api/history/${id}`, { method: 'DELETE' });
      setHistory(prev => prev.filter(h => h._id !== id));
    } catch (err) {
      console.error('Delete error:', err);
    }
  }

  // Stats
  const avgScore = history.length ? Math.round(history.reduce((a, b) => a + b.atsScore, 0) / history.length) : 0;
  const bestScore = history.length ? Math.max(...history.map(h => h.atsScore)) : 0;
  const scores = [...history].reverse().map(h => h.atsScore);
  const trend = scores.length >= 2 ? scores[scores.length - 1] - scores[0] : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <History className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Resume History</h2>
            <p className="text-xs text-white/40">{history.length} scans total</p>
          </div>
        </div>
        <button onClick={fetchHistory} className="btn-outline py-2 px-3 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {history.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">Total Scans</p>
            <p className="text-2xl font-bold text-white">{history.length}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">Average Score</p>
            <p className={`text-2xl font-bold ${avgScore >= 80 ? 'text-green-400' : avgScore >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{avgScore}%</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">Best Score</p>
            <p className="text-2xl font-bold text-purple-400 flex items-center gap-1">
              <Award className="w-5 h-5" />{bestScore}%
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-xs text-white/40 mb-1">Score Trend</p>
            <p className={`text-2xl font-bold flex items-center gap-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {trend >= 0 ? '+' : ''}{trend}%
            </p>
          </div>
        </div>
      )}

      {/* Score Trend Graph */}
      {scores.length >= 2 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Score Progression</p>
          <MiniGraph scores={scores} />
          <div className="flex justify-between text-xs text-white/30 mt-1">
            <span>Oldest</span>
            <span>Latest</span>
          </div>
        </div>
      )}

      {/* History List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
          <History className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No scan history yet</p>
          <p className="text-white/20 text-xs mt-1">Analyze your resume in the ATS Analyzer tab to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(scan => (
            <HistoryCard key={scan._id} scan={scan} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
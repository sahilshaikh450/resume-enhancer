'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileText, MessageSquare, Bot, Zap, Target, LogOut, User, ChevronRight, Shield, Sparkles, Brain, PenLine, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';
import ATSAnalyzer from '../components/ats/ATSAnalyzer';
import EnhanceTab from '../components/resume/EnhanceTab';
import InterviewTab from '../components/interview/InterviewTab';
import ChatTab from '../components/chat/ChatTab';
import CoverLetterTab from '../components/coverLetter/CoverLetterTab';
import HistoryDashboard from '../components/history/HistoryDashboard';

const TABS = [
  { id: 'ats', label: 'ATS Analyzer', icon: Target },
  { id: 'enhance', label: 'Enhance Resume', icon: Zap },
  { id: 'cover', label: 'Cover Letter', icon: PenLine },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
  { id: 'chat', label: 'AI Coach', icon: Bot },
  { id: 'history', label: 'History', icon: History },
];

const FEATURES = [
  { icon: Target, title: 'ATS Score Checker', desc: 'Instant ATS compatibility score with detailed breakdown' },
  { icon: Zap, title: 'AI Resume Enhancer', desc: 'Rewrite bullets with strong action verbs and keyword alignment' },
  { icon: PenLine, title: 'Cover Letter Generator', desc: 'Personalized cover letters tailored to any job in seconds' },
  { icon: MessageSquare, title: 'Interview Prep', desc: 'Personalized Q&A with sample answers for any role' },
  { icon: Brain, title: 'AI Career Coach', desc: 'Chat with AI that knows your resume and gives tailored advice' },
  { icon: History, title: 'Score History', desc: 'Track your ATS score improvements over time with trend graphs' },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('ats');
  const [sessionId, setSessionId] = useState('');
  const [resumeContext, setResumeContext] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [showApp, setShowApp] = useState(false);
  const { user, logout, isLoggedIn } = useAuth();

  useEffect(() => { setSessionId(uuidv4()); }, []);

  function handleGetStarted() {
    if (isLoggedIn) setShowApp(true);
    else setShowAuth(true);
  }

  if (showApp) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <header className="border-b border-white/10 sticky top-0 z-10 bg-[#0a0a0f]/90 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">R</div>
                <span className="font-semibold text-white">AI Resume Enhancer</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="badge bg-green-500/20 text-green-400">● Live</span>
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                  <User className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-white/70">{user?.name}</span>
                </div>
                <button onClick={() => { logout(); setShowApp(false); }} className="btn-outline py-2 px-3 text-xs">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          <div className="card">
            <div className="flex border-b border-white/10 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-fit flex items-center justify-center gap-2 py-4 px-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                        : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              <div style={{ display: activeTab === 'ats' ? 'block' : 'none' }}>
                <ATSAnalyzer sessionId={sessionId} onResumeAnalyzed={setResumeContext} userId={user?.id} />
              </div>
              <div style={{ display: activeTab === 'enhance' ? 'block' : 'none' }}>
                <EnhanceTab sessionId={sessionId} onResumeIndexed={setResumeContext} />
              </div>
              <div style={{ display: activeTab === 'cover' ? 'block' : 'none' }}>
                <CoverLetterTab resumeContext={resumeContext} />
              </div>
              <div style={{ display: activeTab === 'interview' ? 'block' : 'none' }}>
                <InterviewTab sessionId={sessionId} resumeContext={resumeContext} />
              </div>
              <div style={{ display: activeTab === 'chat' ? 'block' : 'none' }}>
                <ChatTab sessionId={sessionId} resumeContext={resumeContext} />
              </div>
              <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
                <HistoryDashboard />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 blur-[120px] pointer-events-none" />
      <nav className="border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-sm">R</div>
              <span className="font-semibold text-white">AI Resume Enhancer</span>
            </div>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <span className="text-white/50 text-sm">Hi, {user?.name?.split(' ')[0]}!</span>
                  <button onClick={() => setShowApp(true)} className="btn-primary">Go to Dashboard <ChevronRight className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowAuth(true)} className="btn-outline py-2">Sign In</button>
                  <button onClick={() => setShowAuth(true)} className="btn-primary">Get Started →</button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 text-sm text-purple-300 mb-8">
          <Sparkles className="w-4 h-4" /> AI-Powered Career Platform — 100% Free
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          Land Your Dream Job<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">with AI</span>
        </h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          ATS score, resume enhancer, cover letters, interview prep and score tracking — all free.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button onClick={handleGetStarted} className="btn-primary text-base px-8 py-4 rounded-2xl">Get Started Free →</button>
          <div className="flex items-center gap-2 text-white/40 text-sm"><Shield className="w-4 h-4" /> No credit card required</div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Everything you need to get hired</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 hover:border-purple-500/40 transition-all duration-300 group">
              <div className="w-9 h-9 bg-purple-500/20 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-500/30 transition-colors">
                <Icon className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1.5">{title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-16 text-center card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get shortlisted?</h2>
            <p className="text-white/50 mb-8">Join thousands of job seekers using AI to land their dream job.</p>
            <button onClick={handleGetStarted} className="btn-primary text-base px-8 py-4 rounded-2xl mx-auto">Start for Free →</button>
          </div>
        </div>
      </div>

      {showAuth && (
        <AuthModal onClose={(goToDashboard) => { setShowAuth(false); if (goToDashboard || isLoggedIn) setShowApp(true); }} />
      )}
    </div>
  );
}
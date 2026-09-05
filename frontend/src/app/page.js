'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileText, MessageSquare, Bot, Zap, Target, LogOut, User, History, ChevronRight, Shield, Sparkles, Brain } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';
import ATSAnalyzer from '../components/ats/ATSAnalyzer';
import EnhanceTab from '../components/resume/EnhanceTab';
import InterviewTab from '../components/interview/InterviewTab';
import ChatTab from '../components/chat/ChatTab';

const TABS = [
  { id: 'ats', label: 'ATS Analyzer', icon: Target },
  { id: 'enhance', label: 'Enhance Resume', icon: Zap },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
  { id: 'chat', label: 'AI Coach', icon: Bot },
];

const FEATURES = [
  { icon: Target, title: 'ATS Score Checker', desc: 'Upload your resume and get an instant ATS compatibility score with detailed breakdown' },
  { icon: Zap, title: 'AI Resume Enhancer', desc: 'Rewrite your bullets with strong action verbs and align keywords to any job description' },
  { icon: MessageSquare, title: 'Interview Prep', desc: 'Get personalized technical, behavioral and situational questions with sample answers' },
  { icon: Brain, title: 'AI Career Coach', desc: 'Chat with an AI that knows your resume and gives tailored career advice' },
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

  if (showApp || isLoggedIn && showApp) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* App Header */}
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
            {/* Tabs */}
            <div className="flex border-b border-white/10 overflow-x-auto">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-fit flex items-center justify-center gap-2 py-4 px-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
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
                <ATSAnalyzer sessionId={sessionId} onResumeAnalyzed={setResumeContext} />
              </div>
              <div style={{ display: activeTab === 'enhance' ? 'block' : 'none' }}>
                <EnhanceTab sessionId={sessionId} onResumeIndexed={setResumeContext} />
              </div>
              <div style={{ display: activeTab === 'interview' ? 'block' : 'none' }}>
                <InterviewTab sessionId={sessionId} resumeContext={resumeContext} />
              </div>
              <div style={{ display: activeTab === 'chat' ? 'block' : 'none' }}>
                <ChatTab sessionId={sessionId} resumeContext={resumeContext} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing Page
  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      {/* Bg glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-purple-600/20 blur-[120px] pointer-events-none" />

      {/* Navbar */}
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
                  <button onClick={() => setShowApp(true)} className="btn-primary">
                    Go to Dashboard <ChevronRight className="w-4 h-4" />
                  </button>
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

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 text-sm text-purple-300 mb-8">
          <Sparkles className="w-4 h-4" />
          AI-Powered Career Platform — 100% Free
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          Land Your Dream Job<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">with AI</span>
        </h1>

        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
          Get instant ATS score, optimize your resume, prepare for interviews, and get personalized coaching — all powered by AI, completely free.
        </p>

        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button onClick={handleGetStarted} className="btn-primary text-base px-8 py-4 rounded-2xl">
            Analyze My Resume Free →
          </button>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Shield className="w-4 h-4" />
            No credit card required
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-12 mt-16 flex-wrap">
          {[['ATS Analyzer', 'Instant Score'], ['Interview Q&A', 'Personalized'], ['AI Coach', '24/7 Available']].map(([title, sub]) => (
            <div key={title} className="text-center">
              <p className="text-2xl font-bold text-white">{title}</p>
              <p className="text-white/40 text-sm">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-3xl font-bold text-center text-white mb-12">Everything you need to get hired</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:border-purple-500/40 transition-all duration-300 group">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500/30 transition-colors">
                <Icon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center card p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to get shortlisted?</h2>
            <p className="text-white/50 mb-8">Upload your resume and get your ATS score in seconds.</p>
            <button onClick={handleGetStarted} className="btn-primary text-base px-8 py-4 rounded-2xl mx-auto">
              Start for Free →
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal onClose={() => { setShowAuth(false); if (isLoggedIn) setShowApp(true); }} />
      )}
    </div>
  );
}

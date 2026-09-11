'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileText, MessageSquare, Bot, Zap, Target, LogOut, User, ChevronRight, Shield, Sparkles, Brain, PenLine, History, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/auth/AuthModal';
import ATSAnalyzer from '../components/ats/ATSAnalyzer';
import EnhanceTab from '../components/resume/EnhanceTab';
import InterviewTab from '../components/interview/InterviewTab';
import ChatTab from '../components/chat/ChatTab';
import CoverLetterTab from '../components/coverLetter/CoverLetterTab';
import HistoryDashboard from '../components/history/HistoryDashboard';

const TABS = [
  { id: 'ats', label: 'ATS', fullLabel: 'ATS Analyzer', icon: Target },
  { id: 'enhance', label: 'Enhance', fullLabel: 'Enhance Resume', icon: Zap },
  { id: 'cover', label: 'Cover Letter', fullLabel: 'Cover Letter', icon: PenLine },
  { id: 'interview', label: 'Interview', fullLabel: 'Interview Prep', icon: MessageSquare },
  { id: 'chat', label: 'AI Coach', fullLabel: 'AI Coach', icon: Bot },
  { id: 'history', label: 'History', fullLabel: 'History', icon: History },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isLoggedIn } = useAuth();

  useEffect(() => { setSessionId(uuidv4()); }, []);

  function handleGetStarted() {
    if (isLoggedIn) setShowApp(true);
    else setShowAuth(true);
  }

  if (showApp) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Header */}
        <header className="border-b border-white/10 sticky top-0 z-20 bg-[#0a0a0f]/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">R</div>
                <span className="font-semibold text-white text-sm">AI Resume Enhancer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:flex badge bg-green-500/20 text-green-400 text-xs">● Live</span>
                <div className="hidden sm:flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-xs text-white/70">{user?.name?.split(' ')[0]}</span>
                </div>
                <button onClick={() => { logout(); setShowApp(false); }} className="flex items-center gap-1.5 border border-white/20 text-white/70 px-2.5 py-1.5 rounded-lg text-xs hover:border-red-500/50 hover:text-red-400 transition-all">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs — scrollable on mobile */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 pt-4 pb-20 sm:pb-8">
          <div className="card">
            <div className="flex border-b border-white/10 overflow-x-auto scrollbar-none">
              {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium transition-all border-b-2 ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-400 bg-purple-500/5'
                        : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="whitespace-nowrap text-xs">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 sm:p-6">
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

        {/* Mobile bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-sm border-t border-white/10 sm:hidden z-20">
          <div className="flex">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-all ${
                    activeTab === tab.id ? 'text-purple-400' : 'text-white/30'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[9px]">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Landing page
  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-x-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/15 blur-[100px] pointer-events-none" />

      {/* Navbar */}
      <nav className="border-b border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-xs">R</div>
              <span className="font-semibold text-white text-sm">AI Resume Enhancer</span>
            </div>

            {/* Desktop nav */}
            <div className="hidden sm:flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <span className="text-white/50 text-sm">Hi, {user?.name?.split(' ')[0]}!</span>
                  <button onClick={() => setShowApp(true)} className="btn-primary text-sm py-2">
                    Dashboard <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setShowAuth(true)} className="text-white/60 hover:text-white text-sm transition-colors">Sign In</button>
                  <button onClick={() => setShowAuth(true)} className="btn-primary text-sm py-2">Get Started →</button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="sm:hidden text-white/60 p-1" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile menu dropdown */}
          {menuOpen && (
            <div className="sm:hidden border-t border-white/10 py-4 space-y-3">
              {isLoggedIn ? (
                <>
                  <p className="text-white/50 text-sm px-1">Hi, {user?.name?.split(' ')[0]}!</p>
                  <button onClick={() => { setShowApp(true); setMenuOpen(false); }} className="btn-primary w-full justify-center">
                    Go to Dashboard <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setShowAuth(true); setMenuOpen(false); }} className="w-full text-left text-white/60 text-sm py-2">Sign In</button>
                  <button onClick={() => { setShowAuth(true); setMenuOpen(false); }} className="btn-primary w-full justify-center">Get Started →</button>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pt-16 sm:pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-3 py-1.5 text-xs sm:text-sm text-purple-300 mb-6 sm:mb-8">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          AI-Powered Career Platform — 100% Free
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
          Land Your Dream Job<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">with AI</span>
        </h1>
        <p className="text-base sm:text-xl text-white/50 max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed px-4">
          ATS score, resume enhancer, cover letters, interview prep — all free.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button onClick={handleGetStarted} className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-2xl w-full sm:w-auto justify-center">
            Get Started Free →
          </button>
          <div className="flex items-center gap-2 text-white/40 text-xs sm:text-sm">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> No credit card required
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8 sm:mb-12">Everything you need to get hired</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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

        {/* CTA */}
        <div className="mt-12 sm:mt-16 text-center card p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20" />
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Ready to get shortlisted?</h2>
            <p className="text-white/50 mb-6 sm:mb-8 text-sm sm:text-base">Join thousands of job seekers using AI to land their dream job.</p>
            <button onClick={handleGetStarted} className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 rounded-2xl mx-auto w-full sm:w-auto justify-center">
              Start for Free →
            </button>
          </div>
        </div>
      </div>

      {showAuth && (
        <AuthModal onClose={(goToDashboard) => { setShowAuth(false); if (goToDashboard || isLoggedIn) setShowApp(true); }} />
      )}
    </div>
  );
}
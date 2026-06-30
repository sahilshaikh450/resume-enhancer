'use client';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileText, MessageSquare, Bot, Zap, Target } from 'lucide-react';
import EnhanceTab from '../components/resume/EnhanceTab';
import InterviewTab from '../components/interview/InterviewTab';
import ChatTab from '../components/chat/ChatTab';
import ATSAnalyzer from '../components/ats/ATSAnalyzer';

const TABS = [
  { id: 'ats', label: 'ATS Analyzer', icon: Target },
  { id: 'enhance', label: 'Enhance Resume', icon: Zap },
  { id: 'interview', label: 'Interview Prep', icon: MessageSquare },
  { id: 'chat', label: 'AI Coach', icon: Bot },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('ats');
  const [sessionId, setSessionId] = useState('');
  const [resumeContext, setResumeContext] = useState('');

  useEffect(() => { setSessionId(uuidv4()); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-brand rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">AI Resume Enhancer</h1>
                <p className="text-xs text-gray-400">AI-Powered Resume Tools</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge bg-green-100 text-green-700">● Live</span>
              <span className="text-xs text-gray-400 hidden sm:block">Session: {sessionId.slice(0, 8)}...</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Land Your Dream Job with AI</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
            Upload your resume for an instant ATS score, optimize keywords, and prepare for interviews — all powered by AI.
          </p>
        </div>

        <div className="card mb-6">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-fit flex items-center justify-center gap-2 py-4 px-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-brand text-brand bg-brand-light/30'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
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

        <div className="flex flex-wrap justify-center gap-3 pb-8">
          {['ATS Score Check', 'PDF Upload', 'Keyword Analysis', 'RAG Pipeline', 'Interview Q&A', 'AI Coach'].map(f => (
            <span key={f} className="badge bg-white border border-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded-full shadow-sm">{f}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
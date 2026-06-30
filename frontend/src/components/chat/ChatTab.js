'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Search } from 'lucide-react';
import { chatAPI, ragAPI } from '../../lib/api';

const SUGGESTIONS = [
  'How can I improve my resume summary?',
  'What are common mistakes in technical interviews?',
  'How do I explain my projects effectively?',
  'What salary should I negotiate for?',
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isUser ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-brand text-white rounded-tr-sm'
          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  );
}

export default function ChatTab({ sessionId, resumeContext }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your AI career coach powered by Claude. I can help you with resume advice, interview prep, project explanations, and career guidance. What would you like to work on today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useRAG, setUseRAG] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text) {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      let reply;
      if (useRAG && resumeContext) {
        // Use RAG pipeline for resume-specific queries
        const ragRes = await ragAPI.query(msg, sessionId);
        reply = ragRes?.data?.answer || 'Could not retrieve answer from RAG.';
      } else {
        const res = await chatAPI.send(msg, sessionId, resumeContext);
        reply = res?.data?.reply || 'Sorry, I could not process that.';
      }
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${err.message}. Please check that the backend is running.`
      }]);
    } finally {
      setLoading(false);
    }
  }

  async function clearChat() {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! How can I help you today?"
    }]);
    try { await chatAPI.clearSession(sessionId); } catch {}
  }

  return (
    <div className="flex flex-col h-[520px]">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              onClick={() => setUseRAG(!useRAG)}
              className={`w-9 h-5 rounded-full transition-colors relative ${useRAG ? 'bg-brand' : 'bg-gray-200'}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${useRAG ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <Search className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-600">RAG Mode</span>
          </label>
          {useRAG && !resumeContext && (
            <span className="text-xs text-amber-500">⚠ Enhance your resume first to enable RAG</span>
          )}
          {useRAG && resumeContext && (
            <span className="text-xs text-green-600">✓ Resume indexed</span>
          )}
        </div>
        <button onClick={clearChat} className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 my-3">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="text-xs bg-brand-light text-brand px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
        <input
          className="input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about your resume, interview tips, projects..."
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="btn-primary shrink-0 px-4"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

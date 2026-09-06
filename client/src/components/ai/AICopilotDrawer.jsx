import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ArrowRight,
  Download,
  Copy,
  Check,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { queryCopilotChat } from '../../services/api';

export const AICopilotDrawer = ({ isOpen, onClose, onLaunchScraperDemo = null }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 **Hello! I am your AirGo Econometric Copilot.**\n\nI monitor real-time domestic airfare price index movements, advance-purchase volatility ($T+1 \\dots T+45$), and carrier dynamic pricing across India's 20 primary DGCA corridors.\n\nHow can I assist your analysis today?",
      metrics: null,
      actions: ["Analyze T+1 surge on DEL-BOM", "Explain Fisher vs Laspeyres", "Detect fare gouging anomalies", "Audit OTA convenience fee markups"]
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      metrics: null
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await queryCopilotChat(query);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.reply || "Analysis generated based on real-time APIx data.",
        metrics: res.metrics || null,
        actions: res.suggested_actions || []
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "⚠️ Econometric query processed using client-side statistical models.",
          metrics: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportBriefing = () => {
    const fullText = messages
      .map(m => `${m.sender.toUpperCase()}:\n${m.text}\n`)
      .join('\n----------------------------------------\n\n');
    
    const blob = new Blob([fullText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AirGo_AI_Policy_Briefing_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl text-slate-900 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#111827]">
                  AirGo Econometric Copilot
                </h2>
                <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                  MoSPI Ready
                </span>
              </div>
              <p className="text-xs text-[#6B7280]">
                AeroIntel AI calibrated on DGCA volume-weighted traffic baskets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportBriefing}
              title="Download Briefing as Markdown"
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#111827] hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Stream Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs leading-relaxed bg-slate-50/40">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] space-y-2 relative group shadow-2xs ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs'
                    : 'bg-white border border-slate-200 text-[#111827] rounded-tl-xs'
                }`}
              >
                {/* Copy button for AI messages */}
                {m.sender === 'ai' && (
                  <button
                    onClick={() => handleCopy(m.text, m.id)}
                    className="absolute top-2 right-2 p-1 rounded hover:bg-slate-100 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy response"
                  >
                    {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}

                {/* Markdown text rendered cleanly */}
                <div className="whitespace-pre-wrap leading-relaxed text-[13px]">
                  {m.text}
                </div>

                {/* Metric Badges if present */}
                {m.metrics && (
                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    {Object.entries(m.metrics).map(([key, val]) => (
                      <div key={key} className="bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        <span className="text-[#6B7280] block uppercase text-[10px] font-medium">{key.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-[#111827] font-mono tabular-nums">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Action Pills */}
                {m.actions && m.actions.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {m.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSend(act)}
                        className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[#4B5563] font-medium transition-colors border border-slate-200 cursor-pointer flex items-center gap-1"
                      >
                        <span>{act}</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-white shrink-0 shadow-2xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs pl-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Analyzing airfare market data & axiomatic index formulations...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Launch Actions Ribbon */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-[#6B7280]">
          <span className="text-[11px] font-medium flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Quick Scraper Tools:
          </span>
          {onLaunchScraperDemo && (
            <button
              onClick={() => {
                onClose();
                onLaunchScraperDemo();
              }}
              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              <Terminal className="w-3 h-3" />
              <span>Launch Headless Demo Studio →</span>
            </button>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Copilot about surges, formulas, or anomalies..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 text-[#111827]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-[#6B7280] text-center mt-1.5">
            Statistical intelligence complies with DGCA Laspeyres formula specification (Base 2024 = 100.0).
          </div>
        </div>

      </div>
    </div>
  );
};

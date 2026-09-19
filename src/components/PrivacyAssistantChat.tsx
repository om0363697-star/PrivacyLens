import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { PolicyAnalysis, ChatMessage } from '../types';

interface PrivacyAssistantChatProps {
  analysis: PolicyAnalysis;
}

export const PrivacyAssistantChat: React.FC<PrivacyAssistantChatProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Hello! I'm your PrivacyLens AI Assistant. I've analyzed the **${analysis.serviceName}** privacy policy. You can ask me specific questions about what data they collect, telemetry tracking, third-party sharing, or available opt-outs. *(Note: This is an informational AI assessment, not legal advice.)*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    `Does ${analysis.serviceName} sell my data to third-party data brokers?`,
    `Do they use my content or chats to train AI models?`,
    `What biometric faceprints or voiceprints are captured?`,
    `How do I request a full data download or account erasure?`
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    // Build context string from the analysis
    const policyContext = `Service: ${analysis.serviceName} (${analysis.companyName || ''})
AI-generated Privacy Risk Indicator: ${analysis.riskLevel} (${analysis.riskScore}/100)
Executive Summary:
- Data Collected: ${analysis.executiveSummary.dataCollected.join('; ')}
- Data Shared: ${analysis.executiveSummary.dataShared.join('; ')}
- Controls: ${(analysis.executiveSummary.userControls || (analysis.executiveSummary as any).userRights || []).join('; ')}
- Summary: ${analysis.executiveSummary.humanReadableSummary || (analysis.executiveSummary as any).plainEnglishVerdict || analysis.oneSentenceVerdict}
Important Clauses:
${(analysis.importantClauses || analysis.redFlags || []).map(r => `[${r.severity}] ${r.title}: ${r.clauseExcerpt} -> ${r.explanation}`).join('\n')}
Retention: ${analysis.dataRetention.summary}
Third-Party Sharing: Sells to Brokers=${analysis.thirdPartySharing.sellsDataToBrokers}, Shares with Ads=${analysis.thirdPartySharing.sharesWithAdvertisers}
Raw Snippet: ${analysis.rawPolicyExcerpt || ''}`;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          policyContext,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'msg-asst-' + Date.now(),
        role: 'assistant',
        content: data.reply || 'I analyzed the policy, but could not generate a complete answer.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        content: 'Unable to reach the AI engine right now. Please review the Red Flags and Category Breakdown tabs for verified insights.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[580px] overflow-hidden">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {analysis.serviceName} Privacy Assistant
            </h3>
            <p className="text-[11px] text-slate-500">
              Ask anything grounded in this policy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Policy Grounded</span>
        </div>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-5 py-2.5 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Try asking:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-700 whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                isUser 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-indigo-50 border border-indigo-200 text-indigo-600'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-1 ${
                isUser 
                  ? 'bg-indigo-600 text-white shadow-xs rounded-tr-xs' 
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs'
              }`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] text-right ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:0.4s]"></div>
              <span className="ml-1 text-[11px] font-medium">Consulting legal clauses...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={`Ask about ${analysis.serviceName}'s privacy policy...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};

import { useState } from 'react';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import EmptyState from '../components/ui/EmptyState';
import { HiOutlineSparkles, HiOutlinePaperAirplane } from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await API.post('/api/ai-assistant/chat', { message: userMessage });
      const reply = res?.data?.data?.reply || 'I could not generate a response right now.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to connect to AI assistant');
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I am having trouble responding right now. Please try again in a moment.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Assistant"
        subtitle="Ask about countries, tiers, documents, programs, and your study-abroad path"
      />

      <GlassCard className="p-0 overflow-hidden border border-white/20">
        <div className="px-5 py-4 border-b border-white/20 flex items-center gap-2 bg-white/20">
          <HiOutlineSparkles className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-semibold text-text">FutureWings AI Chat</h3>
        </div>

        <div className="p-5 min-h-90 max-h-[60vh] overflow-y-auto space-y-4">
          {messages.length === 0 ? (
            <EmptyState
              icon={HiOutlineSparkles}
              title="Start your AI chat"
              message="Try: Which country should I explore for Tier 2, or what documents do I need first?"
            />
          ) : (
            messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-white/55 text-text border border-white/40'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 text-sm bg-white/55 text-text border border-white/40">
                Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/20 bg-white/15">
          <div className="flex items-end gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={2}
              placeholder="Ask anything about your study abroad journey..."
              className="w-full resize-none rounded-xl border border-white/25 bg-white/50 px-4 py-3 text-sm text-text placeholder:text-text-muted/70 outline-none focus:border-primary/35 focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <HiOutlinePaperAirplane className="w-5 h-5" />
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

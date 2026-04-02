import { useEffect, useRef, useState } from 'react';
import API from '../api/axios';
import { PageHeader } from '../components/ui/PageHeader';
import GlassCard from '../components/ui/GlassCard';
import EmptyState from '../components/ui/EmptyState';
import { HiOutlineSparkles, HiOutlinePaperAirplane, HiOutlineBolt, HiOutlineClock, HiOutlineDocumentText, HiOutlineGlobeAlt } from 'react-icons/hi2';
import toast from 'react-hot-toast';

const quickPrompts = [
  'Give me a Tier 1 study-abroad plan.',
  'What documents do I need for Canada?',
  'Compare USA vs UK for CS students.',
  'How should I improve my SOP?',
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const launchPrompt = (prompt) => {
    setInput(prompt);
  };

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
        children={(
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary">
            <HiOutlineBolt className="w-4 h-4" />
            Gemini-powered guidance
          </div>
        )}
      />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <GlassCard className="relative overflow-hidden border border-white/20 p-5">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-primary/15 blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <HiOutlineSparkles className="w-5 h-5" />
                <span className="text-sm font-semibold">AI Command Center</span>
              </div>
              <p className="text-sm text-text-muted leading-6">
                Use the assistant to plan countries, compare programs, and organize applications with structured, paragraph-style answers.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/20 bg-white/40 p-3">
                  <HiOutlineClock className="w-4 h-4 text-primary mb-2" />
                  <p className="text-xs font-semibold text-text">Fast planning</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/40 p-3">
                  <HiOutlineDocumentText className="w-4 h-4 text-primary mb-2" />
                  <p className="text-xs font-semibold text-text">Docs guidance</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/40 p-3">
                  <HiOutlineGlobeAlt className="w-4 h-4 text-primary mb-2" />
                  <p className="text-xs font-semibold text-text">Country compare</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/40 p-3">
                  <HiOutlineBolt className="w-4 h-4 text-primary mb-2" />
                  <p className="text-xs font-semibold text-text">Smart next steps</p>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="border border-white/20 p-5">
            <h3 className="text-sm font-semibold text-text mb-3">Quick Prompts</h3>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => launchPrompt(prompt)}
                  className="rounded-full border border-primary/20 bg-primary/8 px-3 py-2 text-left text-xs font-medium text-text transition hover:border-primary/35 hover:bg-primary/12"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </GlassCard>
        </aside>

        <GlassCard className="p-0 overflow-hidden border border-white/20 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/20 bg-white/20 px-5 py-4">
            <div className="flex items-center gap-2">
              <HiOutlineSparkles className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-semibold text-text">FutureWings AI Chat</h3>
            </div>
            <span className="rounded-full bg-white/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
              Paragraph Mode
            </span>
          </div>

          <div ref={chatRef} className="max-h-[64vh] min-h-90 overflow-y-auto bg-linear-to-b from-white/20 to-white/5 p-5 space-y-4">
            {messages.length === 0 ? (
              <div className="space-y-5">
                <EmptyState
                  icon={HiOutlineSparkles}
                  title="Start your AI chat"
                  message="Choose a quick prompt or ask anything about countries, tiers, documents, applications, and visa planning."
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/20 bg-white/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Ideal for</p>
                    <p className="mt-2 text-sm text-text-muted">Students who want structured guidance without long back-and-forth prompts.</p>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/40 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">Response style</p>
                    <p className="mt-2 text-sm text-text-muted">Serial steps, clear paragraphs, and practical next actions.</p>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={`${msg.role}-${index}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-white/70 text-text border border-white/40'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-3xl border border-white/40 bg-white/70 px-4 py-3 text-sm text-text">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                  </span>
                  <span className="ml-2">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/20 bg-white/15 p-4">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium text-text-muted">
              <span className="rounded-full border border-white/20 bg-white/40 px-3 py-1">Enter to send</span>
              <span className="rounded-full border border-white/20 bg-white/40 px-3 py-1">Shift + Enter for new line</span>
            </div>
            <div className="flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={2}
                placeholder="Ask anything about your study abroad journey..."
                className="w-full resize-none rounded-2xl border border-white/25 bg-white/60 px-4 py-3 text-sm text-text placeholder:text-text-muted/70 outline-none transition focus:border-primary/35 focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <HiOutlinePaperAirplane className="h-5 w-5" />
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

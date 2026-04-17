import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/Button';

const GITHUB_REPO = 'https://github.com/iDarcky/setlists-md';

const FEEDBACK_TYPES = [
  { key: 'bug', label: '🐛 Bug', ghLabel: 'bug' },
  { key: 'feature', label: '✨ Feature', ghLabel: 'enhancement' },
  { key: 'general', label: '💬 General', ghLabel: 'feedback' },
];

const ChatIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('bug');
  const [description, setDescription] = useState('');
  const modalRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    // Delay to avoid the triggering click
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [open]);

  const handleSubmit = () => {
    const feedbackType = FEEDBACK_TYPES.find(t => t.key === type);
    const title = encodeURIComponent(
      type === 'bug'
        ? `[Bug] ${description.slice(0, 60)}`
        : type === 'feature'
        ? `[Feature] ${description.slice(0, 60)}`
        : `[Feedback] ${description.slice(0, 60)}`
    );
    const body = encodeURIComponent(
      `## ${feedbackType.label.split(' ')[1]} Report\n\n${description}\n\n---\n*Submitted via in-app feedback button*\n*User-Agent: ${navigator.userAgent}*`
    );
    const label = encodeURIComponent(feedbackType.ghLabel);

    window.open(
      `${GITHUB_REPO}/issues/new?title=${title}&body=${body}&labels=${label}`,
      '_blank',
      'noopener'
    );

    // Reset form
    setDescription('');
    setType('bug');
    setOpen(false);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed z-[90] w-12 h-12 rounded-full bg-[var(--ds-gray-200)] border border-[var(--ds-gray-400)] shadow-lg flex items-center justify-center cursor-pointer hover:bg-[var(--ds-gray-300)] hover:border-[var(--ds-gray-600)] transition-all duration-200 active:scale-95 text-[var(--ds-gray-900)]"
        style={{
          left: '20px',
          bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }}
        aria-label="Send feedback"
      >
        <ChatIcon />
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div
            ref={modalRef}
            className="w-full max-w-md rounded-2xl bg-[var(--ds-background-100)] border border-[var(--ds-gray-400)] shadow-2xl flex flex-col overflow-hidden"
            style={{
              animation: 'feedbackSlideUp 0.2s ease-out',
            }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--ds-gray-200)]">
              <h2 className="text-heading-18 text-[var(--ds-gray-1000)] m-0 font-semibold">Send Feedback</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent border-none cursor-pointer text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-200)] hover:text-[var(--ds-gray-1000)] transition-colors"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Type selector */}
            <div className="px-5 pt-4 pb-2">
              <label className="text-label-12 text-[var(--ds-gray-700)] uppercase tracking-wider font-semibold mb-2 block">
                Type
              </label>
              <div className="flex p-1 bg-[var(--ds-gray-200)] rounded-lg">
                {FEEDBACK_TYPES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className={`flex-1 py-2 px-3 rounded-md text-label-13 font-medium border-none cursor-pointer transition-all duration-150 ${
                      type === t.key
                        ? 'bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-sm'
                        : 'bg-transparent text-[var(--ds-gray-700)] hover:text-[var(--ds-gray-900)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="px-5 pt-3 pb-4">
              <label className="text-label-12 text-[var(--ds-gray-700)] uppercase tracking-wider font-semibold mb-2 block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  type === 'bug'
                    ? 'Describe the bug \u2014 what happened vs what you expected\u2026'
                    : type === 'feature'
                    ? "Describe the feature you\u2019d like to see\u2026"
                    : "Tell us what\u2019s on your mind\u2026"
                }
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-[var(--ds-gray-400)] bg-[var(--ds-background-100)] text-copy-14 text-[var(--ds-gray-1000)] placeholder:text-[var(--ds-gray-600)] outline-none focus:border-[var(--ds-gray-600)] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-[var(--ds-gray-200)] bg-[var(--ds-background-200)]">
              <p className="text-copy-13 text-[var(--ds-gray-600)] m-0">
                Opens a GitHub issue
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!description.trim()}
                  className={!description.trim() ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Submit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframe animation */}
      <style>{`
        @keyframes feedbackSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

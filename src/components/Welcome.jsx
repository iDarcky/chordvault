import { useRef } from 'react';
import { Button } from './ui/Button';

function ChordLine({ line }) {
  const parts = [];
  const regex = /(\[[^\]]+\])/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'lyric', text: line.slice(lastIndex, match.index) });
    parts.push({ type: 'chord', text: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) parts.push({ type: 'lyric', text: line.slice(lastIndex) });
  return (
    <div className="text-copy-13 leading-relaxed">
      {parts.map((p, i) =>
        p.type === 'chord'
          ? <span key={i} className="font-bold" style={{ color: 'var(--chord)' }}>{p.text}</span>
          : <span key={i} className="text-[var(--ds-gray-800)]">{p.text}</span>
      )}
    </div>
  );
}

export default function Welcome({ onGetStarted, onImport, onSignIn }) {
  const fileRef = useRef(null);

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImport(text);
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[var(--ds-background-200)] flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute pointer-events-none w-[600px] h-[600px] rounded-full"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, var(--color-brand-soft) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, var(--color-brand), #6b9e91)',
          boxShadow: '0 8px 32px var(--color-brand-border)',
        }}
      >
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      {/* Title */}
      <h1 className="text-heading-32 text-[var(--ds-gray-1000)] text-center m-0">
        Setlists MD
      </h1>

      {/* Tagline */}
      <p className="text-copy-16 text-[var(--ds-gray-600)] text-center mt-2">
        Chord charts for worship teams
      </p>

      {/* Mini chord chart preview */}
      <div
        className="mt-6 w-full max-w-xs rounded-xl px-4 py-3 border text-left"
        style={{ background: 'var(--ds-background-100)', borderColor: 'var(--ds-gray-400)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-label-12 font-semibold text-[var(--ds-gray-700)]">Amazing Grace</span>
          <span className="text-label-11 px-1.5 py-0.5 rounded font-semibold" style={{ background: 'var(--color-brand-soft)', color: 'var(--color-brand)' }}>G</span>
        </div>
        <div className="flex flex-col gap-1">
          <ChordLine line="A[G]mazing [G7]grace, how [C]sweet the [G]sound" />
          <ChordLine line="That saved a wretch like [D]me." />
          <ChordLine line="I [G]once was [G7]lost, but [C]now I'm [G]found" />
        </div>
      </div>

      {/* Description */}
      <p className="text-copy-14 text-[var(--ds-gray-500)] text-center mt-4 max-w-xs leading-relaxed">
        Build chord charts, create setlists, transpose on the fly.
        Works offline on any device.
      </p>

      {/* CTA */}
      <Button
        variant="brand"
        size="lg"
        onClick={onGetStarted}
        className="mt-8 px-12"
      >
        Get Started
      </Button>

      {/* Import link */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileRef.current?.click()}
        className="mt-4 text-[var(--ds-gray-600)] underline underline-offset-4 decoration-[var(--ds-gray-400)]"
      >
        I already have .md files — Import
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".md,.txt"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {onSignIn && (
        <p className="mt-10 text-copy-13 text-[var(--ds-gray-600)] text-center">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSignIn}
            className="text-[var(--color-brand)] font-semibold bg-transparent border-none p-0 cursor-pointer underline-offset-4 hover:underline"
          >
            Sign in
          </button>
        </p>
      )}
    </div>
  );
}

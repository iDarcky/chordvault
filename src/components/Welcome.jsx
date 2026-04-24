import { useRef } from 'react';
import { Button } from './ui/Button';

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
      <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-heading-32 mb-6 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, var(--color-brand), #6b9e91)',
          boxShadow: '0 8px 32px var(--color-brand-border)',
        }}
      >
        CV
      </div>

      {/* Title */}
      <h1 className="text-heading-32 text-[var(--ds-gray-1000)] text-center m-0">
        Setlists MD
      </h1>

      {/* Tagline */}
      <p className="text-copy-16 text-[var(--ds-gray-600)] text-center mt-2">
        Chord charts for worship teams
      </p>

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
        className="mt-10 px-12"
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


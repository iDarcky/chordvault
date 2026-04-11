import { useState } from 'react';
import { Button } from './ui/Button';

const STEPS = [
  {
    icon: '\u266B',
    title: 'Your Song Library',
    description: 'All your chord charts in one place. Import .md files or create from scratch with our visual editor.',
  },
  {
    icon: '\u2630',
    title: 'Live Setlists',
    description: 'Build setlists for worship services. Reorder songs, set per-song transpose, and add band notes.',
  },
  {
    icon: '\u25B6',
    title: 'Play Mode',
    description: 'Full-screen chord charts with transpose, multi-column layout, and foot pedal navigation.',
  },
  {
    icon: '\u2601',
    title: 'Sync Everywhere',
    description: 'Connect Google Drive, Dropbox, or OneDrive to sync your songs across all your devices.',
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-[var(--ds-background-200)] flex flex-col items-center justify-center px-6 py-10 relative">
      {/* Skip button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onComplete}
        className="absolute top-5 right-5 text-[var(--ds-gray-600)]"
      >
        Skip
      </Button>

      {/* Illustration */}
      <div
        className="w-[120px] h-[120px] rounded-3xl flex items-center justify-center text-5xl mb-8 border"
        style={{
          background: `var(--color-brand-soft)`,
          borderColor: `var(--color-brand-border)`,
        }}
      >
        {current.icon}
      </div>

      {/* Title */}
      <h2 className="text-heading-24 text-[var(--ds-gray-1000)] text-center m-0">
        {current.title}
      </h2>

      {/* Description */}
      <p className="text-copy-14 text-[var(--ds-gray-600)] text-center mt-3 max-w-xs leading-relaxed">
        {current.description}
      </p>

      {/* Step dots */}
      <div className="flex gap-2 mt-10">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === step
                ? 'w-6 bg-[var(--color-brand)]'
                : 'w-2 bg-[var(--ds-gray-400)]'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <Button
            variant="secondary"
            onClick={() => setStep(step - 1)}
            className="px-7"
          >
            Back
          </Button>
        )}
        <Button
          variant="brand"
          onClick={() => isLast ? onComplete() : setStep(step + 1)}
          className="px-9"
        >
          {isLast ? "Let's Go" : 'Next'}
        </Button>
      </div>
    </div>
  );
}

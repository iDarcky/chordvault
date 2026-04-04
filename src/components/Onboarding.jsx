import { useState } from 'react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

const STEPS = [
  {
    icon: '\u266B',
    title: 'Your Song Library',
    description: 'All your chord charts in one place. Import .md files or create from scratch with our visual editor.',
    color: '#0070f3',
  },
  {
    icon: '\u2630',
    title: 'Live Setlists',
    description: 'Build setlists for worship services. Reorder songs, set per-song transpose, and add band notes.',
    color: '#0070f3',
  },
  {
    icon: '\u25B6',
    title: 'Play Mode',
    description: 'Full-screen chord charts with transpose, multi-column layout, and foot pedal navigation.',
    color: '#0070f3',
  },
  {
    icon: '\u2601',
    title: 'Sync Everywhere',
    description: 'Connect Google Drive, Dropbox, or OneDrive to sync your songs across all your devices.',
    color: '#0070f3',
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative font-sans">
      {/* Skip button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onComplete}
        className="absolute top-6 right-6 text-accents-4 hover:text-foreground text-[11px] font-bold tracking-widest uppercase"
      >
        Skip
      </Button>

      {/* Content wrapper */}
      <div className="flex flex-col items-center max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Illustration */}
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl mb-8 border border-accents-2 shadow-sm transition-transform hover:scale-105 duration-300"
          style={{ background: `${current.color}10`, color: current.color }}
        >
          {current.icon}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-foreground tracking-tighter mb-3 text-center uppercase italic">
          {current.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-accents-5 text-center leading-relaxed mb-10 px-4 min-h-[60px]">
          {current.description}
        </p>

        {/* Step dots */}
        <div className="flex gap-2 mb-10">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-foreground" : "w-2 bg-accents-2"
              )}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 w-full">
          {step > 0 && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setStep(step - 1)}
              className="flex-1 h-12 rounded-full font-bold tracking-widest text-[11px] uppercase border-accents-2"
            >
              Back
            </Button>
          )}
          <Button
            size="lg"
            onClick={() => isLast ? onComplete() : setStep(step + 1)}
            className="flex-1 h-12 rounded-full font-bold tracking-widest text-[11px] uppercase shadow-lg"
          >
            {isLast ? "Let's Go" : 'Next Step'}
          </Button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="absolute bottom-10">
        <Badge variant="outline" className="font-mono text-[10px] tracking-[0.2em] border-accents-2 text-accents-3 px-3 py-1">
          STEP {step + 1} OF {STEPS.length}
        </Badge>
      </div>
    </div>
  );
}

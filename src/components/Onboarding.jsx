import { useState } from 'react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '../lib/utils';

const STEPS = [
  {
    icon: 'M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z',
    title: 'Integrated Library',
    description: 'A professional repository for your .md song files. Import your existing catalog or build one with our specialized editors.',
  },
  {
    icon: 'M4 6h16M4 12h16M4 18h16',
    title: 'Performance Setlists',
    description: 'Engineered for live environments. Sequence your items, define transitions, and synchronize your entire ensemble.',
  },
  {
    icon: 'M5 3l14 9-14 9V3z',
    title: 'Real-time Execution',
    description: 'Clean, high-contrast chart rendering with instant transposition, capo calculation, and automated navigation.',
  },
  {
    icon: 'M12 2v8 M12 14v8 M2 12h8 M14 12h8 M4.9 4.9l4.3 4.3 M14.8 14.8l4.3 4.3 M4.9 19.1l4.3-4.3 M14.8 9.2l4.3-4.3',
    title: 'Global Sync',
    description: 'Keep your configuration and library consistent across all platforms. Offline-first by default, connected by choice.',
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 relative font-sans overflow-hidden">
       {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-accents-1/20 to-transparent z-0" />

      {/* Skip button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onComplete}
        className="absolute top-8 right-8 text-accents-3 hover:text-foreground text-[10px] font-black tracking-[0.2em] uppercase transition-all"
      >
        TERMINATE ONBOARDING
      </Button>

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full animate-in fade-in slide-in-from-right-8 duration-500">
        {/* Illustration Icon */}
        <div className="w-32 h-32 rounded-[2.5rem] bg-foreground text-background flex items-center justify-center mb-12 shadow-2xl transition-all hover:scale-105 duration-300">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d={current.icon} />
          </svg>
        </div>

        {/* Text Group */}
        <div className="text-center space-y-4 mb-12">
           <Badge variant="outline" className="font-mono text-[9px] font-black tracking-[0.3em] border-accents-2 text-accents-4 px-4 h-6 mb-2 rounded-full uppercase">
             Component {step + 1}
           </Badge>
           <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase italic leading-none">
             {current.title}
           </h2>
           <p className="text-sm text-accents-4 leading-relaxed px-2 font-medium min-h-[4.5rem]">
             {current.description}
           </p>
        </div>

        {/* Progress System */}
        <div className="flex gap-1.5 mb-16">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                i === step ? "w-12 bg-foreground" : (i < step ? "w-4 bg-accents-3" : "w-4 bg-accents-2")
              )}
            />
          ))}
        </div>

        {/* Navigation Layer */}
        <div className="flex gap-4 w-full">
          {step > 0 && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setStep(step - 1)}
              className="flex-1 h-14 rounded-2xl font-black tracking-widest text-[10px] uppercase border-2 border-accents-2 bg-background hover:bg-accents-1"
            >
              PREVIOUS
            </Button>
          )}
          <Button
            size="lg"
            onClick={() => isLast ? onComplete() : setStep(step + 1)}
            className="flex-1 h-14 rounded-2xl font-black tracking-widest text-[10px] uppercase shadow-geist hover:shadow-2xl transition-all border-none"
          >
            {isLast ? "COMMENCE" : "NEXT PHASE"}
          </Button>
        </div>
      </div>

      {/* Persistent Footer */}
      <div className="absolute bottom-12 font-mono text-[8px] font-bold text-accents-2 uppercase tracking-[0.6em] select-none">
        SETLISTS MD PERFORMANCE PLATFORM
      </div>
    </div>
  );
}

import { useState } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import { cn } from '../lib/utils';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const steps = [
    {
      title: 'Dynamic Charts',
      description: 'Transpose songs instantly and toggle Nashville Number System (NNS) with one tap.',
      icon: (
        <div className="w-16 h-16 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mb-6 shadow-2xl">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2V15H6L11 19V5Z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        </div>
      )
    },
    {
      title: 'Markdown-first',
      description: 'Write your charts in clean markdown and let us handle the rendering and formatting.',
      icon: (
        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6 shadow-2xl">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-3"></path><path d="M9 15l3 3 3-3"></path><path d="M12 18V9"></path></svg>
        </div>
      )
    },
    {
      title: 'Cloud Sync',
      description: 'Your songs are stored locally and can be synced with Google Drive or Dropbox.',
      icon: (
        <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 mb-6 shadow-2xl">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c.6 0 1.1-.4 1.3-.9l1.9-6.6c.2-.7-.3-1.5-1-1.5h-15c-.7 0-1.2.8-1 1.5l1.9 6.6c.2.5.7.9 1.3.9h11z"></path><path d="M18 10V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v6"></path></svg>
        </div>
      )
    },
  ];

  const current = steps[step - 1];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--geist-background)] overflow-hidden">
      <div className="absolute inset-0 geist-grid opacity-30 pointer-events-none" />

      <Card className="max-w-md w-full p-10 space-y-8 border-[var(--geist-border)] shadow-[0_30px_100px_rgba(0,0,0,0.1)] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center flex flex-col items-center">
          {current.icon}
          <h2 className="text-2xl font-black tracking-tight text-[var(--geist-foreground)]">{current.title}</h2>
          <p className="text-[var(--accents-5)] text-sm font-medium mt-4 px-4 leading-relaxed">{current.description}</p>
        </div>

        <div className="flex gap-2 justify-center py-4">
          {steps.map((_, i) => (
            <div key={i} className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              step === i + 1 ? "w-8 bg-brand" : "w-1.5 bg-[var(--accents-2)]"
            )} />
          ))}
        </div>

        <div className="space-y-4">
          <Button
            variant="brand"
            className="w-full h-12 text-base font-bold shadow-xl shadow-brand/20"
            onClick={() => step < steps.length ? setStep(v => v + 1) : onComplete()}
          >
            {step === steps.length ? 'Get Started' : 'Next Step'}
          </Button>
          {step < steps.length && (
            <Button variant="ghost" className="w-full text-xs font-semibold uppercase tracking-widest text-[var(--accents-4)]" onClick={onComplete}>
              Skip Tour
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

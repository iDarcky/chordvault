import { useRef } from 'react';
import { Button } from './ui/Button';

export default function Welcome({ onGetStarted, onImport }) {
  const fileRef = useRef(null);

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImport(text);
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--foreground) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-background/50 z-0 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-geist-link/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-geist-success/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Logo */}
        <div className="w-24 h-24 rounded-3xl bg-foreground flex items-center justify-center text-background text-4xl font-black mb-12 shadow-2xl transition-transform hover:rotate-3 hover:scale-105 active:scale-95 duration-300">
          SM
        </div>

        {/* Title Group */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-6xl font-black text-foreground tracking-tighter italic leading-none">
            Setlists MD
          </h1>
          <p className="text-xl font-bold text-accents-5 tracking-tight uppercase">
            Performance Optimized Charts
          </p>
        </div>

        {/* Action Group */}
        <div className="flex flex-col gap-6 w-full px-4">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="w-full h-16 rounded-2xl font-black tracking-[0.2em] shadow-geist hover:shadow-2xl transition-all active:scale-95 text-base border-none"
          >
            INITIALIZE &rarr;
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="text-accents-3 hover:text-foreground font-black tracking-widest text-[11px] uppercase transition-colors"
          >
            IMPORT EXISTING REPOSITORY (.MD)
          </Button>
        </div>

        {/* Features Minimalist List */}
        <div className="mt-20 grid grid-cols-3 gap-8 opacity-40">
           <Feature icon="⚡️" label="INSTANT" />
           <Feature icon="🌐" label="OFFLINE" />
           <Feature icon="🔒" label="PRIVATE" />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".md,.txt"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {/* Footer Branding */}
      <div className="absolute bottom-12 text-[10px] font-black text-accents-2 tracking-[0.5em] uppercase pointer-events-none select-none">
        BY WORSHIP LEADERS FOR WORSHIP LEADERS
      </div>
    </div>
  );
}

function Feature({ icon, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-2xl">{icon}</span>
      <span className="text-[9px] font-black tracking-widest uppercase font-mono">{label}</span>
    </div>
  );
}

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-geist-link/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-foreground flex items-center justify-center text-background text-3xl font-black mb-8 shadow-2xl">
          SM
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2 text-center italic">
          Setlists MD
        </h1>

        {/* Tagline */}
        <p className="text-lg font-bold text-accents-5 mb-4 text-center tracking-tight">
          CHORD CHARTS FOR WORSHIP TEAMS
        </p>

        {/* Description */}
        <p className="text-sm text-accents-4 text-center leading-relaxed mb-10 px-4">
          Professional chord charts, instant transposition, and offline setlists.
          The minimalist powerhouse for the modern worship leader.
        </p>

        {/* CTA */}
        <div className="flex flex-col gap-4 w-full">
          <Button
            size="lg"
            onClick={onGetStarted}
            className="w-full h-14 rounded-full font-bold tracking-widest shadow-xl transition-transform active:scale-95"
          >
            GET STARTED &rarr;
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileRef.current?.click()}
            className="text-accents-4 hover:text-foreground font-bold tracking-widest text-[11px] uppercase"
          >
            IMPORT EXISTING .MD FILES
          </Button>
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
      <div className="absolute bottom-8 text-[10px] font-bold text-accents-3 tracking-[0.3em] uppercase pointer-events-none">
        BY WORSHIP LEADERS, FOR WORSHIP LEADERS
      </div>
    </div>
  );
}

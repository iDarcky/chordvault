import Button from './ui/Button';
import Card from './ui/Card';
import { cn } from '../lib/utils';

export default function Welcome({ onGetStarted, onImport }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--geist-background)] overflow-hidden">
      <div className="absolute inset-0 geist-grid opacity-30 pointer-events-none" />

      <Card className="max-w-md w-full p-10 space-y-10 border-[var(--geist-border)] shadow-[0_30px_100px_rgba(0,0,0,0.1)] relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-brand rounded-geist-card mx-auto flex items-center justify-center text-white text-3xl font-black shadow-2xl mb-4 transform rotate-6 hover:rotate-0 transition-transform cursor-default">
            S
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[var(--geist-foreground)]">Setlists MD</h1>
          <p className="text-[var(--accents-5)] text-sm font-medium">Professional chord charts, built for teams.</p>
        </div>

        <div className="space-y-4">
          <Button variant="brand" className="w-full h-12 text-base font-bold shadow-xl shadow-brand/20" onClick={onGetStarted}>
            Get Started
          </Button>
          <div className="flex items-center gap-4 text-[var(--accents-3)]">
            <div className="h-[1px] flex-1 bg-[var(--geist-border)]" />
            <span className="text-[10px] font-bold uppercase tracking-widest">or</span>
            <div className="h-[1px] flex-1 bg-[var(--geist-border)]" />
          </div>
          <Button variant="secondary" className="w-full h-12 text-sm font-semibold" onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.md,.txt';
            input.onchange = async (e) => {
              const text = await e.target.files[0].text();
              onImport(text);
            };
            input.click();
          }}>
            Import existing .md
          </Button>
        </div>

        <div className="pt-6 border-t border-[var(--geist-border)]">
          <div className="text-[10px] text-center font-bold uppercase tracking-[0.2em] text-[var(--accents-4)]">Powered by Vercel Design</div>
        </div>
      </Card>
    </div>
  );
}

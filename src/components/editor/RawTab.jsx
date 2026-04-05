import Input from '../ui/Input';

export default function RawTab({ value, onChange }) {
  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--accents-4)]">Markdown Editor</div>
      <textarea
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-h-[400px] w-full p-6 bg-[var(--accents-1)] border border-[var(--geist-border)] rounded-geist-card text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[var(--geist-foreground)] transition-all resize-none text-[var(--geist-foreground)] leading-relaxed"
        placeholder="# Title\n## Artist\nKey: C\n\n[Verse 1]\nC       F\nAmazing Grace..."
      />
      <div className="text-[10px] text-[var(--accents-4)] text-center">
        Changes in Markdown mode are parsed back to visual components when saving.
      </div>
    </div>
  );
}

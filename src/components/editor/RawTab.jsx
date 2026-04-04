import { useState } from 'react';

export default function RawTab({ md, onChange, textareaRef }) {
  const [showRef, setShowRef] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background rounded-geist overflow-hidden border border-accents-2">
      {/* Syntax Reference Toggle */}
      <button
        onClick={() => setShowRef(v => !v)}
        className="flex items-center gap-2 p-3 bg-accents-1 border-b border-accents-2 text-[11px] font-black uppercase tracking-widest text-accents-5 hover:text-foreground transition-colors border-none bg-transparent cursor-pointer w-full text-left"
      >
        <span className="text-[8px] opacity-60 transition-transform duration-200" style={{ transform: showRef ? 'rotate(90deg)' : 'rotate(0deg)' }}>&#9654;</span>
        Syntax Reference
      </button>

      {showRef && (
        <div className="bg-accents-1/50 border-b border-accents-2 animate-in slide-in-from-top duration-200">
          <div className="p-4 text-[11px] leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-accents-5">
            <div>
              <div className="font-black text-foreground mb-2 uppercase tracking-tighter">Identity (Frontmatter)</div>
              <div className="bg-background p-2 rounded border border-accents-2 space-y-1">
                <div>title: Song Name</div>
                <div>artist: Artist Name</div>
                <div>key: C</div>
                <div>tempo: 120</div>
                <div>time: 4/4</div>
                <div className="opacity-50 mt-1 italic">// tags, ccli, capo, notes</div>
              </div>
            </div>

            <div>
              <div className="font-black text-foreground mb-2 uppercase tracking-tighter">Content Syntax</div>
              <div className="bg-background p-2 rounded border border-accents-2 space-y-1">
                <div><span className="text-foreground font-bold">## Section Name</span> (Starts section)</div>
                <div><span className="text-geist-link font-bold">[Chord]</span>lyrics (Inline chords)</div>
                <div><span className="text-accents-4 italic">&gt; band cue note</span> (Section note)</div>
                <div><span className="text-geist-success font-bold">{'{modulate: +1}'}</span> (Key change)</div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="font-black text-foreground mb-2 uppercase tracking-tighter">Guitar Tab Blocks</div>
              <div className="bg-background p-3 rounded border border-accents-2 overflow-x-auto whitespace-pre">
                <span className="text-foreground font-bold">{'{tab, time: 4/4}'}</span>{'\n'}
                e|--0--2h3--|--5-----|{'\n'}
                B|--1--3----|--5-----|{'\n'}
                <span className="text-foreground font-bold">{'{/tab}'}</span>
              </div>
              <div className="mt-2 flex gap-3 flex-wrap opacity-70">
                <span><span className="text-foreground font-bold mr-1">h</span>hammer</span>
                <span><span className="text-foreground font-bold mr-1">p</span>pull</span>
                <span><span className="text-foreground font-bold mr-1">s</span>slide</span>
                <span><span className="text-foreground font-bold mr-1">b</span>bend</span>
                <span><span className="text-foreground font-bold mr-1">x</span>mute</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Textarea Area */}
      <div className="flex-1 relative bg-background p-4 flex flex-col min-h-[50vh]">
        <textarea
          ref={textareaRef}
          value={md}
          onChange={e => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 w-full bg-transparent border-none focus:ring-0 text-sm leading-relaxed font-mono resize-none outline-none p-0 caret-geist-link"
          placeholder="Enter raw Markdown content..."
        />
      </div>
    </div>
  );
}

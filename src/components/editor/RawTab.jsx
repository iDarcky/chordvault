import { useState } from 'react';
import { Button } from '../ui/Button';

export default function RawTab({ md, onChange, textareaRef }) {
  const [showRef, setShowRef] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Syntax Reference Toggle */}
      <button
        onClick={() => setShowRef(v => !v)}
        className="bg-transparent border-none cursor-pointer text-[var(--color-brand-text)] text-label-12 font-semibold font-mono py-2 text-left flex items-center gap-1.5"
      >
        <span className="text-[10px]">{showRef ? '▾' : '▸'}</span>
        Syntax Reference
      </button>

      {showRef && (
        <div className="mb-2.5 p-3 rounded-lg bg-[var(--color-brand-soft)] border border-[var(--color-brand-border)] text-copy-11 text-[var(--ds-gray-600)] leading-relaxed font-mono">
          <div className="mb-1.5">
            <strong className="text-[var(--ds-gray-1000)]">Frontmatter</strong> (between <code>---</code> delimiters):
          </div>
          <div className="pl-2.5 mb-2 text-[var(--ds-gray-500)]">
            title: Song Name<br />
            artist: Artist Name<br />
            key: C<br />
            tempo: 120<br />
            time: 4/4<br />
            structure: [Verse 1, Chorus, Verse 2, Chorus]<br />
            <span className="opacity-50">tags, ccli, spotify, youtube, capo, notes — optional</span>
          </div>

          <div className="mb-1.5">
            <strong className="text-[var(--ds-gray-1000)]">Sections & Chords:</strong>
          </div>
          <div className="pl-2.5 text-[var(--ds-gray-500)] mb-2">
            <strong className="text-[var(--color-brand-text)]">## Section Name</strong> — starts a section (Verse, Chorus, Bridge, etc.)<br />
            <strong className="text-[var(--chord)]">[Chord]</strong>lyrics — inline chords above lyrics<br />
            <strong className="text-[var(--ds-gray-600)]">&gt; note</strong> — band cue / performance note<br />
            <span className="opacity-50">Blank lines between sections</span>
          </div>

          <div className="mb-1.5">
            <strong className="text-[var(--ds-gray-1000)]">Tab Blocks:</strong>
          </div>
          <div className="pl-2.5 text-[var(--ds-gray-500)]">
            <strong className="text-[var(--color-brand-text)]">{'{'}</strong>tab{'}'} ... {'{'}/tab{'}'} — guitar tab block<br />
            <strong className="text-[var(--color-brand-text)]">{'{'}</strong>tab, time: 4/4{'}'} — with time signature<br />
            <span className="text-[var(--chord)]">e|--0--2h3--|--5-----|</span> — string lines (e B G D A E)<br />
            <span className="opacity-70">Techniques: </span>
            <strong className="text-[var(--chord)]">h</strong> hammer-on &nbsp;
            <strong className="text-[var(--chord)]">p</strong> pull-off &nbsp;
            <strong className="text-[var(--chord)]">s</strong> slide &nbsp;
            <strong className="text-[var(--chord)]">b</strong> bend &nbsp;
            <strong className="text-[var(--chord)]">x</strong> mute &nbsp;
            <strong className="text-[var(--chord)]">~</strong> vibrato<br />
            <span className="opacity-50">Use the Tab button in Visual/Form tab to open the grid editor</span>
          </div>
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={md}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 w-full min-h-[50vh] bg-[var(--ds-gray-100)] border border-[var(--ds-gray-400)] rounded-lg p-4 text-copy-13 leading-relaxed text-[var(--ds-gray-1000)] resize-y outline-none font-mono"
        style={{ caretColor: 'var(--chord)' }}
      />
    </div>
  );
}

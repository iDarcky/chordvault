import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { transposeKey, sectionStyle } from '../music';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import ChartView from './ChartView';

export default function SetlistPlayer({ setlist, songs, onBack, defaultColumns, defaultFontSize, showInlineNotes, inlineNoteStyle, displayRole, duplicateSections }) {
  const [idx, setIdx] = useState(0);
  const songBarRef = useRef(null);

  const resolved = useMemo(() =>
    setlist.items
      .map(it => {
        if (it.type === 'break') return { ...it, isBreak: true };
        const song = songs.find(s => s.id === it.songId);
        return song ? { ...it, song } : null;
      })
      .filter(Boolean),
    [setlist, songs]
  );

  const goNext = useCallback(() => setIdx(p => Math.min(resolved.length - 1, p + 1)), [resolved.length]);
  const goPrev = useCallback(() => setIdx(p => Math.max(0, p - 1)), []);

  // Auto-scroll song strip to keep active item visible
  useEffect(() => {
    const container = songBarRef.current;
    if (!container) return;
    const activeBtn = container.children[idx];
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [idx]);

  // Keyboard / Bluetooth pedal navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goNext(); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev]);

  if (!resolved.length) {
    return (
      <div className="p-10 text-center text-[var(--ds-gray-600)] text-copy-14">
        No items in setlist
      </div>
    );
  }

  const cur = resolved[idx];

  const nav = (
    <div className="flex items-center gap-1.5">
      <span className="text-label-11-mono text-[var(--ds-gray-600)]">
        {idx + 1}/{resolved.length}
      </span>
      <IconButton
        variant="default"
        size="sm"
        onClick={goPrev}
        disabled={idx === 0}
        aria-label="Previous song"
      >
        &#9664;
      </IconButton>
      <IconButton
        variant="default"
        size="sm"
        onClick={goNext}
        disabled={idx === resolved.length - 1}
        aria-label="Next song"
      >
        &#9654;
      </IconButton>
    </div>
  );

  const progress = (
    <div className="flex gap-0.5 px-5 pt-2 overflow-hidden">
      {resolved.map((r, i) => {
        const color = r.isBreak
          ? '#6b7280'
          : sectionStyle(r.song.sections?.[0]?.type || 'Verse').b;
        return (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className="flex-1 rounded-sm border-none cursor-pointer transition-all duration-200 min-w-0 p-0"
            style={{
              height: i === idx ? 6 : 4,
              background: i === idx ? color : i < idx ? 'var(--ds-gray-500)' : 'var(--ds-gray-300)',
              minHeight: 'auto',
            }}
          />
        );
      })}
    </div>
  );

  const songBar = (
    <div ref={songBarRef} className="hide-scrollbar flex gap-1.5 px-5 py-1.5 overflow-auto">
      {resolved.map((r, i) => {
        const active = i === idx;
        if (r.isBreak) {
          return (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-all duration-150 bg-transparent ${
                active ? 'border-[var(--ds-gray-500)] bg-[var(--ds-gray-200)]' : 'border-[var(--ds-gray-300)]'
              }`}
              style={{ minHeight: 'auto' }}
            >
              <span className={`text-label-11-mono font-bold ${active ? 'text-[var(--ds-gray-700)]' : 'text-[var(--ds-gray-500)]'}`}>
                {i + 1}
              </span>
              <span className={`text-copy-11 whitespace-nowrap italic ${active ? 'font-semibold text-[var(--ds-gray-1000)]' : 'text-[var(--ds-gray-600)]'}`}>
                {r.label || 'Break'}
              </span>
            </button>
          );
        }
        const s = sectionStyle(r.song.sections?.[0]?.type || 'Verse');
        return (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-all duration-150 ${
              active ? '' : 'border-[var(--ds-gray-300)] bg-transparent'
            }`}
            style={{
              borderColor: active ? `${s.b}66` : undefined,
              background: active ? `${s.b}15` : undefined,
              minHeight: 'auto',
            }}
          >
            <span
              className="text-label-11-mono font-bold"
              style={{ color: active ? s.d : 'var(--ds-gray-500)' }}
            >
              {i + 1}
            </span>
            <span className={`text-copy-11 whitespace-nowrap ${active ? 'font-semibold text-[var(--ds-gray-1000)]' : 'text-[var(--ds-gray-600)]'}`}>
              {r.song.title}
            </span>
            <span
              className="text-label-10-mono"
              style={{ color: active ? 'var(--chord)' : 'var(--ds-gray-400)' }}
            >
              {transposeKey(r.song.key, r.transpose)}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {/* Back button for the whole player */}
      <div className="flex items-center gap-2.5 px-5 pt-2.5">
        <Button variant="ghost" size="xs" onClick={onBack}>← Back</Button>
        <span className="text-label-13 font-semibold text-[var(--ds-gray-600)]">
          {setlist.name}
        </span>
      </div>
      {progress}
      {songBar}
      {cur.note && (
        <div className="px-5 pt-1">
          <div className="px-3 py-1.5 rounded-md bg-[var(--ds-warning-soft)] border border-[var(--ds-warning-border)] text-label-12 text-[var(--ds-warning-900)]">
            {cur.note}
          </div>
        </div>
      )}
      {cur.isBreak ? (
        <div className="flex flex-col items-center justify-center px-5 py-20 min-h-[50vh]">
          <div className="text-heading-32 text-[var(--ds-gray-1000)] mb-2">
            {cur.label || 'Break'}
          </div>
          {cur.duration > 0 && (
            <div className="text-copy-16 text-[var(--ds-gray-600)] font-mono mb-2">
              {cur.duration} min
            </div>
          )}
          <div className="mt-4">{nav}</div>
        </div>
      ) : (
        <ChartView
          song={{ ...cur.song, key: transposeKey(cur.song.key, cur.transpose) }}
          onBack={onBack}
          navOverride={nav}
          compact
          forceTranspose={cur.transpose}
          capo={cur.capo || 0}
          defaultColumns={defaultColumns}
          defaultFontSize={defaultFontSize}
          showInlineNotes={showInlineNotes}
          inlineNoteStyle={inlineNoteStyle}
          displayRole={displayRole}
          duplicateSections={duplicateSections}
        />
      )}
    </div>
  );
}

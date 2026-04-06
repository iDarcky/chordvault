import { useMemo } from 'react';
import { transposeKey, sectionStyle } from '../music';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export default function SetlistOverview({ setlist, songs, onBack, onEdit, onExport, onPlay }) {
  const getSong = (id) => songs.find(s => s.id === id);

  const { songCount, breakCount, totalDuration } = useMemo(() => {
    let sc = 0, bc = 0, dur = 0;
    for (const it of setlist.items) {
      if (it.type === 'break') {
        bc++;
        dur += it.duration || 0;
      } else {
        sc++;
        const s = getSong(it.songId);
        if (s) {
          const bpm = s.tempo || 120;
          dur += Math.round(240 / bpm * s.sections.length);
        }
      }
    }
    return { songCount: sc, breakCount: bc, totalDuration: dur };
  }, [setlist, songs]);

  const dateStr = new Date(setlist.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[var(--ds-background-200)]">
      {/* Header */}
      <div className="material-header flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2.5">
          <Button variant="ghost" size="xs" onClick={onBack}>← Back</Button>
          <span className="text-heading-16 text-[var(--ds-gray-1000)]">
            {setlist.name || 'Untitled Setlist'}
          </span>
        </div>
        <div className="flex gap-1.5">
          <Button variant="secondary" size="xs" onClick={onExport}>↓ Export</Button>
          <Button variant="secondary" size="xs" onClick={onEdit}>Edit</Button>
          <Button variant="brand" size="xs" onClick={onPlay}>Live</Button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex gap-2.5 flex-wrap items-center px-5 pt-4 pb-2">
        <Badge variant="brand">
          {setlist.service || 'Service'}
        </Badge>
        <span className="text-copy-13 text-[var(--ds-gray-900)]">{dateStr}</span>
        <span className="text-label-12-mono text-[var(--ds-gray-600)]">
          {songCount} song{songCount !== 1 ? 's' : ''}
          {breakCount > 0 && ` + ${breakCount} break${breakCount !== 1 ? 's' : ''}`}
          {totalDuration > 0 && ` · ~${totalDuration} min`}
        </span>
      </div>

      {/* Items */}
      <div className="px-5 pt-2 pb-10 flex flex-col gap-1.5">
        {setlist.items.map((item, idx) => {
          // Break item
          if (item.type === 'break') {
            return (
              <div key={idx} className="flex items-center gap-3 rounded-xl border border-[var(--ds-gray-300)] bg-[var(--ds-gray-100)] px-4 py-3">
                <span className="text-label-13-mono text-[var(--ds-gray-500)] w-6 text-center shrink-0">
                  {idx + 1}
                </span>
                <div className="w-10 h-10 rounded-lg shrink-0 bg-[var(--ds-gray-200)] border border-[var(--ds-gray-400)] flex items-center justify-center text-base text-[var(--ds-gray-600)]">
                  &#9646;
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-heading-14 text-[var(--ds-gray-1000)] italic">
                    {item.label || 'Break'}
                  </div>
                  <div className="flex gap-2 mt-0.5">
                    {item.duration > 0 && (
                      <span className="text-label-11-mono text-[var(--ds-gray-600)]">
                        {item.duration} min
                      </span>
                    )}
                    {item.note && (
                      <span className="text-copy-11 text-[var(--ds-gray-500)] italic">
                        {item.note}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Song item
          const song = getSong(item.songId);
          if (!song) return null;
          const s = sectionStyle(song.sections?.[0]?.type || 'Verse');
          const displayKey = transposeKey(song.key, item.transpose);

          return (
            <div key={idx} className="flex items-center gap-3 rounded-xl border border-[var(--ds-gray-300)] bg-[var(--ds-gray-100)] px-4 py-3">
              <span className="text-label-13-mono text-[var(--ds-gray-500)] w-6 text-center shrink-0">
                {idx + 1}
              </span>
              <div
                className="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center font-mono text-label-13 font-bold border"
                style={{
                  background: `linear-gradient(135deg, ${s.b}33, ${s.b}11)`,
                  borderColor: `${s.b}44`,
                  color: s.d,
                }}
              >
                {displayKey}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-heading-14 text-[var(--ds-gray-1000)] truncate">
                  {song.title}
                </div>
                <div className="text-copy-11 text-[var(--ds-gray-600)] mt-0.5">
                  {song.artist} · {song.tempo} bpm · {song.time}
                </div>
              </div>
              <div className="flex gap-1.5 items-center shrink-0">
                {item.transpose !== 0 && (
                  <Badge variant="warning">
                    {song.key} → {displayKey}
                  </Badge>
                )}
                {(item.capo || 0) > 0 && (
                  <Badge variant="brand">
                    Capo {item.capo}
                  </Badge>
                )}
                {item.note && (
                  <span className="text-copy-11 text-[var(--ds-gray-500)] italic max-w-[120px] truncate">
                    {item.note}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

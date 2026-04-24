import { useState } from 'react';
import { Button } from './ui/Button';

function ChordLine({ line }) {
  const parts = [];
  const regex = /(\[[^\]]+\])/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'lyric', text: line.slice(lastIndex, match.index) });
    parts.push({ type: 'chord', text: match[0] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < line.length) parts.push({ type: 'lyric', text: line.slice(lastIndex) });
  return (
    <div className="text-copy-13 leading-relaxed">
      {parts.map((p, i) =>
        p.type === 'chord'
          ? <span key={i} className="font-bold" style={{ color: 'var(--chord)' }}>{p.text}</span>
          : <span key={i} className="text-[var(--ds-gray-800)]">{p.text}</span>
      )}
    </div>
  );
}

function ChordChartPreview() {
  return (
    <div
      className="w-full rounded-xl overflow-hidden border text-left"
      style={{ background: 'var(--ds-background-100)', borderColor: 'var(--ds-gray-400)' }}
    >
      <div className="px-3 py-2.5 border-b flex items-center justify-between" style={{ borderColor: 'var(--ds-gray-300)' }}>
        <div>
          <div className="text-copy-13 font-semibold text-[var(--ds-gray-1000)]">Amazing Grace</div>
          <div className="text-label-11 text-[var(--ds-gray-600)]">John Newton · 3/4</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-label-11 px-1.5 py-0.5 rounded font-semibold" style={{ background: 'var(--color-brand-soft)', color: 'var(--color-brand)' }}>G</span>
          <span className="text-label-11 text-[var(--ds-gray-600)]">+2 →</span>
          <span className="text-label-11 px-1.5 py-0.5 rounded font-semibold" style={{ background: 'var(--color-brand-soft)', color: 'var(--color-brand)' }}>A</span>
        </div>
      </div>
      <div className="px-3 py-3">
        <div className="text-label-11 font-semibold uppercase tracking-wide text-[var(--ds-gray-600)] mb-2">Verse 1</div>
        <div className="flex flex-col gap-1">
          <ChordLine line="A[G]mazing [G7]grace, how [C]sweet the [G]sound" />
          <ChordLine line="That saved a wretch like [D]me." />
          <ChordLine line="I [G]once was [G7]lost, but [C]now I'm [G]found" />
          <ChordLine line="Was blind, but [D7]now I [G]see." />
        </div>
      </div>
    </div>
  );
}

function SetlistPreview() {
  const songs = [
    { title: 'Amazing Grace', key: 'G', offset: null },
    { title: 'How Great Thou Art', key: 'A', offset: '+2' },
    { title: 'Great Is Thy Faithfulness', key: 'D', offset: null },
  ];
  return (
    <div
      className="w-full rounded-xl overflow-hidden border text-left"
      style={{ background: 'var(--ds-background-100)', borderColor: 'var(--ds-gray-400)' }}
    >
      <div className="px-3 py-2.5 border-b" style={{ borderColor: 'var(--ds-gray-300)' }}>
        <div className="text-copy-13 font-semibold text-[var(--ds-gray-1000)]">Sunday Morning</div>
        <div className="text-label-11 text-[var(--ds-gray-600)]">3 songs</div>
      </div>
      {songs.map((s, i) => (
        <div
          key={i}
          className="px-3 py-2.5 flex items-center gap-2"
          style={i > 0 ? { borderTop: '1px solid var(--ds-gray-300)' } : {}}
        >
          <div className="text-label-12 text-[var(--ds-gray-600)] w-4 shrink-0">{i + 1}</div>
          <div className="flex-1 min-w-0 text-copy-13 text-[var(--ds-gray-900)] truncate">{s.title}</div>
          <div className="flex items-center gap-1.5 shrink-0">
            {s.offset && (
              <span className="text-label-11 px-1.5 py-0.5 rounded font-semibold" style={{ background: 'var(--color-brand-soft)', color: 'var(--color-brand)' }}>
                {s.offset}
              </span>
            )}
            <span className="text-label-12 font-bold w-5 text-right" style={{ color: 'var(--chord)' }}>{s.key}</span>
          </div>
        </div>
      ))}
      <div className="px-3 py-2.5" style={{ borderTop: '1px solid var(--ds-gray-300)' }}>
        <div
          className="w-full py-2 rounded-lg text-center text-label-13 font-semibold text-white"
          style={{ background: 'var(--color-brand)' }}
        >
          ▶  Play Live
        </div>
      </div>
    </div>
  );
}

function StagePreview() {
  return (
    <div
      className="w-full rounded-xl overflow-hidden text-left"
      style={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="px-4 py-4">
        <div className="text-label-11 text-white/40 mb-3 uppercase tracking-widest">Verse 1  ·  Song 1 of 3</div>
        <div className="flex flex-col gap-1">
          <div className="text-copy-13 text-white/80 leading-relaxed">
            <span className="font-bold" style={{ color: 'var(--chord)' }}>[G]</span>Amazing{' '}
            <span className="font-bold" style={{ color: 'var(--chord)' }}>[G7]</span>grace, how{' '}
            <span className="font-bold" style={{ color: 'var(--chord)' }}>[C]</span>sweet the{' '}
            <span className="font-bold" style={{ color: 'var(--chord)' }}>[G]</span>sound
          </div>
          <div className="text-copy-13 text-white/80 leading-relaxed">
            That saved a wretch like <span className="font-bold" style={{ color: 'var(--chord)' }}>[D]</span>me.
          </div>
          <div className="text-copy-13 text-white/80 leading-relaxed mt-1">
            I <span className="font-bold" style={{ color: 'var(--chord)' }}>[G]</span>once was{' '}
            <span className="font-bold" style={{ color: 'var(--chord)' }}>[G7]</span>lost, but{' '}
            <span className="font-bold" style={{ color: 'var(--chord)' }}>[C]</span>now I'm{' '}
            <span className="font-bold" style={{ color: 'var(--chord)' }}>[G]</span>found
          </div>
        </div>
      </div>
      <div
        className="px-4 py-2.5 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}
      >
        <div className="text-white/40 text-label-12">◀ Prev</div>
        <div className="flex items-center gap-1.5 text-label-11" style={{ color: 'var(--color-brand)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-brand)' }} />
          Screen stays on
        </div>
        <div className="text-white/40 text-label-12">Next ▶</div>
      </div>
    </div>
  );
}

function DataOwnershipPreview() {
  const items = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
        </svg>
      ),
      title: 'Offline first',
      subtitle: 'Works without internet, always',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
          <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
        </svg>
      ),
      title: 'Sync to your cloud',
      subtitle: 'Google Drive, Dropbox, or OneDrive',
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
      title: 'Export anything',
      subtitle: 'Plain .md files — open in any editor',
    },
  ];
  return (
    <div
      className="w-full rounded-xl border text-left overflow-hidden"
      style={{ background: 'var(--ds-background-100)', borderColor: 'var(--ds-gray-400)' }}
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="px-3 py-3 flex items-center gap-3"
          style={i > 0 ? { borderTop: '1px solid var(--ds-gray-300)' } : {}}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'var(--color-brand-soft)' }}
          >
            {item.icon}
          </div>
          <div>
            <div className="text-copy-13 font-semibold text-[var(--ds-gray-1000)]">{item.title}</div>
            <div className="text-label-12 text-[var(--ds-gray-600)]">{item.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const STEPS = [
  {
    Visual: ChordChartPreview,
    title: 'This is a chord chart',
    description: 'Chords in brackets sit inline with lyrics. Tap any key badge to transpose the whole song instantly — no edits needed.',
  },
  {
    Visual: SetlistPreview,
    title: 'Build setlists for Sunday',
    description: 'Add songs, set a different key per song, and hit Play Live when you\'re on stage.',
  },
  {
    Visual: StagePreview,
    title: 'Stage mode. Screen stays on.',
    description: 'Full-screen chart display. Your screen won\'t lock mid-set, and Bluetooth foot pedals work out of the box.',
  },
  {
    Visual: DataOwnershipPreview,
    title: 'Your data. Your call.',
    description: 'Everything saves locally on your device — no account needed. Sign in to sync your library across all your devices.',
  },
];

export default function Onboarding({ onComplete, onSignIn }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const { Visual } = current;

  return (
    <div className="min-h-screen bg-[var(--ds-background-200)] flex flex-col items-center justify-center px-5 py-10 relative">
      {/* Skip */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onComplete}
        className="absolute top-5 right-5 text-[var(--ds-gray-600)]"
      >
        Skip
      </Button>

      {/* Visual area */}
      <div className="w-full max-w-xs mb-6">
        <Visual />
      </div>

      {/* Title */}
      <h2 className="text-heading-24 text-[var(--ds-gray-1000)] text-center m-0">
        {current.title}
      </h2>

      {/* Description */}
      <p className="text-copy-14 text-[var(--ds-gray-600)] text-center mt-3 max-w-xs leading-relaxed">
        {current.description}
      </p>

      {/* Step dots */}
      <div className="flex gap-2 mt-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === step
                ? 'w-6 bg-[var(--color-brand)]'
                : 'w-2 bg-[var(--ds-gray-400)]'
            }`}
          />
        ))}
      </div>

      {/* Navigation */}
      {isLast ? (
        <div className="flex flex-col gap-3 mt-8 w-full max-w-xs">
          <Button variant="brand" size="lg" onClick={onComplete} className="w-full">
            Start offline — it's free
          </Button>
          {onSignIn && (
            <Button variant="secondary" size="lg" onClick={onSignIn} className="w-full">
              Sign in to sync
            </Button>
          )}
        </div>
      ) : (
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)} className="px-7">
              Back
            </Button>
          )}
          <Button variant="brand" onClick={() => setStep(step + 1)} className="px-9">
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef, useMemo } from 'react';
import { parseSongMd, songToMd } from '../parser';
import PageHeader from './PageHeader';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import { cn } from '../lib/utils';
import VisualTab from './editor/VisualTab';
import RawTab from './editor/RawTab';
import FormTab from './editor/FormTab';
import PreviewPanel from './editor/PreviewPanel';

export default function Editor({ song, onSave, onBack, onDelete }) {
  const [tab, setTab] = useState('visual');
  const [songData, setSongData] = useState(song || {
    title: 'Untitled Song',
    artist: 'Unknown Artist',
    key: 'C',
    tempo: '70',
    time: '4/4',
    tags: [],
    sections: []
  });
  const [rawMd, setRawMd] = useState(song ? songToMd(song) : '');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (tab === 'raw') {
      setRawMd(songToMd(songData));
    }
  }, [tab]);

  const handleSave = () => {
    let finalData = songData;
    if (tab === 'raw') {
      try {
        finalData = { ...parseSongMd(rawMd), id: songData.id };
      } catch (err) {
        alert('Markdown parse error: ' + err.message);
        return;
      }
    }
    onSave({ ...finalData, updatedAt: Date.now() });
    setIsDirty(false);
  };

  const updateSong = (patch) => {
    setSongData(prev => ({ ...prev, ...patch }));
    setIsDirty(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--geist-background)]">
      <PageHeader title={song ? 'Edit Song' : 'New Song'}>
        <div className="flex gap-2">
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => confirm('Delete this song?') && onDelete(song.id)}
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onBack}>Cancel</Button>
          <Button variant="brand" size="sm" onClick={handleSave} disabled={!isDirty && song}>
            {isDirty || !song ? 'Save Changes' : 'Saved'}
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden max-w-[1400px] mx-auto w-full">
        {/* Left Side: Editor */}
        <div className="flex-1 flex flex-col border-r border-[var(--geist-border)] overflow-hidden">
          <div className="px-6 py-2 border-b border-[var(--geist-border)] flex gap-4 overflow-x-auto no-scrollbar">
            {[
              { id: 'visual', label: 'Visual Builder' },
              { id: 'form', label: 'Meta & Info' },
              { id: 'raw', label: 'Raw Markdown' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  "px-1 py-3 text-xs font-semibold uppercase tracking-tight transition-all border-b-2",
                  tab === t.id
                    ? "border-[var(--geist-foreground)] text-[var(--geist-foreground)]"
                    : "border-transparent text-[var(--accents-5)] hover:text-[var(--accents-8)]"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-6 scroll-smooth">
            {tab === 'visual' && <VisualTab song={songData} onChange={updateSong} />}
            {tab === 'form' && <FormTab song={songData} onChange={updateSong} />}
            {tab === 'raw' && <RawTab value={rawMd} onChange={(val) => { setRawMd(val); setIsDirty(true); }} />}
          </div>
        </div>

        {/* Right Side: Preview (Hidden on mobile) */}
        <div className="hidden lg:block w-[450px] bg-[var(--accents-1)] overflow-auto p-8">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--accents-4)] mb-6">Live Preview</h3>
          <PreviewPanel song={tab === 'raw' ? (tryParse(rawMd) || songData) : songData} />
        </div>
      </div>
    </div>
  );
}

function tryParse(md) {
  try { return parseSongMd(md); } catch { return null; }
}

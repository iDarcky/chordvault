import { useState, useMemo, useRef, useEffect } from 'react';
import { transposeChord, ALL_KEYS, semitonesBetween } from '../music';
import SectionBlock from './SectionBlock';
import ChordDiagram from './ChordDiagram';
import { Button } from './ui/Button';
import { IconButton } from './ui/IconButton';
import { Card } from './ui/Card';
import { SegmentedControl } from './ui/SegmentedControl';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/Select';
import { cn } from '../lib/utils';
import { StructureRibbon, MetaPill } from './StructureRibbon';

const FONT_SIZES = { S: 13, M: 16, L: 20 };

const FONT_FAMILIES = {
  'Geist Sans': "var(--font-sans)",
  'Geist Mono': "var(--font-mono)",
  'JetBrains Mono': "'JetBrains Mono', monospace",
};

export default function ChartView({
  song, onBack, onEdit, isPreview,
  defaultColumns = 1, defaultFontSize = 16,
  showInlineNotes = true, inlineNoteStyle = 'dashes',
  displayRole = 'leader', duplicateSections = 'full'
}) {
  const initialFontSize = FONT_SIZES[defaultFontSize] || (typeof defaultFontSize === 'number' ? defaultFontSize : 16);

  const [selectedKey, setSelectedKey] = useState(song.key);
  const [columns, setColumns] = useState(defaultColumns);
  const [fontSize, setFontSize] = useState(initialFontSize);
  const [fontFamily, setFontFamily] = useState('Geist Mono');
  const [nns, setNns] = useState(false);
  const [showChords, setShowChords] = useState(true);
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMusicSettings, setShowMusicSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const scrollContainerRef = useRef(null);

  const transpose = semitonesBetween(song.key, selectedKey);
  const displayKey = selectedKey;

  const toggleInfo = () => { setShowInfo(s => !s); setShowSettings(false); setShowMusicSettings(false); };
  const toggleAa = () => { setShowSettings(s => !s); setShowInfo(false); setShowMusicSettings(false); };
  const toggleMusic = () => { setShowMusicSettings(s => !s); setShowInfo(false); setShowSettings(false); };

  // Detect scroll position for collapsing header
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const onScroll = () => setScrolled(el.scrollTop > 40);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  // Compute cumulative modulate offsets per section
  const sectionModOffsets = useMemo(() => {
    const acc = { total: 0 };
    return song.sections.map(section => {
      const offset = acc.total;
      (section.lines || []).forEach(line => {
        if (typeof line === 'object' && line.type === 'modulate') {
          acc.total += line.semitones;
        }
      });
      return offset;
    });
  }, [song.sections]);

  // Extract all unique chords for diagrams
  const allChords = Array.from(new Set(
    song.sections.flatMap(s => s.lines)
      .filter(l => typeof l === 'string')
      .flatMap(l => {
        const matches = l.match(/\[(.*?)\]/g);
        return matches ? matches.map(m => m.slice(1, -1)) : [];
      })
  ));

  const hasMetadata = song.capo > 0 || song.ccli || (song.tags?.length > 0) || song.notes || song.spotify || song.youtube;
  const panelOpen = showSettings || showMusicSettings || showInfo;

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        "h-screen overflow-y-auto overflow-x-hidden material-page",
        isPreview && "h-auto overflow-visible bg-transparent"
      )}
    >
      {/* ── Sticky Header ── */}
      {!isPreview && (
        <div className="material-header transition-all duration-200">
          <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-between pt-3 pb-1 gap-3">
            <div className="min-w-0 flex-1 flex items-center gap-3">
              <h1 className={cn(
                "text-[var(--text-1)] m-0 truncate transition-all duration-200",
                scrolled ? "text-heading-16" : "text-heading-24"
              )}>{song.title}</h1>
              {scrolled && (
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0 text-label-11 text-[var(--text-2)]">
                  <span className="font-bold text-[var(--text-1)]">{selectedKey}</span>
                  {song.tempo && <span>{song.tempo} bpm</span>}
                  {song.time && <span>{song.time}</span>}
                </div>
              )}
            </div>
            <div className="flex gap-1.5 items-center flex-shrink-0">
              <div className={cn(
                "flex gap-1.5 items-center transition-all duration-200 overflow-hidden",
                scrolled ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[400px] opacity-100"
              )}>
                <IconButton
                   variant={showInfo ? 'active' : 'default'}
                   size="sm"
                   onClick={toggleInfo}
                   aria-label="Song info"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </IconButton>
                <IconButton
                  variant={showSettings ? 'active' : 'default'}
                  size="sm"
                  onClick={toggleAa}
                  aria-label="Layout settings"
                >Aa</IconButton>
                <IconButton
                  variant={showMusicSettings ? 'active' : 'default'}
                  size="sm"
                  onClick={toggleMusic}
                  aria-label="Music display settings"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55C7.79 13 6 14.79 6 17s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </IconButton>
                <div className="w-px h-5 bg-[var(--border-1)]" />
              </div>

              <IconButton variant="default" size="sm" onClick={onEdit} aria-label="Edit chart">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              </IconButton>
              <IconButton variant="ghost" size="sm" onClick={onBack} aria-label="Close">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </IconButton>
            </div>
          </div>

          {!scrolled && (
            <div className="max-w-[1600px] mx-auto px-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-1)] pb-6 mt-4">
              <div className="space-y-1">
                <div className="text-label-14 text-[var(--text-2)]">{song.artist}</div>
                <div className="flex gap-3">
                  <MetaPill label="Key" value={displayKey} />
                  {song.tempo && <MetaPill label="Tempo" value={`${song.tempo} BPM`} />}
                  {song.time && <MetaPill label="Time" value={song.time} />}
                </div>
              </div>
            </div>
          )}

          <div className="max-w-[1600px] mx-auto px-6 py-2">
            <StructureRibbon
              structure={song.sections.map(s => s.type)}
              compact
              onSelect={(i) => {
                const el = document.getElementById(`section-${i}`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />
          </div>

          {panelOpen && !scrolled && (
            <div className="max-w-[1600px] mx-auto px-6 flex flex-wrap items-center gap-1.5 pb-3 transition-all duration-200">
              {showSettings && (
                <>
                  <SegmentedControl
                    value={columns}
                    onChange={setColumns}
                    options={[
                      { value: 1, label: '1 COL' },
                      { value: 2, label: '2 COL' },
                    ]}
                    size="xs"
                  />
                  <div className="flex items-center bg-[var(--bg-1)] border border-[var(--border-1)] rounded-lg p-0.5">
                    <IconButton variant="ghost" size="xs" onClick={() => setFontSize(prev => Math.max(10, prev - 2))}>-</IconButton>
                    <span className="px-1.5 text-label-10-mono text-[var(--text-2)]">{fontSize}px</span>
                    <IconButton variant="ghost" size="xs" onClick={() => setFontSize(prev => Math.min(30, prev + 2))}>+</IconButton>
                  </div>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger className="h-7 px-2 text-label-11 font-medium text-[var(--text-1)] gap-1 min-w-0 w-auto">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(FONT_FAMILIES).map(name => (
                        <SelectItem key={name} value={name}>
                          <span style={{ fontFamily: FONT_FAMILIES[name] }}>{name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}
              {showMusicSettings && (
                <>
                  <Button
                    variant={nns ? 'brand' : 'secondary'}
                    size="xs"
                    onClick={() => setNns(!nns)}
                    className={cn("text-label-10 font-bold", nns && "border-[var(--color-brand-border)] text-[var(--color-brand-text)] bg-[var(--color-brand-soft)]")}
                  >NUMBERS</Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => setShowChords(!showChords)}
                    className={cn("text-label-10 font-bold", !showChords && "opacity-40")}
                  >CHORDS</Button>
                  <Button
                    variant="secondary"
                    size="xs"
                    onClick={() => setShowDiagrams(!showDiagrams)}
                    className={cn("text-label-10 font-bold", showDiagrams && "border-[var(--color-brand-border)] text-[var(--color-brand-text)] bg-[var(--color-brand-soft)]")}
                  >DIAGRAMS</Button>
                </>
              )}
              {showInfo && (
                hasMetadata ? (
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-label-14 text-[var(--text-2)]">
                    {song.capo > 0 && (
                      <span><span className="font-semibold text-[var(--text-1)]">Capo</span> {song.capo}</span>
                    )}
                    {song.ccli && (
                      <span><span className="font-semibold text-[var(--text-1)]">CCLI</span> {song.ccli}</span>
                    )}
                    {song.tags?.length > 0 && (
                      <span><span className="font-semibold text-[var(--text-1)]">Tags</span> {song.tags.join(', ')}</span>
                    )}
                    {song.notes && (
                      <span><span className="font-semibold text-[var(--text-1)]">Notes</span> {song.notes}</span>
                    )}
                    {song.spotify && (
                      <a href={song.spotify} target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand-text)] hover:underline">
                        Spotify ↗
                      </a>
                    )}
                    {song.youtube && (
                      <a href={song.youtube} target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand-text)] hover:underline">
                        YouTube ↗
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-label-14 text-[var(--text-2)] italic">No additional song info</span>
                )
              )}
            </div>
          )}
        </div>
      )}

      <div className={cn(
        "px-6 pt-4 pb-24 max-w-[1600px] mx-auto w-full",
        isPreview && "px-0 pt-0 pb-0"
      )}>
        {showDiagrams && !isPreview && (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 mb-8 border-b border-[var(--ds-gray-400)]">
            {allChords.map(chord => (
              <div key={chord} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div className="text-label-10-mono font-bold text-[var(--text-2)]">{transposeChord(chord, transpose)}</div>
                <Card className="w-24 h-28 flex items-center justify-center p-2">
                   <ChordDiagram chord={transposeChord(chord, transpose)} />
                </Card>
              </div>
            ))}
          </div>
        )}

        <div
          className={cn(
            "grid gap-x-12 gap-y-4",
            columns === 2 ? "grid-cols-2" : "grid-cols-1"
          )}
          style={{ fontSize, fontFamily: FONT_FAMILIES[fontFamily] }}
        >
          {song.sections.map((section, idx) => (
            <div key={section.id || idx} id={`section-${idx}`} style={{ scrollMarginTop: '10rem' }}>
              <SectionBlock
                section={section}
                transpose={transpose}
                modOffset={sectionModOffsets[idx]}
                nns={nns}
                songKey={song.key}
                showChords={showChords}
                inlineNotes={showInlineNotes}
                noteStyle={inlineNoteStyle}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

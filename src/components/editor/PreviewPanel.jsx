import SectionBlock from '../SectionBlock';
import { StructureRibbon, MetaPill } from '../StructureRibbon';

export default function PreviewPanel({ preview }) {
  if (!preview) {
    return (
      <div style={{
        padding: 32, textAlign: 'center',
        color: 'var(--text-dim)', fontSize: 14,
        fontStyle: 'italic',
      }}>
        Start typing to see preview…
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      {/* Meta row */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {preview.key && <MetaPill label="Key" value={preview.key} highlight />}
        {preview.tempo && <MetaPill label="BPM" value={preview.tempo} />}
        {preview.time && <MetaPill label="Time" value={preview.time} />}
        {preview.capo && <MetaPill label="Capo" value={preview.capo} />}
      </div>

      {/* Structure ribbon */}
      {preview.structure && preview.structure.length > 0 && (
        <StructureRibbon structure={preview.structure} compact />
      )}

      {/* Sections — auto-column layout */}
      <div className="chart-auto-cols" style={{
        gap: 10, marginTop: 8,
      }}>
        {preview.sections.map((sec, i) => (
          <SectionBlock key={i} section={sec} transpose={0} />
        ))}
      </div>
    </div>
  );
}

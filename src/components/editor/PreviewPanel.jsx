import SectionBlock from '../SectionBlock';
import { StructureRibbon, MetaPill } from '../StructureRibbon';

export default function PreviewPanel({ preview }) {
  if (!preview) {
    return (
      <div className="py-8 text-center text-default-400 text-copy-14 italic">
        Start typing to see preview…
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Meta row */}
      <div className="flex flex-wrap gap-1.5 mb-2">
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
      <div className="chart-auto-cols" style={{ gap: 10, marginTop: 8 }}>
        {preview.sections.map((sec, i) => (
          <SectionBlock key={i} section={sec} transpose={0} />
        ))}
      </div>
    </div>
  );
}

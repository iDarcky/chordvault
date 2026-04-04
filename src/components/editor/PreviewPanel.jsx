import SectionBlock from '../SectionBlock';
import { StructureRibbon, MetaPill } from '../StructureRibbon';

export default function PreviewPanel({ preview }) {
  if (!preview) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-accents-2 border-t-accents-4 animate-spin" />
        <div className="text-accents-4 text-xs font-bold uppercase tracking-widest font-mono">
          Waiting for valid content...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-background min-h-full">
      {/* Meta row */}
      <div className="flex flex-wrap gap-2 mb-6">
        {preview.key && <MetaPill label="KEY" value={preview.key} highlight />}
        {preview.tempo && <MetaPill label="BPM" value={preview.tempo} />}
        {preview.time && <MetaPill label="TIME" value={preview.time} />}
        {preview.capo && <MetaPill label="CAPO" value={preview.capo} />}
      </div>

      {/* Structure ribbon */}
      {preview.structure && preview.structure.length > 0 && (
        <div className="mb-6">
          <StructureRibbon structure={preview.structure} compact />
        </div>
      )}

      {/* Sections — auto-column layout */}
      <div className="space-y-4">
        {preview.sections.map((sec, i) => (
          <SectionBlock key={i} section={sec} transpose={0} />
        ))}
      </div>

      <div className="mt-12 text-center text-[10px] font-bold text-accents-3 uppercase tracking-widest font-mono">
        &middot; PREVIEW MODE &middot;
      </div>
    </div>
  );
}

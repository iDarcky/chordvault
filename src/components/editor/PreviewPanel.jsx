import SectionBlock from '../SectionBlock';
import { StructureRibbon, MetaPill } from '../StructureRibbon';

export default function PreviewPanel({ preview, displayRole = 'leader' }) {
  if (!preview) {
    return (
      <div className="p-10 flex flex-col items-center justify-center text-center space-y-6 opacity-30 h-full">
        <div className="w-16 h-16 rounded-full border-4 border-accents-2 border-t-accents-5 animate-spin" />
        <div className="text-[10px] font-black uppercase tracking-[0.4em] font-mono italic">
          Synchronizing Engine...
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-background min-h-full">
      {/* Identity Header */}
      <div className="mb-10 border-b border-accents-2 pb-6">
         <div className="text-[10px] font-black text-accents-4 uppercase tracking-[0.4em] mb-4 font-mono italic">REAL-TIME EXECUTION PREVIEW</div>
         <div className="flex flex-wrap gap-2">
           {preview.key && <MetaPill label="KEY" value={preview.key} highlight />}
           {preview.tempo && <MetaPill label="BPM" value={preview.tempo} />}
           {preview.time && <MetaPill label="TIME" value={preview.time} />}
           {preview.capo && <MetaPill label="CAPO" value={preview.capo} />}
         </div>
      </div>

      {/* Logic Flow */}
      {preview.structure && preview.structure.length > 0 && (
        <div className="mb-10">
          <StructureRibbon structure={preview.structure} compact />
        </div>
      )}

      {/* Operational Segments */}
      <div className="space-y-6">
        {preview.sections.map((sec, i) => (
          <SectionBlock key={i} section={sec} transpose={0} displayRole={displayRole} />
        ))}
      </div>

      <div className="mt-20 pt-10 border-t border-accents-2 text-center opacity-20">
        <div className="text-[9px] font-black uppercase tracking-[0.5em] font-mono">
          V2.5 PERFORMANCE ENGINE ACTIVE
        </div>
      </div>
    </div>
  );
}

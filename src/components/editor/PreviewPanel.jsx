import React from 'react';
import { Card, CardContent, ScrollShadow } from "@heroui/react";
import SectionBlock from '../SectionBlock';
import { StructureRibbon, MetaPill } from '../StructureRibbon';

export default function PreviewPanel({ preview }) {
  if (!preview) {
    return (
      <div className="p-12 text-center text-default-400 italic">
        Start typing to see preview…
      </div>
    );
  }

  return (
    <ScrollShadow className="h-full px-6 py-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {preview.key && <MetaPill label="Key" value={preview.key} highlight />}
        {preview.tempo && <MetaPill label="BPM" value={preview.tempo} />}
        {preview.time && <MetaPill label="Time" value={preview.time} />}
        {preview.capo && <MetaPill label="Capo" value={preview.capo} />}
      </div>

      {preview.structure && preview.structure.length > 0 && (
        <div className="mb-6">
          <StructureRibbon structure={preview.structure} compact />
        </div>
      )}

      <div className="chart-auto-cols gap-6 mt-4">
        {preview.sections.map((sec, i) => (
          <SectionBlock key={i} section={sec} transpose={0} />
        ))}
      </div>
    </ScrollShadow>
  );
}

import React, { useState } from 'react';
import { TextArea, Card, CardContent, Button, Accordion, AccordionItem } from "@heroui/react";

export default function RawTab({ md, onChange, textareaRef }) {
  return (
    <div className="flex flex-col h-full space-y-4">
      <Accordion variant="flat" className="px-0">
        <AccordionItem
          key="syntax"
          aria-label="Syntax Reference"
          title={<span className="text-xs font-bold uppercase tracking-wider text-primary">Syntax Reference</span>}
        >
          <div className="text-xs space-y-4 text-default-500 leading-relaxed pb-2">
            <section>
              <h4 className="font-bold text-foreground mb-1">Frontmatter</h4>
              <p className="font-mono bg-default-100 p-2 rounded">
                title: Song Name<br />
                artist: Artist Name<br />
                key: C<br />
                tempo: 120<br />
                time: 4/4<br />
                structure: [Verse 1, Chorus]
              </p>
            </section>
            <section>
              <h4 className="font-bold text-foreground mb-1">Sections & Chords</h4>
              <p>
                <code className="text-primary font-bold">## Section Name</code> — Starts a section<br />
                <code className="text-warning font-bold">[Chord]</code> — Inline chords<br />
                <code className="text-default-400">&gt; note</code> — Band cue
              </p>
            </section>
            <section>
              <h4 className="font-bold text-foreground mb-1">Tab Blocks</h4>
              <p className="font-mono bg-default-100 p-2 rounded">
                {'{tab, time: 4/4}'}<br />
                e|--0--2h3--|<br />
                {'{/tab}'}
              </p>
            </section>
          </div>
        </AccordionItem>
      </Accordion>

      <TextArea
        ref={textareaRef}
        value={md}
        onValueChange={onChange}
        variant="flat"
        className="flex-1 font-mono"
        classNames={{
          input: "min-h-[50vh] text-[14px] leading-relaxed caret-warning",
          inputWrapper: "h-full p-4 bg-content1"
        }}
        placeholder="Enter song markdown here..."
      />
    </div>
  );
}

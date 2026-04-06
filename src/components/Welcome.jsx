import React, { useRef } from 'react';
import { Button, Link } from "@heroui/react";

export default function Welcome({ onGetStarted, onImport }) {
  const fileRef = useRef(null);

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImport(text);
    }
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-sm">
        <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/30 mb-8 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
          SM
        </div>

        <h1 className="text-4xl font-black tracking-tight text-foreground mb-3">
          Setlists MD
        </h1>

        <p className="text-lg font-bold text-primary mb-6">
          Chord charts for worship teams
        </p>

        <p className="text-default-500 leading-relaxed mb-10 px-4">
          Build professional chord charts, create setlists, and transpose on the fly.
          Everything works offline, right in your browser.
        </p>

        <div className="flex flex-col w-full gap-4">
          <Button
            onPress={onGetStarted}
            size="lg"
            color="primary"
            className="h-14 text-lg font-bold shadow-xl shadow-primary/20"
            radius="xl"
          >
            Get Started
          </Button>

          <Button
            onPress={() => fileRef.current?.click()}
            variant="light"
            className="text-default-400 font-semibold"
          >
            I already have .md files — <span className="underline ml-1">Import</span>
          </Button>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".md,.txt"
        multiple
        onChange={handleFiles}
        className="hidden"
      />
    </div>
  );
}

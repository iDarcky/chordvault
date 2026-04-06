import React, { useState } from 'react';
import { Button, Card, CardContent } from "@heroui/react";

const STEPS = [
  {
    icon: '🎵',
    title: 'Your Song Library',
    description: 'All your chord charts in one place. Import .md files or create from scratch with our visual editor.',
    color: 'primary',
  },
  {
    icon: '📋',
    title: 'Live Setlists',
    description: 'Build setlists for worship services. Reorder songs, set per-song transpose, and add band notes.',
    color: 'warning',
  },
  {
    icon: '▶️',
    title: 'Play Mode',
    description: 'Full-screen chord charts with transpose, multi-column layout, and foot pedal navigation.',
    color: 'success',
  },
  {
    icon: '☁️',
    title: 'Sync Everywhere',
    description: 'Connect Google Drive, Dropbox, or OneDrive to sync your songs across all your devices.',
    color: 'secondary',
  },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative">
      <Button
        onPress={onComplete}
        variant="light"
        size="sm"
        className="absolute top-6 right-6 text-default-400 font-bold"
      >
        Skip
      </Button>

      <div className="z-10 flex flex-col items-center max-w-sm w-full">
        <div className={`w-32 h-32 rounded-[40px] bg-${current.color}/10 border-2 border-${current.color}/20 flex items-center justify-center text-5xl mb-10 shadow-inner`}>
          {current.icon}
        </div>

        <h2 className="text-2xl font-black tracking-tight text-foreground mb-4">
          {current.title}
        </h2>

        <p className="text-default-500 leading-relaxed mb-12 min-h-[4.5rem]">
          {current.description}
        </p>

        <div className="flex gap-2 mb-12">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === step ? `w-8 bg-${current.color}` : 'w-2 bg-default-200'
              }`}
            />
          ))}
        </div>

        <div className="flex w-full gap-3">
          {step > 0 && (
            <Button
              onPress={() => setStep(step - 1)}
              variant="flat"
              className="flex-1 h-14 font-bold"
              radius="xl"
            >
              Back
            </Button>
          )}
          <Button
            onPress={() => isLast ? onComplete() : setStep(step + 1)}
            color={current.color}
            className={`h-14 font-bold ${step > 0 ? 'flex-1' : 'w-full'} shadow-lg shadow-${current.color}/20`}
            radius="xl"
          >
            {isLast ? "Get Started" : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}

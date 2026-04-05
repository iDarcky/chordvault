import React from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Switch } from './ui/Switch';
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem } from './ui/Select';
import { Card } from './ui/Card';
import { Separator } from './ui/Separator';
import PageHeader from './PageHeader';

export default function DesignShowcase({ onBack }) {
  return (
    <div className="min-h-screen bg-[var(--ds-background-200)] pb-32">
      <PageHeader title="Geist UI Design System">
        <Button variant="secondary" size="sm" onClick={onBack}>Back to Settings</Button>
      </PageHeader>

      <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-16">
        
        {/* Layer A: Tokens (Colors) */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-label-14 text-[var(--ds-gray-700)] uppercase tracking-widest font-bold">Colors & Tokens</h2>
            <p className="text-copy-14 text-[var(--ds-gray-900)]">The official gray-scale tokens used for building consistent web experiences.</p>
          </div>
          
          <div className="flex bg-[var(--ds-background-100)] border border-[var(--ds-gray-400)] rounded-md overflow-hidden h-24">
            {[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map(scale => (
              <div 
                key={scale}
                className="flex-1 flex flex-col items-center justify-end pb-2"
                style={{ backgroundColor: `var(--ds-gray-${scale})` }}
              >
                <span className={`text-[10px] uppercase font-mono ${scale > 500 ? 'text-[var(--ds-background-200)]' : 'text-[var(--ds-gray-1000)]'}`}>
                  {scale}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-md bg-[var(--color-brand)] text-white flex items-end h-24">
              <span className="text-label-14-mono">--color-brand</span>
            </div>
            <div className="p-4 border border-[var(--ds-gray-400)] rounded-md bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] flex items-end h-24">
              <span className="text-label-14-mono">Background 100</span>
            </div>
            <div className="p-4 border border-[var(--ds-gray-400)] rounded-md bg-[var(--ds-background-200)] text-[var(--ds-gray-1000)] flex flex-col justify-between h-24">
              <span className="text-[10px] text-[var(--ds-gray-700)]">Global Page BG</span>
              <span className="text-label-14-mono">Background 200</span>
            </div>
          </div>
        </section>

        <Separator />

        {/* Layer A: Typography */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-label-14 text-[var(--ds-gray-700)] uppercase tracking-widest font-bold">Typography</h2>
            <p className="text-copy-14 text-[var(--ds-gray-900)]">Geist Sans and Geist Mono typography hierarchy.</p>
          </div>
          <Card className="grid gap-6">
            <div>
              <h1 className="text-heading-32 text-[var(--ds-gray-1000)] m-0">Heading 32 - Page Titles</h1>
              <p className="text-label-12-mono text-[var(--ds-gray-700)]">.text-heading-32</p>
            </div>
            <div>
              <h2 className="text-heading-24 text-[var(--ds-gray-1000)] m-0">Heading 24 - Section Titles</h2>
              <p className="text-label-12-mono text-[var(--ds-gray-700)]">.text-heading-24</p>
            </div>
            <div>
              <p className="text-copy-14 text-[var(--ds-gray-900)] m-0 leading-relaxed">
                Copy 14 - Default body text. Geist is designed for precision and clarity. Vercel products use this for descriptions and regular content.
              </p>
              <p className="text-label-12-mono text-[var(--ds-gray-700)] mt-1">.text-copy-14</p>
            </div>
          </Card>
        </section>

        <Separator />

        {/* Layer B: Materials */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-label-14 text-[var(--ds-gray-700)] uppercase tracking-widest font-bold">Materials (Layouts)</h2>
            <p className="text-copy-14 text-[var(--ds-gray-900)]">Presets for radii, fills, strokes, and shadows based on standard vercel utility classes.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="material-panel p-6 flex flex-col gap-2">
              <h3 className="text-heading-16 text-[var(--ds-gray-1000)] m-0">Material Panel</h3>
              <p className="text-copy-14 text-[var(--ds-gray-900)] m-0">A lower elevation surface used for minor items. Sharp 6px radius.</p>
              <span className="text-label-12-mono text-[var(--ds-gray-700)] mt-2">.material-panel</span>
            </div>
            <div className="material-card p-6 flex flex-col gap-2">
              <h3 className="text-heading-16 text-[var(--ds-gray-1000)] m-0">Material Card</h3>
              <p className="text-copy-14 text-[var(--ds-gray-900)] m-0">A standard elevated container with a drop-shadow. Soft 12px radius.</p>
              <span className="text-label-12-mono text-[var(--ds-gray-700)] mt-2">.material-card</span>
            </div>
          </div>
        </section>

        <Separator />

        {/* Layer B: Atomic Components */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-label-14 text-[var(--ds-gray-700)] uppercase tracking-widest font-bold">Base UI Components</h2>
            <p className="text-copy-14 text-[var(--ds-gray-900)]">Atomic building blocks like buttons and inputs.</p>
          </div>
          <Card className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h4 className="text-label-12-mono text-[var(--ds-gray-700)]">Buttons</h4>
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="brand">Brand</Button>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-3">
              <h4 className="text-label-12-mono text-[var(--ds-gray-700)]">Forms</h4>
              <div className="grid gap-6 max-w-sm">
                <Input placeholder="Type something..." />
                <Select value="option">
                  <SelectTrigger><SelectValue placeholder="Dropdown" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup><SelectItem value="option">Selected Option</SelectItem></SelectGroup>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-3">
                  <Switch checked={true} />
                  <span className="text-copy-14">Switch Label</span>
                </div>
              </div>
            </div>
          </Card>
        </section>

      </div>
    </div>
  );
}

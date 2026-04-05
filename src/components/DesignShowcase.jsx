import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';
import { Switch } from './ui/Switch';
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem } from './ui/Select';
import { Card } from './ui/Card';
import { Separator } from './ui/Separator';
import { Checkbox } from './ui/Checkbox';
import { Tooltip, TooltipProvider } from './ui/Tooltip';
import { toast } from './ui/use-toast';
import PageHeader from './PageHeader';

export default function DesignShowcase({ onBack }) {
  const [name, setName] = useState('');
  const [toggle, setToggle] = useState(false);
  const [role, setRole] = useState('developer');
  const [loading, setLoading] = useState(false);

  const triggerToast = () => {
    toast({
      title: "Success",
      description: "Design System is working correctly.",
    });
  };

  const triggerError = () => {
    toast({
      title: "Error",
      description: "Something went wrong with the system.",
      variant: 'error',
    });
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[var(--ds-background-200)] pb-32">
        <PageHeader title="Geist UI Showcase">
          <Button variant="secondary" size="sm" onClick={onBack}>Back to App</Button>
        </PageHeader>

        <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-16">

          {/* Section: Typography */}
          <section className="flex flex-col gap-6">
            <h2 className="text-label-14 text-[var(--ds-gray-700)] uppercase tracking-widest font-bold px-1">Typography</h2>
            <Card className="grid gap-6">
              <h1 className="text-heading-24 text-[var(--ds-gray-1000)] m-0">Heading 24 - Page Titles</h1>
              <h2 className="text-heading-20 text-[var(--ds-gray-1000)] m-0">Heading 20 - Section Titles</h2>
              <p className="text-copy-14 text-[var(--ds-gray-900)] m-0 leading-relaxed">
                Copy 14 - Default body text. Geist is designed for precision and clarity.
                Vercel products use this for descriptions and regular content.
              </p>
              <div className="text-label-12-mono text-[var(--ds-gray-700)] uppercase tracking-wider">
                Label 12 Mono - Metadata and Technical details
              </div>
            </Card>
          </section>

          {/* Section: Buttons */}
          <section className="flex flex-col gap-6">
            <h2 className="text-label-14 text-[var(--ds-gray-700)] uppercase tracking-widest font-bold px-1">Buttons & Interactions</h2>
            <Card className="flex flex-col gap-8">
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="error">Error</Button>
                <Button variant="brand">Brand</Button>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-4 items-center">
                <Button variant="primary" loading={loading} onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 2000);
                }}>
                  Interactive Loading
                </Button>
                <Button variant="secondary" size="sm">Small</Button>
                <Button variant="secondary" size="lg">Large</Button>
                <Tooltip content="Settings">
                  <Button variant="secondary" size="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                  </Button>
                </Tooltip>
              </div>
            </Card>
          </section>

          {/* Section: Forms */}
          <section className="flex flex-col gap-6">
            <h2 className="text-label-14 text-[var(--ds-gray-700)] uppercase tracking-widest font-bold px-1">Form Elements</h2>
            <Card className="grid gap-8 max-w-md">
              <div className="grid gap-2">
                <label className="text-label-12 text-[var(--ds-gray-700)] px-1">Input with Prefix</label>
                <Input
                  placeholder="Search..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  prefix={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>}
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <Switch checked={toggle} onCheckedChange={setToggle} />
                  <span className="text-copy-14">Switch</span>
                </div>
                <div className="flex items-center gap-3">
                  <Checkbox id="check" />
                  <label htmlFor="check" className="text-copy-14 cursor-pointer">Checkbox</label>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-label-12 text-[var(--ds-gray-700)] px-1">Select Menu</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="designer">Designer</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </Card>
          </section>

          {/* Section: Feedback */}
          <section className="flex flex-col gap-6">
            <h2 className="text-label-14 text-[var(--ds-gray-700)] uppercase tracking-widest font-bold px-1">Feedback</h2>
            <Card className="flex flex-wrap gap-4 items-center">
              <Button onClick={triggerToast} variant="secondary">Trigger Toast</Button>
              <Button onClick={triggerError} variant="secondary">Trigger Error Toast</Button>
              <Separator orientation="vertical" className="h-10 mx-2" />
              <Badge variant="success">Active</Badge>
              <Badge variant="error">Critical</Badge>
              <Badge variant="outline">Preview</Badge>
            </Card>
          </section>

        </div>
      </div>
    </TooltipProvider>
  );
}

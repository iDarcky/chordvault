import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';
import { Switch } from './ui/Switch';
import { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectItem } from './ui/Select';
import PageHeader from './PageHeader';

export default function DesignShowcase({ onBack }) {
  const [name, setName] = useState('');
  const [toggle, setToggle] = useState(false);
  const [role, setRole] = useState('developer');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ds-background-200)', paddingBottom: 100 }}>
      <PageHeader title="Design System Showcase">
        <Button variant="secondary" size="sm" onClick={onBack}>Back to App</Button>
      </PageHeader>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }} className="flex flex-col gap-12">

        {/* Buttons */}
        <section className="flex flex-col gap-6">
          <h2 className="text-label-14 text-[var(--ds-gray-600)] uppercase tracking-wider">Buttons</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="error">Error Button</Button>
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" disabled>Disabled</Button>
          </div>
        </section>

        {/* Inputs */}
        <section className="flex flex-col gap-6">
          <h2 className="text-label-14 text-[var(--ds-gray-600)] uppercase tracking-wider">Inputs</h2>
          <div className="max-w-xs flex flex-col gap-4">
            <Input
              placeholder="Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <Input
              placeholder="Disabled Input"
              disabled
            />
          </div>
        </section>

        {/* Badges */}
        <section className="flex flex-col gap-6">
          <h2 className="text-label-14 text-[var(--ds-gray-600)] uppercase tracking-wider">Badges</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="error">Error</Badge>
          </div>
        </section>

        {/* Avatar */}
        <section className="flex flex-col gap-6">
          <h2 className="text-label-14 text-[var(--ds-gray-600)] uppercase tracking-wider">Avatar</h2>
          <div className="flex gap-4 items-center">
            <Avatar>
              <AvatarImage src="https://vercel.com/api/www/avatar/idarcaky" alt="User" />
              <AvatarFallback>ID</AvatarFallback>
            </Avatar>
            <Avatar className="h-12 w-12">
              <AvatarImage src="broken-link" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">CV</AvatarFallback>
            </Avatar>
          </div>
        </section>

        {/* Switch */}
        <section className="flex flex-col gap-6">
          <h2 className="text-label-14 text-[var(--ds-gray-600)] uppercase tracking-wider">Switch</h2>
          <div className="flex items-center gap-4">
            <Switch checked={toggle} onCheckedChange={setToggle} />
            <span className="text-copy-14 text-[var(--ds-gray-900)]">
              {toggle ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </section>

        {/* Select */}
        <section className="flex flex-col gap-6">
          <h2 className="text-label-14 text-[var(--ds-gray-600)] uppercase tracking-wider">Select</h2>
          <div className="max-w-xs">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </section>

      </div>
    </div>
  );
}

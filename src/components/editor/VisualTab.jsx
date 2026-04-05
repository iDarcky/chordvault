import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function VisualTab({ song, onChange }) {
  const addSection = (type) => {
    const newSection = {
      type,
      id: Math.random().toString(36).substr(2, 9),
      content: ''
    };
    onChange({ ...song, sections: [...song.sections, newSection] });
  };

  const updateSection = (id, patch) => {
    onChange({
      ...song,
      sections: song.sections.map(s => s.id === id ? { ...s, ...patch } : s)
    });
  };

  const removeSection = (id) => {
    onChange({
      ...song,
      sections: song.sections.filter(s => s.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['verse', 'chorus', 'bridge', 'outro'].map(type => (
          <Button key={type} variant="secondary" size="sm" onClick={() => addSection(type)} className="capitalize">
            + {type}
          </Button>
        ))}
      </div>

      <div className="space-y-4">
        {song.sections.map((section, idx) => (
          <Card key={section.id || idx} className="p-4 border-l-4 border-l-brand relative group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand">{section.type}</span>
              <button onClick={() => removeSection(section.id)} className="text-red-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
            <textarea
              value={section.content}
              onChange={e => updateSection(section.id, { content: e.target.value })}
              placeholder="Enter chords and lyrics..."
              className="w-full bg-transparent border-none outline-none font-mono text-sm min-h-[100px] resize-none text-[var(--geist-foreground)]"
            />
          </Card>
        ))}
      </div>

      {song.sections.length === 0 && (
        <div className="text-center py-20 border border-dashed border-[var(--geist-border)] rounded-geist-card text-[var(--accents-5)] text-sm italic">
          Start adding sections to your song chart.
        </div>
      )}
    </div>
  );
}

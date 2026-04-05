import Input from '../ui/Input';
import Card from '../ui/Card';

export default function FormTab({ song, onChange }) {
  const update = (patch) => onChange({ ...song, ...patch });

  return (
    <div className="space-y-8">
      <Card className="p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accents-5)] mb-4 px-1">Basic Details</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold block mb-2 text-[var(--accents-5)]">Song Title</label>
            <Input value={song.title} onChange={e => update({ title: e.target.value })} placeholder="Amazing Grace" />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-2 text-[var(--accents-5)]">Artist / Composer</label>
            <Input value={song.artist} onChange={e => update({ artist: e.target.value })} placeholder="John Newton" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-6">
          <label className="text-xs font-semibold block mb-2 text-[var(--accents-5)] uppercase">Key</label>
          <Input value={song.key} onChange={e => update({ key: e.target.value })} placeholder="C" className="font-mono font-bold" />
        </Card>
        <Card className="p-6">
          <label className="text-xs font-semibold block mb-2 text-[var(--accents-5)] uppercase">Tempo (BPM)</label>
          <Input value={song.tempo} onChange={e => update({ tempo: e.target.value })} placeholder="72" className="font-mono font-bold" />
        </Card>
        <Card className="p-6">
          <label className="text-xs font-semibold block mb-2 text-[var(--accents-5)] uppercase">Time Signature</label>
          <Input value={song.time} onChange={e => update({ time: e.target.value })} placeholder="4/4" className="font-mono font-bold" />
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--accents-5)] mb-4 px-1">Tags & Metadata</h3>
        <Input
          value={song.tags?.join(', ') || ''}
          onChange={e => update({ tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
          placeholder="Hymn, Worship, Upbeat"
        />
        <div className="mt-2 text-[10px] text-[var(--accents-4)] italic">
          Separate tags with commas. Tags help you filter your library.
        </div>
      </Card>
    </div>
  );
}

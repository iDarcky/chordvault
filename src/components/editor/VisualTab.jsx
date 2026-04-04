import SectionBlock from '../SectionBlock';

export default function VisualTab({ song }) {
  if (!song.sections || song.sections.length === 0) {
    return (
      <div className="bento-card" style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Preview will appear here</div>
        <p style={{ fontSize: 13, marginTop: 8 }}>Start writing in the Markdown tab to see your chart.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {song.sections.map((sec, i) => (
        <SectionBlock key={i} section={sec} transpose={0} size={1} />
      ))}
    </div>
  );
}

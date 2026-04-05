import ChartView from '../ChartView';

export default function PreviewPanel({ song }) {
  if (!song) return null;
  return (
    <div className="bg-[var(--geist-background)] border border-[var(--geist-border)] rounded-geist-card shadow-2xl p-6 h-[700px] overflow-auto transform scale-90 origin-top">
      <ChartView
        song={song}
        onBack={() => {}}
        onEdit={() => {}}
        isPreview={true}
      />
    </div>
  );
}

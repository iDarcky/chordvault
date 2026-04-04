export default function PageHeader({ title }) {
  return (
    <div style={{
      padding: '20px 24px 12px',
    }}>
      <h1 style={{
        margin: 0, fontSize: 20, fontWeight: 700,
        color: 'var(--text-bright)', letterSpacing: '-0.02em',
      }}>
        {title}
      </h1>
    </div>
  );
}

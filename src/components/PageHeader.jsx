export default function PageHeader({ title, children }) {
  return (
    <div style={{
      padding: '20px 24px 12px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <h1 style={{
        margin: 0, fontSize: 20, fontWeight: 700,
        color: 'var(--text-bright)', letterSpacing: '-0.02em',
      }}>
        {title}
      </h1>
      {children && (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}

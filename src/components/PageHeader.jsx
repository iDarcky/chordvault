export default function PageHeader({ title, children }) {
  return (
    <div style={{
      padding: '20px 24px 12px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <h1 className="text-heading-20" style={{
        margin: 0,
        color: 'var(--text-bright)',
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

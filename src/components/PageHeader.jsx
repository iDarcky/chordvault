export default function PageHeader({ title, children }) {
  return (
    <div style={{
      padding: '24px 24px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'var(--ds-background-200)',
      borderBottom: '1px solid var(--ds-gray-200)',
    }}>
      <h1 className="text-heading-24" style={{
        margin: 0,
        color: 'var(--text-bright)',
      }}>
        {title}
      </h1>
      {children && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {children}
        </div>
      )}
    </div>
  );
}

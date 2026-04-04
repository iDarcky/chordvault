import { useRef } from 'react';

export default function Welcome({ onGetStarted, onImport }) {
  const fileRef = useRef(null);

  const handleFiles = async (e) => {
    for (const file of Array.from(e.target.files)) {
      const text = await file.text();
      onImport(text);
    }
    e.target.value = '';
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      border: '20px solid var(--border)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginBottom: 60,
        padding: '24px',
        border: 'var(--bw) solid var(--border)'
      }}>
        <div style={{ width: 24, height: 24, background: 'var(--accent)', borderRadius: 0 }} />
        <h1 style={{ fontSize: 36, fontWeight: 700, margin: 0 }}>ChordVault</h1>
      </div>

      <div style={{ maxWidth: 400, textAlign: 'center', marginBottom: 60 }}>
        <p style={{ fontSize: 24, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>Modern Worship Charts</p>
        <p style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 500 }}>BEYOND PORTABLE. BEYOND PDF. BEYOND REPLACEMENT.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, width: '100%', maxWidth: 300 }}>
        <button onClick={onGetStarted} style={{ background: 'var(--accent)', padding: '20px' }}>GET STARTED</button>
        <button onClick={() => fileRef.current?.click()} style={{ background: 'var(--text-bright)', color: 'var(--bg)', padding: '20px' }}>IMPORT .MD</button>
      </div>
      <input ref={fileRef} type="file" accept=".md,.txt" multiple onChange={handleFiles} style={{ display: 'none' }} />
    </div>
  );
}

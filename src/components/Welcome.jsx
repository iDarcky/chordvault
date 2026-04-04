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
      background: 'radial-gradient(circle at 50% 30%, #2d1a1c 0%, var(--bg) 70%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Cinematic Background Glow */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        height: 400,
        background: 'radial-gradient(ellipse at center, var(--accent-glow) 0%, transparent 80%)',
        opacity: 0.5,
        pointerEvents: 'none',
      }} />

      {/* Floating Logo */}
      <div className="animate-in" style={{
        width: 100,
        height: 100,
        borderRadius: 24,
        background: 'linear-gradient(135deg, var(--accent), #fb7185)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: 40,
        fontWeight: 900,
        marginBottom: 40,
        boxShadow: '0 20px 40px rgba(244,63,94,0.3)',
        border: '1px solid rgba(255,255,255,0.2)',
      }}>
        CV
      </div>

      <div className="animate-in" style={{ textAlign: 'center', position: 'relative', zIndex: 1, animationDelay: '0.1s' }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, margin: '0 0 16px', letterSpacing: '-0.05em' }}>ChordVault</h1>
        <p style={{ fontSize: 20, color: 'var(--text)', fontWeight: 500, margin: '0 auto 12px', maxWidth: 340, lineHeight: 1.4 }}>
          Modern music management for worship teams.
        </p>
        <p style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 400, maxWidth: 300, margin: '0 auto 64px' }}>
          Craft beautiful charts, build setlists, and lead with confidence.
        </p>
      </div>

      <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 320, position: 'relative', zIndex: 1, animationDelay: '0.2s' }}>
        <button className="primary" onClick={onGetStarted} style={{ padding: '18px', borderRadius: 16, fontSize: 16, fontWeight: 700 }}>GET STARTED</button>
        <button onClick={() => fileRef.current?.click()} style={{ padding: '18px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', fontSize: 15, fontWeight: 600 }}>IMPORT EXISTING DATA</button>
      </div>

      <input ref={fileRef} type="file" accept=".md,.txt" multiple onChange={handleFiles} style={{ display: 'none' }} />

      <div style={{ position: 'absolute', bottom: 32, fontSize: 12, color: 'var(--text-dim)', fontWeight: 500, letterSpacing: '0.05em' }}>VERSION 2026.1 / PRO PREVIEW</div>
    </div>
  );
}

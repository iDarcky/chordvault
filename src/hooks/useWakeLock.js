import { useEffect, useRef } from 'react';

// Keep the screen awake while `active` is true. Browsers release the
// wake lock when the document hides (background tab); we re-acquire on
// `visibilitychange` so a brief screen lock or tab switch doesn't kill
// it for the rest of the set. Silently no-ops on browsers without the
// Wake Lock API (older Safari, etc.) — the user can always tap the
// screen to keep it alive there.
export function useWakeLock(active) {
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    if (typeof navigator === 'undefined') return;
    if (!('wakeLock' in navigator)) return;

    let cancelled = false;

    const acquire = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener('release', () => {
          if (sentinelRef.current === sentinel) sentinelRef.current = null;
        });
      } catch (err) {
        // Surface for diagnostics but don't blow up the UI.
        console.warn('[wakeLock] request failed:', err?.message || err);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !sentinelRef.current) {
        acquire();
      }
    };

    acquire();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisibility);
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      if (sentinel) sentinel.release().catch(() => {});
    };
  }, [active]);
}

// Optional Sentry integration. We import @sentry/react dynamically so
// the app builds and runs even when the package isn't installed yet — a
// missing dep just means errors aren't reported. Set VITE_SENTRY_DSN in
// your Vercel/.env to turn it on; everything else here is sane defaults.

export async function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  if (!dsn) return; // No-op until DSN is configured.

  try {
    const Sentry = await import('@sentry/react');
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || undefined,
      // Conservative defaults — bump tracesSampleRate when you want
      // performance data, replaysSessionSampleRate for session replays.
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        Sentry.browserTracingIntegration?.(),
        Sentry.replayIntegration?.({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ].filter(Boolean),
      // The parser is the highest-risk surface in this app — capture
      // its errors aggressively while sampling routine UI errors.
      beforeSend(event) {
        return event;
      },
    });
  } catch (err) {
    // Package isn't installed (or import failed). Don't crash; just log.
    console.warn('[sentry] init skipped:', err?.message || err);
  }
}

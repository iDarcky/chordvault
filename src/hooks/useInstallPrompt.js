import { useState, useEffect, useCallback } from 'react';

// Detect once at module load — these never change for the life of the page.
const IS_IOS = (() => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
})();

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

// Captures the browser's `beforeinstallprompt` event so we can fire the
// install dialog from our own UI (drawer button, welcome footer, etc.).
// iOS Safari does not fire this event — for iOS we expose a flag so the
// caller can show a custom Add-to-Home-Screen explainer instead.
export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [standalone, setStandalone] = useState(isStandalone());

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredEvent(e);
    };
    const onAppInstalled = () => {
      setInstalled(true);
      setDeferredEvent(null);
      setStandalone(true);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return null;
    deferredEvent.prompt();
    try {
      const { outcome } = await deferredEvent.userChoice;
      setDeferredEvent(null);
      return outcome;
    } catch {
      return null;
    }
  }, [deferredEvent]);

  return {
    canInstall: !!deferredEvent && !standalone,
    isIOS: IS_IOS && !standalone,
    isStandalone: standalone,
    installed,
    promptInstall,
  };
}

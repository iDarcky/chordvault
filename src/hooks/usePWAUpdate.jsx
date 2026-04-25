import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { toast } from '../components/ui/use-toast';

// Surface a "new version available" toast whenever the service worker
// finishes downloading an updated bundle. The toast's primary action
// reloads via updateServiceWorker(true), which calls skipWaiting() and
// then triggers a controllerchange. Without this hook, vite-plugin-pwa's
// `autoUpdate` mode silently swaps SWs but the user keeps running the
// old bundle until they happen to close the tab.
export function usePWAUpdate() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisterError(err) {
      console.warn('[pwa] service worker registration failed:', err);
    },
  });

  useEffect(() => {
    if (!needRefresh) return;
    const t = toast({
      title: 'New version available',
      description: 'Reload to get the latest fixes and features.',
      duration: 1000 * 60 * 60 * 24, // sticky-ish; user dismisses or reloads
      action: (
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="ml-2 px-3 py-1.5 rounded-md text-label-12 font-semibold text-white border-none cursor-pointer"
          style={{ background: 'var(--color-brand)' }}
        >
          Reload
        </button>
      ),
    });
    return () => {
      t.dismiss();
      setNeedRefresh(false);
    };
  }, [needRefresh, updateServiceWorker, setNeedRefresh]);
}

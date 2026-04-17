import React, { useCallback, useState } from 'react';
import { ConfirmDialog } from './Dialog';

/**
 * useConfirm — hook returning `[confirm, element]`.
 * `confirm(opts)` returns a Promise<boolean>. Render `element` once near the root.
 *
 *   const [confirm, confirmElement] = useConfirm();
 *   const ok = await confirm({ title: 'Delete?', variant: 'error' });
 */
export function useConfirm() {
  const [state, setState] = useState({ open: false, opts: null, resolve: null });

  const confirm = useCallback((opts = {}) => {
    return new Promise((resolve) => {
      setState({ open: true, opts, resolve });
    });
  }, []);

  const handleOpenChange = (next) => {
    if (!next && state.resolve) state.resolve(false);
    setState((s) => ({ ...s, open: next }));
  };

  const handleConfirm = () => {
    if (state.resolve) state.resolve(true);
  };

  const element = React.createElement(ConfirmDialog, {
    open: state.open,
    onOpenChange: handleOpenChange,
    onConfirm: handleConfirm,
    ...(state.opts || {}),
  });

  return [confirm, element];
}

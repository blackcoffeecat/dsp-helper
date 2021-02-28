import { useEffect } from 'react';

function useIdleEffect(fn, deps) {
  useEffect(() => {
    const RIC = window.requestIdleCallback ?? (fn => setTimeout(fn, 1));
    let out;
    let current = true;
    RIC(() => {
      if (current) out = fn?.();
    });
    return () => {
      current = false;
      out?.();
    };
  }, deps);
}

export default useIdleEffect;

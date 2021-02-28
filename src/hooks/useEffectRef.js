import { useEffect, useRef } from 'react';

function useEffectRef(value) {
  const ref = useRef(value);
  ref.current = value;

  useEffect(() => {
    let prev = ref.current;
    ref.current = value;
    return () => {
      ref.current = prev;
    };
  }, [value]);

  return ref;
}

export default useEffectRef;

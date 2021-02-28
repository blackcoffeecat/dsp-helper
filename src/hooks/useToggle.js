import useCall from '@/hooks/useCall';
import { useMemo, useState } from 'react';

function useToggle(initial = false) {
  const [value, setValue] = useState(initial);

  const toggle = useCall(() => setValue(v => !v));

  return useMemo(() => {
    return [value, toggle, setValue];
  }, [value]);
}

export default useToggle;

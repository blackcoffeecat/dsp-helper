import useCall from '@/hooks/useCall';
import { useState } from 'react';

function useOnChange(initial = '') {
  const [value, setValue] = useState(initial);

  const onChange = useCall(event => {
    setValue(event?.target?.value ?? event);
  });

  return [value, onChange, setValue];
}

export default useOnChange;

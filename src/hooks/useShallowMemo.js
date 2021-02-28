import { useEffect, useState } from 'react';
import shallowEqual from 'shallowequal';

function useShallowMemo(value) {
  const [state, setState] = useState(value);

  useEffect(() => {
    if (!shallowEqual(state, value)) {
      setState(value);
    }
  }, [value]);

  return state;
}

export default useShallowMemo;

import isEqual from 'lodash.isequal';
import { useEffect, useState } from 'react';

function useSimpleMemo(value) {
  const [state, setState] = useState(value);

  useEffect(() => {
    if (!isEqual(state, value)) {
      setState(value);
    }
  }, [value]);

  return state;
}

export default useSimpleMemo;

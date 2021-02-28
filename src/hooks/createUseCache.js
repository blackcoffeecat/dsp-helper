import cloneDeep from 'clone-deep';
import { useEffect, useState } from 'react';

function createUseCache() {
  let cache = null;

  function useCacheState(initial) {
    const [state, setState] = useState(cache ?? initial);
    useEffect(() => {
      cache = cloneDeep(state);
    }, [state]);

    return [state, setState];
  }

  return useCacheState;
}

export default createUseCache;

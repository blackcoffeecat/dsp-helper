import useEffectRef from '@/hooks/useEffectRef';
import { useDebugValue, useEffect, useState } from 'react';

function useJson(url, options = null) {
  const requestId = url + JSON.stringify(options);
  const ref = useEffectRef(requestId);
  const [data, setData] = useState(null);

  useDebugValue(data);

  useEffect(() => {
    fetch(url, options)
      .then(r => r.json())
      .then(data => {
        if (ref.current === requestId) {
          setData(() => data);
        }
      }, console.error);
  }, [requestId]);

  return data;
}

export default useJson;

import useCall from '@/hooks/useCall';
import { useMemo, useRef } from 'react';

function useProxy(getter) {
  const $getter = useCall(getter);
  const plain = useRef({}).current;

  return useMemo(() => {
    return new Proxy(plain, {
      get() {
        const me = $getter() ?? plain;
        const args = [].slice.call(arguments, 1);
        return Reflect.get.call(me, me, ...args);
      },
      set() {
        const me = $getter() ?? plain;
        const args = [].slice.call(arguments, 1);
        return Reflect.set.call(me, me, ...args);
      },
      ownKeys() {
        const me = $getter() ?? plain;
        const args = [].slice.call(arguments, 1);
        return Reflect.ownKeys.call(me, me, ...args);
      },
    });
  }, []);
}

export default useProxy;

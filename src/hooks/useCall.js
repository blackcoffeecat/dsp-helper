import { useCallback, useRef } from 'react';

function useCall(fn) {
  const fnRef = useRef();
  fnRef.current = fn;

  return useCallback(function() {
    return fnRef.current?.apply(this, arguments);
  }, []);
}

export function useCallArgs(fn, ...args) {
  return useCall(function() {
    return fn?.call(this, ...args, ...arguments);
  });
}

export function useCreateCall() {
  const { current: fnMap } = useRef(new Map());
  const { current: callMap } = useRef(new Map());

  return useCallback((key, fn) => {
    fnMap.set(key, fn);

    let call = callMap.get(key);
    if (!call) {
      call = function $call() {
        return fnMap.get(key)?.apply(this, arguments);
      };
      callMap.set(key, call);
    }

    return call;
  }, []);
}

export default useCall;

import useShallowMemo from '@/hooks/useShallowMemo';
import { useContext, useDebugValue } from 'react';

const createUseContext = Context => {
  return function useSelectContext(selector) {
    const context = useContext(Context);

    const value = useShallowMemo(selector ? selector(context) ?? null : context);
    useDebugValue(value);

    return value;
  };
};

export default createUseContext;

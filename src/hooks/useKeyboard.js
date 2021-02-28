import useCall from '@/hooks/useCall';
import { off, on } from '@/utils/misc';
import { useEffect } from 'react';

function useKeyboard(
  key,
  handler,
  { type = 'press', preventDefault = false, stopPropagation = false } = {},
) {
  const $handler = useCall(function(event) {
    if (event?.key === key) {
      handler?.apply(this, arguments);
      if (preventDefault) event.preventDefault();
      if (stopPropagation) event.stopPropagation();
    }
  });

  useEffect(() => {
    on(window, `key${type}`, $handler);
    return () => {
      off(window, `key${type}`, $handler);
    };
  }, [type]);
}

export default useKeyboard;

import { useRef } from 'react';

function useConstants(value) {
  return useRef(value).current;
}

export default useConstants;

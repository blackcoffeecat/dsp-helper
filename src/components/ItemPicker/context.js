import createUseContext from '@/hooks/createUseContext';
import { createContext } from 'react';

const context = createContext({ state: {}, actions: {} });

export const useItemPickerCtx = createUseContext(context);

export default context;

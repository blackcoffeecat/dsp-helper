import createUseContext from '@/hooks/createUseContext';
import useShallowMemo from '@/hooks/useShallowMemo';
import React, { createContext } from 'react';

const ProductionContext = createContext({ context: {}, state: {}, actions: {}, picker: {} });

function ProductionProvider(props) {
  const { children, value } = props;
  return <ProductionContext.Provider value={useShallowMemo(value)} children={children} />;
}

export const useProductionContext = createUseContext(ProductionContext);

export default ProductionProvider;

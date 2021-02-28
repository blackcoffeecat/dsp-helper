import ProductionProvider from '@/app/ProductionContext';
import { itemCollectSolution } from '@/app/solutions';
import useProductionState from '@/app/useProductionState';
import ItemPicker from '@/components/ItemPicker';
import useIdleEffect from '@/hooks/useIdleEffect';
import useProxy from '@/hooks/useProxy';
import ChooseRecipe from '@/pages/ProductionCalculator/ChooseRecipe';
import ProduceItem from '@/pages/ProductionCalculator/ProduceItem';
import ProductionAllocated from '@/pages/ProductionCalculator/ProductionAllocated';
import { Box } from '@material-ui/core';
import React, { useRef } from 'react';

function ProductionCalculator() {
  const { context, state, actions, result } = useProductionState(itemCollectSolution);

  const pickerRef = useRef();
  const picker = useProxy(() => pickerRef.current);

  const appContext = { context, state, result, actions, picker };

  useIdleEffect(() => {
    if (!state.produceItem && context.itemMap?.size) {
      actions.setProduceItem(context.itemMap.get('Universe_Matrix'));
    }
  }, [context.itemMap]);

  return (
    <Box maxHeight='100vh' overflow='auto' pt={2}>
      <ProductionProvider value={appContext}>
        <ProduceItem />

        <ChooseRecipe />

        <ProductionAllocated />

        <ItemPicker ref={pickerRef} />
      </ProductionProvider>
    </Box>
  );
}

export default ProductionCalculator;

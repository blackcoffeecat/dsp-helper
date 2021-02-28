import { useProductionContext } from '@/app/ProductionContext';
import ItemView from '@/components/ItemView/ItemView';
import { parseNum } from '@/utils/object-utils';
import { Box } from '@material-ui/core';
import React, { forwardRef, memo } from 'react';

const contextSelector = ({ context, state, result, actions }) => {
  return {
    itemMap: context.itemMap,
    chainMap: context.chainMap,
    assemblers: state.assemblers,
  };
};

function RecipeView(props, ref) {
  const { itemMap, chainMap, assemblers } = useProductionContext(contextSelector);
  let { chainId, itemId, chainSize = 1, active = false, imageSize, ...rest } = props;
  const chain = chainMap.get(chainId);

  let building = chain.building ?? [null];
  if (building.length > 1) {
    building = building.find(v => assemblers.includes(v)) ?? building[0];
  } else {
    building = building[0];
  }
  building = itemMap.get(building) ?? null;

  let duration = chain.duration;
  if (duration != null && building?.produceSpeed != null) {
    duration /= building.produceSpeed;
  }

  imageSize ??= 42;

  return (
    <Box
      ref={ref}
      display='inline-flex'
      flexDirection='row'
      alignItems='flex-start'
      py={1.5}
      {...rest}
    >
      {itemId ? (
        <>
          <ItemView
            type='image'
            imageSize={imageSize}
            item={itemMap.get(itemId)}
            badge={parseNum(new Map(chain.output).get(itemId) * chainSize)}
          />
          <Box p={1} />
        </>
      ) : null}

      {building && (
        <>
          <ItemView
            type='image'
            imageSize={imageSize}
            item={building}
            badge={`${parseNum(duration)}s`}
          />
          <Box p={1} />
        </>
      )}

      {chain.recipe.map(([id, count], index, array) => (
        <React.Fragment key={id}>
          <ItemView
            type='image'
            imageSize={imageSize}
            item={itemMap.get(id)}
            badge={parseNum(count * chainSize)}
          />
          {index !== array.length - 1 && <Box p={1} />}
        </React.Fragment>
      ))}
    </Box>
  );
}

RecipeView = memo(forwardRef(RecipeView));

export default RecipeView;

import { useProductionContext } from '@/app/ProductionContext';
import { isLeafItem } from '@/app/solutions/shared';
import { ItemMapList } from '@/components/ItemView/ItemList';
import ItemView from '@/components/ItemView/ItemView';
import LayoutPaper, { PaperIcons } from '@/components/LayoutPaper';
import useCall, { useCreateCall } from '@/hooks/useCall';
import useConstants from '@/hooks/useConstants';
import { mergeMapNum, numReadable, parseNum } from '@/utils/object-utils';
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@material-ui/core';
import { WidgetsOutlined } from '@material-ui/icons';
import React, { memo, useMemo, useState } from 'react';

const selector = ({ context, state, result, actions }) => {
  return {
    items: context.items,
    itemMap: context.itemMap,
    chainMap: context.chainMap,

    assemblers: state.assemblers,
    resources: state.resources,

    productionChains: result.productionChains,
    unassigned: result.unassigned,

    actions,
  };
};

function ProductionAllocated() {
  const {
    items,
    itemMap,
    assemblers,
    resources,
    productionChains,
    unassigned,
    actions,
  } = useProductionContext(selector);

  const [rate, setRate] = useState(1);
  const changeRate = useCall((e, rate) => {
    setRate(rate);
  });

  const assemblerList = useMemo(() => {
    return items?.filter(v => v.categories?.includes('Assembler')) ?? [];
  }, [items]);

  const assembler = useMemo(() => {
    return assemblers.find(v => itemMap.get(v)?.categories?.includes('Assembler'));
  }, [assemblers]);

  const [buildingMap, resourceMap, workConsumption] = useMemo(() => {
    let buildingMap = new Map();
    let resourceMap = new Map();
    let workConsumption = 0;
    productionChains?.forEach(item => {
      const { chainSize, recipe, building } = item;
      if (building) {
        buildingMap = mergeMapNum([[building, chainSize]], buildingMap);
        workConsumption += (itemMap.get(building)?.workConsumption ?? 0) * chainSize;
      }
      recipe.forEach(([id, count]) => {
        if (isLeafItem(id, resources, itemMap)) {
          resourceMap = mergeMapNum([[id, count]], resourceMap, chainSize);
        }
      });
    });

    return [buildingMap, resourceMap, workConsumption];
  }, [productionChains, assemblers]);

  const changeAssembler = useCall((e, value) => {
    if (assembler) actions.removeAssembler(assembler);
    actions.addAssembler(value);
  });

  const [itemProps] = useConstants([{ max: Number.MAX_SAFE_INTEGER }]);

  const createCall = useCreateCall();

  if (!productionChains?.length || unassigned?.length > 0) return null;

  const imageSize = 64;

  return (
    <LayoutPaper title='Production Allocated'>
      <PaperIcons>
        <ToggleButtonGroup size='small' exclusive value={rate} onChange={changeRate}>
          <ToggleButton value={1}>Per Second</ToggleButton>
          <ToggleButton value={60}>Per Minute</ToggleButton>
        </ToggleButtonGroup>
        <ToggleButtonGroup size='small' exclusive value={assembler} onChange={changeAssembler}>
          {assemblerList.map(item => (
            <ToggleButton value={item.id} key={item.id}>
              <ItemView
                active={assembler?.id === item.id}
                key={item.id}
                item={item}
                imageSize={24}
                type='image'
              />
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </PaperIcons>
      <List>
        {productionChains.map(chainInfo => {
          const { assemblyChainId, itemId, itemRate, recipe, building, chainSize } = chainInfo;

          const onAddResource = createCall(`${assemblyChainId}:toResource`, () => {
            actions.addToResource(itemId);
          });

          return (
            <ListItem
              component={Box}
              key={assemblyChainId}
              disableGutters
              overflow='auto'
              minWidth={0}
            >
              <Box display='flex' flexDirection='row'>
                <ItemView
                  item={itemMap.get(itemId)}
                  type='image'
                  imageSize={imageSize}
                  badge={`${parseNum(itemRate * chainSize * rate)}/${{ 1: 's', 60: 'm' }[rate]}`}
                />
                <Box p={1} />

                {building != null && chainSize > 0 && (
                  <>
                    <ItemView
                      item={itemMap.get(building)}
                      type='image'
                      imageSize={imageSize}
                      badge={`${chainSize}`}
                      max={Number.MAX_SAFE_INTEGER}
                    />
                    <Box p={1} />
                  </>
                )}

                {recipe.map(([id, count]) => (
                  <React.Fragment key={`${assemblyChainId}:${id}`}>
                    <ItemView
                      item={itemMap.get(id)}
                      type='image'
                      imageSize={imageSize}
                      badge={`${parseNum(count * chainSize * rate)}/${{ 1: 's', 60: 'm' }[rate]}`}
                    />
                    <Box p={1} />
                  </React.Fragment>
                ))}

                <Box width={48} />
              </Box>
              <ListItemSecondaryAction>
                <Tooltip title='Add to Resource'>
                  <IconButton edge='end' onClick={onAddResource}>
                    <WidgetsOutlined />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
          );
        })}
      </List>

      <Box py={1}>
        <Divider />
      </Box>
      <List subheader={`Buildings (work consumption ${numReadable(workConsumption)}W)`} />
      <ItemMapList itemMap={buildingMap} listType='image' itemProps={itemProps} />

      <Box py={1}>
        <Divider />
      </Box>
      <List subheader='Resources' />
      <ItemMapList
        itemMap={new Map(resourceMap)}
        listType='image'
        unit={rate === 1 ? '/s' : '/m'}
      />
    </LayoutPaper>
  );
}

ProductionAllocated = memo(ProductionAllocated);

export default ProductionAllocated;

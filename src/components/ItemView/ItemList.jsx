import { useProductionContext } from '@/app/ProductionContext';
import ItemView from '@/components/ItemView/ItemView';
import useCall, { useCreateCall } from '@/hooks/useCall';
import useConstants from '@/hooks/useConstants';
import useShallowMemo from '@/hooks/useShallowMemo';
import { parseNum } from '@/utils/object-utils';
import { Grid, useTheme } from '@material-ui/core';
import React, { memo, useMemo } from 'react';

const selector = ({ context }) => {
  return {
    itemMap: context.itemMap,
  };
};

function ItemList(props) {
  const { itemMap } = useProductionContext(selector);

  const {
    items,
    hiddenSet,
    listType = 'basic',
    activeItem,
    gridItemProps,
    itemProps,
    onItemProps,
    onItemClick,
    ...rest
  } = props;

  const createCall = useCreateCall();

  const { transitions } = useTheme();

  const gridItemSx = useConstants({
    transition: transitions.create(['width', 'max-width'], {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shortest,
    }),
    ...(gridItemProps?.sx ?? null),
  });
  const $gridProps = useShallowMemo(
    listType === 'image'
      ? { xs: 3, sm: 2, md: 1, ...gridItemProps, sx: gridItemSx }
      : { xs: 12, md: 6, ...gridItemProps, sx: gridItemSx },
  );
  const itemSx = useShallowMemo({ display: 'block', ...itemProps?.sx });
  const _itemProps = useShallowMemo(
    listType === 'image'
      ? { imageSize: '100%', ...itemProps, sx: itemSx }
      : { ...itemProps, sx: itemSx },
  );

  return (
    <Grid container spacing={2} {...rest}>
      {items?.map(item => {
        if (typeof item === 'string') item = itemMap.get(item);

        let itemClick;
        if (typeof onItemClick === 'function') {
          itemClick = createCall(`itemClick:${item.id}`, () => onItemClick(item));
        }

        let $itemProps = _itemProps;
        if (typeof onItemProps === 'function') {
          $itemProps = Object.assign({}, $itemProps, onItemProps(item, listType, activeItem));
        }

        return (
          <Grid key={item.id} item {...$gridProps} hidden={hiddenSet?.has(item.id)}>
            <ItemView
              item={item}
              type={listType}
              active={activeItem?.id === item.id}
              onClick={itemClick}
              {...$itemProps}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

ItemList = memo(ItemList);

export function ItemMapList(props) {
  const { itemMap, onItemProps, items: _, unit, ...rest } = props;

  const items = useMemo(() => {
    return [...itemMap.keys()];
  }, [itemMap]);

  const $onItemProps = useCall(function(item) {
    const count = itemMap.get(item.id) ?? 1;
    return Object.assign(
      {
        badge:
          unit === '/m'
            ? `${parseNum((count ?? 1) * 60)}/m`
            : unit === '/s'
            ? `${parseNum(count ?? 1)}/s`
            : count,
      },
      onItemProps?.apply?.(this, arguments) ?? {},
    );
  });

  return <ItemList items={items} onItemProps={$onItemProps} {...rest} />;
}

ItemMapList = memo(ItemMapList);

export default ItemList;

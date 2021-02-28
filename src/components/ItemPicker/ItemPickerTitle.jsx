import { useProductionContext } from '@/app/ProductionContext';
import useCall from '@/hooks/useCall';
import {
  Box,
  Collapse,
  IconButton,
  Input,
  MenuItem,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@material-ui/core';
import { AppsOutlined, ListOutlined, Search } from '@material-ui/icons';
import React, { memo, useMemo, useRef } from 'react';
import { useItemPickerCtx } from './context';

const selectProduction = ({ context }) => {
  return {
    items: context.items,
  };
};

const selectPicker = ({ state, actions }) => {
  return {
    search: state.search,
    focused: state.focused,
    category: state.category,
    title: state.title,
    viewType: state.viewType,
    actions,
  };
};

function ItemPickerTitle() {
  const { items } = useProductionContext(selectProduction);
  const { search, focused, category, title, viewType, actions } = useItemPickerCtx(selectPicker);
  const inputRef = useRef();

  const allCategories = useMemo(() => {
    if (!items?.length) return [];
    const set = new Set();
    for (const item of items) item?.categories?.forEach(set.add, set);
    return [...set];
  }, [items]);

  const showSearch = !!(search || category) || focused;

  return (
    <Box display='flex' flexDirection='row' alignItems='center'>
      <IconButton color='primary' edge='start' onClick={actions.onFocus}>
        <Search />
      </IconButton>

      <Collapse
        orientation='horizontal'
        in={showSearch}
        onEnter={useCall(() => inputRef.current?.focus())}
      >
        <Box display='flex' flexDirection='row' flexWrap='nowrap' alignItems='flex-end'>
          <Select
            size='small'
            autoWidth
            value={category}
            onChange={actions.changeCategory}
            onFocus={actions.onFocus}
            onBlur={actions.onBlur}
            placeholder='Category'
          >
            <MenuItem value={false} dense>
              <Typography variant='body2'>All</Typography>
            </MenuItem>
            {allCategories.map(cate => (
              <MenuItem value={cate} key={cate} dense>
                <Typography variant='body2'>{cate}</Typography>
              </MenuItem>
            ))}
          </Select>

          <Input
            size='small'
            inputRef={inputRef}
            placeholder='search by item name'
            value={search}
            onChange={actions.changeSearch}
            onFocus={actions.onFocus}
            onBlur={actions.onBlur}
          />
        </Box>
      </Collapse>

      <Collapse orientation='horizontal' in={!showSearch}>
        <Typography noWrap>{title || 'Pick Items'}</Typography>
      </Collapse>

      <Box pl={1} ml='auto' justifySelf='flex-end'>
        <ToggleButtonGroup
          size='small'
          value={viewType}
          exclusive
          onChange={useCall((e, value) => {
            actions.setViewType(value);
          })}
        >
          <ToggleButton value='basic'>
            <ListOutlined />
          </ToggleButton>
          <ToggleButton value='image'>
            <AppsOutlined />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}

ItemPickerTitle = memo(ItemPickerTitle);

export default ItemPickerTitle;

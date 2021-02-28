import { useProductionContext } from '@/app/ProductionContext';
import ItemList from '@/components/ItemView/ItemList';
import ItemView from '@/components/ItemView/ItemView';
import LayoutPaper, { PaperIcons } from '@/components/LayoutPaper';
import RecipeView from '@/components/RecipeView';
import useCall, { useCreateCall } from '@/hooks/useCall';
import useConstants from '@/hooks/useConstants';
import useShallowMemo from '@/hooks/useShallowMemo';
import useToggle from '@/hooks/useToggle';
import {
  Box,
  Collapse,
  Divider,
  Grow,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
} from '@material-ui/core';
import {
  ClearAll,
  KeyboardArrowDown,
  RemoveCircle,
  SettingsOutlined,
  WidgetsOutlined,
} from '@material-ui/icons';
import React, { memo, useEffect, useState } from 'react';

const productionSelector = ({ context, state, result, actions }) => {
  return {
    unassigned: result.unassigned,
    itemMap: context.itemMap,
    chainMap: context.chainMap,
    produceMap: context.produceMap,
    alternateRecipes: state.alternateRecipes,
    resources: state.resources,
    actions,
  };
};

function ChooseRecipe() {
  const {
    unassigned,
    itemMap,
    chainMap,
    produceMap,
    alternateRecipes,
    resources,

    actions,
  } = useProductionContext(productionSelector);
  const {
    addItemRecipe,
    removeItemRecipe,
    resetAlternateRecipes,
    addToResource,
    removeResource,
    resetResources,
  } = actions;

  const createCall = useCreateCall();

  const [open, toggle] = useToggle();
  const [assemblyList, setAssemblyList] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const openSelect = useCall((assembles, anchorEl) => {
    setAssemblyList(assembles);
    setAnchorEl(anchorEl);
    toggle();
  });

  const { transitions } = useTheme();
  const [openList, toggleList] = useToggle(true);
  useEffect(() => {
    if (unassigned?.length && !openList) toggleList();
  }, [unassigned]);

  const arrowSx = useShallowMemo({
    transition: transitions.create('transform'),
    transform: `rotate(${openList ? -180 : 0}deg)`,
  });
  const [itemSx] = useConstants([{ display: 'block' }]);

  const onItemProps = useCall(item => ({
    badge: (
      <IconButton onClick={createCall(`${item.id}:removeResource`, () => removeResource(item))}>
        <RemoveCircle fontSize='inherit' />
      </IconButton>
    ),
    color: 'default',
  }));

  const resetAll = useCall(() => {
    resetAlternateRecipes();
    resetResources();
  });

  if (!unassigned?.length && !alternateRecipes?.length) return null;

  const clickSelect = itemId =>
    createCall(`${itemId}:select`, event => {
      openSelect(
        produceMap.get(itemId)?.map((chainId, index, array) => (
          <MenuItem
            key={chainId}
            dense
            divider={index !== array.length - 1}
            onClick={createCall(`${itemId}:${chainId}`, () => {
              toggle();
              addItemRecipe(itemId, chainId);
            })}
          >
            <RecipeView chainId={chainId} />
          </MenuItem>
        )),
        event.target,
      );
    });

  const clickAddToResource = itemId =>
    createCall(`${itemId}:addLeaf`, () => {
      addToResource(itemId);
    });

  const clickRemoveRecipe = itemId =>
    createCall(`${itemId}:remove`, () => {
      removeItemRecipe(itemId);
    });

  return (
    <LayoutPaper title='Choose Recipe' pb={0}>
      <PaperIcons>
        <Grow in={openList}>
          <Tooltip title='Clear All' placement='left'>
            <IconButton onClick={resetAll}>
              <ClearAll />
            </IconButton>
          </Tooltip>
        </Grow>

        <IconButton onClick={toggleList}>
          <KeyboardArrowDown sx={arrowSx} />
        </IconButton>
      </PaperIcons>

      <Menu open={open} onClose={toggle} anchorEl={anchorEl}>
        {assemblyList}
      </Menu>

      <Collapse in={openList}>
        <Box py={0.5} />
        {unassigned?.length > 0 && (
          <>
            <List>
              {unassigned.map((itemId, index, array) => {
                const hasAssembles = produceMap.get(itemId)?.length || null;

                return (
                  <ListItem key={itemId} disableGutters>
                    <Box display='flex' flexDirection='row' alignItems='center' width='100%'>
                      <Box flex='1' overflow='hidden' pr={2}>
                        <ItemView item={itemMap.get(itemId)} imageSize={64} sx={itemSx} />
                      </Box>

                      <Box ml='auto' justifySelf='flex-end' flexShrink='0'>
                        <Tooltip title='Add to Resource' placement='top'>
                          <IconButton
                            onClick={clickAddToResource(itemId)}
                            edge={hasAssembles ? false : 'end'}
                          >
                            <WidgetsOutlined />
                          </IconButton>
                        </Tooltip>

                        {hasAssembles && (
                          <Tooltip title='Select Production Line' placement='top'>
                            <IconButton edge='end' color='primary' onClick={clickSelect(itemId)}>
                              <SettingsOutlined />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
            <Box py={1}>
              <Divider />
            </Box>
          </>
        )}

        {alternateRecipes?.length > 0 && (
          <>
            <List subheader='Recipes'>
              {alternateRecipes.map(([itemId, chainId], index, array) => (
                <ListItem key={itemId} disableGutters>
                  <Box display='flex' flexDirection='row' alignItems='center' width='100%'>
                    <Box flex='1' overflow='auto' minWidth={0} pr={2}>
                      <RecipeView itemId={itemId} chainId={chainId} imageSize={64} />
                    </Box>

                    <Box ml='auto' justifySelf='flex-end' flexShrink='0'>
                      <Tooltip title='Remove Production Line' placement='top'>
                        <IconButton onClick={clickRemoveRecipe(itemId)} edge='end'>
                          <RemoveCircle />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
            <Box py={1}>
              <Divider />
            </Box>
          </>
        )}

        {resources?.length > 0 && (
          <>
            <List subheader='Resources' />
            <ItemList items={resources} listType='image' onItemProps={onItemProps} />
          </>
        )}

        <Box py={1} />
      </Collapse>
    </LayoutPaper>
  );
}

ChooseRecipe = memo(ChooseRecipe);

export default ChooseRecipe;

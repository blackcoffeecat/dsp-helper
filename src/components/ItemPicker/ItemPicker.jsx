import { useProductionContext } from '@/app/ProductionContext';
import ItemList from '@/components/ItemView/ItemList';
import useCall, { useCallArgs } from '@/hooks/useCall';
import useConstants from '@/hooks/useConstants';
import useKeyboard from '@/hooks/useKeyboard';
import useOnChange from '@/hooks/useOnChange';
import useShallowMemo from '@/hooks/useShallowMemo';
import useToggle from '@/hooks/useToggle';
import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import Context from './context';
import ItemPickerTitle from './ItemPickerTitle';

const contextSelector = ({ context, state }) => {
  return {
    items: context.items,
    itemMap: context.itemMap,
    resources: state.resources,
  };
};

function ItemPicker(props, ref) {
  const { items, itemMap, resources } = useProductionContext(contextSelector);

  const [current, setCurrent] = useState(null);
  const [title, setTitle] = useState(null);
  const [open, toggle, setOpen] = useToggle();
  const [search, changeSearch, setSearch] = useOnChange();
  const [category, changeCategory, setCategory] = useOnChange(false);
  const [focused, setFocused] = useState(false);
  const [viewType, setViewType] = useState('basic');
  const [pickType, setPickType] = useState('production');

  // Search and category field event.
  let timerRef = useRef();
  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };
  const onFocus = useCallArgs(() => {
    clearTimer();
    setFocused(true);
  });
  const onBlur = useCall(() => {
    timerRef.current = setTimeout(setFocused, 200, false);
  });

  const state = useShallowMemo({
    current,
    open,
    search,
    category,
    focused,
    title,
    viewType,
  });

  const actions = useConstants({
    setCurrent,
    setTitle,
    toggle,
    setOpen,
    changeSearch,
    setSearch,
    changeCategory,
    setCategory,
    onFocus,
    onBlur,
    setViewType,
  });

  const resolveRef = useRef();
  const done = item => {
    resolveRef.current?.(item);
    resolveRef.current = null;
  };

  const onConfirm = useCall(() => {
    // if (pickType === 'production' && isLeafItem(current.id, resources, itemMap)) {
    //   return console.log('123');
    // }
    done(current);
    toggle();
  });

  const onCancel = useCall(() => {
    done(null);
    toggle();
  });

  useKeyboard('Enter', onConfirm);

  const resetPicker = useCall(() => {
    done(null);
    setSearch('');
    setCategory(false);
    setTitle(null);
    setFocused(false);
    setOpen(false);
    setCurrent(null);
  });

  const openPicker = useCall(
    (item = null, pickType = 'production', { title = null, category = false } = {}) => {
      resetPicker();
      return new Promise(resolve => {
        resolveRef.current = resolve;
        setCurrent(item);
        setTitle(title);
        setCategory(category);
        setOpen(true);
        setPickType(pickType);
      });
    },
  );

  const pickerContext = useShallowMemo({
    state,
    actions,
    resetPicker,
    openPicker,
  });

  useImperativeHandle(ref, () => pickerContext, [pickerContext]);

  const { breakpoints } = useTheme();
  const upSm = useMediaQuery(breakpoints.up('sm'));

  // Filtered items id
  const hiddenSet = useMemo(() => {
    if (!search && !category) return null;
    let hidden = [];
    if (search) {
      hidden.push(...items.filter(v => v.name.toLowerCase().indexOf(search.toLowerCase()) === -1));
    }

    if (category) {
      hidden.push(...items.filter(v => !v.categories?.includes(category)));
    }
    return new Set(hidden.map(v => v.id));
  }, [search, category, items]);

  // Render list content after first render.
  const [mountContent, setMountContent] = useState(false);
  useEffect(() => {
    setMountContent(true);
  }, []);

  return (
    <Context.Provider value={pickerContext}>
      <Dialog
        open={open}
        maxWidth='md'
        fullScreen={!upSm}
        onClose={toggle}
        keepMounted={mountContent}
      >
        <DialogTitle>
          <ItemPickerTitle />
        </DialogTitle>

        <DialogContent sx={{ minHeight: 320 }}>
          <Container sx={{ overflow: 'hidden' }} maxWidth='md'>
            <Box width='100vw' />
          </Container>

          <ItemList
            items={items}
            listType={viewType}
            hiddenSet={hiddenSet}
            activeItem={current}
            onItemClick={setCurrent}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onCancel}>CANCEL</Button>
          <Button variant='contained' onClick={onConfirm} disabled={!current}>
            SELECT
          </Button>
        </DialogActions>
      </Dialog>
    </Context.Provider>
  );
}

ItemPicker = forwardRef(ItemPicker);

export default ItemPicker;

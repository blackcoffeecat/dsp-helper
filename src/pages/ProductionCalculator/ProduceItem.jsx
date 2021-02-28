import { useProductionContext } from '@/app/ProductionContext';
import ItemView from '@/components/ItemView/ItemView';
import LayoutPaper, { PaperIcons } from '@/components/LayoutPaper';
import useCall from '@/hooks/useCall';
import useConstants from '@/hooks/useConstants';
import useShallowMemo from '@/hooks/useShallowMemo';
import useToggle from '@/hooks/useToggle';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Input,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from '@material-ui/core';
import { KeyboardArrowDown } from '@material-ui/icons';
import React, { memo } from 'react';

const contextSelector = ({ context, state, actions, picker }) => ({
  picker,
  produceItem: state.produceItem,
  produceSpeed: state.produceSpeed,
  speedUnit: state.speedUnit,
  setProduceItem: actions.setProduceItem,
  changeProduceSpeed: actions.changeProduceSpeed,
  changeSpeedUnit: actions.changeSpeedUnit,
});

function ProduceItem() {
  const {
    picker,
    produceItem,
    produceSpeed,
    speedUnit,
    setProduceItem,
    changeProduceSpeed,
    changeSpeedUnit,
  } = useProductionContext(contextSelector);

  const onPick = useCall(async () => {
    const nextItem = await picker.openPicker(produceItem);
    if (nextItem != null) setProduceItem(nextItem);
  });

  const [open, toggle] = useToggle(true);

  const productionTitle = produceItem ? (
    <>
      {produceItem.name}
      &nbsp;
      <Typography component='span' variant='caption'>
        ({produceSpeed} Per {speedUnit === '/n' ? 'Minute' : 'Second'})
      </Typography>
    </>
  ) : (
    'No Item Selected.'
  );

  const { transitions, zIndex } = useTheme();
  const [paperSx, titleProps] = useConstants([
    { borderWidth: 2 },
    { onClick: toggle, flex: 1, sx: { cursor: 'pointer' } },
  ]);

  return (
    <Box position='sticky' top={2} zIndex={zIndex.appBar}>
      <LayoutPaper
        title={open ? 'Produce Item' : productionTitle}
        sx={paperSx}
        pb={0}
        titleProps={titleProps}
      >
        <PaperIcons>
          <IconButton onClick={toggle}>
            <KeyboardArrowDown
              sx={useShallowMemo({
                transition: transitions.create('transform'),
                transform: `rotate(${open ? -180 : 0}deg)`,
              })}
            />
          </IconButton>
        </PaperIcons>
        <Collapse in={open}>
          {produceItem ? (
            <Box>
              <ItemView item={produceItem} type='detail' active onClick={onPick} />
              <Box display='flex' flexDirection='row' alignItems='flex-end' mt={2}>
                <Input
                  type='number'
                  min={1}
                  step={1}
                  value={produceSpeed}
                  onChange={changeProduceSpeed}
                />

                <Box px={0.5} />

                <Select value={speedUnit} onChange={changeSpeedUnit}>
                  <MenuItem dense value='/s'>
                    <Typography variant='body2'>Per Second</Typography>
                  </MenuItem>
                  <MenuItem dense value='/m'>
                    <Typography variant='body2'>Per Minute</Typography>
                  </MenuItem>
                </Select>
              </Box>
            </Box>
          ) : (
            <Button variant='outlined' onClick={onPick}>
              SELECT
            </Button>
          )}

          <Box p={1} />
        </Collapse>
      </LayoutPaper>
    </Box>
  );
}

ProduceItem = memo(ProduceItem);

export default ProduceItem;

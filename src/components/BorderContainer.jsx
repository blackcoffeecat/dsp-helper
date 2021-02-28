import useShallowMemo from '@/hooks/useShallowMemo';
import { Paper } from '@material-ui/core';
import React, { forwardRef, memo } from 'react';

function BorderContainer(props, ref) {
  let { active, sx: propSx, onClick, ...rest } = props;

  if (typeof onClick === 'function' && propSx?.cursor == null) {
    propSx = { ...propSx, cursor: 'pointer' };
  }

  const sx = useShallowMemo(
    Object.assign(
      active
        ? {
          margin: '-1px',
          borderWidth: 2,
          borderColor: 'primary.main',
        }
        : {},
      {
        display: 'inline-block',
        ...propSx,
      },
    ),
  );

  return <Paper ref={ref} variant='outlined' sx={sx} onClick={onClick} {...rest} />;
}

BorderContainer = memo(forwardRef(BorderContainer));

export default BorderContainer;

import useConstants from '@/hooks/useConstants';
import useSimpleMemo from '@/hooks/useSimpleMemo';
import { Box, useTheme } from '@material-ui/core';
import React, { forwardRef, memo, useMemo } from 'react';

const base = new URL('data/', window.location.href).href;

function ItemImage(props, ref) {
  const { src, sx, size, ...rest } = props;
  const url = useMemo(() => new URL(src, base).href, [src]);

  const imgSx = useConstants({
    display: 'inline-block',
    objectFit: 'contain',
    width: '100%',
    height: '100%',
  });

  const { transitions, spacing } = useTheme();

  const containerSx = useSimpleMemo({
    overflow: 'hidden',
    aspectRatio: '1 / 1',
    padding: spacing(size > 80 || size == null ? 1 : size > 48 ? 0.5 : 0.25),
    width: size ? size : [spacing(10), spacing(12), spacing(14)],

    // transition: transitions.create('width', {
    //   easing: transitions.easing.sharp,
    //   duration: transitions.duration.shortest,
    // }),
    ...sx,
  });

  return (
    <Box ref={ref} sx={containerSx} {...rest}>
      <Box component='img' alt='' src={url} sx={imgSx} />
    </Box>
  );
}

ItemImage = memo(forwardRef(ItemImage));

export default ItemImage;

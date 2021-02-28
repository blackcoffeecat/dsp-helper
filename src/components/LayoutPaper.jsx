import useConstants from '@/hooks/useConstants';
import {
  Box,
  Container,
  Paper,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@material-ui/core';
import React, { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';
import { createPortal, findDOMNode } from 'react-dom';

const PaperContext = createContext({});

export function PaperIcons({ children }) {
  const iconEl = useContext(PaperContext);
  if (!iconEl) return null;
  return createPortal(children, iconEl);
}

function LayoutPaper(props) {
  const { children, title = null, titleProps, ...rest } = props;
  const iconRef = useRef();
  const [iconEl, setIconEl] = useState(null);

  useLayoutEffect(() => {
    const dom = findDOMNode(iconRef.current) ?? null;
    if (iconEl !== dom) setIconEl(dom);
  });

  const toolbarSx = useConstants({
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    userSelect: 'none',
  });

  const iconSx = useConstants({
    '& > *:not(:last-child)': {
      mr: 1,
    },
    '& > .MuiIconButton-root:last-child': {
      mr: -1.5,
    },
    display: 'flex',
    flexFlow: 'row nowrap',
    alignItems: 'center',
  });

  const paperMb = useConstants({ xs: 1, sm: 1.5, md: 2.5 });

  const { breakpoints } = useTheme();
  const upSm = useMediaQuery(breakpoints.up('sm'));

  return (
    <Container maxWidth='md' disableGutters={!upSm} sx={useConstants({ overflow: 'hidden' })}>
      <Paper
        square={!upSm}
        variant='outlined'
        component={Box}
        pb={3}
        mb={paperMb}
        mx={upSm ? 0 : '-2px'}
        {...rest}
      >
        <Toolbar variant='dense' sx={toolbarSx}>
          <Typography variant='h6' {...titleProps}>
            {title}
          </Typography>
          <Box ref={iconRef} sx={iconSx} />
        </Toolbar>

        <Container>
          <PaperContext.Provider value={iconEl} children={children} />
        </Container>
      </Paper>
    </Container>
  );
}

export default LayoutPaper;

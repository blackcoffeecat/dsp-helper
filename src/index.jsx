import ProductionCalculator from '@/pages/ProductionCalculator';
import { colors, createMuiTheme, CssBaseline, MuiThemeProvider } from '@material-ui/core';
import React from 'react';
import { render } from 'react-dom';

const root = document.createElement('div');
document.body.appendChild(root);

const theme = createMuiTheme({
  palette: {
    primary: colors.purple,
    secondary: colors.teal,
  },
  typography: {
    fontFamily: `-apple-system, BlinkMacSystemFont, "Helvetica Neue", Roboto, "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", "Noto Sans", "Segoe UI", "Microsoft Yahei"`,
  },
});

render(
  <MuiThemeProvider theme={theme}>
    <CssBaseline />
    <ProductionCalculator />
  </MuiThemeProvider>,
  root,
);

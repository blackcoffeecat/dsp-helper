const path = require('path');
const Html = require('html-webpack-plugin');
const { CleanWebpackPlugin: Clean } = require('clean-webpack-plugin');
const Copy = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const plugins = [new Html({ title: 'Dyson Sphere Program Helper' })];

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new Clean(),
    new Copy({
      patterns: [{ from: 'public', to: '' }],
    }),
    new CompressionPlugin(),
  );
}

module.exports = {
  devServer: {
    port: 4000,
    open: true,
    hot: true,
    contentBase: [path.join(__dirname, 'public')],
  },
  devtool: 'cheap-module-source-map',
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      }),
    ],
  },
  entry: path.resolve('src/index.jsx'),
  output: {
    path: path.resolve('dist'),
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/i,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins,
};

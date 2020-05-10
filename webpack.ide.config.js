const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';
const isBuildWebIDE = process.env.SLATE2_ENV === 'web';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  target: isBuildWebIDE ? 'web' : 'electron-renderer',

  ...(isBuildWebIDE ? {
    entry: './src/ide/index.js',
    output: {
      path: path.join(__dirname, 'out', 'web-ide'),
    },
  } : null),

  resolve: {
    alias: {
      'react-dom': isBuildWebIDE ? 'react-dom' : '@hot-loader/react-dom',
      '@ide/bridge': path.resolve(__dirname, isBuildWebIDE ? 'src/ide/bridge/browser' : 'src/ide/bridge/electron'),
    },
  },

  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
    ],
  },

  plugins: [
    ...(isDevelopment ? [] : [new MiniCssExtractPlugin()]),
    new HtmlWebpackPlugin({
      template: './src/ide/index.html',
    }),
  ],
};

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const slate2_home = process.env.SLATE2_HOME;
const slate2_path = path.resolve(slate2_home, 'node_modules');

module.exports = {
  mode: 'production',
  target: 'web',
  entry: './src/game.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'game.js',
    library: 'slate2_game',
    libraryTarget: 'var',
    libraryExport: 'default',
  },

  resolveLoader: {
    modules: [slate2_path],
  },

  resolve: {
    alias: {
      '@slate2': path.resolve(slate2_home, 'src', 'engine'),
    },
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            // babel has its own module loader
            // presets: ['@babel/preset-env'],
            presets: [path.resolve(slate2_path, '@babel', 'preset-env')],
          },
        },
      },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
  ],
};

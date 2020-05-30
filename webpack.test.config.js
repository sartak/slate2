const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  mode: 'development',
  target: 'node',
  externals: [nodeExternals()],

  resolve: {
    alias: {
      '@ide': path.resolve(__dirname, 'src', 'ide'),
    },
  },

  module: {
    rules: [
      {
        test: /__tests__\/.*\.js$/,
        use: ['raw-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules|__tests__/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: { "node": true },
                },
              ],
              '@babel/preset-react',
            ],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-proposal-nullish-coalescing-operator',
              '@babel/plugin-proposal-optional-chaining',
            ],
          },
        },
      },
    ],
  },
};

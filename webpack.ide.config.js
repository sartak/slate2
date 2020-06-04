const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const electronVersion = require('electron/package.json').version;

const isDevelopment = process.env.NODE_ENV !== 'production';
const isBuildWebIDE = process.env.SLATE2_ENV === 'web';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  target: isBuildWebIDE ? 'web' : 'electron-renderer',

  ...(isBuildWebIDE ? {
    entry: './src/ide/web.js',
    output: {
      path: path.join(__dirname, 'out', 'web-ide'),
      filename: 'slate2.js',
      library: 'slate2',
      libraryTarget: 'var',
      libraryExport: 'default',
    },
    // needed to build babel for the web
    node: {
      fs: 'empty'
    },
  } : {
    output: {
      // Work around a bug in Electron for packaging Monaco correctly in
      // `npm run make`. If syntax highlighting works in the .app without
      // this, it can be removed.
      // https://github.com/electron-userland/electron-forge/issues/1675#issuecomment-629868800
      publicPath: './../',
    },
  }),

  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },

  resolve: {
    alias: {
      'react-dom': isBuildWebIDE ? 'react-dom' : '@hot-loader/react-dom',
      '@ide/bridge': path.resolve(__dirname, isBuildWebIDE ? 'src/ide/bridge/browser' : 'src/ide/bridge/electron'),
    },
  },

  module: {
    rules: [
      {
        test: /\.css/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'less-loader',
        ],
      },
      {
        test: /\.ttf$/,
        use: ['file-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: isBuildWebIDE ? "> 0.25%, not dead" : { "electron": electronVersion },
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

  plugins: [
    ...(isDevelopment ? [] : [new MiniCssExtractPlugin()]),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: isBuildWebIDE ? './src/ide/web.html' : './src/ide/index.html',
    }),
    new MonacoWebpackPlugin({
      languages: [
        'css', 'html', 'javascript', 'json', 'cpp', 'shell',

        // @Upstream: using javascript without typescript introduces
        // occasional innocuous but annoying errors of `Unexpected usage` in
        // loadForeignModule
        'typescript',
      ],

      features: [
        // '!accessibilityHelp',
        // '!bracketMatching',
        // '!caretOperations',
        // '!clipboard',
        // '!codeAction',
        // '!codelens',
        // '!colorDetector',
        // '!comment',
        // '!contextmenu',
        // '!coreCommands',
        // '!cursorUndo',
        // '!dnd',
        // '!find',
        // '!folding',
        // '!fontZoom',
        // '!format',
        // '!gotoError',
        // '!gotoLine',
        // '!gotoSymbol',
        // '!hover',
        '!iPadShowKeyboard',
        // '!inPlaceReplace',
        // '!inspectTokens',
        // '!linesOperations',
        // '!links',
        // '!multicursor',
        // '!parameterHints',
        // '!quickCommand',
        // '!quickOutline',
        // '!referenceSearch',
        // '!rename',
        // '!smartSelect',
        // '!snippets',
        // '!suggest',
        // '!toggleHighContrast',
        // '!toggleTabFocusMode',
        // '!transpose',
        // '!wordHighlighter',
        // '!wordOperations',
        // '!wordPartOperations'
      ],
    }),
  ],
};

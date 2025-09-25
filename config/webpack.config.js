const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  target: 'electron-renderer',
  mode: 'development',
  
  entry: path.resolve(__dirname, '../src/renderer/index.js'),
  
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'renderer.js',
    clean: true,
  },
  
  devServer: {
    port: 3000,
    hot: false,
    liveReload: false, // Disable live reload client
    client: false, // Disable webpack-dev-server client entirely
    open: false,
    static: {
      directory: path.resolve(__dirname, '../dist'),
    },
  },
  
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { electron: '37' } }],
              ['@babel/preset-react', { runtime: 'automatic' }]
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/renderer/index.html'),
      filename: 'index.html',
    }),
  ],
  
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      '@': path.resolve(__dirname, '../src/renderer'),
      '@services': path.resolve(__dirname, '../src/renderer/services'),
      '@components': path.resolve(__dirname, '../src/renderer/components'),
      '@hooks': path.resolve(__dirname, '../src/renderer/hooks'),
      '@utils': path.resolve(__dirname, '../src/renderer/utils'),
    },
  },
  
  devtool: 'eval-source-map',
};
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  target: 'electron-renderer',
  mode: isDevelopment ? 'development' : 'production',
  
  entry: path.resolve(__dirname, '../src/renderer/index.js'),
  
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'renderer.js',
    publicPath: '/',
    clean: true,
    globalObject: 'this', // Fix for global is not defined
  },
  
  devServer: {
    port: 3000,
    hot: true,
    open: false,
    historyApiFallback: true,
    static: {
      directory: path.resolve(__dirname, '../dist'),
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
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
              ['@babel/preset-env', {
                targets: { electron: '37' }
              }],
              ['@babel/preset-react', {
                runtime: 'automatic'
              }]
            ],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        type: 'asset/resource',
      },
    ],
  },
  
  plugins: [
    new webpack.ProvidePlugin({
      global: path.resolve(__dirname, './global-polyfill.js'), // Provide global polyfill
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/renderer/index.html'),
      filename: 'index.html',
      inject: 'body',
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../data'),
          to: path.resolve(__dirname, '../dist/data'),
          noErrorOnMissing: true,
        },
        {
          from: path.resolve(__dirname, '../assets'),
          to: path.resolve(__dirname, '../dist/assets'),
          noErrorOnMissing: true,
        },
      ],
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
    fallback: {
      "stream": false,
      "crypto": false,
      "buffer": false,
      "util": false,
      "assert": false,
      "http": false,
      "https": false,
      "os": false,
      "url": false,
      "zlib": false,
    }
  },
  
  devtool: isDevelopment ? 'eval-source-map' : 'source-map',
  
  performance: {
    hints: false,
  },
  
  stats: 'minimal',
};
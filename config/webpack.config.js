const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const isDevelopment = process.env.NODE_ENV === 'development';

module.exports = {
  target: 'electron-renderer',
  mode: isDevelopment ? 'development' : 'production',
  
  entry: './src/renderer/index.js',
  
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: 'renderer.js',
    publicPath: isDevelopment ? '/' : './',  // Fixed: Remove http://localhost:3000
    clean: true, // Clean output directory before each build
  },
  
  devServer: {
    port: 3000,
    host: 'localhost', // Explicitly set host
    hot: true,
    open: false, // Don't auto-open browser
    historyApiFallback: true, // CRITICAL: Serve index.html for all routes
    static: {
      directory: path.resolve(__dirname, '../dist'),
      publicPath: '/',
    },
    allowedHosts: 'all', // Allow connections from Electron
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    client: {
      webSocketURL: 'ws://localhost:3000/ws', // Explicit WebSocket URL
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
                targets: {
                  electron: '37.3.1'
                }
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
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/renderer/index.html'),
      filename: 'index.html',
      inject: 'body', // Inject scripts at end of body
      minify: false, // Don't minify in development
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../data'),
          to: path.resolve(__dirname, '../dist/data'),
          noErrorOnMissing: true, // Don't fail if directory doesn't exist
        },
        {
          from: path.resolve(__dirname, '../assets'),
          to: path.resolve(__dirname, '../dist/assets'),
          noErrorOnMissing: true, // Don't fail if directory doesn't exist
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
  },
  
  devtool: isDevelopment ? 'eval-source-map' : 'source-map',
  
  // Performance hints
  performance: {
    hints: false, // Disable performance warnings in development
  },
  
  // Stats configuration for cleaner output
  stats: isDevelopment ? 'minimal' : 'normal',
};
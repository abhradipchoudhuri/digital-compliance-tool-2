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
    publicPath: isDevelopment ? 'http://localhost:3000/' : './',
  },
  
  devServer: {
    port: 3000,
    hot: true,
    static: {
      directory: path.join(__dirname, '../dist'),
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
            presets: ['@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
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
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, '../data'),
          to: path.resolve(__dirname, '../dist/data'),
        },
        {
          from: path.resolve(__dirname, '../assets'),
          to: path.resolve(__dirname, '../dist/assets'),
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
};
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { electron: '22' } }],
    ['@babel/preset-react', { runtime: 'automatic' }],
  ],
};
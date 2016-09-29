var GhPagesWebpackPlugin = require('gh-pages-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './xo-game-main.js',
  output: {
    path: './dist',
    filename: 'xo-game-bundle.js'
  },

  plugins: [
    /*new GhPagesWebpackPlugin({
      path: './dist',
      options: {
        message: 'Update live page by webpack',
        user: {
          name: 'Yuriy Kuzin',
          email: ''
        }
      }
    }),*/
    new CopyWebpackPlugin([{
      from: 'index.html',
      to: ''
    }, {
      from: '*.css',
      to: ''
    }, ])
  ]

};

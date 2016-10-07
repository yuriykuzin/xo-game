'use strict';

const MODE = process.env.MODE || 'dev';

var GhPagesWebpackPlugin = require('gh-pages-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var webpack = require('webpack');

module.exports = {
  entry: './xo-game-main.js',
  output: {
    path: './dist',
    filename: 'xo-game-bundle.js'
  },

  watch: MODE === 'dev',

  watchOptions: {
    aggregateTimeout: 100
  },

  devtool: MODE === 'dev' ? 'source-map' : null,

  plugins: [
    new webpack.NoErrorsPlugin(),
    
    new CopyWebpackPlugin([{
      from: 'index.html',
      to: ''
    }, {
      from: '*.css',
      to: ''
    }, ])
  ]

};

if (MODE === 'prod') {
  module.exports.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        drop_console: true,
        unsafe: true
      }
    }));

  module.exports.plugins.push(
    new GhPagesWebpackPlugin({
      path: './dist',
      options: {
        message: 'Update live page by webpack',
        user: {
          name: 'Yuriy Kuzin',
          email: ''
        }
      }
    })
  );
}

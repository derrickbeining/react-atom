'use strict';
const devWebpackConfig = require('./webpack.development.config');
const prodWebpackConfig = require('./webpack.production.config');

const isDev = process.env.NODE_ENV !== 'production';

module.exports = isDev ? devWebpackConfig : prodWebpackConfig;

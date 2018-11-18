'use strict';
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const PeerDepsExternalsPlugin = require('peer-deps-externals-webpack-plugin');

const libraryName = 'reactAtom';
const filename = 'react-atom';

module.exports = {
  devtool: 'inline-source-map',
  entry: `./src/${filename}.ts`,
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: filename + '.js',
    libraryTarget: 'umd',
    library: libraryName,
    globalObject: "typeof self !== 'undefined' ? self : this",
    pathinfo: false,
  },
  mode: 'development',
  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: [
          {loader: 'babel-loader'},

          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [new ForkTsCheckerWebpackPlugin(), new PeerDepsExternalsPlugin()],
};

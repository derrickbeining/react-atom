'use strict';
const path = require('path');
const nodeExternals = require('webpack-node-externals');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const PeerDepsExternalsPlugin = require('peer-deps-externals-webpack-plugin');

const libraryName = 'reactAtom';
const filename = 'react-atom';

module.exports = {
  devtool: 'source-map',
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
  mode: 'production',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: false,
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

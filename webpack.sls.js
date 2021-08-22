const path = require('path');
const slsw = require('serverless-webpack');
const webpack = require('webpack');

/*
  This drives the webpack bundling of lambda functions
*/

module.exports = {
  entry: slsw.lib.entries,
  mode: slsw.lib.webpack.isLocal ? 'development' : 'production',
  node: {
    __dirname: true,
    __filename: true,
  },
  resolve: {
    extensions: ['.mjs', '.json', '.js', '.ts', '.tsx'],
    plugins: [],
  },
  plugins: [new webpack.DefinePlugin({ 'global.GENTLY': false })],
  output: {
    libraryTarget: 'commonjs',
    path: path.join(process.cwd(), '.webpack'),
    filename: '[name].js',
    sourceMapFilename: '[file].map',
  },
  optimization: {
    minimize: false,
  },
  target: 'node',
  // misc workarounds for various things that trip up webpack
  externals: ['aws-sdk', 'utf-8-validate', 'bufferutil', 'pino-pretty'],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          happyPackMode: true,
          transpileOnly: true,
        },
      },
    ],
  },
};

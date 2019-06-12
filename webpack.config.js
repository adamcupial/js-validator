const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'production',
  optimization: {
    minimize: true,
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
    modules: ['src', 'node_modules'],
  },
  plugins: [
    new CleanWebpackPlugin(),
  ],
  output: {
    filename: 'validator.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'FormValidator',
    libraryExport: 'default',
    libraryTarget: 'window',
  },
};

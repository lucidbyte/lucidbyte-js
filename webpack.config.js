const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  entry: './src/index.js',
  output: {
    libraryTarget: 'umd',
    filename: './dist/noted-sdk.js',
    libraryExport: 'default',
    library: 'notedSdk'
  },
  devtool: isDev ? 'cheap-module-eval-source-map' : false,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          // check .babelrc file for configuration
          loader: 'babel-loader',
        }
      }
    ]
  },
  plugins: [
    isDev
      ? (v) => v
      : new UglifyJsPlugin()
  ]
};

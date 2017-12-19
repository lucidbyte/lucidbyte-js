const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    libraryTarget: 'umd',
    filename: './dist/noted-sdk.js'
  },
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
    new UglifyJsPlugin()
  ]
};

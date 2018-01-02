const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  entry: {
    lucidbyte: './src/index.js',
    'lucidbyte-examples': './src/examples/todos/src/index.js'
  },
  output: {
    libraryTarget: 'umd',
    filename: './dist/[name].js',
    libraryExport: 'default',
    library: 'lucidbyte'
  },
  devtool: isDev ? 'cheap-module-eval-source-map' : false,
  devServer: {
    compress: true,
    port: 3003
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
    (
      isDev
        ? (v) => v
        : new UglifyJsPlugin()
    ),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    })
  ]
};

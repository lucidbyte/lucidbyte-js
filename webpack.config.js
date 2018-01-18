const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpack = require('webpack');

const isDev = process.env.NODE_ENV === 'development';

const config = {
  entry: {
    'lucidbyte-examples': './src/examples/todos/src/index.js',
  },
  output: {
    libraryTarget: 'umd',
    filename: './dist/[name].js',
    libraryExport: 'default',
    library: 'lucidbyte'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ 'css-loader' ]
      },
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          // check .babelrc file for configuration
          loader: 'babel-loader',
        }
      }
    ]
  }
};

if (isDev) {
  config.entry['lucidbyte-dev'] = './src/index.js',
  config.devtool = 'cheap-module-eval-source-map';
  config.devServer = {
    compress: true,
    port: 3003,
    host: '0.0.0.0'
  };
  config.plugins = [
    new webpack.DefinePlugin({
      DEVELOPMENT: true
    })
  ];
} else {
  config.entry['lucidbyte'] = './src/index.js',
  config.plugins = [
    new UglifyJsPlugin(),
    new webpack.DefinePlugin({
      DEVELOPMENT: false
    })
  ];
}

module.exports = config;

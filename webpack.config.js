var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  cache: true,
  debug: true,
  devtool: 'eval',

  stats: {
    colors: true,
    reasons: true
  },

  entry: {
    'app': [
      'core-js/es6/promise',
      'webpack/hot/only-dev-server',
      './frontend/app.js',
    ],
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    publicPath: '/'
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel?stage=0']},
      {test: /\.css$/, loader: 'style!css'},
      {test: /\.scss$/, loader: 'style!css!sass'},
      {test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff'},
      {test: /\.(ttf|eot|svg|gif|ico|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader'},
      {test: /\.html$/, exclude: path.resolve(__dirname, 'frontend/index.html'), loader: 'file!extract!html'},
      {test: /\.html$/, include: path.resolve(__dirname, 'frontend/index.html'), loader: 'html?interpolate'},
      {test: /\.json$/, loader: 'json'},
    ]
  },
  externals: {
    'angular': 'angular',
    'angular-animate': '"ngAnimate"',
    'angular-file-upload': '"angularFileUpload"',
    'angular-google-analytics': '"angular-google-analytics"',
    'angular-marked': '"hc.marked"',
    'angular-resource': '"ngResource"',
    'bootstrap-sass': '"bootstrap-sass"',
    'jquery': 'jQuery',
    'mathjs': 'mathjs',
    'ng-focus-on': '"focusOn"',
    'ng-sortable': '"ng-sortable"',
    'ngtoast': '"ngToast"',
    'ui.bootstrap.modal': '"ui.bootstrap.modal"',
    'ui.bootstrap.tpls': '"ui.bootstrap.tpls"',
    'ui.bootstrap.typeahead': '"ui.bootstrap.typeahead"',
    'ui.router': '"ui.router"',
    'ui.unique': '"ui.unique"',
  },
  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx'],
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin({
      DEBUG: true,
      BACKEND_URL: JSON.stringify(process.env.BACKEND_URL || '/'),
    }),
    new HtmlWebpackPlugin({
      template: 'frontend/index.html',
      hash: true
    }),
  ]
};

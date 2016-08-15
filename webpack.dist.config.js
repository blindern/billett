var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  cache: false,
  debug: false,
  devtool: false,

  stats: {
    colors: true,
    reasons: false
  },

  entry: {
    'app': [
      'core-js/es6/promise',
      './frontend/app.js',
    ],
  },
  output: {
    path: __dirname + '/dist/billett/',
    filename: '[name].js',
    publicPath: '/billett/'
  },
  module: {
    loaders: [
      {test: /\.jsx?$/, exclude: /node_modules/, loaders: ['ng-annotate', 'babel?stage=0']},
      {test: /\.css$/, loader: 'style!css'},
      {test: /\.css$/, loader: ExtractTextPlugin.extract('style', 'css')},
      {test: /\.scss$/, loader: ExtractTextPlugin.extract('style', 'css!sass')},
      {test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'url-loader?limit=10000&minetype=application/font-woff'},
      {test: /\.(ttf|eot|svg|gif|ico)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: 'file-loader'},
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
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({sourceMap: false}),
    new webpack.NoErrorsPlugin(),

    // keeps hashes consistent between compilations
    new webpack.optimize.OccurenceOrderPlugin(),

    new ExtractTextPlugin("styles.css"),

    new HtmlWebpackPlugin({
      template: 'frontend/index.html'
    }),

    // removes a lot of debugging code in React
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }}),

    new webpack.DefinePlugin({
      DEBUG: false,
      BACKEND_URL: JSON.stringify(process.env.BACKEND_URL || '/billett/'),
    }),
  ]
};

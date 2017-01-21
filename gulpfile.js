var concat = require('gulp-concat'),
    del = require('del'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    //uglify = require('gulp-uglify'),
    webpack = require('webpack'),
    WebpackDevServer = require('webpack-dev-server'),
    webpackConfigDev = require('./webpack.config.js'),
    webpackConfigDist = require('./webpack.dist.config.js');

var js_files_library = [
    './node_modules/jquery/dist/jquery.min.js',
    './node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js',
    './node_modules/angular/angular.min.js',
    './node_modules/angular-ui-router/release/angular-ui-router.min.js',
    './node_modules/angular-animate/angular-animate.min.js',
    './node_modules/angular-resource/angular-resource.min.js',
    './node_modules/angular-sanitize/angular-sanitize.min.js',
    './node_modules/angular-bootstrap/ui-bootstrap.min.js',
    './node_modules/angular-bootstrap/ui-bootstrap-tpls.min.js',
    './node_modules/angular-file-upload/angular-file-upload.min.js',
    './node_modules/moment/min/moment.min.js',
    './node_modules/moment/locale/nb.js',
    './node_modules/marked/marked.min.js',
    './node_modules/angular-marked/angular-marked.min.js',
    './node_modules/ng-toast/dist/ngToast.min.js',
    './node_modules/angular-google-analytics/dist/angular-google-analytics.min.js',
    './node_modules/sortablejs/Sortable.min.js',
    './node_modules/sortablejs/ng-sortable.js',
    './node_modules/ng-focus-on/lib/index.js',
    './node_modules/mathjs/dist/math.min.js',
];

gulp.task('scripts-library', function() {
    return gulp.src(js_files_library)
        .pipe(concat('library.js'))
        //.pipe(uglify())
        .pipe(gulp.dest('dist'));
});

var webpackBuild = function(callback, config, name) {
    webpack(config, function(err, stats) {
        if (err) throw new gutil.PluginError(name, err);
        gutil.log('['+name+']', stats.toString({
           colors: true
        }));
        callback();
    });
};

gulp.task('webpack:build', function(callback) {
    webpackBuild(callback, webpackConfigDist, 'webpack:build');
});

gulp.task('webpack:build-dev', function(callback) {
    webpackBuild(callback, webpackConfigDev, 'webpack:build-dev');
});

gulp.task('webpack-dev-server', function(callback) {
    var bindHost = '0.0.0.0'; // replace with 0.0.0.0 to allow remote connections
    var webpackPort = 3000;
    var webpackHost = 'localhost' + ':' + webpackPort;

    new WebpackDevServer(webpack(webpackConfigDev), {
        historyApiFallback: {
            index: '/'
        },
        hot: true,
        inline: true,
        publicPath: webpackConfigDev.output.publicPath,
        contentBase: 'dist',
    }).listen(webpackPort, bindHost, function(err) {
        if (err) throw new gutil.PluginError('webpack-dev-server', err);
        gutil.log('[webpack-dev-server]', 'Go to http://' + webpackHost + '/webpack-dev-server/');
    });
});

gulp.task('clean', function() {
    del('dist');
});

gulp.task('build', ['webpack:build', 'scripts-library']);
gulp.task('build-dev', ['webpack:build-dev', 'scripts-library']);
gulp.task('default', ['webpack-dev-server', 'scripts-library']);

var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps');
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    gulpif = require('gulp-if'),
    args = require('yargs').argv;

// run with --production to do more compressing etc
var isProd = !!args.production;

var js_files = [
    "./bower_components/jquery/dist/jquery.js",
    "./bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js",
    "./bower_components/angular/angular.js",
    "./bower_components/angular-route/angular-route.js",
    "./bower_components/angular-animate/angular-animate.js",
    "./bower_components/moment/moment.js",
    "./bower_components/moment/locale/nb.js",
    "./public/assets/src/javascript/**.js"
];

gulp.task('styles', function() {
    return gulp.src('public/assets/src/stylesheets/frontend.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({ style: isProd ? 'compressed' : 'expanded'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/assets/stylesheets'));
});

gulp.task('scripts', function() {
    return gulp.src(js_files)
        .pipe(concat('frontend.js'))
        .pipe(sourcemaps.init())
        .pipe(gulpif(isProd, ngAnnotate()))
        .pipe(gulpif(isProd, uglify()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/assets/javascript'));
});

gulp.task('watch', function() {
    gulp.watch('public/assets/src/stylesheets/**/*.scss', ['styles']);
    gulp.watch(js_files, ['scripts']);
});

gulp.task('default', function() {
    gulp.start('styles', 'scripts');
});

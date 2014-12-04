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
    "./bower_components/angular-resource/angular-resource.js",
    "./bower_components/angular-sanitize/angular-sanitize.js",
    "./bower_components/angular-ui-utils/ui-utils.js",
    "./bower_components/angular-file-upload/angular-file-upload.js",
    "./bower_components/moment/moment.js",
    "./bower_components/moment/locale/nb.js",
    "./bower_components/marked/lib/marked.js",
    "./bower_components/angular-marked/angular-marked.js",
    "./bower_components/ngtoast/dist/ngToast.js",
    "./public/assets/src/javascript/**/*.js"
];

var css_files = [
    "./bower_components/ngtoast/dist/ngToast.css",
    "public/assets/src/stylesheets/frontend.scss"
];

gulp.task('styles', function() {
    return gulp.src(css_files)
        .pipe(sourcemaps.init())
        .pipe(sass({ style: isProd ? 'compressed' : 'expanded'}))
        .pipe(concat('frontend.css'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/assets/stylesheets'));
});

gulp.task('scripts', function() {
    return gulp.src(js_files)
        .pipe(sourcemaps.init())
        .pipe(concat('frontend.js'))
        .pipe(gulpif(isProd, ngAnnotate()))
        .pipe(gulpif(isProd, uglify()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/assets/javascript'));
});

gulp.task('fonts', function() {
    return gulp.src('./bower_components/bootstrap-sass-official/assets/fonts/**')
        .pipe(gulp.dest('./public/assets/fonts'));
});

gulp.task('watch', function() {
    gulp.watch('public/assets/src/stylesheets/**/*.scss', ['styles']);
    gulp.watch(js_files, ['scripts']);
});

gulp.task('production', function() {
    isProd = true;
    gulp.start('styles', 'scripts', 'fonts');
});

gulp.task('default', function() {
    gulp.start('styles', 'scripts');
});

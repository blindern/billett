var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    ngAnnotate = require('gulp-ng-annotate'),
    gulpif = require('gulp-if'),
    args = require('yargs').argv,
    templates = require('gulp-angular-templatecache'),
    minifyHTML = require('gulp-minify-html'),
    rename = require('gulp-rename'),
    rev = require('gulp-rev'),
    buffer = require('gulp-buffer'),
    extend = require('gulp-extend'),
    runSequence = require('run-sequence'),
    minifyCSS = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer');

// run with --production to do more compressing etc
var isProd = !!args.production;

var js_files_library = [
    "./bower_components/jquery/dist/jquery.js",
    "./bower_components/bootstrap-sass-official/assets/javascripts/bootstrap.js",
    "./bower_components/angular/angular.js",
    "./bower_components/angular-ui-router/release/angular-ui-router.js",
    "./bower_components/angular-animate/angular-animate.js",
    "./bower_components/angular-resource/angular-resource.js",
    "./bower_components/angular-sanitize/angular-sanitize.js",
    "./bower_components/angular-bootstrap/ui-bootstrap.js",
    "./bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
    "./bower_components/angular-ui-utils/ui-utils.js",
    "./bower_components/angular-file-upload/angular-file-upload.js",
    "./bower_components/moment/moment.js",
    "./bower_components/moment/locale/nb.js",
    "./bower_components/marked/lib/marked.js",
    "./bower_components/angular-marked/angular-marked.js",
    "./bower_components/ngtoast/dist/ngToast.js",
    "./bower_components/angular-google-analytics/dist/angular-google-analytics.js",
    "./bower_components/Sortable/Sortable.js", // min.js
    "./bower_components/Sortable/ng-sortable.js",
    "./bower_components/ng-focus-on/lib/index.js",
    "./bower_components/mathjs/dist/math.js"
];

var js_files = [
    "./frontend/app.js",
    "./frontend/**/module.js",
    "./frontend/**/routes.js",
    "./frontend/**/*.js"
];

var css_files = [
    "./bower_components/ngtoast/dist/ngToast.css",
    "frontend/app.scss"
];

var processScripts = function (files, name) {
    return gulp.src(files)
        .pipe(sourcemaps.init())
        .pipe(concat(name + '.js'))
        .pipe(gulpif(isProd, ngAnnotate()))
        .pipe(gulpif(isProd, uglify()))
        .pipe(buffer())
        .pipe(rev())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/assets'))
        .pipe(rev.manifest({path: 'rev-manifest-scripts-' + name + '.json'}))
        .pipe(gulp.dest('public/assets'));
};

var processTemplates = function (files, subpath, name) {
    return gulp.src(files)
        .pipe(rename(function(path) {
            path.dirname = "views/" + subpath + path.dirname;
        }))
        .pipe(minifyHTML({
            quotes: true,
            empty: true
        }))
        .pipe(templates(name + '.js', {module: 'billett'}))
        .pipe(buffer())
        .pipe(rev())
        .pipe(gulp.dest('public/assets'))
        .pipe(rev.manifest({path: 'rev-manifest-' + name + '.json'}))
        .pipe(gulp.dest('public/assets'));
};

gulp.task('styles', function() {
    return gulp.src(css_files)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(concat('frontend.css'))
        .pipe(gulpif(isProd, minifyCSS()))
        .pipe(buffer())
        .pipe(rev())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('public/assets'))
        .pipe(rev.manifest({path: 'rev-manifest-styles.json'}))
        .pipe(gulp.dest('public/assets'));
});

gulp.task('scripts-library', function () {
    return processScripts(js_files_library, 'library');
});

gulp.task('scripts', function() {
    return processScripts(js_files, 'frontend');
});

gulp.task('templates', ['templates-normal', 'templates-admin'], function() {
    return gulp.src('frontend/**/*.html')
        .pipe(gulp.dest('public/assets/views'));
});

gulp.task('templates-normal', function() {
    return processTemplates(['frontend/**/*.html', '!frontend/admin/**/*.html'], '', 'templates');
});

gulp.task('templates-admin', function() {
    return processTemplates('frontend/admin/**/*.html', 'admin/', 'templates-admin');
});

gulp.task('fonts', function() {
    return gulp.src('./bower_components/bootstrap-sass-official/assets/fonts/**')
        .pipe(gulp.dest('./public/assets/fonts'));
});

gulp.task('rev-concat', function() {
    return gulp.src('public/assets/rev-manifest-*.json')
        .pipe(extend('rev-manifest.json'))
        .pipe(gulp.dest('public/assets'));
});

gulp.task('watch', function() {
    gulp.watch('frontend/**/*.scss').on('change', function () { runSequence('styles', 'rev-concat'); });
    gulp.watch(js_files).on('change', function () { runSequence('scripts', 'rev-concat'); });
    gulp.watch('frontend/**/*.html').on('change', function () { runSequence('templates', 'rev-concat'); });
});

gulp.task('production', function(cb) {
    isProd = true;
    runSequence(
        ['styles', 'scripts-library', 'scripts', 'fonts', 'templates'],
        'rev-concat',
        cb);
});

gulp.task('default', function(cb) {
    runSequence(
        ['styles', 'scripts-library', 'scripts', 'templates'],
        'rev-concat',
        cb);
});

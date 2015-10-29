// require modules
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');

// require custom modules
var customPlumber = require('../custom-modules/plumber');

// require config
var config = require('../config');

// Compiles Sass to CSS
gulp.task('sass', function() {
  return gulp.src(config.sass.src)
    .pipe(customPlumber('Error Running Sass'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: [
        'app/bower_components',
        'node_modules'
      ]
    }))
    .pipe($.autoprefixer())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});
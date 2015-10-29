var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// require custom modules
var customPlumber = require('../custom-modules/plumber');

// require config
var config = require('../config');

// Linting JavaScript
gulp.task('lint:js', function() {
  return gulp.src(config.js.src)
    .pipe(customPlumber('JSHint Error'))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail', config.jshint.reporterOptions))
    .pipe($.jscs(config.jscs.options))
    .pipe(gulp.dest(config.jscs.dest));
});
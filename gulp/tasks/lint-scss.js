var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// require config
var config = require('../config');

// Linting Scss
gulp.task('lint:scss', function() {
  return gulp.src(config.sass.src)
    .pipe($.scssLint(config.scsslint));
});
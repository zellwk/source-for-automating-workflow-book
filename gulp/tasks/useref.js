// require modules
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// require config
var config = require('../config');

// JavaScript and CSS
gulp.task('useref', function() {
  return gulp.src(config.useref.src)
    .pipe($.useref())
    .pipe($.cached('useref'))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.uncss(config.uncss.options)))
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.if('*.js', $.rev()))
    .pipe($.if('*.css', $.rev()))
    .pipe($.revReplace())
    .pipe(gulp.dest(config.useref.dest));
});
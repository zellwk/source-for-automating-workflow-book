// require modules
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

// require config
var config = require('../config');

// JavaScript and CSS
gulp.task('useref', function() {
  var assets = $.useref.assets();

  return gulp.src(config.useref.src)
    .pipe(assets)
    .pipe($.cached('useref'))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.uncss(config.uncss.options)))
    .pipe($.if('*.css', $.minifyCss()))
    .pipe($.rev())
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe($.revReplace())
    .pipe(gulp.dest(config.useref.dest));
});
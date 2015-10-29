// require modules
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');

// require config
var config = require('../config');

// Watchers files for changes
gulp.task('watch', function() {
  gulp.watch(config.sass.src, ['sass', 'lint:scss']);
  gulp.watch(config.js.src, ['watch-js']);
  gulp.watch(config.nunjucks.watch, ['nunjucks']);
});

gulp.task('watch-js', ['lint:js'], browserSync.reload);
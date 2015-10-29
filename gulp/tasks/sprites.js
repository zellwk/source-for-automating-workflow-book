var gulp = require('gulp');
var spritesmith = require('gulp.spritesmith');
var $ = require('gulp-load-plugins')();

// require config
var config = require('../config');

// Sprites
gulp.task('sprites', function() {
  gulp.src(config.sprites.src)
    .pipe(spritesmith(config.sprites.options))
    .pipe($.if('*.png', gulp.dest(config.sprites.imgDest)))
    .pipe($.if('*.scss', gulp.dest(config.sprites.scssDest)));
});
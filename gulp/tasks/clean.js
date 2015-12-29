var gulp = require('gulp');
var del = require('del');

// Clean
gulp.task('clean:dev', function() {
  return del.sync([
    'app/css',
    'app/*.html'
  ]);
});

// Cleaning dist (With gulp-cache)
gulp.task('clean:dist', function() {
  return del.sync(['dist']);
})

// Cleaning (with gulp-newer)
// gulp.task('clean:dist', function (callback) {
//   return del.sync([
//     'dist/**/*', 
//     '!dist/images',
//     '!dist/images/**/*'
//   ])
// })
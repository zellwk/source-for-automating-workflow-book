var gulp = require('gulp');
var del = require('del');

// Clean
gulp.task('clean:dev', function(callback) {
  del([
    'app/css',
    'app/*.+(html|nunjucks)'
  ], callback);
});


// Cleaning dist (With gulp-cache)
gulp.task('clean:dist', function(callback) {
  del(['dist'], callback);
})

// Cleaning (with gulp-newer)
// gulp.task('clean:dist', function (callback) {
//   del([
//     'dist/**/*', 
//     '!dist/images',
//     '!dist/images/**/*'
//   ], callback)
// })
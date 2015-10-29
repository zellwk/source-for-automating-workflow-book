var gulp = require('gulp');
var runSequence = require('run-sequence');

// Consolidated dev phase task
gulp.task('default', function(callback) {
  runSequence(
    'clean:dev',
    ['sprites', 'lint:js', 'lint:scss'],
    ['sass', 'nunjucks'],
    ['browserSync', 'watch'],
    callback
  );
});
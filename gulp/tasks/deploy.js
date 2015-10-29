var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var $ = require('gulp-load-plugins')();
var rsync = require('rsyncwrapper').rsync;
var ftp = require('vinyl-ftp');
// var s3 = require('gulp-s3');
// var ghPages = require('gulp-gh-pages');

if (!process.env.CI) {
  // Getting credentials
  var creds = JSON.parse(fs.readFileSync('./secrets.json'));

  // rsync task
  gulp.task('rsync', function() {
    rsync({
      src: 'dist/',
      // Keep dest in secrets.json
      dest: 'username@server-address:public_html/path-to-project',
      ssh: true,
      recursive: true,
      deleteAll: true

    }, function(error, stdout, stderr, cmd) {
      if (error) {
        console.log(error.message);
        console.log(stdout);
        console.log(stderr);
      }
    });
  });

  // ftp tasks
  var conn = ftp.create({
    // Keep everything here in secrets.json
    host: creds.server,
    user: creds.username,
    password: creds.password,
    log: gutil.log
  });

  gulp.task('ftp-clean', function(cb) {
    conn.rmdir('public_html/path-to-project', function(err) {
      if (err) {
        console.log(err);
      }
    });
  })

  gulp.task('ftp', function() {
    return gulp.src('dist/**/*')
      .pipe(conn.dest('public_html/path-to-project'));
  });

  // gh pages
  gulp.task('gh-pages', function() {
    return gulp.src('./dist/**/*')
      .pipe(ghPages());
  });

  // s3
  gulp.task('amazon', function() {
    gulp.src('./dist/**/*')
      .pipe($.s3({
        // Keep everything here in secrets.json
        'key': 'Your-API-Key',
        'secret': 'Your-AWS-Secret',
        'bucket': 'Your-AWS-bucket',
        'region': 'Your-region'
      }));
  });
}

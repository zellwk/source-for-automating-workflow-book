var gulp = require('gulp');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var spritesmith = require('gulp.spritesmith');
var gulpIf = require('gulp-if');
var nunjucksRender = require('gulp-nunjucks-render');
var rename = require('gulp-rename');
var data = require('gulp-data');
var fs = require('fs');
var del = require('del');
var runSequence = require('run-sequence');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var scssLint = require('gulp-scss-lint');
var Server = require('karma').Server;
var gutil = require('gulp-util');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var debug = require('gulp-debug');
var cached = require('gulp-cached');
var unCss = require('gulp-uncss');
var minifyCss = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var newer = require('gulp-newer');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var ghPages = require('gulp-gh-pages');
var rsync = require('rsyncwrapper').rsync;
var ftp = require('vinyl-ftp');

// Getting sensitive info
var creds;
if (!process.env.CI) {
  creds = JSON.parse(fs.readFileSync('./secrets.json'));
}

// ===========
// INTRO PHASE
// ===========

// Hello task
gulp.task('hello', function() {
  console.log('Hello Zell');
});

// =================
// DEVELOPMENT PHASE
// =================

// Custom Plumber function for catching errors
function customPlumber(errTitle) {
  // Determining whether plumber is ran by Travis
  if (process.env.CI) {
    return plumber({
      errorHandler: function(err) {
        throw Error(gutil.colors.red(err.message));
      }
    });
  } else {
    return plumber({
      errorHandler: notify.onError({
        // Customizing error title
        title: errTitle || 'Error running Gulp',
        message: 'Error: <%= error.message %>',
      })
    });
  }
}

// Clean
gulp.task('clean:dev', function(callback) {
  del([
    'app/css',
    'app/*.+(html|nunjucks)'
  ], callback);
});

// Browser Sync
gulp.task('browserSync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
  });
});

// Compiles Sass to CSS
gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss')
    .pipe(customPlumber('Error Running Sass'))
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: [
        'app/bower_components',
        'node_modules'
      ]
    }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Sprites
gulp.task('sprites', function() {
  gulp.src('app/images/sprites/**/*')
    .pipe(spritesmith({
      cssName: '_sprites.scss', // CSS file
      imgName: 'sprites.png', // Image file
      retinaSrcFilter: 'app/images/sprites/*@2x.png',
      retinaImgName: 'sprites@2x.png'
    }))
    .pipe(gulpIf('*.png', gulp.dest('app/images')))
    .pipe(gulpIf('*.scss', gulp.dest('app/scss')));
});

// Watchers files for changes
gulp.task('watch', function() {
  gulp.watch('app/scss/**/*.scss', ['sass', 'lint:scss']);
  gulp.watch('app/js/**/*.js', ['watch-js']);
  gulp.watch([
    'app/pages/**/*.+(html|nunjucks)',
    'app/templates/**/*',
    'app/data.json'
  ], ['nunjucks']);
});

gulp.task('watch-js', ['lint:js'], browserSync.reload);

// Templating
gulp.task('nunjucks', function() {
  nunjucksRender.nunjucks.configure(['app/templates/'], {
    watch: false
  });
  return gulp.src('app/pages/**/*.+(html|nunjucks)')
    .pipe(customPlumber('Error Running Nunjucks'))
    .pipe(data(function() {
      return JSON.parse(fs.readFileSync('./app/data.json'));
    }))
    .pipe(nunjucksRender())
    // TODO: Remove rename, because it's automatically .html
    // .pipe(rename(function(path) {
    //   path.extname = '.html';
    // }))
    .pipe(gulp.dest('app'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

// Consolidated dev phase task
gulp.task('default', function(callback) {
  runSequence(
    'clean:dev', ['sprites', 'lint:js', 'lint:scss'], ['sass', 'nunjucks'], ['browserSync', 'watch'],
    callback
  );
});

// =============
// TESTING PHASE
// =============

// Linting JavaScript
gulp.task('lint:js', function() {
  return gulp.src('app/js/**/*.js')
    .pipe(customPlumber('JSHint Error'))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail', {
      ignoreWarning: true,
      ignoreInfo: true
    }))
    .pipe(jscs({
      fix: true,
      configPath: '.jscsrc'
    }))
    .pipe(gulp.dest('app/js'));
});

// Linting Scss
gulp.task('lint:scss', function() {
  return gulp.src('app/scss/**/*.scss')
    .pipe(scssLint({
      config: '.scss-lint.yml'
    }));
});

// Test
gulp.task('test', function(done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

// =================
// INTEGRATION PHASE
// =================

gulp.task('dev-ci', function(callback) {
  runSequence(
    'clean:dev', ['sprites', 'lint:js', 'lint:scss'], ['sass', 'nunjucks'],
    callback
  );
})

// ==================
// OPTIMIZATION PHASE
// ==================

// JavaScript and CSS
gulp.task('useref', function() {
  var assets = useref.assets();

  return gulp.src('app/*.html')
    .pipe(assets)
    .pipe(cached('useref'))
    .pipe(gulpIf('*.js', uglify()))
    .pipe(gulpIf('*.css', unCss({
      html: ['app/*.html'],
      ignore: [
        '.susy-test',
        /.is-/,
        /.has-/
      ]
    })))
    .pipe(gulpIf('*.css', minifyCss()))
    .pipe(rev())
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(revReplace())
    .pipe(gulp.dest('dist'));
});

// Images (With Gulp-caches)
gulp.task('images', function() {
  return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
    .pipe(cache(imagemin(), {
      name: 'project'
    }))
    .pipe(gulp.dest('dist/images'))
})

// Clearing caches
gulp.task('cache:clear', function(callback) {
  return cache.clearAll(callback);
})

// Images (With Gulp Newer)
// gulp.task('images', function() {
//   return gulp.src('app/images/**/*.+(png|jpg|jpeg|gif|svg)')
//     .pipe(newer('dist/images'))
//     .pipe(imagemin())
//     .pipe(gulp.dest('dist/images'))
// })

// Copying fonts
gulp.task('fonts', function() {
  return gulp.src('app/fonts/**/*')
    .pipe(gulp.dest('dist/fonts'))
});

// Cleaning (With gulp-cache)
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

gulp.task('build', function(callback) {
  runSequence(
    ['clean:dev', 'clean:dist'], ['sprites', 'lint:js', 'lint:scss'], ['sass', 'nunjucks'], ['useref', 'images', 'fonts', 'test'],
    callback
  );
})

// ================
// DEPLOYMENT PHASE
// ================

if (!process.env.CI) {
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

  gulp.task('gh-pages', function() {
    return gulp.src('./dist/**/*')
      .pipe(ghPages());
  });

  gulp.task('amazon', function() {
    gulp.src('./dist/**/*')
      .pipe(s3({
        // Keep everything here in secrets.json
        'key': 'Your-API-Key',
        'secret': 'Your-AWS-Secret',
        'bucket': 'Your-AWS-bucket',
        'region': 'Your-region'
      }));
  });
}

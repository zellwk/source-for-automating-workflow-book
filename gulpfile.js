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

// Custom Plumber function for catching errors
function customPlumber(errTitle) {
  return plumber({
    errorHandler: notify.onError({
      // Customizing error title
      title: errTitle || 'Error running Gulp',
      message: 'Error: <%= error.message %>',
    })
  });
}

// Hello task
gulp.task('hello', function() {
  console.log('Hello Zell');
});

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
  nunjucksRender.nunjucks.configure(['app/templates/'], {watch: false});
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
    'clean:dev',
    ['sprites', 'lint:js', 'lint:scss'],
    ['sass', 'nunjucks'],
    ['browserSync', 'watch'],
    callback
    );
});

// Linting JavaScript
gulp.task('lint:js', function() {
  return gulp.src('app/js/**/*.js')
  .pipe(customPlumber('JSHint Error'))
  .pipe(jshint())
  .pipe(jshint.reporter('fail', {
    ignoreWarning: true,
    ignoreInfo: true
  }))
  .pipe(jshint.reporter('jshint-stylish'))
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

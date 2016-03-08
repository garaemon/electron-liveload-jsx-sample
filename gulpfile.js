'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var electron = require('electron-connect').server.create();
var mainBowerFiles = require('main-bower-files');

// In order to compile jsx, we need to add "react" to "presets" of .babelrc.
gulp.task('compile:scripts', function() {
  return gulp.src('src/**/*.{js,jsx}')
    .pipe($.sourcemaps.init())
    .pipe($.babel())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.serve'))
  ;
});


// compile scss into .serve/styles directory
gulp.task('compile:styles', function() {
  return gulp.src('src/styles/**/*.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass())
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('.serve/styles'));
});

// insert css to html replacing inject:css and endinject
gulp.task('inject:css', ['compile:styles'], function() {
  return gulp.src('src/**/*.html')
    .pipe($.inject(gulp.src(mainBowerFiles().concat([".serve/styles/**/*.css"])), {
      relative: true,
      ignorePath: ['../../.serve', '..'],
      addPrefix: '..'
    }))
    .pipe(gulp.dest('.serve'));
});

// ES6 -> js
// JSX -> js
gulp.task('compile:scripts:watch', function(done) {
  gulp.src('src/**/*.{js,jsx}')
    .pipe($.watch('src/**/*.{js,jsx}', {verbose: true}))
    .pipe($.plumber())          // ignore error
    .pipe($.sourcemaps.init())  // initialization sourcemap
    .pipe($.babel())            // jsx and es6 compilation
    .pipe($.sourcemaps.write('.')) // finalization sourcemap
    .pipe(gulp.dest('.serve'))     // write to .serve directory
  ;
  done();
});


gulp.task('serve', ['inject:css', 'compile:styles', 'compile:scripts:watch'], function() {
  electron.start();

  // browser process
  gulp.watch(['.serve/app.js', '.serve/browser/**/*.js'], electron.restart);
  // reload rendering
  gulp.watch(['.serve/styles/**/*.css', '.serve/renderer/**/*.{html,js}'],
             electron.reload);
});

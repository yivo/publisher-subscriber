gulp       = require 'gulp'
concat     = require 'gulp-concat'
coffee     = require 'gulp-coffee'
preprocess = require 'gulp-preprocess'
iife       = require 'gulp-iife-wrap'
uglify     = require 'gulp-uglify'
rename     = require 'gulp-rename'
plumber    = require 'gulp-plumber'

gulp.task 'default', ['build', 'watch'], ->

gulp.task 'build', ->
  gulp.src('source/__manifest__.coffee')
    .pipe plumber()
    .pipe preprocess()
    .pipe iife(global: 'PublisherSubscriber', dependencies: [{global: 'Object', native: true}])
    .pipe concat('publisher-subscriber.coffee')
    .pipe gulp.dest('build')
    .pipe coffee()
    .pipe concat('publisher-subscriber.js')
    .pipe gulp.dest('build')

gulp.task 'build-min', ['build'], ->
  gulp.src('build/publisher-subscriber.js')
  .pipe uglify()
  .pipe rename('publisher-subscriber.min.js')
  .pipe gulp.dest('build')

gulp.task 'watch', ->
  gulp.watch 'source/**/*', ['build']

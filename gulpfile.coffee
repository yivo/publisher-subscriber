gulp        = require 'gulp'
connect     = require 'gulp-connect'
concat      = require 'gulp-concat'
coffee      = require 'gulp-coffee'
preprocess  = require 'gulp-preprocess'
iife        = require 'gulp-iife'
uglify      = require 'gulp-uglify'
rename      = require 'gulp-rename'
del         = require 'del'
plumber     = require 'gulp-plumber'

gulp.task 'default', ['build', 'watch'], ->

gulp.task 'build', ->
  gulp.src('source/pub-sub.js')
  .pipe plumber()
  .pipe gulp.dest('build')

gulp.task 'watch', ->
  gulp.watch 'source/**/*', ['build']

gulp.task 'coffeespec', ->
  gulp.src('coffeespec/**/*.coffee')
  .pipe coffee(bare: yes)
  .pipe gulp.dest('spec')
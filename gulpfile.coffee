gulp       = require 'gulp'
concat     = require 'gulp-concat'
coffee     = require 'gulp-coffee'
preprocess = require 'gulp-preprocess'
umd        = require 'gulp-umd-wrap'
uglify     = require 'gulp-uglify'
rename     = require 'gulp-rename'
plumber    = require 'gulp-plumber'
fs         = require 'fs'

gulp.task 'default', ['build', 'watch'], ->

gulp.task 'build', ->
  gulp.src('source/__manifest__.coffee')
    .pipe plumber()
    .pipe preprocess()
    .pipe umd do ->
            global: 'PublisherSubscriber'
            dependencies: [{global: 'Object', native: true}]
            header: fs.readFileSync('source/__license__.coffee')
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

require('gulp-lazyload')
  gulp:       'gulp'
  connect:    'gulp-connect'
  concat:     'gulp-concat'
  coffee:     'gulp-coffee'
  preprocess: 'gulp-preprocess'
  iife:       'gulp-iife'
  uglify:     'gulp-uglify'
  rename:     'gulp-rename'
  del:        'del'
  plumber:    'gulp-plumber'
  ejs:        'gulp-ejs'

gulp.task 'default', ['build', 'watch'], ->

gulp.task 'build', ->
  gulp.src('source/manifest.coffee')
  .pipe plumber()
  .pipe preprocess()
  .pipe iife {global: 'PublisherSubscriber'}
  .pipe concat('publisher-subscriber.coffee')
  .pipe ejs({}, {ext: '.coffee'})
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
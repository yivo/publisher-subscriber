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
  replace:    'gulp-replace'

gulp.task 'default', ['build', 'watch'], ->

gulp.task 'build', ->
  gulp.src('source/__manifest__.coffee')
  .pipe plumber()
  .pipe preprocess()
  .pipe iife(global: 'PublisherSubscriber', dependencies: [])
  .pipe concat('publisher-subscriber.coffee')
  .pipe(replace(/getOID\((\w+)\)/g, '$1.oid ||= generateOID()'))
  .pipe(replace(/fastProperty\((\w+)\)/g, "if $1.indexOf(':') > -1 then $1.replace(/:/g, '_') else $1"))
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

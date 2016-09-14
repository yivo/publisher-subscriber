require('gulp-lazyload')
  gulp:       'gulp'
  concat:     'gulp-concat'
  coffee:     'gulp-coffee'
  preprocess: 'gulp-preprocess'
  iife:       'gulp-iife-wrap'
  uglify:     'gulp-uglify'
  rename:     'gulp-rename'
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
#  .pipe(replace(/bind__Base\(object, events\[i \- j\.\.\.i\], callback, context, once\)/g, 'event = events[i - j...i]; cb = (if once is true then onceWrap(object, event, callback, context) else callback);((object._ps ?= {})[fastProperty(event)] ?= []).push(undefined, cb, context)'))
#  .pipe(replace(/bind__Base\(object, events, callback, context, once\)/g, 'cb = (if once is true then onceWrap(object, events, callback, context) else callback);((object._ps ?= {})[fastProperty(events)] ?= []).push(undefined, cb, context)'))
#  .pipe(replace(/increaseListeningCount\(pub, sub\)/g, 'listening = (sub._psTo ?= {}); record = (listening[getOID(pub)] ?= [pub, 0]); record[1] += 1;'))
#  .pipe(replace(/decrementListeningCount\(object, sub, 1\)/g, '(oid = getOID(object); record = sub._psTo[oid]; delete sub._psTo[oid] if (record? and (record[1] -= 1) < 1);)'))
#  .pipe(replace(/decrementListeningCount\(pub, sub, n \/ 3\)/g, '(oid = getOID(pub); record = sub._psTo[oid]; delete sub._psTo[oid] if (record? and (record[1] -= n / 3) < 1);)'))
  .pipe(replace(/getOID\((\w+)\)/g, '$1.oid ?= generateOID()'))
  .pipe(replace(/fastProperty\((\w+)\)/g, "$1"))
  .pipe(replace(/resolveCallback\(([\w\[\]]+),\s*([\w\[\]]+)\)/g, "(if typeof $2 is 'string' then $1[$2] else $2)"))
  .pipe(replace(/\|\|\=/g, '?='))
  .pipe(replace(/(@|\.)_psTo/g, '$1_3'))
  .pipe(replace(/(@|\.)_ps/g, '$1_2'))
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

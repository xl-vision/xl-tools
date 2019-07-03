const gulp = require('gulp')
const lintScript = require('./lintScript')
const lintStyle = require('./lintStyle')
const compileScss = require('./compileScss')
const compileTs = require('./compileTs')
const compileJs = require('./compileJs')
const {setTarget, TARGET_ES, TARGET_LIB, TARGET_SITE} = require('../utils/target')

const compileWithTarget = (func, isEs) => {
  return () => {
    setTarget(isEs ? TARGET_ES : TARGET_LIB)
    return func()
  }
}

gulp.task('lint:script', lintScript)

gulp.task('lint:style', lintStyle)

gulp.task('compile:scss:es', compileWithTarget(compileScss, true))

gulp.task('compile:scss:lib', compileWithTarget(compileScss))

gulp.task('compile:ts:es', compileWithTarget(compileTs, true))

gulp.task('compile:ts:lib', compileWithTarget(compileTs))

gulp.task('compile:js:es', compileWithTarget(compileJs, true))

gulp.task('compile:js:lib', compileWithTarget(compileJs))

gulp.task('lint', gulp.parallel('lint:script', 'lint:style'))

gulp.task('compile:lib', gulp.parallel('compile:scss:lib', 'compile:js:lib'))
gulp.task('compile:es', gulp.parallel('compile:scss:es', 'compile:js:es'))

gulp.task('compile:lib', gulp.parallel('compile:scss:lib', 'compile:ts:lib'))
gulp.task('compile:es', gulp.parallel('compile:scss:es', 'compile:ts:es'))

gulp.task('compile', gulp.parallel('compile-lib', 'compile-es'))

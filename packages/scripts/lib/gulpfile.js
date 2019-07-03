const gulp = require('gulp')
const lintScript = require('./lintScript')
const lintStyle = require('./lintStyle')
const compileScss = require('./compileScss')
const compileTs = require('./compileTs')
const compileJs = require('./compileJs')
const {setTarget, TARGET_ES, TARGET_LIB, TARGET_SITE} = require('../utils/target')

gulp.task('lint-script', lintScript)

gulp.task('lint-style', lintStyle)

gulp.task('compile-scss-es', () => {
  setTarget(TARGET_ES)
  return compileScss()
})

gulp.task('compile-scss-lib', () => {
  setTarget(TARGET_LIB)
  return compileScss()
})

gulp.task('compile-ts-es', () => {
  setTarget(TARGET_ES)
  return compileTs()
})

gulp.task('compile-ts-lib', () => {
  setTarget(TARGET_LIB)
  return compileTs()
})

gulp.task('compile-js-es', () => {
  setTarget(TARGET_ES)
  return compileJs()
})

gulp.task('compile-js-lib', () => {
  setTarget(TARGET_LIB)
  return compileJs()
})

gulp.task('lint', gulp.parallel('lint-script', 'lint-style'))

gulp.task('compile-lib', gulp.parallel('compile-scss-lib', 'compile-ts-lib', 'compile-js-lib'))
gulp.task('compile-es', gulp.parallel('compile-scss-es', 'compile-ts-es', 'compile-js-es'))
gulp.task('compile', gulp.parallel('compile-lib', 'compile-es'))

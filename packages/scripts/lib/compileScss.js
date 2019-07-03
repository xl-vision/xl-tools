const gulp = require('gulp')
const merge2 = require('merge2')
const gulpSass = require('gulp-sass')
const gulpPostcss = require('gulp-postcss')
const gulpCleanCss = require('gulp-clean-css')
const getConfig = require('../utils/getConfig')
const {getTarget, TARGET_ES} = require('../utils/target')

module.exports = () => {

  const srcDir = getConfig('sourceDir')

  const src = [`${srcDir}/**/*.scss`, `!**/test/**/*`, `!**/doc/**/*`]

  const dest = getTarget() === TARGET_ES ? getConfig('esDir') : getConfig('libDir')

  const stream1 = gulp.src(src)
  .pipe(gulpSass())
  .pipe(gulpPostcss())
  .pipe(gulpCleanCss({
    level: 2,
    format: 'beautify'
  }))
  .pipe(gulp.dest(dest))

  const stream2 = gulp.src(src).pipe(gulp.dest(dest))

  return merge2([stream1, stream2])
}

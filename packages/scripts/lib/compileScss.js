const gulp = require('gulp')
const gulpSass = require('gulp-sass')
const gulpPostcss = require('gulp-postcss')
const gulpCleanCss = require('gulp-clean-css')
const getConfig = require('../utils/getConfig')
const {getTarget, TARGET_ES} = require('../utils/target')

module.exports = () => {

  const sourceDir = getConfig('sourceDir')

  const src = [`${sourceDir}/**/*.scss`, `!${srcDir}/**/test/**/*`, `!${srcDir}/**/doc/**/*`]

  const dest = getTarget() === TARGET_ES ? getConfig('esDir') : getConfig('libDir')

  return gulp.src(src)
  .pipe(gulpSass())
  .pipe(gulpPostcss())
  .pipe(gulpCleanCss({
    level: 2,
    format: 'beautify'
  }))
  .pipe(gulp.dest(dest))
}

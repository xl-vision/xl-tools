const gulp = require('gulp')
const gulpEslint = require('gulp-eslint')
const getConfig = require('../utils/getConfig')

module.exports = () => {
  const srcDir = getConfig('sourceDir')
  const siteDir = getConfig('siteDir')

  const suffix = '{ts?(x), js?(x)}'

  const src = [`{${srcDir}, ${siteDir}}/**/*.${suffix}`]

  return gulp.src(src)
    .pipe(gulpEslint())
    .pipe(gulpEslint.failAfterError())
}
const gulp = require('gulp')
const gulpStylelint = require('gulp-stylelint')
const getConfig = require('../utils/getConfig')

module.exports = () => {

  const srcDir = getConfig('sourceDir')
  const siteDir = getConfig('siteDir')

  const suffix = '{scss, sass, css, styl, less}'

  const src = [`{${srcDir}, ${siteDir}}/**/*.${suffix}`]

  return gulp.src(src)
    .pipe(gulpStylelint({
      failAfterError: true,
      reporters: [{
        formatter: 'verbose',
        console: true
      }]
    }))
}
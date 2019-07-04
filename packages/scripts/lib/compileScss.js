const gulp = require('gulp')
const merge2 = require('merge2')
const gulpSass = require('gulp-sass')
const gulpPostcss = require('gulp-postcss')
const gulpCleanCss = require('gulp-clean-css')
const streamPromisify = require('../utils/streamPromisify')

module.exports = ({
  src,
  dest,
  beautify = true
}) => {
  const stream1 = gulp.src(src)
  .pipe(gulpSass())
  .pipe(gulpPostcss())
  .pipe(gulpCleanCss({
    level: 2,
    format: beautify ? 'beautify' : 'none'
  }))
  .pipe(gulp.dest(dest))

  const stream2 = gulp.src(src).pipe(gulp.dest(dest))

  return streamPromisify(merge2([stream1, stream2]))
}

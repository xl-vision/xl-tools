const gulp = require('gulp')
const gulpSass = require('gulp-sass')
const gulpPostcss = require('gulp-postcss')
const gulpCleanCss = require('gulp-clean-css')

module.exports = ({
  src,
  dest
}) => {
  return gulp.src(src)
  .pipe(gulpSass())
  .pipe(gulpPostcss())
  .pipe(gulpCleanCss({
    level: 2,
    format: 'beautify'
  }))
  .pipe(gulp.dest(dest))
}

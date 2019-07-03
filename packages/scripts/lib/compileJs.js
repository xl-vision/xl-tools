const gulp = require('gulp')
const gulpBabel = require('gulp-babel')

module.exports = ({
  src,
  dest
}) => {
  return gulp.src(src)
    .pipe(gulpBabel())
    .pipe(dest)
}

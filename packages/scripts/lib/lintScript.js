const gulp = require('gulp')
const gulpEslint = require('gulp-eslint')

module.exports = ({
  src,
  dest
}) => {
  return gulp.src(src)
    .pipe(gulpEslint())
    .pipe(gulpEslint.failOnError())
}
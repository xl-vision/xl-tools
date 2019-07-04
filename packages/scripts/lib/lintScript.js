const gulp = require('gulp')
const gulpEslint = require('gulp-eslint')
const streamPromisify = require('../utils/streamPromisify')

module.exports = ({
  src,
}) => {
  const stream = gulp.src(src)
    .pipe(gulpEslint())
    .pipe(gulpEslint.failOnError())
  return streamPromisify(stream)
}

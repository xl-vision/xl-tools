const gulp = require('gulp')
const gulpStylelint = require('gulp-stylelint')

module.exports = ({
  src,
  dest
}) => {
  return gulp.src(src)
    .pipe(gulpStylelint({
      failAfterError: true,
      reporters: [{
        formatter: 'verbose',
        console: true
      }]
    }))
}
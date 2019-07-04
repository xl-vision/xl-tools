const gulp = require('gulp')
const gulpStylelint = require('gulp-stylelint')
const streamPromisify = require('../utils/streamPromisify')

module.exports = ({
  src
}) => {
  const stream = gulp.src(src)
    .pipe(gulpStylelint({
      failAfterError: true,
      reporters: [{
        formatter: 'verbose',
        console: true
      }]
    }))
  return streamPromisify(stream)
}

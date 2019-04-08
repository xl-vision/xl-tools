const gulp = require('gulp')
const gulpStylelint = require('gulp-stylelint')

module.exports = ({
  src,
  config
}) => {
  if (typeof config === 'string') {
    config = require(config)
  }
  return gulp.src(src)
    .pipe(gulpStylelint({
      syntax: 'scss',
      config,
      reporters: [{
        formatter: 'verbose',
        console: true
      }]
    }))
}

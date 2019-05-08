const gulp = require('gulp')
const gulpCleanCss = require('gulp-clean-css')
const gulpPostcss = require('gulp-postcss')
const gulpSass = require('gulp-sass')
const gulpRename = require('gulp-rename')

module.exports = ({
  src,
  dest,
  postcssConfig,
  beautify = true,
  rename = () => {}
}) => {
  if (typeof postcssConfig === 'string') {
    postcssConfig = require(postcssConfig)
  }

  const { plugins, ...others } = postcssConfig

  return gulp.src(src)
    .pipe(gulpSass().on('error', gulpSass.logError))
    .on('error', function () {
      this.emit('end')
    })
    .pipe(gulpPostcss(plugins, others))
    .pipe(gulpCleanCss({
      level: 2,
      format: beautify ? 'beautify' : 'none'
    }))
    .pipe(gulpRename(rename))
    .pipe(gulp.dest(dest))
}

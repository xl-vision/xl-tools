const gulp = require('gulp')
const gulpBabel = require('gulp-babel')
const streamPromisify = require('../utils/streamPromisify')

module.exports = ({
                    src,
                    dest,
                    isEs
                  }) => {
  // 注入环境变量到babel-preset-library
  process.env.XL_TOOLS_TARGET = isEs ? 'es' : 'lib'
  const stream = gulp.src(src)
    .pipe(gulpBabel())
    .pipe(dest)
  return streamPromisify(stream)
}

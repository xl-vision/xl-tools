const gulp = require('gulp')
const gulpBabel = require('gulp-babel')
const getConfig = require('../utils/getConfig')
const {getTarget, TARGET_ES} = require('../utils/target')


module.exports = () => {
  const srcDir = getConfig('sourceDir')
  
  const src = [`${srcDir}/**/*.js?(x)`, `!**/test/**/*`, `!**/doc/**/*`]

  const dest = getTarget() === TARGET_ES ? getConfig('esDir') : getConfig('libDir')

  return gulp.src(src)
    .pipe(gulpBabel())
    .pipe(dest)
}

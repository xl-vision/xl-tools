const gulp = require('gulp')
const gulpTs = require('gulp-typescript')
const gulpBabel = require('gulp-babel')
const merge2 = require('merge2')
const getProjectPath = require('../utils/getProjectPath')
const getConfig = require('../utils/getConfig')
const {getTarget, TARGET_ES} = require('../utils/target')

const reporter = gulpTs.reporter.defaultReporter()

const overwriteConfig = {
  declaration: true,
  module: 'ESNext'
}

module.exports = () => {
  const srcDir = getConfig('sourceDir')
  
  const src = [`${srcDir}/**/*.ts?(x)`, `!${srcDir}/**/test/**/*`, `!${srcDir}/**/doc/**/*`]

  const dest = getTarget() === TARGET_ES ? getConfig('esDir') : getConfig('libDir')

  const tsProject = gulpTs.createProject(getProjectPath('tsconfig.json'), overwriteConfig)
  const tsResult = gulp.src(src)
    .pipe(tsProject({
      error (err, ts) {
        throw err
      },
      finish: reporter.finish
    }))

  const dts = tsResult.dts
  const js = tsResult.js.pipe(gulpBabel())

  return merge2([dts, js]).pipe(dest)
}

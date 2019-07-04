const gulp = require('gulp')
const gulpTs = require('gulp-typescript')
const gulpBabel = require('gulp-babel')
const merge2 = require('merge2')
const getProjectPath = require('../utils/getProjectPath')
const streamPromisify = require('../utils/streamPromisify')

const reporter = gulpTs.reporter.defaultReporter()

const overwriteConfig = {
  declaration: true,
  module: 'ESNext'
}

module.exports = ({
                    src,
                    dest,
                    isEs
                  }) => {
  // 注入环境变量到babel-preset-library
  process.env.XL_TOOLS_TARGET = isEs ? 'es' : 'lib'
  // 注入typescript
  process.env.XL_TOOLS_TYPESCRIPT = true

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

  const stream = merge2([dts, js]).pipe(gulp.dest(dest))
  return streamPromisify(stream)
}

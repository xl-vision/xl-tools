const gulp = require('gulp')
const getBabelConfig = require('../config/getBabelConfig')
const defaultTsConfig = require('../config/tsConfig')
const ts = require('gulp-typescript')
const merge2 = require('merge2')
const babel = require('gulp-babel')
const { promisefyStream } = require('../utils/runTask')

const tsDefaultReporter = ts.reporter.defaultReporter()

module.exports = ({ src, dest, tsConfig, babelConfig, modules }) => {
    tsConfig = (tsConfig || {}).compilerOptions || defaultTsConfig
    babelConfig = babelConfig || getBabelConfig(modules)
    const tsProject = ts.createProject(tsConfig)
    let error = false
    const tsResult = gulp.src(src).pipe(tsProject({
        error(err, ts) {
            tsDefaultReporter.error(err, ts)
            error = true
        },
        finish: tsDefaultReporter.finish,
    }))

    function check() {
        if (error) {
            this.emit('end')
        }
    }

    tsResult.on('finish', check)
    tsResult.on('end', check)

    const tsd = tsResult.dts
    const js = tsResult.js.pipe(babel(babelConfig))
    const stream = merge2([tsd, js]).pipe(gulp.dest(dest))
    return promisefyStream(stream)
}
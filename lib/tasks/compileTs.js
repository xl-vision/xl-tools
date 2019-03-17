const gulp = require('gulp')
const defaultBabelConfig = require('../config/babelConfig')
const defaultTsConfig = require('../config/tsConfig')
const ts = require('gulp-typescript')
const merge2 = require('merge2')
const babel = require('gulp-babel')

const tsDefaultReporter = ts.reporter.defaultReporter()

module.exports = ({ src, dest, tsConfig, babelConfig }) => {
    tsConfig = (tsConfig || {}).compilerOptions || defaultTsConfig
    babelConfig = babelConfig || defaultBabelConfig
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
    return merge2([tsd, js]).pipe(gulp.dest(dest))
}
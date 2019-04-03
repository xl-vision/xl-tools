const gulp = require('gulp')
const getBabelConfig = require('../config/getBabelConfig')
const defaultTsConfig = require('../config/tsConfig')
const ts = require('gulp-typescript')
const merge2 = require('merge2')
const babel = require('gulp-babel')
const path = require('path')

const {
    promisefyStream
} = require('../utils/runTask')
const {
    exist,
    getProjectPath
} = require('../utils/projectHelper')

const tsDefaultReporter = ts.reporter.defaultReporter()

const defaultSrc = [
    'src/package/**/*.ts?(x)',
    '!src/package/**/_*/**'
]

module.exports = ({
    src,
    dest,
    tsConfig,
    babelConfig,
    modules,
    ...others
}) => {
    src = src || defaultSrc
    modules = modules || 'js'
    dest = dest || modules

    let babelOptions = {}
    if (babelConfig) {
        if (exist(babelConfig)) {
            babelOptions.configFile = getProjectPath(babelConfig)
        } else {
            throw new Error(`The babel config file: '${babelConfig}' does not exist`)
        }
    } else if (exist('babel.config.js')) {
        babelOptions.configFile = getProjectPath('babel.config.js')
    } else {
        babelOptions = getBabelConfig(modules === 'js' ? 'auto' : false)
    }

    let tsProject
    if (tsConfig) {
        if (exist(tsConfig)) {
            // 命令行参数需要合入
            tsProject = ts.createProject(getProjectPath(tsConfig), others)
        } else {
            throw new Error(`The typescript config file: '${tsConfig}' does not exist`)
        }
    } else if (exist('tsconfig.json')) {
        // 命令行参数需要合入
        tsProject = ts.createProject(getProjectPath('tsconfig.json'), others)
    } else {
        // 命令行参数需要合入
        tsProject = ts.createProject(path.join(__dirname, '../config/tsconfig.json'), others)
    }

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
    const js = tsResult.js.pipe(babel(babelOptions))
    const stream = merge2([tsd, js]).pipe(gulp.dest(dest))
    return promisefyStream(stream)
}
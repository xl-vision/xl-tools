const gulp = require('gulp')
const tslint = require('gulp-tslint')
const {
    promisefyStream
} = require('../utils/runTask')
const path = require('path')
const {
    exist,
    getProjectPath
} = require('../utils/projectHelper')

const defaultSrc = [
    'src/package/**/*.ts?(x)'
]

module.exports = ({
    tslintConfig,
    src
}) => {
    src = src || defaultSrc
    if (tslintConfig) {
        if (exist(tslintConfig)) {
            tslintConfig = getProjectPath(tslintConfig)
        } else {
            throw new Error(`The tslint config file: '${tslintConfig}' does not exist`)
        }
    } else if (exist('tslint.json')) {
        tslintConfig = getProjectPath('tslint.json')
    } else {
        tslintConfig = path.join(__dirname, '../config/tslint.json')
    }

    const stream = gulp.src(src).pipe(tslint({
        formatter: 'verbose',
        configuration: tslintConfig
    })).pipe(tslint.report())
    return promisefyStream(stream)
}
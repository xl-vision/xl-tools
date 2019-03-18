const gulp = require('gulp')
const tslint = require('gulp-tslint')
const { promisefyStream } = require('../utils/runTask')
const path = require('path')

module.exports = ({ tslintConfigPath, src }) => {
    tslintConfigPath = tslintConfigPath || path.join(__dirname, '../config/tslintConfig.js')
    const stream = gulp.src(src).pipe(tslint({
        formatter: 'verbose',
        configuration: tslintConfigPath
    })).pipe(tslint.report())
    return promisefyStream(stream)
}
const gulp = require('gulp')
const tslint = require('gulp-tslint')
const { promisefyStream } = require('../utils/runTask')
const path = require('path')
const { exist, getProjectPath } = require('../utils/projectHelper')

module.exports = ({ tslintConfig, src }) => {
    let tslintConfigPath = path.join(__dirname, '../config/tslintConfig.js')
    if (tslintConfig && exist(tslintConfig)) {
        tslintConfigPath = getProjectPath(tslintConfig)
    } else if (exist('tslint.json')) {
        tslintConfigPath = 'tslint.json'
    }
    const stream = gulp.src(src).pipe(tslint({
        formatter: 'verbose',
        configuration: tslintConfigPath
    })).pipe(tslint.report())
    return promisefyStream(stream)
}
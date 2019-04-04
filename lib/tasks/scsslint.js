const {
    exist,
    getProjectPath
} = require('../utils/projectHelper')
const path = require('path')
const stylelint = require('gulp-stylelint')
const gulp = require('gulp')
const {
    promisefyStream
} = require('../utils/runTask')

const defaultSrc = [
    'src/style/**/*.scss'
]
module.exports = ({
    stylelintConfig,
    src
}) => {
    src = src || defaultSrc
    let configFile
    if (stylelintConfig) {
        if (exist(stylelintConfig)) {
            configFile = getProjectPath(stylelintConfig)
        } else {
            throw new Error(`The stylelint config file: '${stylelintConfig}' does not exist`)
        }
    } else if (exist('stylelint.config.js')) {
        configFile = getProjectPath('stylelint.config.js')
    } else {
        configFile = path.join(__dirname, '../config/stylelint.config.js')
    }
    const stream = gulp.src(src)
        .pipe(stylelint({
            syntax: 'scss',
            configFile,
            reporters: [{
                formatter: 'string',
                console: true
            }]
        }))
    return promisefyStream(stream)
}
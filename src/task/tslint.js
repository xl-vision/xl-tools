const gulp = require('gulp')
const gulpTslint = require('gulp-tslint')
const path = require('path')
const {
    promisefyStream
} = require('../utils/task')

const defaultProps = {
    src: ['src/**/*.ts?(x)', 'site/**/*.ts?(x)'],
    cwd: process.cwd(),
    configFile: path.resolve(__dirname, '../config/tslint.json')
}

module.exports = (props) => {
    const {
        src,
        cwd,
        configFile
    } = {
        ...defaultProps,
        ...props
    }

    const stream = gulp.src(src, {
            cwd
        }).pipe(gulpTslint({
            configuration: configFile,
            formatter: 'verbose'
        }))
        .pipe(gulpTslint.report())
    return promisefyStream(stream)
}
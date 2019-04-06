const gulp = require('gulp')
const gulpStylelint = require('gulp-stylelint')
const path = require('path')
const {
    promisefyStream
} = require('../utils/task')

const defaultProps = {
    src: ['src/**/*.scss', 'site/**/*.scss'],
    cwd: process.cwd(),
    configFile: path.resolve(__dirname, '../config/scsslint.config.js')
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
        })
        .pipe(gulpStylelint({
            syntax: 'scss',
            configFile,
            reporters: [{
                formatter: 'verbose',
                console: true
            }]
        }))
        
    return promisefyStream(stream)
}
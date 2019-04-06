const gulp = require('gulp')
const gulpMarkdownLint = require('gulp-markdownlint')
const path = require('path')
const {
    promisefyStream
} = require('../utils/task')

const defaultProps = {
    src: ['src/**/*.md', 'site/**/*.md'],
    configFile: path.resolve(__dirname, '../config/mdlint.json'),
    cwd: process.cwd()
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
            cwd,
        })
        .pipe(gulpMarkdownLint({
            configFile
        }))

    return promisefyStream(stream)
}
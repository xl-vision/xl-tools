const gulp = require('gulp')
// const gulpPostcss = require('gulp-postcss')
// const gulpSass = require('gulp-sass')
const path = require('path')
const {
    promisefyStream
} = require('../utils/task')

const defaultProps = {
    src: ['src/**/*.scss'],
    cwd: process.cwd(),
    postcssConfigFile: path.resolve(__dirname, '../config/postcss.config.js')
}

module.exports = (props) => {
    const {
        src,
        cwd,
        // configFile
    } = {
        ...defaultProps,
        ...props
    }

    const stream = gulp.src(src, {
            cwd
        })
        
    return promisefyStream(stream)
}
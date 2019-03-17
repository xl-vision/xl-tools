const gulp = require('gulp')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')

const defaultPostcssConfig = require('../config/postcssConfig')
const { promisefyStream } = require('../utils/runTask')

module.exports = ({ src, dest, postcssConfig }) => {
    postcssConfig = postcssConfig || defaultPostcssConfig
    const stream = gulp.src(src).pipe(sass())
        .on('error', function (error) {
            console.error(error.toString())
            this.emit('end')
        })
        .pipe(postcss(() => postcssConfig))
        .pipe(gulp.dest(dest))
    return promisefyStream(stream)
}
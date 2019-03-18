const gulp = require('gulp')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const clean = require('gulp-clean-css')

const defaultPostcssConfig = require('../config/postcssConfig')
const { promisefyStream } = require('../utils/runTask')

module.exports = ({ src, dest, postcssConfig, beautify }) => {
    postcssConfig = postcssConfig || defaultPostcssConfig
    const stream = gulp.src(src).pipe(sass())
        .on('error', function (error) {
            console.error(error.toString())
            this.emit('end')
        })
        .pipe(postcss(() => postcssConfig))
        .pipe(clean({
            level: 2,
            format: beautify ? 'beautify' : 'none'
        }))
        .pipe(gulp.dest(dest))
    return promisefyStream(stream)
}
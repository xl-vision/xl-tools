const gulp = require('gulp')
const gulpCleanCss = require('gulp-clean-css')
const gulpPostcss = require('gulp-postcss')
const gulpSass = require('gulp-sass')

module.exports = ({
    src,
    dest,
    postcssConfig,
    beautify = false
}) => {
    if(typeof postcssConfig === 'string'){
        postcssConfig = require(postcssConfig)
    }
    return gulp.src(src)
        .pipe(gulpSass().on('error',function(err)  {
            gulpSass.logError(err)
            this.emit('end')
        }))
        .pipe(gulpPostcss(...postcssConfig))
        .pipe(gulpCleanCss({
            level: 2,
            format: beautify ? 'beautify' : 'none'
        }))
        .pipe(gulp.dest(dest))
}
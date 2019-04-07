const gulp = require('gulp')
const gulpMarkdownLint = require('gulp-markdownlint')

module.exports = ({
    src,
    config
}) => {
    if(typeof config === 'string'){
        config = require(config)
    }
    return gulp.src(src)
        .pipe(gulpMarkdownLint({
            config,
            failAfterError: true
        }))

}
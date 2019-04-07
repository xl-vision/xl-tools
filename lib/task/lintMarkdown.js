const gulp = require('gulp')
const gulpMarkdownLint = require('gulp-markdownlint')

module.exports = ({
    src,
    config,
    cwd = process.cwd()
}) => {
    if(typeof config === 'string'){
        config = require(config)
    }
    return gulp.src(src, {
            cwd,
        })
        .pipe(gulpMarkdownLint({
            config
        }))

}
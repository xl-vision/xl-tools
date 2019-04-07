const gulp = require('gulp')
const gulpTslint = require('gulp-tslint')

module.exports = ({
    src,
    config
}) => {
    if(typeof config === 'string'){
        config = require(config)
    }
    return gulp.src(src)
        .pipe(gulpTslint({
            configuration: config,
            formatter: 'verbose'
        }))
        .pipe(gulpTslint.report())
}
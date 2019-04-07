const gulp = require('gulp')
const gulpTslint = require('gulp-tslint')
const tslint = require('tslint')

module.exports = ({
    src,
    config
}) => {
    if(typeof config === 'object'){
        // https://github.com/palantir/tslint/issues/2457
        config = tslint.Configuration.parseConfigFile(config)
    }

    return gulp.src(src)
        .pipe(gulpTslint({
            configuration: config,
            formatter: 'verbose'
        }))
        .pipe(gulpTslint.report())
}
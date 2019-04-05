const gulp = require('gulp')
const gulpStylelint = require('gulp-stylelint')
const path = require('path')

const defaultProps = {
    src: ['src/**/*.scss', 'site/**/*.scss'],
    configPath: path.resolve(__dirname, '../config/scsslint.config.js')
}

module.exports = (props) => {
    const {
        src,
        configPath
    } = {
        ...defaultProps,
        ...props
    }

    return gulp.src(src)
        .pipe(gulpStylelint({
            syntax: 'scss',
            configFile: configPath,
            reporters: [{
                formatter: 'verbose',
                console: true
            }]
        }))
}
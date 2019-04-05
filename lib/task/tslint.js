const gulp = require('gulp')
const gulpTslint = require('gulp-tslint')
const tslint = require('tslint')
const path = require('path')

const defaultProps = {
    src: ['src/**/*.ts?(x)', 'site/**/*.ts?(x)'],
    configPath: path.resolve(__dirname, '../config/tslint.json')
}

module.exports = (props) => {
    const {
        src,
        configPath
    } = {
        ...defaultProps,
        ...props
    }

    // const program = tslint.Linter.createProgram(configPath, process.cwd())
    return gulp.src(src).pipe(gulpTslint({
            configuration: configPath,
            // program,
            formatter: 'verbose'
        }))
        .pipe(gulpTslint.report())
}
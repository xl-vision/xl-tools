const gulp = require('gulp')
const sass = require('gulp-sass')
const postcss = require('gulp-postcss')
const clean = require('gulp-clean-css')

const defaultPostcssConfig = require('../config/postcssConfig')
const { promisefyStream } = require('../utils/runTask')
const { exist, getProjectPath } = require('../utils/projectHelper')

const defaultSrc = [
    'src/style/**/*.scss',
    '!src/style/**/_*/**',
]

module.exports = ({ src, dest, postcssConfig, beautify }) => {
    src = src || defaultSrc
    dest = dest || 'style'

    let postcssConfigContent

    if (postcssConfig) {
        if (exist(postcssConfig)) {
            postcssConfigContent = require(getProjectPath(postcssConfig))
        } else {
            throw new Error(`The postcss config file: '${postcssConfig}' does not exist`)
        }
    } else if (exist('postcss.config.js')) {
        postcssConfigContent = require(getProjectPath('postcss.config.js'))
    } else {
        postcssConfigContent = defaultPostcssConfig
    }

    const stream = gulp.src(src).pipe(sass())
        .on('error', function (error) {
            console.error(error.toString())
            this.emit('end')
        })
        .pipe(postcss(() => {
            if (typeof postcssConfigContent === 'function') {
                return postcssConfigContent(...arguments)
            }
            return postcssConfigContent
        }))
        .pipe(clean({
            level: 2,
            format: beautify ? 'beautify' : 'none'
        }))
        .pipe(gulp.dest(dest))
    return promisefyStream(stream)
}
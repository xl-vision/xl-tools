const gulp = require('gulp')
const MarkdownLint = require('markdownlint')
const through2 = require('through2')
const path = require('path')
const defaultProps = {
    src: ['src/**/*.md', 'site/**/*.md'],
    configPath: path.resolve(__dirname, '../config/mdlint.json')
}

module.exports = (props) => {
    const {
        src,
        configPath
    } = {
        ...defaultProps,
        ...props
    }

    const config = MarkdownLint.readConfigSync(configPath)

    return gulp.src(src)
        .pipe(through2.obj((file, encoding, cb) => {
            const filepath = file.path
            const ret = MarkdownLint.sync({
                files: filepath,
                config
            })
            const msg = ret.toString(true)
            if (msg) {
                cb(new Error(msg))
            } else {
                cb()
            }
        }))
}
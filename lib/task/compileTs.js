const gulp = require('gulp')
const gulpTs = require('gulp-typescript')
const gulpBabel = require('gulp-babel')
const merge2 = require('merge2')

const tsDefaultReporter = gulpTs.reporter.defaultReporter()


module.exports = ({
    src,
    dest,
    babelConfig,
    tsConfig
}) => {

    if(typeof babelConfig === 'string'){
        babelConfig = require(babelConfig)
    }

    let tsProject
    if(typeof tsConfig === 'string'){
        tsProject = gulpTs.createProject(tsConfig)
    } else{
        tsProject = gulpTs.createProject(tsConfig.compilerOptions)
    }

    let error = false

    function check() {
        if (error) {
            this.emit('end')
        }
    }

    const tsResult = gulp.src(src)
        .pipe(tsProject({
            error(err, ts) {
                tsDefaultReporter.error(err, ts)
                error = true
            },
            finish: tsDefaultReporter.finish,
        }))
        
    tsResult.on('finish', check)
    tsResult.on('end', check)
    const tds = tsResult.tds
    const js = tsResult.js.pipe(gulpBabel({
        ...babelConfig,
        babelrc: false,
        configFile: false,
    }))

    return merge2([tds, js]).pipe(gulp.dest(dest))
}
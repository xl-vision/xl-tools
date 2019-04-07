const gulp = require('gulp')
const lintScss = require('./lintScss')
const lintMarkdown = require('./lintMarkdown')
const lintTs = require('./lintTs')
const compileScss = require('./compileScss')
const compileTs = require('./compileTs')
const merge2 = require('merge2')
const path = require('path')
const getBabelConfig = require('../config/getBabelConfig')

gulp.task('lint:scss', () => lintScss({
    src: ['src/**/*.scss','site/**/*.scss'],
    config: require.resolve('../config/scsslint.config.js')
}))

gulp.task('lint:markdown', () => lintMarkdown({
    src: ['src/**/*.md','site/**/*.md'],
    config: require.resolve('../config/markdownlint.config.json')
}))

gulp.task('lint:ts',() => lintTs({
    src: ['src/**/*.ts?(x)','site/**/*.ts?(x)'],
    config: require.resolve('../config/tslint.json')
}))

gulp.task('compile:es',() => {
    const babelConfig = getBabelConfig({modules: false})
    const ts = compileTs({
        src: ['src/**/*.ts?(x)','!src/**/_*/**/*.ts?(x)'],
        dest: 'es',
        babelConfig,
        tsConfig: require.resolve('../config/tsconfig.json')
    })
    const scss = compileScss({
        src: ['src/**/*.scss','!src/styles/**/*.scss'],
        dest: 'es',
        postcssConfig: require.resolve('../config/postcss.config.js')
    })
    return merge2([ts,scss])
})

gulp.task('compile:js',() => {
    const babelConfig = getBabelConfig({modules: 'commonjs'})
    const ts = compileTs({
        src: ['src/**/*.ts?(x)','!src/**/_*/**/*.ts?(x)'],
        dest: 'js',
        babelConfig,
        tsConfig: require.resolve('../config/tsconfig.json')
    })
    const scss = compileScss({
        src: ['src/**/*.scss','!src/styles/**/*.scss'],
        dest: 'js',
        postcssConfig: require.resolve('../config/postcss.config.js')
    })
    return merge2([ts,scss])
})
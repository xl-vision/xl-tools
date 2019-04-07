const gulp = require('gulp')
const lintScss = require('./lintScss')
const lintMarkdown = require('./lintMarkdown')
const lintTs = require('./lintTs')
const compileScss = require('./compileScss')
const compileTs = require('./compileTs')
const bundle = require('./bundle')
const site = require('./site')
const getBabelConfig = require('../config/getBabelConfig')

gulp.task('lint:scss', () => lintScss({
    src: ['src/**/*.scss','site/**/*.scss'],
    config: require.resolve('../config/scsslint.config.js')
}))

gulp.task('lint:markdown', () => lintMarkdown({
    src: ['src/**/*.md','site/**/*.md'],
    config: require.resolve('../config/markdownlint.json')
}))

gulp.task('lint:ts',() => lintTs({
    src: ['src/**/*.ts?(x)','site/**/*.ts?(x)'],
    config: require.resolve('../config/tslint.json')
}))

gulp.task('lint',gulp.parallel('lint:scss','lint:markdown','lint:ts'))

const compileEs = gulp.parallel(() => {
    const babelConfig = getBabelConfig({modules: false})
    return compileTs({
        src: ['src/**/*.ts?(x)','!src/**/doc/**/*.ts?(x)'],
        dest: 'es',
        babelConfig,
        tsConfig: require.resolve('../config/tsconfig.json')
    })
},() => compileScss({
    src: ['src/**/*.scss','!src/styles/**/*.scss'],
    dest: 'es',
    postcssConfig: require.resolve('../config/postcss.config.js')
}))

gulp.task('compile:es',compileEs)

const compileJs = gulp.parallel(() => {
    const babelConfig = getBabelConfig({modules: false})
    return compileTs({
        src: ['src/**/*.ts?(x)','!src/**/_*/**/*.ts?(x)'],
        dest: 'js',
        babelConfig,
        tsConfig: require.resolve('../config/tsconfig.json')
    })
},() => compileScss({
    src: ['src/**/*.scss','!src/styles/**/*.scss'],
    dest: 'js',
    postcssConfig: require.resolve('../config/postcss.config.js')
}))


gulp.task('compile:js',compileJs)


const compileDist = gulp.parallel(() => {
    return bundle({
        input: 'src/index.tsx',
        output: 'dist',
        name: 'xl-vision',
        babelConfig: getBabelConfig({typescript: true})
    })
},() => compileScss({
    src: 'src/index.scss',
    dest: 'dist',
    postcssConfig: require.resolve('../config/postcss.config.js')
}))

gulp.task('compile:dist',compileDist)

gulp.task('site:build',() => site({
    env: 'production',
    input: 'site/index.tsx',
    output: 'docs',
    publicPath: '/xl-vision/',
    postcssConfig: require.resolve('../config/postcss.config.js'),
    babelConfig: getBabelConfig({typescript: true}),
    htmlTemplate: 'site/index.html',
    tsconfigPath: require.resolve('../config/tsconfig.json')
}))


gulp.task('site:start',() => site({
    env: 'development',
    input: 'site/index.tsx',
    output: 'docs',
    publicPath: '/',
    postcssConfig: require.resolve('../config/postcss.config.js'),
    babelConfig: getBabelConfig({typescript: true}),
    htmlTemplate: 'site/index.html',
    tsconfigPath: require.resolve('../config/tsconfig.json')
}))
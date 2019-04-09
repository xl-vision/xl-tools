const gulp = require('gulp')
const lintScss = require('./lintScss')
const lintMarkdown = require('./lintMarkdown')
const lintTs = require('./lintTs')
const compileScss = require('./compileScss')
const compileTs = require('./compileTs')
const bundle = require('./bundle')
const site = require('./site')
const getBabelConfig = require('../config/getBabelConfig')
const path = require('path')

const rootPkgPath = path.join(process.cwd(), 'package.json')
const rootPkg = require(rootPkgPath)

const bannerMessage = `${rootPkg.name} v${rootPkg.version}\nCopyright 2015-present, Alipay, Inc.\nAll rights reserved.`

gulp.task('lint:scss', () => lintScss({
  src: ['src/**/*.scss', 'site/**/*.scss'],
  config: require.resolve('../config/scsslint.config.js')
}))

gulp.task('lint:markdown', () => lintMarkdown({
  src: ['src/**/*.md', 'site/**/*.md'],
  config: require.resolve('../config/markdownlint.json')
}))

gulp.task('lint:ts', () => lintTs({
  src: ['src/**/*.ts?(x)', 'site/**/*.ts?(x)'],
  config: require.resolve('../config/tslint.json')
}))

gulp.task('lint', gulp.parallel('lint:scss', 'lint:markdown', 'lint:ts'))

gulp.task('compile:es:ts', () => compileTs({
  src: ['src/**/*.ts?(x)', '!src/**/doc/**/*.ts?(x)', '!src/**/test/**/*.ts?(x)'],
  dest: 'es',
  babelConfig: getBabelConfig({ modules: false }),
  tsConfig: require.resolve('../config/tsconfig.json')
}))

gulp.task('compile:es:style', () => compileScss({
  src: ['src/**/*.scss', '!src/style/**/*.scss', '!src/**/test/**/*.scss', '!src/**/doc/**/*.scss'],
  dest: 'es',
  postcssConfig: require.resolve('../config/postcss.config.js')
}))

gulp.task('compile:es', gulp.parallel('compile:es:ts', 'compile:es:style'))

gulp.task('compile:js:ts', () => compileTs({
  src: ['src/**/*.ts?(x)', '!src/**/doc/**/*.ts?(x)', '!src/**/test/**/*.ts?(x)'],
  dest: 'js',
  babelConfig: getBabelConfig({ modules: 'commonjs' }),
  tsConfig: require.resolve('../config/tsconfig.json')
}))

gulp.task('compile:js:style', () => compileScss({
  src: ['src/**/*.scss', '!src/style/**/*.scss', '!src/**/test/**/*.scss', '!src/**/doc/**/*.scss'],
  dest: 'js',
  postcssConfig: require.resolve('../config/postcss.config.js')
}))

gulp.task('compile:js', gulp.parallel('compile:js:ts', 'compile:js:style'))

gulp.task('compile:dist:style', () => compileScss({
  src: ['src/index.scss'],
  dest: 'dist',
  postcssConfig: require.resolve('../config/postcss.config.js')
}))

gulp.task('compile:dist:ts:dev', () => bundle({
  isProduction: false,
  input: 'src',
  output: 'dist',
  babelConfig: getBabelConfig({ typescript: true }),
  tsconfigPath: require.resolve('../config/tsconfig.json'),
  bannerMessage
}))

gulp.task('compile:dist:ts:prod', () => bundle({
  isProduction: true,
  input: 'src',
  output: 'dist',
  babelConfig: getBabelConfig({ typescript: true }),
  tsconfigPath: require.resolve('../config/tsconfig.json'),
  bannerMessage
}))

gulp.task('compile:dist', gulp.parallel('compile:dist:ts:prod', 'compile:dist:ts:prod', 'compile:dist:style'))

gulp.task('site:build', () => site({
  isProduction: true,
  input: 'site/index.tsx',
  output: 'docs',
  publicPath: '/xl-vision/',
  postcssConfig: require.resolve('../config/postcss.config.js'),
  babelConfig: getBabelConfig({ typescript: true }),
  htmlTemplate: 'site/index.html',
  tsconfigPath: require.resolve('../config/tsconfig.json')
}))

gulp.task('site:start', () => site({
  isProduction: false,
  input: 'site/index.tsx',
  output: 'docs',
  publicPath: '/',
  postcssConfig: require.resolve('../config/postcss.config.js'),
  babelConfig: getBabelConfig({ typescript: true }),
  htmlTemplate: 'site/index.html',
  tsconfigPath: require.resolve('../config/tsconfig.json')
}))

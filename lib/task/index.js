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

const bannerMessage = `${rootPkg.name} v${rootPkg.version}\nCopyright 2019-present, Rhys Xia.\nAll rights reserved.`

const tsSource = ['src/**/*.ts?(x)', '!src/**/doc/**/*.ts?(x)', '!src/**/test/**/*.ts?(x)']
const styleSource = ['src/**/*.scss', '!src/style/**/*.scss', '!src/**/test/**/*.scss', '!src/**/doc/**/*.scss']

const allTsSource = ['src/**/*.ts?(x)', 'site/**/*.ts?(x)']
const allStyleSource = ['src/**/*.scss', 'site/**/*.scss']
const allMarkdownSource = ['src/**/*.md', 'site/**/*.md']

gulp.task('lint:scss', () => lintScss({
  src: allStyleSource,
  config: require.resolve('../config/scsslint.config.js')
}))

gulp.task('lint:markdown', () => lintMarkdown({
  src: allMarkdownSource,
  config: require.resolve('../config/markdownlint.json')
}))

gulp.task('lint:ts', () => lintTs({
  src: allTsSource,
  config: require.resolve('../config/tslint.json')
}))

gulp.task('lint', gulp.parallel('lint:scss', 'lint:markdown', 'lint:ts'))

gulp.task('compile:es', () => compileTs({
  src: tsSource,
  dest: 'es',
  babelConfig: getBabelConfig({ modules: false }),
  tsConfig: require.resolve('../config/tsconfig.json')
}))

gulp.task('compile:js', () => compileTs({
  src: tsSource,
  dest: 'js',
  babelConfig: getBabelConfig({ modules: 'commonjs' }),
  tsConfig: require.resolve('../config/tsconfig.json')
}))

gulp.task('compile:style', () => compileScss({
  src: styleSource,
  dest: 'style',
  postcssConfig: require.resolve('../config/postcss.config.js')
}))

gulp.task('compile:dist:dev', () => bundle({
  isProduction: false,
  input: 'src/index.tsx',
  output: 'dist',
  babelConfig: getBabelConfig({ typescript: true }),
  bannerMessage
}))

gulp.task('compile:dist:prod', () => bundle({
  isProduction: true,
  input: 'src/index.tsx',
  output: 'dist',
  babelConfig: getBabelConfig({ typescript: true }),
  bannerMessage
}))

gulp.task('compile:dist', gulp.parallel('compile:dist:prod', 'compile:dist:dev'))

gulp.task('compile', gulp.parallel('compile:es', 'compile:js', 'compile:dist', 'compile:style'))

gulp.task('site:build', () => site({
  alias: {
    'site': path.join(process.cwd(), 'site')
  },
  mdLoaderOptions: {
    clsPrefix: 'md',
    mdCodeComponentPath: 'site/components/demo-box'
  },
  isProduction: true,
  input: 'site/index.tsx',
  tsCheckIncludes: ['src', 'site'],
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

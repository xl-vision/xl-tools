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
const fs = require('fs-extra')
const chalk = require('chalk')

const rootPkg = require(getProjectPath('package.json'))

const bannerMessage = `${rootPkg.name} v${rootPkg.version}\nCopyright 2019-present, Rhys Xia.\nAll rights reserved.`

const tsSource = ['src/**/*.ts?(x)', '!src/**/doc/**/*.ts?(x)', '!src/**/test/**/*.ts?(x)', 'typings/**/*.ts?(x)']
const styleSource = ['src/**/index.scss', '!src/style/**/*.scss', '!src/**/test/**/*.scss', '!src/**/doc/**/*.scss']

const allTsSource = ['src/**/*.ts?(x)', 'typings/**/*.ts?(x)', 'site/**/*.ts?(x)', 'typings/**/*.ts?(x)']
const allStyleSource = ['src/**/*.scss', 'site/**/*.scss']
const allMarkdownSource = ['src/**/*.md', 'site/**/*.md']

const stylelintFile = 'stylelint.config.js'
const markdownlintFile = 'markdownlint.json'
const tslintFile = 'tslint.json'
const tsconfigFile = 'tsconfig.json'
const postcssFile = 'postcss.config.js'

function getProjectPath (...paths) {
  return path.join(process.cwd(), ...paths)
}

function checkAndCopyFile (fileName) {
  const filePath = getProjectPath(fileName)
  if (fs.existsSync(filePath)) {
    console.info(chalk.green(`File '${fileName}' exists`))
    return
  }
  fs.copyFileSync(path.join(__dirname, '../config', fileName), filePath)
}

gulp.task('lint:scss', () => {
  checkAndCopyFile(stylelintFile)
  return lintScss({
    src: allStyleSource,
    config: getProjectPath(stylelintFile)
  })
})

gulp.task('lint:markdown', () => {
  checkAndCopyFile(markdownlintFile)
  return lintMarkdown({
    src: allMarkdownSource,
    config: getProjectPath(markdownlintFile)
  })
})

gulp.task('lint:ts', () => {
  checkAndCopyFile(tslintFile)
  return lintTs({
    src: allTsSource,
    config: getProjectPath(tslintFile)
  })
})

gulp.task('lint', gulp.parallel('lint:scss', 'lint:markdown', 'lint:ts'))

gulp.task('compile:es', () => {
  checkAndCopyFile(tsconfigFile)
  return compileTs({
    src: tsSource,
    dest: 'es',
    babelConfig: getBabelConfig({ modules: false }),
    tsConfig: getProjectPath(tsconfigFile)
  })
})

gulp.task('compile:js', () => {
  checkAndCopyFile(tsconfigFile)
  return compileTs({
    src: tsSource,
    dest: 'js',
    babelConfig: getBabelConfig({ modules: 'commonjs' }),
    tsConfig: getProjectPath(tsconfigFile)
  })
})

gulp.task('compile:style', () => {
  checkAndCopyFile(postcssFile)
  return compileScss({
    src: styleSource,
    dest: 'style',
    postcssConfig: getProjectPath(postcssFile)
  })
})

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

gulp.task('site:build', () => {
  checkAndCopyFile(tsconfigFile)
  return site({
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
    tsconfigPath: getProjectPath(tsconfigFile)
  })
})

gulp.task('site:start', () => {
  checkAndCopyFile(tsconfigFile)
  return site({
    alias: {
      'site': path.join(process.cwd(), 'site')
    },
    mdLoaderOptions: {
      clsPrefix: 'md',
      mdCodeComponentPath: 'site/components/demo-box'
    },
    isProduction: false,
    input: 'site/index.tsx',
    tsCheckIncludes: ['src', 'site', 'typings'],
    output: 'docs',
    postcssConfig: require.resolve('../config/postcss.config.js'),
    babelConfig: getBabelConfig({ typescript: true }),
    htmlTemplate: 'site/index.html',
    tsconfigPath: getProjectPath(tsconfigFile)
  })
})

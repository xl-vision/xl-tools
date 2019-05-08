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
    src: ['src/**/*.scss', 'site/**/*.scss'],
    config: getProjectPath(stylelintFile)
  })
})

gulp.task('lint:markdown', () => {
  checkAndCopyFile(markdownlintFile)
  return lintMarkdown({
    src: ['src/**/*.md', 'site/**/*.md'],
    config: getProjectPath(markdownlintFile)
  })
})

gulp.task('lint:ts', () => {
  checkAndCopyFile(tslintFile)
  return lintTs({
    src: ['src/**/*.ts?(x)', 'typings/**/*.ts?(x)', 'site/**/*.ts?(x)'],
    config: getProjectPath(tslintFile)
  })
})

gulp.task('lint', gulp.parallel('lint:scss', 'lint:markdown', 'lint:ts'))

function compileAddCopyStyle (dest) {
  const styleSource = ['src/**/*.scss', '!src/**/test/**/*.scss', '!src/**/doc/**/*.scss']
  const indexStyleSource = ['src/**/index.scss', '!src/**/test/**/*.scss', '!src/**/doc/**/*.scss']

  // copy
  const copy = () => gulp.src(styleSource).pipe(gulp.dest(dest))
  // compile
  const compile = () => {
    checkAndCopyFile(postcssFile)
    return compileScss({
      src: indexStyleSource,
      dest: dest,
      postcssConfig: getProjectPath(postcssFile)
    })
  }

  return gulp.parallel(copy, compile)
}

function compileTsAndStyle (dest, modules) {
  const compileJs = () => {
    checkAndCopyFile(tsconfigFile)
    return compileTs({
      src: ['src/**/*.ts?(x)', '!src/**/doc/**/*.ts?(x)', '!src/**/test/**/*.ts?(x)', 'typings/**/*.ts?(x)'],
      dest,
      babelConfig: getBabelConfig({ modules }),
      tsConfig: getProjectPath(tsconfigFile)
    })
  }
  const compileStyle = compileAddCopyStyle(dest)
  return gulp.parallel(compileJs, compileStyle)
}

gulp.task('compile:es', compileTsAndStyle('es'))

gulp.task('compile:js', compileTsAndStyle('js', 'commonjs'))

const rootPkg = require(getProjectPath('package.json'))

function compileDist (isProduction) {
  const compileTs = () => bundle({
    isProduction,
    input: 'src/index.tsx',
    output: 'dist',
    babelConfig: getBabelConfig({ typescript: true }),
    bannerMessage: `${rootPkg.name} v${rootPkg.version}\nCopyright 2019-present, Rhys Xia.\nAll rights reserved.`
  })

  const compileStyle = () => compileScss({
    src: 'src/style/index.scss',
    dest: 'dist',
    beautify: !isProduction,
    postcssConfig: getProjectPath(postcssFile),
    rename: path => {
      path.basename += (isProduction ? '.production' : '.development')
    }
  })
  return gulp.parallel(compileTs, compileStyle)
}
gulp.task('compile:dist:dev', compileDist(false))

gulp.task('compile:dist:prod', compileDist(true))

gulp.task('compile:dist', gulp.parallel('compile:dist:prod', 'compile:dist:dev'))

gulp.task('compile', gulp.parallel('compile:es', 'compile:js', 'compile:dist'))

function runSite (isProduction) {
  checkAndCopyFile(tsconfigFile)
  return () => site({
    alias: {
      'site': path.join(process.cwd(), 'site')
    },
    mdLoaderOptions: {
      clsPrefix: 'md',
      mdCodeComponentPath: 'site/components/demo-box'
    },
    isProduction,
    input: 'site/index.tsx',
    tsCheckIncludes: ['src', 'site', 'typings'],
    output: 'docs',
    publicPath: isProduction ? '/xl-vision/' : '/',
    postcssConfig: require.resolve('../config/postcss.config.js'),
    babelConfig: getBabelConfig({ typescript: true }),
    htmlTemplate: 'site/index.html',
    tsconfigPath: getProjectPath(tsconfigFile)
  })
}

gulp.task('site:build', runSite(true))

gulp.task('site:start', runSite(false))

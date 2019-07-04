import chalk from 'chalk'
import path from 'path'
import inquirer from 'inquirer'
import fs from 'fs-extra'
import spawn from 'cross-spawn'
import writeTpl from '../utils/writeTpl'
import ora from 'ora'

const questions: inquirer.Questions<{
  desc: string
  style: 'scss',
  isTypescript: boolean
  isLint: boolean,
  isStylelint: boolean,
  author: string
  license: string
  keywords: string
}> = [{
  name: 'desc',
  type: 'input',
  message: '请输入项目描述',
  default: 'library for react'
}, {
  name: 'author',
  type: 'input',
  message: '请输入项目作者',
  default: ''
}, {
  name: 'license',
  type: 'input',
  message: '请输入License',
  default: 'MIT'
}, {
  name: 'keywords',
  type: 'input',
  message: '请输入关键字，空格隔开',
  default: '',
}, {
  name: 'style',
  type: 'list',
  message: '请选择样式语言',
  choices: ['scss'],
  // choices: ['scss', 'sass', 'less', 'stylus', 'css'],
  default: 'scss'
}, {
  name: 'isTypescript',
  type: 'confirm',
  message: '是否使用typescript',
  choices: ['typescript'],
  // choices: ['typescript', 'javascript'],
  default: 'typescript'
}, {
  name: 'isLint',
  type: 'confirm',
  message: '是否使用eslint',
  default: true
}, {
  name: 'isStylelint',
  type: 'confirm',
  message: '是否使用stylelint',
  default: true
}]

export default (dir: string) => {
  const projectPath = path.join(process.cwd(), dir)
  const name = path.basename(projectPath)

  // 判断文件夹是否存在
  if (fs.existsSync(projectPath)) {
    console.log()
    console.error(chalk.red(`The directory '${projectPath}' exists, please provide a name not to be used`))
    console.log()
    process.exit(1)
  }

  fs.mkdirsSync(projectPath)

  process.chdir(projectPath)

  inquirer.prompt(questions).then((answers) => {

    const data = {name, ...answers}

    const dependencies = [
      '@babel/runtime'
    ]
    const devDependencies = [
      '@xl-vision/xl-tools-scripts',
      'react',
      'react-dom',
      'react-router-dom'
    ]

    if (answers.isLint) {
      writeTpl(path.join(__dirname, '../../template/common/eslint.json'), process.cwd(), data)
      // devDependencies.push('eslint-config-standard', 'eslint-plugin-import', 'eslint-plugin-node', 'eslint-plugin-promise', 'eslint-plugin-standard')
    }

    if (answers.isStylelint) {
      writeTpl(path.join(__dirname, '../../template/common/stylelint.config.js'), process.cwd(), data)
      devDependencies.push('stylelint-config-standard', 'stylelint-config-rational-order')
    }

    if (answers.isTypescript) {
      writeTpl(path.join(__dirname, '../../template/common/tsconfig.json'), process.cwd(), data)
      writeTpl(path.join(__dirname, '../../template/typescript'), '.', data)

      devDependencies.push('@types/react', '@types/react-dom', '@types/react-router-dom')

      if (answers.isLint) {
        devDependencies.push('@typescript-eslint/parser', '@typescript-eslint/eslint-plugin')
      }
    }

    writeTpl(path.join(__dirname, '../../template/common/postcss.config.js'), process.cwd(), data)

    devDependencies.push('autoprefixer')

    const pkg = {
      name,
      description: answers.desc,
      author: answers.author,
      license: answers.license,
      keyword: answers.keywords.trim().split(' '),
      main: 'js/index.js',
      module: 'es/index.js',
      files: [
        'dist',
        'js',
        'es'
      ],
      scripts: {
        lint: '@xl-vision/scripts lint',
        compile: '@xl-vision/scripts compile',
        test: '@xl-vision/scripts test',
        dist: '@xl-vision/scripts dist',
        site: '@xl-vision/scripts site',
        dev: '@xl-vision/scripts dev'
      },
      sideEffects: [
        'dist/*',
        'es/**/style/*',
        'js/**/style/*'
      ]
    }

    fs.writeJSONSync('package.json', pkg, {
      spaces: 2
    })

    const spinner = ora('install dependencies').start()

    // 安装依赖
    spawn.sync('npm', ['install', '-S', ...dependencies])
    spawn.sync('npm', ['install', '-D', ...devDependencies])

    spinner.stop()

    // 添加peerDependencies
    const json = fs.readJSONSync('package.json')
    const reactVersion = json.devDependencies.react
    json.peerDependencies = {
      react: reactVersion
    }
    fs.writeJSONSync('package.json', json, {
      spaces: 2
    })
  })
}

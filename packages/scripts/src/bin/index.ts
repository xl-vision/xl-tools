#!/usr/bin/env node
import program from 'commander'
import chalk from 'chalk'
import bundle from '../tasks/bundle'
import getProjectPath from '../utils/getProjectPath'
import eslint from '../tasks/eslint'
import stylelint from '../tasks/stylelint'
import compileCss from '../tasks/compileCss'
import compileLess from '../tasks/compileLess'
import compileScss from '../tasks/compileScss'
import compileStylus from '../tasks/compileStylus'
import compileJs from '../tasks/compileJs'
import docs, { Alias } from '../tasks/docs'
import compileTs from '../tasks/compileTs'
import copy from '../tasks/copy'
import getScriptConfig, { Command } from '../config/getScriptConfig'
import { warn } from '../utils/logger'

const srcDir = 'src'

const siteDir = 'site'

const compiledDir = 'lib'

const docsDir = 'docs'

const distDir = 'dist'

const libraryName = require(getProjectPath('package.json')).name

const splitHandler = (value: string) => {
  return value.split(',')
}

const scripts: Command[] = [
  {
    name: 'copy',
    script: copy,
    desc: 'copy',
    options: [
      {
        name: 'from',
        desc: "The file path to search, split with ',' if multiple paths.",
        handler: splitHandler,
      },
      {
        name: 'to',
        desc: 'The file path to store files copyed.',
      },
    ],
  },
  {
    name: 'lint:es',
    script: eslint,
    desc: 'eslint',
    options: [
      {
        name: 'from',
        desc: "The file path to search, split with ',' if multiple paths.",
        handler: splitHandler,
        defaultValue: [
          `${srcDir}/**/*.@(ts?(x)|js?(x))`,
          `${siteDir}/**/*.@(ts?(x)|js?(x))`,
        ],
      },
      {
        name: 'to',
        desc: 'The file path to store files fixed.',
      },
      {
        name: 'fix',
        desc: 'Try to fix issues.',
        isBool: true,
      },
      {
        name: 'eslintConfig',
        desc: 'The eslint config file path.',
      },
    ],
  },
  {
    name: 'lint:style',
    script: stylelint,
    desc: 'stylelint',
    options: [
      {
        name: 'from',
        desc: "The file path to search, split with ',' if multiple paths.",
        handler: splitHandler,
        defaultValue: [
          `${srcDir}/**/*.@(css|scss|sass|less|styl)`,
          `${siteDir}/**/*.@(css|scss|sass|less|styl)`,
        ],
      },
      {
        name: 'to',
        desc: 'The file path to store files fixed.',
      },
      {
        name: 'fix',
        desc: 'Try to fix issues.',
        isBool: true,
      },
      {
        name: 'stylelintConfig',
        desc: 'The stylelint config file path.',
      },
    ],
  },
  {
    name: 'compile:css',
    script: compileCss,
    desc: 'Compile css files.',
    options: [
      {
        name: 'from',
        desc: "The file path to search, split with ',' if multiple paths.",
        handler: splitHandler,
        defaultValue: [`${srcDir}/**/*.css`],
      },
      {
        name: 'to',
        desc: 'The file path to store files fixed.',
        defaultValue: compiledDir,
      },
      {
        name: 'rename',
        desc: 'Rename the generated file.',
      },
      {
        name: 'no-beautify',
        desc: 'Whether if or not beautify compiled files.',
        isBool: true,
      },
      {
        name: 'sourceMap',
        desc: 'Whether if or not generate sourceMap files.',
        isBool: true,
      },
      {
        name: 'postcssConfig',
        desc: 'The postcss config file path.',
      },
    ],
  },
  {
    name: 'compile:less',
    script: compileLess,
    desc: 'Compile less files.',
    options: [
      {
        name: 'from',
        desc: "The file path to search, split with ',' if multiple paths.",
        handler: splitHandler,
        defaultValue: [`${srcDir}/**/*.less`],
      },
      {
        name: 'to',
        desc: 'The file path to store files fixed.',
        defaultValue: compiledDir,
      },
      {
        name: 'rename',
        desc: 'Rename the generated file.',
      },
      {
        name: 'no-beautify',
        desc: 'Whether if or not beautify compiled files.',
        isBool: true,
      },
      {
        name: 'sourceMap',
        desc: 'Whether if or not generate sourceMap files.',
        isBool: true,
      },
      {
        name: 'postcssConfig',
        desc: 'The postcss config file path.',
      },
    ],
  },
  {
    name: 'compile:scss',
    script: compileScss,
    desc: 'Compile scss files.',
    options: [
      {
        name: 'from',
        desc: "The file path to search, split with ',' if multiple paths.",
        handler: splitHandler,
        defaultValue: [`${srcDir}/**/*.scss`],
      },
      {
        name: 'to',
        desc: 'The file path to store files fixed.',
        defaultValue: compiledDir,
      },
      {
        name: 'rename',
        desc: 'Rename the generated file.',
      },
      {
        name: 'no-beautify',
        desc: 'Whether if or not beautify compiled files.',
        isBool: true,
      },
      {
        name: 'sourceMap',
        desc: 'Whether if or not generate sourceMap files.',
        isBool: true,
      },
      {
        name: 'postcssConfig',
        desc: 'The postcss config file path.',
      },
    ],
  },
  {
    name: 'compile:sass',
    script: compileScss,
    desc: 'Compile scss files.',
    options: [
      {
        name: 'from',
        desc: "The file path to search, split with ',' if multiple paths.",
        handler: splitHandler,
        defaultValue: [`${srcDir}/**/*.sass`],
      },
      {
        name: 'to',
        desc: 'The file path to store files fixed.',
        defaultValue: compiledDir,
      },
      {
        name: 'rename',
        desc: 'Rename the generated file.',
      },
      {
        name: 'no-beautify',
        desc: 'Whether if or not beautify compiled files.',
        isBool: true,
      },
      {
        name: 'sourceMap',
        desc: 'Whether if or not generate sourceMap files.',
        isBool: true,
      },
      {
        name: 'postcssConfig',
        desc: 'The postcss config file path.',
      },
    ],
  },
  {
    name: 'compile:stylus',
    script: compileStylus,
    desc: 'Compile stylus files.',
    options: [
      {
        name: 'from',
        desc: "The file path to search, split with ',' if multiple paths.",
        handler: splitHandler,
        defaultValue: [`${srcDir}/**/*.styl`],
      },
      {
        name: 'to',
        desc: 'The file path to store files fixed.',
        defaultValue: compiledDir,
      },
      {
        name: 'rename',
        desc: 'Rename the generated file.',
      },
      {
        name: 'no-beautify',
        desc: 'Whether if or not beautify compiled files.',
        isBool: true,
      },
      {
        name: 'sourceMap',
        desc: 'Whether if or not generate sourceMap files.',
        isBool: true,
      },
      {
        name: 'postcssConfig',
        desc: 'The postcss config file path.',
      },
    ],
  },
  {
    name: 'compile:js',
    script: compileJs,
    desc: 'Compile js files.',
    options: [
      {
        name: 'from',
        desc: "The file path to search, split with ',' if multiple paths.",
        handler: splitHandler,
        defaultValue: [`${srcDir}/**/*.js?(x)`],
      },
      {
        name: 'to',
        desc: 'The file path to store files fixed.',
        defaultValue: compiledDir,
      },
      {
        name: 'es',
        desc: 'Whether if or not compile with ES6 format.',
        isBool: true,
      },
    ],
  },
  {
    name: 'compile:ts',
    script: compileTs,
    desc: 'Compile ts files.',
    options: [
      {
        name: 'from',
        desc: "The file path to search, split with ',' if multiple paths.",
        handler: splitHandler,
        defaultValue: [`${srcDir}/**/*.ts?(x)`],
      },
      {
        name: 'to',
        desc: 'The file path to store files fixed.',
        defaultValue: compiledDir,
      },
      {
        name: 'es',
        desc: 'Whether if or not compile with ES6 format.',
        isBool: true,
      },
      {
        name: 'tsConfig',
        desc:
          'The path of tsconfig file, you can not care this option if project does not use Typescript.',
        defaultValue: 'tsconfig.json',
      },
    ],
  },
  {
    name: 'bundle',
    script: bundle,
    desc: 'Bundle library source files.',
    options: [
      {
        name: 'entry',
        desc: 'The entry file.',
        defaultValue: srcDir,
      },
      {
        name: 'dest',
        desc: 'The target directory for bundled files.',
        defaultValue: distDir,
      },
      {
        name: 'libraryName',
        desc:
          'Specify library name, default is the underlined string transformed name in package.json.',
        defaultValue: libraryName,
      },
      {
        name: 'no-sourceMap',
        desc: 'Whether if or not generate sourceMap files.',
        isBool: true,
      },
      {
        name: 'tsConfig',
        desc:
          'The path of tsconfig file, you can not care this option if project does not use Typescript.',
        defaultValue: 'tsconfig.json',
      },
    ],
  },
  {
    name: 'docs',
    script: docs,
    desc: 'Run docs command',
    options: [
      {
        name: 'entry',
        desc: 'The entry path of app.',
        defaultValue: siteDir,
      },
      {
        name: 'dest',
        desc: 'The destination derectory for site bundle',
        defaultValue: docsDir,
      },
      {
        // --alias a1=a/b/c,a2=a/d/c
        name: 'alias',
        desc: 'The alias for webpack',
        handler: (value) => {
          const items = value.split(',').map(it => it.trim())
          const alias: Alias = {}
          for (const item of items) {
            const keyValue = item.split('=')
            if (keyValue.length !== 2) {
              warn(`The alias '${item}' is not expected.`)
              continue
            }
            alias[keyValue[0]] = keyValue[1]
          }
          return alias
        }
      },
      {
        name: 'demoContainer',
        desc: 'The demo container.',
        defaultValue: 'demo',
      },
      {
        name: 'demoBox',
        desc: 'The demo box.',
      },
      {
        name: 'dev',
        desc: 'The mode for build site, run a server if in deveploment.',
        isBool: true,
      },

      {
        name: 'publicPath',
        desc: 'The public path for deploy',
        defaultValue: '/',
      },
      {
        name: 'port',
        desc: 'The port for dev server',
        handler: (value: string) => parseInt(value),
        defaultValue: 3000,
      },
      {
        name: 'no-open',
        desc: 'Whether if open in browser, only effect in dev mode.',
        isBool: true,
      },
      {
        name: 'tsConfig',
        desc:
          'The path of tsconfig file, you can not care this option if project does not use Typescript',
        defaultValue: 'tsconfig.docs.json',
      },
      {
        name: 'postcssConfig',
        desc: 'The postcss config file path.',
      },
      {
        name: 'no-sourceMap',
        desc: 'Whether if or not generate sourceMap files.',
        isBool: true,
      },
    ],
  },
]

const allScripts = getScriptConfig(scripts)

program.version(require('../../package.json').version)

for (let script of allScripts) {
  let exec = program.command(script.name).description(script.desc || '')
  for (const option of script.options || []) {
    let optionStr = `--${option.name}`
    if (!option.isBool) {
      optionStr += option.required ? ` <${option.name}>` : ` [${option.name}]`
    }
    if (option.handler) {
      exec.option(optionStr, option.desc, option.handler, option.defaultValue)
    } else {
      exec.option(optionStr, option.desc, option.defaultValue)
    }
  }
  exec.action(async function (options) {
    const keys = Object.keys(options).filter(
      (it) =>
        !it.startsWith('_') && !['parent', 'commands', 'options'].includes(it)
    )
    const opt: any = {}
    keys.forEach((it) => {
      opt[it] = options[it]
    })
    const start = Date.now()
    console.info(chalk.green(`task '${script.name}' is started`))
    try {
      await script.script(opt)
      console.info(
        chalk.green(
          `task '${script.name}' is finished: ${Date.now() - start} ms`
        )
      )
    } catch (e) {
      console.error(chalk.red(`task '${script.name}' is finished with error: `))
      console.error(e.message)
      process.exit(1)
    }
  })
}

program.parse(process.argv)

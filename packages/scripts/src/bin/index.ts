#!/usr/bin/env node
import program from 'commander'
import chalk from 'chalk'
import compile2Js from '../tasks/compile2Js'
import bundle from '../tasks/bundle'
import compile2Css from '../tasks/compile2Css'
import site from '../tasks/site'
import stylelint from '../tasks/lintStyle'
import lintEs from '../tasks/lintEs';
import getEntryFile from '../utils/getEntryFile';
import getProjectPath from '../utils/getProjectPath';
import { toCamel } from '../utils/stringUtils';

type Command = {
  name: string,
  script: (options: any) => Promise<any>,
  desc: string,
  options?: Array<{
    name: string,
    required?: boolean,
    desc: string,
    bool?: boolean,
    defaultValue?: any,
    handler?: ((arg1: any, arg2: any) => void) | RegExp
  }>
}

const srcDir = 'src'

const siteDir = 'site'

const splitHandler = (value: string) => {
  return value.split(',')
}

const scripts: Command[] = [
  {
    name: 'lint:es',
    script: lintEs,
    desc: 'eslint',
    options: [{
      name: 'fix',
      desc: 'try to fix issues',
      bool: true,
    }, {
      name: 'dirs',
      desc: "base dir to search, split with ',' if multiple dir",
      defaultValue: [srcDir, siteDir],
      handler: splitHandler,
    }, {
      name: 'suffixes',
      desc: "Specify files' suffix to search, split with ',' if multiple suffix",
      defaultValue: ['js', 'jsx', 'ts', 'tsx'],
      handler: splitHandler,
    }]
  },
  {
    name: 'lint:style',
    script: stylelint,
    desc: 'stylelint',
    options: [{
      name: 'fix',
      desc: 'try to fix issues',
      bool: true,
    }, {
      name: 'dirs',
      desc: "base dir to search, split with ',' if multiple dir",
      defaultValue: [siteDir, srcDir],
      handler: splitHandler,
    }, {
      name: 'suffixes',
      desc: "Specify files' suffix to search, split with ',' if multiple suffix",
      defaultValue: ['css', 'sass', 'scss'],
      handler: splitHandler,
    }]
  },
  {
    name: 'compile:style',
    script: compile2Css,
    desc: 'compile style files',
    options: [{
      name: 'dir',
      desc: 'Base directory to search',
      defaultValue: srcDir
    }, {
      name: 'dest',
      desc: 'Destination to compile',
      defaultValue: 'style'
    }, {
      name: 'suffixes',
      desc: "Specify files' suffix to search, split with ',' if multiple suffix",
      defaultValue: ['css', 'scss', 'sass'],
      handler: splitHandler
    }, {
      name: 'no-beautify',
      desc: "Whether if or not beautify compiled files",
      bool: true,
    }, {
      name: 'no-copy',
      desc: "Whether if or not copy source files to destination",
      bool: true,
      defaultValue: true
    }]
  },
  {
    name: 'compile:js',
    script: compile2Js,
    desc: 'Compile script files',
    options: [{
      name: 'dir',
      desc: 'Base directory to search',
      defaultValue: srcDir
    }, {
      name: 'dest',
      desc: 'Destination to compile',
      defaultValue: 'lib'
    }, {
      name: 'suffixes',
      desc: "Specify files' suffix to search, split with ',' if multiple suffix",
      defaultValue: ['ts', 'tsx', 'js', 'jsx'],
      handler: splitHandler
    }, {
      name: 'isEs',
      desc: "Whether if or not compile with ES6 format",
      bool: true,
    }, {
      name: 'tsConfigFile',
      desc: "The path of tsconfig file, you can not care this option if project does not use Typescript",
      defaultValue: 'tsconfig.json'
    }]
  },
  {
    name: 'bundle',
    script: bundle,
    desc: 'bundle source files',
    options: [{
      name: 'src',
      desc: "the source directory",
      defaultValue: srcDir
    }, {
      name: 'dest',
      desc: 'the target directory for bundled files',
      defaultValue: 'dist'
    }, {
      name: 'libraryName',
      desc: 'Specify library name, default is the camel string transformed name in package.json',
      defaultValue: toCamel(require(getProjectPath('package.json')).name, true)
    }, {
      name: 'tsConfigFile',
      desc: "The path of tsconfig file, you can not care this option if project does not use Typescript",
      defaultValue: 'tsconfig.json'
    }]
  }, {
    name: 'site',
    script: site,
    desc: 'run site command',
    options: [{
      name: 'src',
      desc: "The site source directory.",
      defaultValue: siteDir
    }, {
      name: 'dest',
      desc: "The destination derectory for site bundle",
      defaultValue: 'docs'
    }, {
      name: 'dev',
      desc: "The mode for build site, run a server if in deveploment.",
      bool: true,
    }, {
      name: 'demoBoxPath',
      desc: "The path of DemoBox component that is for display example.",
      defaultValue: `${siteDir}/components/demo-box`
    }, {
      name: 'librarySrc',
      desc: "The file path of library.",
      defaultValue: srcDir
    }, {
      name: 'publicPath',
      desc: 'the public path for deploy',
      defaultValue: '/'
    }, {
      name: 'port',
      desc: 'the port for dev server',
      defaultValue: 3000,
      handler: (value: string) => parseInt(value)
    }, {
      name: 'tsConfigFile',
      desc: "The path of tsconfig file, you can not care this option if project does not use Typescript",
      defaultValue: 'tsconfig.json'
    }]
  }
]

program.version(require('../../package.json').version)

for (let script of scripts) {
  let exec = program.command(script.name).description(script.desc || '')
  for (const option of script.options || []) {
    let optionStr = `--${option.name}`
    if (!option.bool) {
      optionStr += option.required ? ` <${option.name}>` : ` [${option.name}]`
    }
    if (option.handler) {
      exec.option(optionStr, option.desc, option.handler, option.defaultValue);
    } else {
      exec.option(optionStr, option.desc, option.defaultValue);
    }
  }
  exec.action(async function (options) {
    const keys = Object.keys(options).filter(it => !it.startsWith('_') && !['parent', 'commands', 'options'].includes(it))
    const opt: any = {}
    keys.forEach(it => {
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
      console.error(e.toString())
      process.exit(1)
    }
  })
}

program.parse(process.argv)

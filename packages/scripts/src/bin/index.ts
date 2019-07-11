#!/usr/bin/env node

import program from 'commander'
import chalk from 'chalk'
import lint from '../tasks/lint'
import compile2es from '../tasks/compile2es'
import compile2lib from '../tasks/compile2lib'
import bundle from "../tasks/bundle";

const scripts = [{
  name: 'lint',
  script: lint,
  desc: 'Lint style'
}, {
  name: 'compile:es',
  script: compile2es,
  desc: 'Compile code to es style'
}, {
  name: 'compile:lib',
  script: compile2lib,
  desc: 'Compile code to normal lib style'
}, {
  name: 'compile',
  script: () => Promise.all([compile2es(), compile2lib()]),
  desc: 'run both commands \'compile:es\' and \'compile:lib\''
}, {
  name: 'bundle',
  script: bundle,
  options: [{
    name: 'libraryName',
    required: false,
    desc: 'Specify library name, default name in package.json'
  }, {
    name: 'entry',
    required: false,
    desc: 'Specify entry name, default searching index in src root directory'
  }, {
    name: 'style',
    required: false,
    desc: 'Specify style entry name, default searching index in src/style root directory'
  }]
}]

program
  .version(require('../../package.json').version)

for (let script of scripts) {
  let exec = program
    .command(script.name)
    .description(script.desc || '')
  for (const option of (script.options || [])) {
    exec = exec.option(`--${option.name} ${option.required ? `<${option.name}>` : `[${option.name}]`}`)
      .description(option.desc || '')
  }
  exec.action(async function (options) {
    const start = Date.now()
    console.log(chalk.green(`task '${script.name}' is started`))
    try {
      await script.script(options)
      console.log(chalk.green(`task '${script.name}' is finished: ${Date.now() - start} ms`))
    } catch (e) {
      console.error(chalk.red(`task '${script.name}' is finished with error:`))
      console.error(e)
    }
  })
}

program.parse(process.argv)

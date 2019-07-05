#!/usr/bin/env node

import program from 'commander'
import chalk from 'chalk'
import lint from '../tasks/lint'
import compile from '../tasks/compile'

const scripts = [{
  name: 'lint',
  script: lint
}, {
  name: 'compile',
  script: compile
}]

program
  .version(require('../../package.json').version)

for (let script of scripts) {
  program
    .command(script.name)
    .action(async function () {
      const start = Date.now()
      console.log(chalk.green(`task '${script.name}' is started`))
      try{
        await script.script()
        console.log(chalk.green(`task '${script.name}' is finished: ${Date.now() - start} ms`))
      }catch (e) {
        console.error(chalk.red(`task '${script.name}' is finished with error:`))
        console.error(e)
      }
    })
}

program.parse(process.argv)

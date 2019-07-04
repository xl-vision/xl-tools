#!/usr/bin/env node

const program = require('commander')
const chalk = require('chalk')
const pkg = require('../package.json')
const lint = require('../tasks/lint')
const build = require('../tasks/build')

const scripts = [{
  name: 'lint',
  script: lint
}, {
  name: 'build',
  script: build
}]

program
  .version(pkg.version)

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

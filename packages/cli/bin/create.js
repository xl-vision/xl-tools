#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const home = require('user-home')
const inquirer = require('inquirer')
const ora = require('ora')
const logger = require('../lib/logger')

program
  .usage('<template-name> [project-name]')

program.on('--help', () => {
  console.log('  Examples:')
  console.log()
  console.log(chalk.gray('    # create a new project with an official template'))
  console.log('    $ vue init typescript my-project')
  console.log()
  console.log(chalk.gray('    # create a new project straight from a github template'))
  console.log('    $ vue init username/repo my-project')
  console.log()
})

function help () {
  program.parse(process.argv)
  if (program.args.length < 1) return program.help()
}
help()

const template = program.args[0]
const isOfficial = template.indexOf('/') === -1
const location = program.args[1]
const inPlace = !location || location === '.'

const projectName = inPlace ? path.relative('../', process.cwd()) : location
const dir = path.resolve(location || '.')

const tmp = path.join(home, '.xl-tools', template.replace(/[\/]/g, '-'))

console.log()
process.on('exit', () => {
  console.log()
})

if (inPlace || exists(dir)) {
  inquirer.prompt([{
    type: 'confirm',
    message: inPlace
      ? 'Generate project in current directory?'
      : 'Target directory exists. Continue?',
    name: 'ok'
  }]).then(answers => {
    if (answers.ok) {
      run()
    }
  }).catch(logger.fatal)
} else {
  run()
}


function run () {
  checkVersion(() => {
    if (isOfficial) {
      // use official templates
      const officialTemplate = 'xl-vision/' + template
      downloadAndGenerate(officialTemplate)
    } else {
      downloadAndGenerate(template)
    }
  })
}

function downloadAndGenerate (template) {
  const spinner = ora('downloading template')
  spinner.start()
  // Remove if local template exists
  if (exists(tmp)) rm(tmp)
  download(template, tmp, { clone }, err => {
    spinner.stop()
    if (err) logger.fatal('Failed to download repo ' + template + ': ' + err.message.trim())
    generate(name, tmp, to, err => {
      if (err) logger.fatal(err)
      console.log()
      logger.success('Generated "%s".', name)
    })
  })
}
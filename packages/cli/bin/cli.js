#!/usr/bin/env node

const program = require('commander')
const create = require('../scripts/create')

program
.version(require('../package').version)
  .usage('<command> [options]')
  
program
  .command('create <dir>', 'generate a new project from template')
  .action(function (dir) {
    create(dir)
  })

program.parse(process.argv)

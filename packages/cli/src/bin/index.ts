#!/usr/bin/env node

import program from 'commander'

import create from '../tasks/create'

program
  .version(require('../../package').version)
  .usage('<command> [options]')

program
  .command('create <dir>')
  .description('generate a new project from template')
  .action((dir) => {
    create(dir)
  })

program.parse(process.argv)

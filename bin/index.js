#!/usr/bin/env node

const program = require('commander')
const gulp = require('gulp')
const pkg = require('../package.json')
require('../lib/task')
const syncTask = require('./sync-task')

syncTask(gulp)

program
  .version(pkg.version)
  .command('run <name>')
  .action(function (name) {
    try {
      const task = gulp.series(name)
      task(err => {
        if (err) {
          console.error(err)
          process.exit(1)
        }
      })
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  })

program.parse(process.argv)

const program = require('commander')
const chalk = require('chalk')
const gulp = require('gulp')
const pkg = require('../package.json')
require('../lib/task')

program
    .version(pkg.version)
    .command('run [name]', 'run specified task')
    .action(name => {
        const task = gulp.task(name)
        if(!task){
            console.error(chalk.red(`The task '${name}' that you try to run is not found`))
            process.exit(1)
        }
        task.apply(gulp)
    })
    .parse(process.argv)


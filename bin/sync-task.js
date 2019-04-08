const chalk = require('chalk')

const tasks = {}

function warn () {
  var taskKeys = Object.keys(tasks)

  if (!taskKeys.length) {
    return
  }

  var taskNames = taskKeys.map(function (key) {
    return tasks[key].name
  }).join(', ')

  process.exitCode = 1

  console.warn(
    chalk.red('The following tasks did not complete:'),
    chalk.cyan(taskNames)
  )
  console.warn(
    chalk.red('Did you forget to signal async completion?')
  )
}

function start (e) {
  const name = e.name
  tasks[e.uid] = {
    name,
    time: e.time
  }
  console.info(chalk.green(`Task '${name}' is started`))
}

function clear (e) {
  const duration = e.time - tasks[e.uid].time
  const name = tasks[e.uid].name
  console.info(chalk.green(`Task '${name}' is stopped with ${duration}ms`))
  delete tasks[e.uid]
}

function logSyncTask (gulpInst) {
  process.once('exit', warn)
  gulpInst.on('start', start)
  gulpInst.on('stop', clear)
  gulpInst.on('error', clear)
}

module.exports = logSyncTask

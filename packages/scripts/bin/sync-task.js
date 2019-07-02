const chalk = require('chalk')

const tasks = []

function warn () {
  var taskKeys = Object.keys(tasks)

  if (!taskKeys.length) {
    return
  }

  var taskNames = taskKeys.map(function (key) {
    return tasks[key]
  }).join(', ')

  process.exitCode = 1

  console.warn(
    chalk.yellow('The following tasks did not complete:'),
    chalk.cyan(taskNames)
  )
  console.warn(
    chalk.yellow('Did you forget to signal async completion?')
  )
}

function start (e) {
  const name = e.name
  tasks[e.uid] = name
  console.info(chalk.green(`Task '${name}' is started.`))
}

function clear (e) {
  const duration = e.duration[0]
  const name = e.name
  const uid = e.uid
  const error = e.error
  if (error) {
    console.error(chalk.red(`Task '${name}' is stopped with error:'`))
    console.error(chalk.red(error.message))
    process.exit(1)
  }
  console.info(chalk.green(`Task '${name}' is completed with ${duration}ms.`))
  delete tasks[uid]
}

function logSyncTask (gulpInst) {
  process.once('exit', warn)
  gulpInst.on('start', start)
  gulpInst.on('stop', clear)
  gulpInst.on('error', clear)
}

module.exports = logSyncTask
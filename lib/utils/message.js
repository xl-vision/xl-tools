const chalk = require('chalk')

const error = str => console.error(chalk.bold.red(str))

const warn = str => console.warn(chalk.keyword(str))

const info = str => console.info(str)

const success = str => console.log(chalk.green(str))

module.exports = {
    error,
    warn,
    info,
    success
}
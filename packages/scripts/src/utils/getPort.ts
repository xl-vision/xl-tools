import inquirer from 'inquirer'
import detect from 'detect-port-alt'
import chalk from 'chalk'

export default async (host: string, defaultPort: number) => {
  try {
    const port = await detect(defaultPort, host)
    if (defaultPort === port) {
      return port
    }

    const answer = await inquirer.prompt({
      type: 'confirm',
      name: 'shouldChangePort',
      message: `The port: ${defaultPort} has been occupied.\nWould you like to run server on another port instead?`,
      default: true
    })

    if (answer.shouldChangePort) {
      return port
    } else {
      return null
    }
  } catch (err) {
    throw new Error(
      chalk.red(`Could not find an open port at ${chalk.bold(host)}.`) +
      '\n' +
      ('Network error message: ' + err.message || err) +
      '\n'
    )
  }
}
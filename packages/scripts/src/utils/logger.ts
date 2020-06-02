import chalk from 'chalk'
export const error = (msg: string) => {
  console.error(chalk.red(msg))
  throw new Error(msg)
}

export const warn = (msg: string) => {
  console.warn(chalk.yellow(msg))
}

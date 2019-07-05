import request  from 'request-promise-native'
import registries from './registries'
import inquirer from 'inquirer'
import chalk from 'chalk'

const ping = async (uri: string) => {
  const reqOpts = {
    method: 'GET',
    timeout: 30000,
    resolveWithFullResponse: true,
    json: true,
    uri: `${uri}/@xl-vision/xl-tools-scripts`
  }

  await request(reqOpts)
  return uri
}

export default async () => {
  let faster: string
  try {
    faster = await Promise.race([
      ping(registries.npm),
      ping(registries.taobao)
    ])
  }catch (e) {
    return false
  }
  if(faster !== registries.taobao) {
    return false
  }

  // ask and save preference
  const { useTaobaoRegistry } = await inquirer.prompt([
    {
      name: 'useTaobaoRegistry',
      type: 'confirm',
      message: chalk.yellow(
        ` Your connection to the default npm registry seems to be slow.\n` +
        `   Use ${chalk.cyan(registries.taobao)} for faster installation?`
      )
    }
  ])
  return useTaobaoRegistry
}

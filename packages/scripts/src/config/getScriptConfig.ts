import { warn } from './../utils/logger'
import { cosmiconfigSync } from 'cosmiconfig'
import getProjectPath from '../utils/getProjectPath'

export type Command = {
  name: string
  script: (options: any) => Promise<any>
  desc: string
  options?: Array<{
    name: string
    required?: boolean
    desc: string
    isBool?: boolean
    defaultValue?: any
    handler?: (value: string, previous?: any) => any
  }>
}

export type Options = {
  [name: string]: any
}

export type Script = {
  name: string
  options?: Options
}

export type Config = {
  name: string
  desc?: string
  scripts: Script | Array<Script>
}

export default (baseCommands: Array<Command>) => {
  const dir = getProjectPath('')
  const result = cosmiconfigSync('script').search(dir)

  let conf: any

  if (!result) {
    conf = []
  } else {
    const config = result.config
    if (typeof config === 'function') {
      conf = config()
    } else {
      conf = config
    }
  }

  const config = (Array.isArray(conf) ? conf : [conf]) as Array<Config>

  const commands = baseCommands.filter((it) => true)

  for (const command of config) {
    const name = command.name
    const desc = command.desc || ''
    const scripts = Array.isArray(command.scripts)
      ? command.scripts
      : [command.scripts]

    const fns: Array<() => Promise<void>> = []

    for (const script of scripts) {
      const sName = script.name
      const sOptions = script.options

      const targetScripts = baseCommands.filter((it) => it.name === sName)

      if (targetScripts.length === 0) {
        warn(
          `The target script '${sName}' in configuration file is not built-in script, please make sure you are configure it correctly.`
        )
        continue
      }

      const targetScript = targetScripts[0]

      const targetDefaultOptions: Options = {}

      for (const option of targetScript.options || []) {
        if (option.isBool) {
          if (option.name.startsWith('no-')) {
            targetDefaultOptions[option.name.substring(3)] = true
          } else {
            targetDefaultOptions[option.name] = false
          }
        } else {
          targetDefaultOptions[option.name] = option.defaultValue

          // 如果输入值是字符串，尝试用handler处理
          const sOption = sOptions ? sOptions[option.name] : undefined
          if (typeof sOption === 'string' && option.handler) {
            sOptions![option.name] = option.handler(sOption)
          }
        }
      }
      const options = { ...targetDefaultOptions, ...sOptions }

      const fn = () => targetScript.script(options)
      fns.push(fn)
    }

    const script = () => Promise.all(fns.map((it) => it()))

    commands.push({
      name,
      desc,
      script,
    })
  }

  return commands
}

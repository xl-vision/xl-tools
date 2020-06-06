import { warn, error } from './../utils/logger'
import { cosmiconfigSync } from 'cosmiconfig'
import getProjectPath from '../utils/getProjectPath'

export interface Command {
  name: string
  desc: string
  script: (options: any) => Promise<any>
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

export type RootTask = {
  name: string
  desc?: string
  tasks: Task | Array<Task>
}

export type Task = {
  name: string
  options?: Options
}

export default (baseCommands: Array<Command>) => {
  const dir = getProjectPath('')
  const result = cosmiconfigSync('xl-script').search(dir)

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

  const tasks = (Array.isArray(conf) ? conf : [conf]) as Array<RootTask>

  const resultMap = new Map<string, Command>()
  const initmap = new Map<string, RootTask>()

  const circleMap = new Map<string, Task>()

  for (const command of baseCommands) {
    resultMap.set(command.name, command)
  }

  for (const task of tasks) {
    initmap.set(task.name, task)
  }

  const buildCommand = (name: string) => {
    if (circleMap.has(name)) {
      return error(`The task '${name}' has circular dependence.`)
    }

    const command = resultMap.get(name)

    if (command) {
      return command
    }

    const task = initmap.get(name)

    if (!task) {
      return error(`The task '${name}' does not exist.`)
    }

    // 循环依赖标记
    circleMap.set(name, task)

    const dependenceTasks = Array.isArray(task.tasks)
      ? task.tasks
      : [task.tasks]

    const fns: Array<() => Promise<any>> = []

    for (const dependenceTask of dependenceTasks) {
      const options: Options = dependenceTask.options || {}

      const defaultOptions: Options = {}

      const dependenceCommand = buildCommand(dependenceTask.name) as Command

      for (const commandOption of dependenceCommand.options || []) {
        if (commandOption.isBool) {
          if (commandOption.name.startsWith('no-')) {
            defaultOptions[commandOption.name.substring(3)] = true
          } else {
            defaultOptions[commandOption.name] = false
          }
        } else {
          defaultOptions[commandOption.name] = commandOption.defaultValue
          // 如果输入值是字符串，尝试用handler处理
          const option = options[commandOption.name]
          if (typeof option === 'string' && commandOption.handler) {
            options[commandOption.name] = commandOption.handler(option)
          }
        }
      }

      const mergeOptions = { ...defaultOptions, ...options }

      const fn = () => dependenceCommand.script(mergeOptions)

      fns.push(fn)
    }

    const taskFn = () => Promise.all(fns.map((it) => it()))

    const newCommand: Command = {
      name: task.name,
      desc: task.desc || '',
      script: taskFn,
    }

    resultMap.set(name, newCommand)

    // 取消循环依赖标记
    circleMap.delete(name)

    return newCommand
  }

  for (const taskName of initmap.keys()) {
    buildCommand(taskName)
  }

  return resultMap.values()
}

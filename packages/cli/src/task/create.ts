import fs from 'fs-extra'
import chalk from 'chalk'
import path from 'path'
import inquirer from 'inquirer'
import writeTpl from '../utils/writeTpl'

const questions: inquirer.Questions<{
  desc: string
  script: 'Typescript'
  style: 'scss'
}> = [{
  name: 'desc',
  type: 'input',
  message: '请输入项目描述',
  default: 'library for react'
},{
  name: 'script',
  type: 'list',
  message: '请选择语言',
  choices: ['Typescript'],
  // choices: ['Typescript', 'Javascript'],
  default: 'Typescript'
}, {
  name: 'style',
  type: 'list',
  message: '请选择样式语言',
  choices: ['scss'],
  // choices: ['scss', 'sass', 'less', 'stylus', 'css'],
  default: 'scss'
}]

export default (dir: string) => {
  const projectPath = path.join(process.cwd(), dir)
  const name = path.basename(projectPath)

  // 判断文件夹是否存在
  if (fs.existsSync(projectPath)) {
    console.log()
    console.error(chalk.red(`The directory '${projectPath}' exists, please provide a name not to be used`))
    console.log()
    process.exit(1)
  }

  inquirer.prompt(questions).then((answers) => {
    const script = answers.script
    const style = answers.style
    const desc = answers.desc

    const data = {
      script, style, name, desc
    }

    writeTpl(data, '../template/common', projectPath)

  })
}

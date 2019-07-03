const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')
const inquirer = require('inquirer')

module.exports = function (dir) {
  const projectPath = path.join(process.cwd(), dir)
  // const projectName = path.basename(projectPath)

  // 判断文件夹是否存在
  if(fs.existsSync(projectPath)) {
    console.log()
    console.error(chalk.red(`The directory '${projectPath}' exists, please provide a name not to be used`))
    console.log()
    process.exit(1)
  }

  inquirer.prompt([{
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
  }]).then(function (answers){
    const script = answers.script
    const style = answers.style

    // 拷贝template/typescript
    fs.copySync('../template/typescript', projectPath)
  })
}

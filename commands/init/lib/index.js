'use strict';

const inquirer = require('inquirer')
const semver = require('semver')
const fse = require('fs-extra')
const path = require('path')
const fs = require('fs')

const Command = require('@zheye-cli-dev/command')
const { spinnerStart } = require('@zheye-cli-dev/utils')
const userHome = require('user-home')
const Package = require('@zheye-cli-dev/package')
const log = require('@zheye-cli-dev/log')
const getProjectTemplate = require('./getProjectTemplate')


const TYPE_PROJECT = 'project'
const TYPE_COMPONENT = 'component'

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ''
    this.force = !!this._argv[1].force
    log.verbose("ProjectName:", this.projectName)
    log.verbose("force:", this.force)
  }

  async exec() {
    // 1.准备阶段

    try {
      const projectInfo = await this.prepare()
      if (projectInfo) {
        log.verbose('projectInfo', projectInfo)
        this.projectInfo = projectInfo
        // 2.下载模板
        // 3.安装模板
      }
    } catch (e) {
      log.error(e)
    }
    await this.downloadTemplate()
  }

  async prepare() {
    // 0.判断模板是否为空
    const template = await getProjectTemplate()
    if( !template || template.length === 0) {
      throw new Error('项目模板不存在')
    }
    this.template = template

    // 1.判断当前目录是否为空
    const localPath = process.cwd()
    if (!this.isDirEmpty(localPath)) {
      // 如果不为空
      let ifContinue = false
      if (!this.force) {
        // 1.1询问是否继续创建
        ifContinue = (await inquirer.prompt({
          type: 'confirm',
          name: 'ifContinue',
          message: '当前目录不为空，是否继续创建项目？',
          default: false
        })).ifContinue
        if (!ifContinue) {
          return
        }
      }
      if (ifContinue || this.force) {
        const { confirmEmpty } = await inquirer.prompt({
          type: 'confirm',
          name: 'confirmEmpty',
          message: '是否确认清空当前目录下的文件？',
          default: false
        })
        if (confirmEmpty) {
          fse.emptyDirSync(localPath)
        }
      }
    }
    return this.getProjectInfo()
  }

  async getProjectInfo() {
    const { type } = await (inquirer.prompt({
      type: 'list',
      name: 'type',
      message: '请选择初始化类型：',
      default: TYPE_PROJECT,
      choices: [{
        name: '项目',
        value: TYPE_PROJECT
      }, {
        name: '组件',
        value: TYPE_COMPONENT
      }
      ]
    }))
    let project
    if (type === TYPE_PROJECT) {
      project = await inquirer.prompt([{
        type: 'input',
        name: 'projectName',
        message: '请输入项目名称：',
        default: '',
        validate: function (v) {
          const done = this.async()
          setTimeout(() => {
            if(!(/^[a-zA-Z]+([-][a-zA-Z0-9]+|[_][a-zA-Z0-9]+|[a-zA-Z0-9])*$/.test(v))){
              done('请输入合法的项目名称')
              return
            }
            done(null, true)
          }, 0);
        },
        filter: function (v) {
          return v
        }
      }, {
        type: 'input',
        name: 'projectVersion',
        message: '请输入项目版本号：',
        default: '1.0.0',
        validate: function (v) {
          const done = this.async()
          setTimeout(()=> {
            if(!(!!semver.valid(v))){
              done('请输入合法的版本号')
              return
            }
            done(null, true)
          }, 0)
        },
        filter: function (v) {
          if(!!semver.valid(v)){
            return semver.valid(v)
          }else {
            return v
          }
        }
      }, {
        type: 'list',
        name: 'projectTemplate',
        message: '请选择项目模板',
        choices: this.createTemplateChoice()
      }])
    } else if (type === TYPE_COMPONENT) {
      console.log('创建组件')
    }

    return {
      type,
      ...project
    }
  }

  async downloadTemplate() {
    const { projectTemplate } = this.projectInfo
    const templateInfo = this.template.find(item => item.npmName === projectTemplate)
    // console.log(templateInfo)
    const targetPath = path.resolve(userHome, '.zheye-cli-dev', 'template')
    const storeDir = path.resolve(userHome, '.zheye-cli-dev', 'template', 'node_modules')
    const { npmName, version } = templateInfo
    const templateNpm = new Package({
      targetPath,
      storeDir,
      packageName: npmName,
      packageVersion: version
    })
    if( ! await templateNpm.exists()) {
      const spinner = spinnerStart()
      await templateNpm.install()
      await new Promise(resolve => setTimeout(resolve, 1000))
      spinner.stop(true)
    } else {
      await templateNpm.update()
    }
  }

  createTemplateChoice () {
    return this.template.map(item => ({
      value: item.npmName,
      name: item.name
    }))
  }

  isDirEmpty(localPath) {
    // 1.1实际开发中还会对文件进行过滤，因为有某些文件不影响代码的执行，例如.git,node_modules
    let fileList = fs.readdirSync(localPath)
    // 过滤掉.开头的和node_modules
    fileList = fileList.filter(file => (
      !file.startsWith('.') && ['node_modules'].indexOf(file) < 0
    ))
    return !fileList || fileList.length <= 0
  }
}

function init(argv) {
  // TODO
  // console.log('projectName:', projectName)
  // console.log('cmdObj', cmdObj.force)
  // console.log('init', projectName, cmdObj.force, process.env.CLI_TARGET_PATH)
  return new InitCommand(argv)
}

module.exports = init

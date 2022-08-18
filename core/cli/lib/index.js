module.exports = core;

const path = require('path')
const semver = require('semver')
const colors = require('colors/safe')
const constant = require('./constant')
const commander = require('commander')
const pkg = require('../package.json')
const exec = require('@zheye-cli-dev/exec')
const log = require('@zheye-cli-dev/log');
const pathExists = require('path-exists');
let argv

const userHome = process.env.HOME || process.env.USERPROFILE

const { program } = commander

async function core() {
  try {
    await prepare()
    registryCommand()
  } catch (e) {
    log.error('cli', colors.red(e.message))
    if (program.opts()['debug']) {
      console.log(e)
    }
  }
}

async function prepare() {
  checkPkgVersion()
  checkRoot()
  checkUserHome()
  checkEnv()
  checkGlobalUpdate()
}

function registryCommand() {
  program
    .name(Object.keys(pkg.bin)[0])
    .usage('<command> [options]')
    .version(pkg.version)
    .option('-d, --debug', '是否开启调试模式', false)
    .option('-tp, --targetPath <targetPath>', '是否指定本地调试文件路径', '')

  program
    .command('init [projectName]')
    .option('-f, --force', '是否强制初始化项目')
    .action(exec)

  // 测试安装指令
  program
    .command('install')
    .action(() => {e
      log.info(' run install command')
    })

  // 监听地址
  program
    .on('option:targetPath', () => {
      process.env.CLI_TARGET_PATH = program.opts()['targetPath']
    })

  //  监听debug模式
  program
    .on('option:debug', () => {

      if(program.opts()['debug']){
        process.env.LOG_LEVEL = 'verbose'
        log.level = process.env.LOG_LEVEL
      }
      log.verbose(colors.red('test debug'))
    })

  //  监听任意指令
  program
    .on('command:*', (obj) => {
      // console.log(program.commands[0].name())
      const availableCommands = program.commands.map((cmd) => cmd.name())
      log.error('未知的命令: ' + obj[0])
      log.info('可用的命令有: ')
      log.info(colors.green(availableCommands.join(',')))
    })
  
  program.parse(process.argv)


}

function createDefaultConfig () {
  const cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome
}

async function checkGlobalUpdate() {
  //  1.获取最新版本号和模块名
  const currentVersion = pkg.version
  const npmName = pkg.name
  //  2.调用npmAPI，获取所有版本号
  const { getNpmSemverVersion } = require('@zheye-cli-dev/get-npm-info')
  const latestVersion = await getNpmSemverVersion(currentVersion, npmName)
  //  3.提取所有版本号，比对哪些版本号大于当前版本号
  //  4.获取最新版本号，提示用户更新到最新的版本号
  if (latestVersion && semver.gt(latestVersion, currentVersion)) {
    log.warn(colors.yellow(`请手动更新 ${npmName}，当前版本：${currentVersion}，最新版本：${latestVersion}
            更新命令：npm install -g ${npmName}
        `))
  }
}

function checkEnv() {
  const dotenv = require('dotenv') 
  const dotenvPath = path.resolve(userHome, '.env')
  if (pathExists(dotenvPath)) {
    dotenv.config({
      path: dotenvPath
    })
  }
  createDefaultConfig()
}


function checkUserHome() {
  const home = require('os').homedir
  const pathExists = require('path-exists')
  if (!home || !pathExists(home)) {
    throw Error('当前登录用户主目录不存在')
  }
}

function checkRoot() {
  const rootCheck = require('root-check')
  rootCheck()
  //  如果是0则是root用户
  // console.log(process.geteuid())

}


function checkPkgVersion() {
  log.info('cli', pkg.version)
}


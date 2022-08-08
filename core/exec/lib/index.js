'use strict';

const log = require('@zheye-cli-dev/log')
const Package = require('@zheye-cli-dev/package')
const path = require('path')
let pkg
const SETTINGS = {
  init: '@imooc-cli/init'
}

const CACHE_DIR = 'dependencies'

async function exec() {
  let targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  let storeDir = ''
  log.verbose('targetPath', targetPath)
  log.verbose('homePath', homePath)
  // console.log(arguments)

  const cmdObj = arguments[arguments.length - 1]
  const cmdName = cmdObj.name()
  const packageName = SETTINGS[cmdName]
  const packageVersion = 'latest'
  console.log(packageName, packageVersion)
  if(!targetPath) {
    targetPath = path.resolve(homePath, CACHE_DIR)
    storeDir = path.resolve(targetPath, 'node_modules')
    log.verbose('targetPath', targetPath)
    log.verbose('storeDir', storeDir)
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion
    })
    if (pkg.exists()) {
      //  更新package
    } else {
      //  安装package
      await pkg.install()
    }
  } else {
    pkg = new Package({
      targetPath,
      storeDir,
      packageName,
      packageVersion
    })
  }
  const rootFile = pkg.getRootFilePath()
  // console.log('arguments', arguments)
  require(rootFile).apply(null, arguments)
}

module.exports = exec;
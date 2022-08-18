'use strict';

const LOW_NODE_VERSION = '16.0.0'
const semver = require('semver')
const colors = require('colors/safe')
const log = require("@zheye-cli-dev/log")
const { isObject } = require("@zheye-cli-dev/utils")


class Command {
  constructor(argv) {
    // console.log('command constructor', argv)
    //  一般将内置属性前面加下划线
    if (!argv) {
      throw new Error('参数不能为空')
    }
    if (!Array.isArray(argv)) {
      throw new Error('参数必须为数组')
    }
    if (argv.length < 1) {
      throw new Error('参数列表不能为空')
    }

    this._argv = argv
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain.then(() => this.checkNodeVersion())
      chain = chain.then(() => this.initArgs())
      chain = chain.then(() => this.init())
      chain = chain.then(() => this.exec())
      chain.catch((err) => {
        log.error(err.message)
      })
    })
  }

  checkNodeVersion() {
    //  第一步，获取当前node版本
    const currentNodeVersion = process.version
    //  第二步，对比最低版本
    if (!semver.gt(currentNodeVersion, LOW_NODE_VERSION)) {
      throw Error(colors.red(`zheye-cli需要安装v${LOW_NODE_VERSION}以上版本的Node.js`))
    }
  }

  initArgs() {
    this._cmd = this._argv[this._argv.length - 1]
    this._argv = this._argv.slice(0, this._argv.length - 1)
    // console.log(this._cmd, this._argv)
  }

  init() {
    throw new Error('init必须实现')
  }

  exec() {
    throw new Error('exec必须实现')
  }
}

module.exports = Command;
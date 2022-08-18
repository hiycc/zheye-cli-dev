'use strict';

const LOW_NODE_VERSION = '18.0.0'
const semver = require('semver')
const colors = require('colors/safe')

class Command {
  constructor(argv) {
    // console.log('command constructor', argv)
    //  一般将内置属性前面加下划线
    this._argv = argv
    let runner = new Promise((resolve, reject) => {
      let chain = Promise.resolve()
      chain = chain.then(() => this.checkNodeVersion())
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

  init() {
    throw new Error('init必须实现')
  }

  exec() {
    throw new Error('exec必须实现')
  }
}

module.exports = Command;
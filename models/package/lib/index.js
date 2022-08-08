'use strict';
const path = require('path')
const pkgDir = require('pkg-dir').sync
const npminstall = require('npminstall')
const { isObject } = require('@zheye-cli-dev/utils')
const formatPath = require('@zheye-cli-dev/format-path')
const { getDefaultRegistry } = require('@zheye-cli-dev/get-npm-info')

class Package {
  constructor(options) {
    if (!options) {
      throw new Error('Package类的options参数不能为空')
    } else if (!isObject(options)) {
      throw new Error('Packages类的options参数必须为对象！')
    }
    //  package路径
    this.targetPath = options.targetPath
    //  缓存Package的路径
    this.storePath = options.storeDir
    //  package的name
    this.packageName = options.packageName
    //  packageVersion
    this.packageVersion = options.packageVersion
  }

  //  判断当前Package是否存在
  exists() {

  }

  //  安装Package
  install() {
    console.log(this.packageName, this.packageVersion)
    return npminstall({
      root: this.targetPath,
      storeDir: this.storePath,
      registry: getDefaultRegistry(),
      pkgs: [
        { name: this.packageName, version: this.packageVersion }
      ]
    })

  }

  //  更新Package
  update() {

  }
  //  获取入口文件的路径
  getRootFilePath() {
    // 1.获取package.json的路径
    const dir = pkgDir(this.targetPath)
    // console.log(dir)
    if (dir) {
      // 2.读取package.json
      const pkgFile = require(path.resolve(dir, 'package.json'))
      // console.log(pkgFile)
      // 3.寻找main/lib
      if (pkgFile && pkgFile.main) {
        // 4.路径的兼容性处理（macOS/Windows）
        return formatPath(path.resolve(dir, pkgFile.main))
      }
    }
    return null
  }
}

module.exports = Package;
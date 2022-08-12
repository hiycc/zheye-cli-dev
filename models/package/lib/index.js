'use strict';
const path = require('path')
const pkgDir = require('pkg-dir').sync
const pathExists = require('path-exists').sync
const fse = require('fs-extra')
const npminstall = require('npminstall')
const { isObject } = require('@zheye-cli-dev/utils')
const formatPath = require('@zheye-cli-dev/format-path')
const { getDefaultRegistry, getNpmLatestVersion } = require('@zheye-cli-dev/get-npm-info')

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
    this.storeDir = options.storeDir
    //  package的name
    this.packageName = options.packageName
    //  packageVersion
    this.packageVersion = options.packageVersion
    //  缓存路径包前缀
    this.cacheFilePathPrefix = options.packageName.replace('/','_')
  }

  async prepare () {
    //  将latest转换成具体的version

    //  先判断字符串再判断文件夹是否存在
    if (this.storeDir && !pathExists(this.storeDir)) {
      fse.mkdirpSync(this.storeDir)
    }

    if (this.packageVersion === 'latest') {
      this.packageVersion = await getNpmLatestVersion(this.packageName)
    }
    // _@imooc-cli_init@1.1.2@@imooc-cli/
    // @imooc-cli_init 1.1.2
  }

  get cacheFilePath() {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${this.packageVersion}@${this.packageName}`)
  }

  getSpecificCacheFilePath(packageVersion) {
    return path.resolve(this.storeDir, `_${this.cacheFilePathPrefix}@${packageVersion}@${this.packageName}`)
  }

  //  判断当前Package是否存在
  async exists() {
     // 判断缓存路径是否存在
    if(this.storeDir) {
      await this.prepare()
      return pathExists(this.cacheFilePath)
    } else {
      return pathExists(this.targetPath)
    }
  }

  //  安装Package
  async install() {
    await this.prepare()
    return npminstall({
      root: this.targetPath,
      storeDir: this.storeDir,
      registry: getDefaultRegistry(),
      pkgs: [
        { name: this.packageName, version: this.packageVersion }
      ]
    })

  }

  //  更新Package
  async update() {
    await this.prepare()
    //1.获取最新的npm模块版本号
    const latestPackageVersion = await getNpmLatestVersion(this.packageName)
    //2.查询最新版本号路径是否存在
    const latestFilePath = this.getSpecificCacheFilePath(latestPackageVersion)
    if(!pathExists(latestFilePath)) {
      //3.如果不存在则直接安装最新版本
      await npminstall({
        root: this.targetPath,
        storeDir: this.storeDir,
        registry: getDefaultRegistry(),
        pkgs: [
          { name: this.packageName, version: latestPackageVersion}
        ]
      })
      this.packageVersion = latestPackageVersion
    }
  }
  //  获取入口文件的路径
  getRootFilePath() {
    function _getRootFile(targetPath) {
      // 1.获取package.json的路径
      const dir = pkgDir(targetPath)
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
    if (this.storeDir) {
      // 使用缓存
      return _getRootFile(this.cacheFilePath)
    } else {
      // 不使用缓存
      return _getRootFile(this.targetPath)
    }
  }
}

module.exports = Package;
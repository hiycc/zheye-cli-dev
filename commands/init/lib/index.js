'use strict';

const Command = require('@zheye-cli-dev/command')
const log = require('@zheye-cli-dev/log')

class InitCommand extends Command {
  init() {
    this.projectName = this._argv[0] || ''
    this.force = !!this._cmd.force
    log.verbose("ProjectName:", this.projectName)
    log.verbose("force:", this.force)
  }
  
  exec() {
    console.log('init的业务逻辑')
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

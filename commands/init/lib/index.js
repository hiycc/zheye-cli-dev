'use strict';

const Command = require('@zheye-cli-dev/command')

class InitCommand extends Command {
    
}

function init(argv) {
    // TODO
    // console.log('projectName:', projectName)
    // console.log('cmdObj', cmdObj.force)
    // console.log('init', projectName, cmdObj.force, process.env.CLI_TARGET_PATH)
    return new InitCommand(argv)
}

module.exports = init

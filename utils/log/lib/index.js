'use strict';



const log = require('npmlog')

log.level = process.env.LOG_LEVEL? process.env.LOG_LEVEL : 'info'   //判断debug模式

log.heading = 'zheye'   //修改前缀
log.addLevel('success', 2000, { fg: 'green', bold: true })  //添加自定义命令

function index() {
    // TODO
    // log.info('cli', 'test')
}
module.exports = log;
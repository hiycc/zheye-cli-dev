const request = require('@zheye-cli-dev/request')

module.exports = function() {
  return request({
    url: '/project/template'
  })
}
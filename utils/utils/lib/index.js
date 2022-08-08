'use strict';

function isObject(o) {
    // TODO
    return Object.prototype.toString.call(o) === '[object Object]'
}

module.exports = {
    isObject
};

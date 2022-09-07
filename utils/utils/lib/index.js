'use strict';

function isObject(o) {
    // TODO
    return Object.prototype.toString.call(o) === '[object Object]'
}

function spinnerStart() {
    const Spinner = require('cli-spinner').Spinner

    const spinner = new Spinner('loading... %s')
    spinner.setSpinnerString('|/-\\')
    spinner.start()
    return spinner
}

module.exports = {
    isObject,
    spinnerStart
};

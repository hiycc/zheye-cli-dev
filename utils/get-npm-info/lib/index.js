'use strict';

const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

function getSemverVersion (baseVersion, versions) {
    return versions.filter(version => {
        return semver.satisfies(version, `^${baseVersion}`,)
    }).sort((a, b) => { return semver.gt(a, b)? -1: 1 })
}

async function getNpmSemverVersion (baseVersion, npmName, registry) {
    const versions = await getNpmVersions(npmName, registry)
    const newVersions = getSemverVersion(baseVersion, versions)
    if (newVersions && newVersions.length > 0) {
        return newVersions[0]
    }
}

async function getNpmVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry)
    if(data) {
        const versions = Object.keys(data.versions)
        return versions
    } else {
        return null
    }
}

function getNpmInfo(npmName, registry) {
    // TODO
    if (!npmName) {
        return null
    }
    const registryURL = registry || getDefaultRegistry()
    const npmInfoURL = urlJoin(registryURL, npmName)
    return axios.get(npmInfoURL).then(response => {
        if (response.status === 200) {
            return response.data
        }
        return null
    }).catch(err => {
        return Promise.reject(err)
    })
}

async function getNpmLatestVersion(npmName, registry) {
    let versions = await getNpmVersions(npmName, registry)
    if (versions) {
        return versions = versions.sort((a, b) => { return semver.gt(a, b)? -1: 1 })[0]
    } else return null
    
}

function getDefaultRegistry (isOriginal = false) {
    return isOriginal? "https://registry.npmjs.org" : "https://registry.npm.taobao.org"
}

module.exports = {
    getNpmInfo,
    getNpmVersions,
    getNpmSemverVersion,
    getDefaultRegistry,
    getNpmLatestVersion
};
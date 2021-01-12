'use strict'

const core = require('@actions/core')

const setOutputs = entries => {
  const json = JSON.stringify(entries)
  const ascii = Buffer.from(json).toString('base64')
  core.setOutput('json', json)
  core.setOutput('base64', ascii)
  core.setOutput('count', entries.length)
}

module.exports = {setOutputs}

// vim: set ft=javascript ts=2 sw=2 sts=2:

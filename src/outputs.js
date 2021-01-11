'use strict'

const {setOutput} = require('@actions/core')

const setOutputs = entries => {
  const json = JSON.stringify(entries)
  const ascii = Buffer.from(json).toString('base64')
  setOutput('json', json)
  setOutput('base64', ascii)
  setOutput('count', entries.length)
}

module.exports = {setOutputs}

// vim: set ft=javascript ts=2 sw=2 sts=2:

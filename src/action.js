'use strict'

/* eslint camelcase: [error, {properties: "never"}] */

const core = require('@actions/core')

const createParams = inputs => {
  const params = {
    owner: inputs.owner,
    repo: inputs.repo,
  }

  if (inputs.per_page) {
    if (inputs.max_entries) {
      params.per_page = Math.min(inputs.per_page, inputs.max_entries)
      core.info(`pagination: set ${params.per_page} entries per page`)
    } else {
      params.per_page = inputs.per_page
      core.info(`pagination: set ${params.per_page} entries per page`)
    }
  } else {
    if (inputs.max_entries && inputs.max_entries < 100) {
      params.per_page = inputs.max_entries
      core.info(`pagination: set ${params.per_page} entries per page`)
    }
  }

  return params
}

const setOutputs = (inputs, entries) => {
  core.info(`setOutputs: preparing for ${entries.length} entries`)

  const processor = new require('./processor').Processor(inputs)
  const array = processor.process(entries)
  const json = JSON.stringify(array)
  const ascii = Buffer.from(json).toString('base64')

  core.info(`setOutputs: setting outputs for ${array.length} entries`)
  core.setOutput('json', json)
  core.setOutput('base64', ascii)
  core.setOutput('count', array.length)
}

async function run() {
  const inputs = require('./inputs').getInputs()
  const octokit = new require('@octokit/rest').Octokit({
    auth: inputs.token,
  })
  const params = createParams(inputs)

  core.info(`inputs: ${JSON.stringify(inputs, null, 2)}`)

  let remain
  if (inputs.max_entries) {
    remain = inputs.max_entries
    core.info(`pagination: setting number of remaing entries to ${remain}`)
  } else {
    remain = Number.MAX_SAFE_INTEGER
  }

  try {
    const entries = await octokit.paginate(
      octokit.repos.listReleases,
      params,
      ({data}, done) => {
        core.info(`pagination: retrieved page of ${data.length} entries`)
        remain -= data.length
        if (remain <= 0) {
          core.info(`pagination: last page with ${-remain} surplus entries`)
          if (remain < 0) {
            data = data.slice(0, data.length + remain)
          }
          core.info(
            `pagination: retaining ${data.length} of the retrieved entries`
          )
          done()
        } else if (inputs.max_entries) {
          core.info(`pagination: ${remain} entries remain to be retrieved`)
        }
        return data
      }
    )
    setOutputs(inputs, entries)
  } catch (error) {
    core.setFailed(error.stack)
  }
}

module.exports = {run}

// vim: set ft=javascript ts=2 sw=2 sts=2:

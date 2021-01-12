'use strict'

/*eslint camelcase: [error, {allow: ["per_page", "max_entries", "tag_name"]}]*/

const {setFailed, error: logError} = require('@actions/core')
const {Octokit} = require('@octokit/rest')
const {Processor} = require('./processor')
const {getInputs} = require('./inputs')
const {setOutputs} = require('./outputs')

const makeParams = inputs => {
  const {owner, repo, per_page, max_entries} = inputs
  const params = {}

  if (owner != null) {
    params.owner = owner
  }

  if (repo != null) {
    params.repo = repo
  }

  if (per_page != null && per_page <= 100) {
    if (max_entries != null && max_entries <= 100) {
      params.per_page = Math.min(per_page, max_entries)
    } else {
      params.per_page = per_page
    }
  } else {
    if (max_entries != null && max_entries <= 100) {
      params.per_page = max_entries
    }
  }

  return params
}

async function doRun() {
  const inputs = getInputs()
  const octokit = new Octokit({
    auth: inputs.token,
  })

  let remain
  if (inputs.max_entries) {
    remain = inputs.max_entries
  } else {
    remain = Number.MAX_SAFE_INTEGER
  }

  const entries = await octokit.paginate(
    octokit.repos.listReleases,
    makeParams(inputs),
    ({data}, done) => {
      remain -= data.length
      if (remain <= 0) {
        if (remain < 0) {
          data = data.slice(0, data.length + remain)
        }
        done()
      }
      return data
    }
  )
  const processor = new Processor(inputs)
  setOutputs(processor.process(entries))
}

async function run() {
  try {
    await doRun()
  } catch (error) {
    logError(error.message)
    setFailed(error.stack)
  }
}

module.exports = {run}

// vim: set ft=javascript ts=2 sw=2 sts=2:

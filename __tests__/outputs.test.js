'use strict'

/*eslint camelcase: [error, {properties: "never"}]*/
/*eslint camelcase: [error, {allow: ["per_page", "max_entries", "tag_name"]}]*/

const {setOutputs} = require('../src/outputs')
const core = require('@actions/core')

jest.mock('@actions/core')

describe('outputs', () => {
  describe.each([['a', 'b']])(`.setOutputs(%s)`, entries => {
    const json = JSON.stringify(entries)
    const ascii = Buffer.from(json).toString('base64')
    const count = entries.length

    it(`calls core.setOutput('json', ${json})`, () => {
      expect.assertions(2)
      expect(setOutputs(entries)).toBeUndefined()
      expect(core.setOutput).toHaveBeenCalledWith('json', json)
    })

    it(`calls core.setOutput('base64', ${ascii})`, () => {
      expect.assertions(2)
      expect(setOutputs(entries)).toBeUndefined()
      expect(core.setOutput).toHaveBeenCalledWith('base64', ascii)
    })

    it(`calls core.setOutput('count', ${count})`, () => {
      expect.assertions(2)
      expect(setOutputs(entries)).toBeUndefined()
      expect(core.setOutput).toHaveBeenCalledWith('count', count)
    })
  })
})

// vim: set ft=javascript ts=2 sw=2 sts=2:

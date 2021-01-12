'use strict'

/*eslint no-unused-vars: ["error", {"argsIgnorePattern": "^_\d*$"}]*/
/*eslint camelcase: [error, {allow: ["per_page", "max_entries", "tag_name"]}]*/

const {run} = require('../src/action')
const {getInputs, ValidationError} = require('../src/inputs')
const {setOutputs} = require('../src/outputs')
const {Octokit} = require('@octokit/rest')
const core = require('@actions/core')

jest.mock('../src/inputs')
jest.mock('../src/outputs')
jest.mock('@octokit/rest')
jest.mock('@actions/core')

class OctokitMockImpl {
  constructor(releases, params) {
    this.releases = releases
    this.params = params
    this.stop = false
    this.repos = {
      listReleases: 'listReleases',
    }
    jest.spyOn(this, 'paginate')
  }

  async paginate(endpoint, params, callback) {
    jest.spyOn(this, 'done')
    const size = params.per_page || 30
    let data = []
    for (let beg = 0; beg < this.releases.length && !this.stop; beg += size) {
      const chunk = this.releases.slice(beg, beg + size)
      data = data.concat(
        callback({data: chunk}, () => {
          this.done()
        })
      )
    }
    return data
  }

  done() {
    this.stop = true
  }
}

class ActionTestCase {
  constructor(inputs, releases = null) {
    this.inputs = inputs
    this.releases = releases

    Octokit.mockImplementation(params => {
      this.octokit = new OctokitMockImpl(this.releases, params)
      return this.octokit
    })
  }

  get getInputs() {
    return () => {
      if (this.inputs instanceof ValidationError) {
        throw this.inputs
      }
      return this.inputs
    }
  }

  setUp() {
    getInputs.mockImplementation(this.getInputs)
    setOutputs.mockImplementation(_ => {})
    core.setFailed.mockImplementation(_ => {})
    core.error.mockImplementation(_ => {})

    Octokit.mockClear()
    getInputs.mockClear()
    setOutputs.mockClear()
    core.setFailed.mockClear()
    core.error.mockClear()
  }

  tearDown() {
    Octokit.mockRestore()
    getInputs.mockRestore()
    setOutputs.mockRestore()
    core.setFailed.mockRestore()
    core.error.mockRestore()
  }
}

describe('action', () => {
  const examine = (inputs, releases) => async callback => {
    const testCase = new ActionTestCase(inputs, releases)
    try {
      testCase.setUp()
      await callback(testCase)
    } finally {
      testCase.tearDown()
    }
  }

  describe('.run()', () => {
    describe.each([
      [{}, [], {}, []],
      [{owner: null, repo: null}, [], {}, []],
      [
        {owner: 'github', repo: 'docs'},
        [1, 2],
        {owner: 'github', repo: 'docs'},
        [1, 2],
      ],
      [
        {name: 'latest'},
        [
          {name: 'latest', id: 1},
          {name: 'oldest', id: 2},
        ],
        {},
        [{name: 'latest', id: 1}],
      ],
      [{per_page: 100}, [], {per_page: 100}, []],
      [{per_page: 101}, [], {}, []],
      [{max_entries: 100}, [], {per_page: 100}, []],
      [{max_entries: 101}, [], {}, []],
      [{max_entries: 100, per_page: 30}, [], {per_page: 30}, []],
      [{max_entries: 30, per_page: 100}, [], {per_page: 30}, []],
      [{max_entries: 101, per_page: 101}, [], {}, []],
      [
        {max_entries: 4},
        [0, 1, 2, 3, 4, 5, 6, 7, 8],
        {per_page: 4},
        [0, 1, 2, 3],
      ],
      [
        {max_entries: 4, per_page: 3},
        [0, 1, 2, 3, 4, 5, 6, 7, 8],
        {per_page: 3},
        [0, 1, 2, 3],
      ],
    ])('with inputs: %j, releases: %j', (inputs, releases, params, output) => {
      it(`calls octokit.paginate(octokit.repos.listReleases, ${JSON.stringify(
        params
      )}, ...)`, async () => {
        expect.assertions(1)
        await examine(
          inputs,
          releases
        )(async testCase => {
          await run()
          expect(testCase.octokit.paginate).toHaveBeenCalledWith(
            testCase.octokit.repos.listReleases,
            params,
            expect.anything()
          )
        })
      })

      it(`calls setOutputs(${JSON.stringify(output)})`, async () => {
        expect.assertions(1)
        await examine(
          inputs,
          releases
        )(async () => {
          await run()
          expect(setOutputs).toHaveBeenCalledWith(output)
        })
      })

      it(`does not call core.setFailed()`, async () => {
        expect.assertions(1)
        await examine(
          inputs,
          releases
        )(async () => {
          await run()
          expect(core.setFailed).not.toHaveBeenCalled()
        })
      })
    })

    describe('when exception is thrown', () => {
      const error = new ValidationError('doh!')

      it(`calls core.error(${JSON.stringify(error.message)})`, async () => {
        expect.assertions(2)
        await examine(error)(async () => {
          await expect(run()).resolves.toBeUndefined()
          expect(core.error).toHaveBeenCalledWith(error.message)
        })
      })

      it('calls core.setFailed(...)', async () => {
        expect.assertions(2)
        await examine(error)(async () => {
          await expect(run()).resolves.toBeUndefined()
          expect(core.setFailed).toHaveBeenCalledWith(error.stack)
        })
      })
    })
  })
})

// vim: set ft=javascript ts=2 sw=2 sts=2:

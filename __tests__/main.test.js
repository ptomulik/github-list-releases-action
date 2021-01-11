'use strict'

const action = require('../src/action')

describe('require("main")', () => {
  it('invokes action.run', () => {
    expect.assertions(1)
    const spy = jest.spyOn(action, 'run').mockImplementation()
    require('../src/main')
    expect(spy).toHaveBeenCalledTimes(1)
    spy.mockRestore()
  })
})

// vim: set ft=javascript ts=2 sw=2 sts=2:

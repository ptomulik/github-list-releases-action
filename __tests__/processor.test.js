'use strict'

/* eslint camelcase: [error, {properties: "never"}] */

const {
  Filter,
  Sorter,
  Selector,
  Slicer,
  Processor,
} = require('../src/processor')

//
// Filter
//

describe('processor', () => {
  describe('.Filter', () => {
    describe.each([
      [{}, [{name: 'foo'}], [{name: 'foo'}]],
      [{name: null}, [{name: 'a'}, {name: 'b'}], [{name: 'a'}, {name: 'b'}]],
      [{name: 'foo'}, [{name: 'foo'}, {name: 'bar'}], [{name: 'foo'}]],
      [
        {name: /^v?\d+\.\d+.\d+$/},
        [{name: 'latest'}, {name: 'v1.0.0'}, {name: 'v1.1.0'}, {name: '1.2.0'}],
        [{name: 'v1.0.0'}, {name: 'v1.1.0'}, {name: '1.2.0'}],
      ],
      [
        {tag_name: 'foo'},
        [{tag_name: 'foo'}, {tag_name: 'bar'}],
        [{tag_name: 'foo'}],
      ],
      [
        {tag_name: /^v?\d+\.\d+.\d+$/},
        [
          {tag_name: 'latest'},
          {tag_name: 'v1.0.0'},
          {tag_name: 'v1.1.0'},
          {tag_name: '1.2.0'},
        ],
        [{tag_name: 'v1.0.0'}, {tag_name: 'v1.1.0'}, {tag_name: '1.2.0'}],
      ],
      [
        {draft: false},
        [
          {name: 'draft', draft: true},
          {name: 'non-draft', draft: false},
        ],
        [{name: 'non-draft', draft: false}],
      ],
      [
        {draft: true},
        [
          {name: 'draft', draft: true},
          {name: 'non-draft', draft: false},
        ],
        [{name: 'draft', draft: true}],
      ],
      [
        {prerelease: false},
        [
          {name: 'prerelease', prerelease: true},
          {name: 'non-prerelease', prerelease: false},
        ],
        [{name: 'non-prerelease', prerelease: false}],
      ],
      [
        {prerelease: true},
        [
          {name: 'prerelease', prerelease: true},
          {name: 'non-prerelease', prerelease: false},
        ],
        [{name: 'prerelease', prerelease: true}],
      ],
      [
        {name: /^v?\d+\.\d+.\d+$/, draft: false},
        [
          {name: 'latest', draft: false},
          {name: 'v1.0.0', draft: false},
          {name: 'v1.1.0', draft: false},
          {name: '1.2.0', draft: true},
        ],
        [
          {name: 'v1.0.0', draft: false},
          {name: 'v1.1.0', draft: false},
        ],
      ],
      [
        {name: /^v?\d+\.\d+.\d+$/, draft: true},
        [
          {name: 'latest', draft: false},
          {name: 'v1.0.0', draft: false},
          {name: 'v1.1.0', draft: false},
          {name: '1.2.0', draft: true},
        ],
        [{name: '1.2.0', draft: true}],
      ],
      [
        {tag_name: /^v?\d+\.\d+.\d+$/, prerelease: false},
        [
          {tag_name: 'latest', prerelease: false},
          {tag_name: 'v1.0.0', prerelease: false},
          {tag_name: 'v1.1.0', prerelease: false},
          {tag_name: '1.2.0', prerelease: true},
        ],
        [
          {tag_name: 'v1.0.0', prerelease: false},
          {tag_name: 'v1.1.0', prerelease: false},
        ],
      ],
      [
        {tag_name: /^v?\d+\.\d+.\d+$/, prerelease: true},
        [
          {tag_name: 'latest', prerelease: false},
          {tag_name: 'v1.0.0', prerelease: false},
          {tag_name: 'v1.1.0', prerelease: false},
          {tag_name: '1.2.0', prerelease: true},
        ],
        [{tag_name: '1.2.0', prerelease: true}],
      ],
    ])('new Filter(%j).filter(%j)', (inputs, entries, output) => {
      it(`returns ${JSON.stringify(output)}`, () => {
        expect.assertions(1)
        expect(new Filter(inputs).filter(entries)).toStrictEqual(output)
      })
    })
  })

  //
  // Sorter
  //

  describe('.Sorter', () => {
    describe.each([
      [null, [{name: 'B'}, {name: 'A'}], [{name: 'B'}, {name: 'A'}]],
      [undefined, [{name: 'B'}, {name: 'F'}], [{name: 'B'}, {name: 'F'}]],
      [[], [{name: 'B'}, {name: 'A'}], [{name: 'B'}, {name: 'A'}]],

      [['name'], [{name: 'B'}, {name: 'A'}], [{name: 'A'}, {name: 'B'}]],

      [[['name', 'A']], [{name: 'B'}, {name: 'A'}], [{name: 'A'}, {name: 'B'}]],

      [[['name', 'D']], [{name: 'A'}, {name: 'B'}], [{name: 'B'}, {name: 'A'}]],

      [
        ['name', 'id'],
        [
          {name: 'B', id: 2},
          {name: 'B', id: 1},
          {name: 'A', id: 2},
          {name: 'A', id: 1},
        ],
        [
          {name: 'A', id: 1},
          {name: 'A', id: 2},
          {name: 'B', id: 1},
          {name: 'B', id: 2},
        ],
      ],

      [
        [
          ['name', 'A'],
          ['id', 'A'],
        ],
        [
          {name: 'B', id: 2},
          {name: 'B', id: 1},
          {name: 'A', id: 2},
          {name: 'A', id: 1},
        ],
        [
          {name: 'A', id: 1},
          {name: 'A', id: 2},
          {name: 'B', id: 1},
          {name: 'B', id: 2},
        ],
      ],

      [
        [
          ['name', 'A'],
          ['id', 'D'],
        ],
        [
          {name: 'B', id: 1},
          {name: 'B', id: 2},
          {name: 'A', id: 1},
          {name: 'A', id: 2},
        ],
        [
          {name: 'A', id: 2},
          {name: 'A', id: 1},
          {name: 'B', id: 2},
          {name: 'B', id: 1},
        ],
      ],

      [
        [
          ['name', 'D'],
          ['id', 'A'],
        ],
        [
          {name: 'A', id: 2},
          {name: 'A', id: 1},
          {name: 'B', id: 2},
          {name: 'B', id: 1},
        ],
        [
          {name: 'B', id: 1},
          {name: 'B', id: 2},
          {name: 'A', id: 1},
          {name: 'A', id: 2},
        ],
      ],

      [
        [
          ['name', 'D'],
          ['id', 'D'],
        ],
        [
          {name: 'A', id: 1},
          {name: 'A', id: 2},
          {name: 'B', id: 1},
          {name: 'B', id: 2},
        ],
        [
          {name: 'B', id: 2},
          {name: 'B', id: 1},
          {name: 'A', id: 2},
          {name: 'A', id: 1},
        ],
      ],

      [
        [
          ['id', 'A'],
          ['name', 'A'],
        ],
        [
          {name: 'B', id: 2},
          {name: 'A', id: 2},
          {name: 'B', id: 1},
          {name: 'A', id: 1},
        ],
        [
          {name: 'A', id: 1},
          {name: 'B', id: 1},
          {name: 'A', id: 2},
          {name: 'B', id: 2},
        ],
      ],

      [
        [
          ['id', 'A'],
          ['name', 'D'],
        ],
        [
          {name: 'A', id: 2},
          {name: 'B', id: 2},
          {name: 'A', id: 1},
          {name: 'B', id: 1},
        ],
        [
          {name: 'B', id: 1},
          {name: 'A', id: 1},
          {name: 'B', id: 2},
          {name: 'A', id: 2},
        ],
      ],

      [
        [
          ['id', 'D'],
          ['name', 'A'],
        ],
        [
          {name: 'B', id: 1},
          {name: 'A', id: 1},
          {name: 'B', id: 2},
          {name: 'A', id: 2},
        ],
        [
          {name: 'A', id: 2},
          {name: 'B', id: 2},
          {name: 'A', id: 1},
          {name: 'B', id: 1},
        ],
      ],

      [
        [
          ['id', 'D'],
          ['name', 'D'],
        ],
        [
          {name: 'A', id: 1},
          {name: 'B', id: 1},
          {name: 'A', id: 2},
          {name: 'B', id: 2},
        ],
        [
          {name: 'B', id: 2},
          {name: 'A', id: 2},
          {name: 'B', id: 1},
          {name: 'A', id: 1},
        ],
      ],

      [
        [
          ['name', 'D'],
          ['id', 'D'],
        ],
        [
          {name: 'A', id: 1},
          {name: 'A', id: 2, tag: 'X'},
          {name: 'A', id: 2, tag: 'Y'},
          {name: 'B', id: 1},
          {name: 'B', id: 2},
        ],
        [
          {name: 'B', id: 2},
          {name: 'B', id: 1},
          {name: 'A', id: 2, tag: 'X'},
          {name: 'A', id: 2, tag: 'Y'},
          {name: 'A', id: 1},
        ],
      ],

      [
        [
          ['name', 'D'],
          ['id', 'D'],
        ],
        [
          {name: 'A', id: 1},
          {name: 'A', id: 2, tag: 'Y'},
          {name: 'A', id: 2, tag: 'X'},
          {name: 'B', id: 1},
          {name: 'B', id: 2},
        ],
        [
          {name: 'B', id: 2},
          {name: 'B', id: 1},
          {name: 'A', id: 2, tag: 'Y'},
          {name: 'A', id: 2, tag: 'X'},
          {name: 'A', id: 1},
        ],
      ],
    ])('new Sorter(%j).sort(%j)', (sort, entries, output) => {
      it(`returns ${JSON.stringify(output)}`, () => {
        expect.assertions(1)
        expect(new Sorter(sort).sort(entries)).toStrictEqual(output)
      })
    })
  })

  //
  // Selector
  //

  describe('.Selector', () => {
    describe.each([
      [null, [{name: 'foo', id: 1234}], [{name: 'foo', id: 1234}]],
      [undefined, [{name: 'foo', id: 1234}], [{name: 'foo', id: 1234}]],
      [
        ['name'],
        [{name: 'foo', id: 1234, url: 'https://x.com'}],
        [{name: 'foo'}],
      ],
      [
        ['url', 'name'],
        [{name: 'foo', id: 1234, url: 'https://x.com'}],
        [{name: 'foo', url: 'https://x.com'}],
      ],
      [
        ['url', 'id'],
        [
          {name: 'v1.1', id: 1234, url: 'http://x.com/v1.1'},
          {name: 'v1.2', id: 1235, url: 'http://x.com/v1.2'},
        ],
        [
          {id: 1234, url: 'http://x.com/v1.1'},
          {id: 1235, url: 'http://x.com/v1.2'},
        ],
      ],
    ])('new Selector(%j).select(%j)', (select, entries, output) => {
      it(`returns ${JSON.stringify(output)}`, () => {
        expect.assertions(1)
        expect(new Selector(select).select(entries)).toStrictEqual(output)
      })
    })
  })

  //
  // Slicer
  //

  describe('.Slicer', () => {
    describe.each([
      [null, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]],

      [
        undefined,
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      ],

      [
        {type: 'A'},
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      ],

      [
        {type: 'A'},
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      ],

      [{type: 'F'}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0]],

      [{type: 'F', count: 1}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0]],

      [{type: 'F', count: 4}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3]],

      [
        {type: 'F', count: 123},
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      ],

      [{type: 'L'}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [9]],

      [{type: 'L', count: 1}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [9]],

      [{type: 'L', count: 4}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [6, 7, 8, 9]],

      [
        {type: 'L', count: 123},
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      ],

      [
        {type: 'R'},
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      ],

      [{type: 'R', to: 4}, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 1, 2, 3, 4]],

      [
        {type: 'R', from: 4},
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7, 8, 9],
      ],

      [
        {type: 'R', from: 4, to: 7},
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [4, 5, 6, 7],
      ],
    ])('new Slicer(%j).slice(%j)', (slice, entries, output) => {
      it(`returns ${JSON.stringify(output)}`, () => {
        expect.assertions(1)
        expect(new Slicer(slice).slice(entries)).toStrictEqual(output)
      })
    })
  })

  //
  // Processor
  //
  describe('.Processor', () => {
    describe.each([
      [{}, [], []],

      [{}, [1, 2, 3, 4], [1, 2, 3, 4]],

      [
        {
          name: null,
          tag_name: null,
          draft: null,
          prerelease: null,
          sort: null,
          order: 'A',
          slice: {
            type: 'A',
          },
          select: null,
        },
        [1, 2, 3, 4],
        [1, 2, 3, 4],
      ],

      [
        {
          name: 'foo',
        },
        [{}],
        [],
      ],

      [
        {
          name: 'foo',
        },
        [{name: 'foo'}, {name: 'bar'}],
        [{name: 'foo'}],
      ],

      [
        {
          name: /^v?\d+\.\d+$/,
          sort: [['name', 'D']],
          select: ['id', 'url'],
          slice: {type: 'F', count: 3},
        },
        [
          {name: 'v1.0', id: 1, url: 'http://x.org/v1.0'},
          {name: 'v2.0', id: 3, url: 'http://x.org/v2.0'},
          {name: 'master', id: 5, url: 'http://x.org/master'},
          {name: 'v1.1', id: 2, url: 'http://x.org/v1.1'},
          {name: 'v2.1', id: 4, url: 'http://x.org/v2.1'},
        ],
        [
          {id: 4, url: 'http://x.org/v2.1'},
          {id: 3, url: 'http://x.org/v2.0'},
          {id: 2, url: 'http://x.org/v1.1'},
        ],
      ],
    ])('new Processor(%j).process(%j)', (inputs, entries, output) => {
      it(`returns ${JSON.stringify(output)}`, () => {
        expect.assertions(1)
        expect(new Processor(inputs).process(entries)).toStrictEqual(output)
      })
    })
  })
})

// vim: set ft=javascript ts=2 sw=2 sts=2:

"use strict";

const { Filter, Sorter, Selector, Slicer, Processor } = require('../src/processor');


//
// Filter
//

for (const { desc, input, entries, output } of [
  {
    desc:     'with empty input',
    input:    { },
    entries:  [ {name: 'foo'} ],
    output:   [ {name: 'foo'} ],
  },
  {
    desc:     'with name: null',
    input:    { name: null },
    entries:  [{name: 'a'}, {name: 'b'}],
    output:   [{name: 'a'}, {name: 'b'}],
  },
  {
    desc:     'with name: "foo"',
    input:    { name: 'foo'},
    entries:  [ {name: 'foo'}, {name: 'bar'} ],
    output:   [ {name: 'foo'} ],
  },
  {
    desc:     'with name: "/^v?\\d+\\.\\d+\\.\\d+$/"',
    input:    { name: /^v?\d+\.\d+.\d+$/ },
    entries:  [ {name: 'latest'}, {name: 'v1.0.0'}, {name: 'v1.1.0'}, {name: '1.2.0'} ],
    output:   [ {name: 'v1.0.0'}, {name: 'v1.1.0'}, {name: '1.2.0'} ],
  },
  {
    desc:     'with tag_name: "foo"',
    input:    { tag_name: 'foo'},
    entries:  [ {tag_name: 'foo'}, {tag_name: 'bar'} ],
    output:   [ {tag_name: 'foo'} ],
  },
  {
    desc:     'with tag_name: "/^v?\\d+\\.\\d+\\.\\d+$/"',
    input:    { tag_name: /^v?\d+\.\d+.\d+$/ },
    entries:  [ {tag_name: 'latest'}, {tag_name: 'v1.0.0'}, {tag_name: 'v1.1.0'}, {tag_name: '1.2.0'} ],
    output:   [ {tag_name: 'v1.0.0'}, {tag_name: 'v1.1.0'}, {tag_name: '1.2.0'} ],
  },
  {
    desc:     'with draft: false',
    input:    { draft: false},
    entries:  [ {name: 'draft', draft: true}, {name: 'non-draft', draft: false} ],
    output:   [ {name: 'non-draft', draft: false} ],
  },
  {
    desc:     'with draft: true',
    input:    { draft: true},
    entries:  [ {name: 'draft', draft: true}, {name: 'non-draft', draft: false} ],
    output:   [ {name: 'draft', draft: true} ],
  },
  {
    desc:     'with prerelease: false',
    input:    { prerelease: false},
    entries:  [ {name: 'prerelease', prerelease: true}, {name: 'non-prerelease', prerelease: false} ],
    output:   [ {name: 'non-prerelease', prerelease: false} ],
  },
  {
    desc:     'with prerelease: true',
    input:    { prerelease: true},
    entries:  [ {name: 'prerelease', prerelease: true}, {name: 'non-prerelease', prerelease: false} ],
    output:   [ {name: 'prerelease', prerelease: true} ],
  },
  {
    desc:     'with name: "/^v?\\d+\\.\\d+\\.\\d+$/" && draft: false',
    input:    { name: /^v?\d+\.\d+.\d+$/, draft: false },
    entries:  [
      {name: 'latest', draft: false},
      {name: 'v1.0.0', draft: false},
      {name: 'v1.1.0', draft: false},
      {name: '1.2.0', draft: true}
    ],
    output:   [
      {name: 'v1.0.0', draft: false},
      {name: 'v1.1.0', draft: false},
    ],
  },
  {
    desc:     'with name: "/^v?\\d+\\.\\d+\\.\\d+$/" && draft: true',
    input:    { name: /^v?\d+\.\d+.\d+$/, draft: true },
    entries:  [
      {name: 'latest', draft: false},
      {name: 'v1.0.0', draft: false},
      {name: 'v1.1.0', draft: false},
      {name: '1.2.0', draft: true}
    ],
    output:   [
      {name: '1.2.0', draft: true}
    ],
  },
  {
    desc:     'with tag_name: "/^v?\\d+\\.\\d+\\.\\d+$/" && prerelease: false',
    input:    { tag_name: /^v?\d+\.\d+.\d+$/, prerelease: false },
    entries:  [
      {tag_name: 'latest', prerelease: false},
      {tag_name: 'v1.0.0', prerelease: false},
      {tag_name: 'v1.1.0', prerelease: false},
      {tag_name: '1.2.0', prerelease: true}
    ],
    output:   [
      {tag_name: 'v1.0.0', prerelease: false},
      {tag_name: 'v1.1.0', prerelease: false},
    ],
  },
  {
    desc:     'with tag_name: "/^v?\\d+\\.\\d+\\.\\d+$/" && prerelease: true',
    input:    { tag_name: /^v?\d+\.\d+.\d+$/, prerelease: true },
    entries:  [
      {tag_name: 'latest', prerelease: false},
      {tag_name: 'v1.0.0', prerelease: false},
      {tag_name: 'v1.1.0', prerelease: false},
      {tag_name: '1.2.0', prerelease: true}
    ],
    output:   [
      {tag_name: '1.2.0', prerelease: true}
    ],
  },
]) {
  test(`testing Filter ${desc}`, () => {
    expect(new Filter(input).filter(entries)).toStrictEqual(output);
  });
}

//
// Sorter
//

for (const { sort, entries, output } of [
  {
    sort:     null,
    entries:  [ {name: 'B'}, {name: 'A'} ],
    output:   [ {name: 'B'}, {name: 'A'} ],
  },
  {
    sort:     undefined,
    entries:  [ {name: 'B'}, {name: 'F'} ],
    output:   [ {name: 'B'}, {name: 'F'} ],
  },
  {
    sort:     [],
    entries:  [ {name: 'B'}, {name: 'A'} ],
    output:   [ {name: 'B'}, {name: 'A'} ],
  },

  {
    sort:     ['name'],
    entries:  [ {name: 'B'}, {name: 'A'} ],
    output:   [ {name: 'A'}, {name: 'B'} ],
  },

  {
    sort:     [['name', 'A']],
    entries:  [ {name: 'B'}, {name: 'A'} ],
    output:   [ {name: 'A'}, {name: 'B'} ],
  },

  {
    sort:     [['name', 'D']],
    entries:  [ {name: 'A'}, {name: 'B'} ],
    output:   [ {name: 'B'}, {name: 'A'} ],
  },

  {
    sort:     ['name', 'id'],
    entries:  [
      {name: 'B', id: 2},
      {name: 'B', id: 1},
      {name: 'A', id: 2},
      {name: 'A', id: 1},
    ],
    output:  [
      {name: 'A', id: 1},
      {name: 'A', id: 2},
      {name: 'B', id: 1},
      {name: 'B', id: 2},
    ],
  },

  {
    sort:     [['name', 'A'], ['id', 'A']],
    entries:  [
      {name: 'B', id: 2},
      {name: 'B', id: 1},
      {name: 'A', id: 2},
      {name: 'A', id: 1},
    ],
    output:  [
      {name: 'A', id: 1},
      {name: 'A', id: 2},
      {name: 'B', id: 1},
      {name: 'B', id: 2},
    ],
  },

  {
    sort:     [['name', 'A'], ['id', 'D']],
    entries:  [
      {name: 'B', id: 1},
      {name: 'B', id: 2},
      {name: 'A', id: 1},
      {name: 'A', id: 2},
    ],
    output:  [
      {name: 'A', id: 2},
      {name: 'A', id: 1},
      {name: 'B', id: 2},
      {name: 'B', id: 1},
    ],
  },

  {
    sort:     [['name', 'D'], ['id', 'A']],
    entries:  [
      {name: 'A', id: 2},
      {name: 'A', id: 1},
      {name: 'B', id: 2},
      {name: 'B', id: 1},
    ],
    output:  [
      {name: 'B', id: 1},
      {name: 'B', id: 2},
      {name: 'A', id: 1},
      {name: 'A', id: 2},
    ],
  },

  {
    sort:     [['name', 'D'], ['id', 'D']],
    entries:  [
      {name: 'A', id: 1},
      {name: 'A', id: 2},
      {name: 'B', id: 1},
      {name: 'B', id: 2},
    ],
    output:  [
      {name: 'B', id: 2},
      {name: 'B', id: 1},
      {name: 'A', id: 2},
      {name: 'A', id: 1},
    ],
  },

  {
    sort:     [['id', 'A'], ['name', 'A']],
    entries:  [
      {name: 'B', id: 2},
      {name: 'A', id: 2},
      {name: 'B', id: 1},
      {name: 'A', id: 1},
    ],
    output:  [
      {name: 'A', id: 1},
      {name: 'B', id: 1},
      {name: 'A', id: 2},
      {name: 'B', id: 2},
    ],
  },

  {
    sort:     [['id', 'A'], ['name', 'D']],
    entries:  [
      {name: 'A', id: 2},
      {name: 'B', id: 2},
      {name: 'A', id: 1},
      {name: 'B', id: 1},
    ],
    output:  [
      {name: 'B', id: 1},
      {name: 'A', id: 1},
      {name: 'B', id: 2},
      {name: 'A', id: 2},
    ],
  },

  {
    sort:     [['id', 'D'], ['name', 'A']],
    entries:  [
      {name: 'B', id: 1},
      {name: 'A', id: 1},
      {name: 'B', id: 2},
      {name: 'A', id: 2},
    ],
    output:  [
      {name: 'A', id: 2},
      {name: 'B', id: 2},
      {name: 'A', id: 1},
      {name: 'B', id: 1},
    ],
  },

  {
    sort:     [['id', 'D'], ['name', 'D']],
    entries:  [
      {name: 'A', id: 1},
      {name: 'B', id: 1},
      {name: 'A', id: 2},
      {name: 'B', id: 2},
    ],
    output:  [
      {name: 'B', id: 2},
      {name: 'A', id: 2},
      {name: 'B', id: 1},
      {name: 'A', id: 1},
    ],
  },

  {
    sort:     [['name', 'D'], ['id', 'D']],
    entries:  [
      {name: 'A', id: 1},
      {name: 'A', id: 2, tag: "X"},
      {name: 'A', id: 2, tag: "Y"},
      {name: 'B', id: 1},
      {name: 'B', id: 2},
    ],
    output:  [
      {name: 'B', id: 2},
      {name: 'B', id: 1},
      {name: 'A', id: 2, tag: "X"},
      {name: 'A', id: 2, tag: "Y"},
      {name: 'A', id: 1},
    ],
  },

  {
    sort:     [['name', 'D'], ['id', 'D']],
    entries:  [
      {name: 'A', id: 1},
      {name: 'A', id: 2, tag: "Y"},
      {name: 'A', id: 2, tag: "X"},
      {name: 'B', id: 1},
      {name: 'B', id: 2},
    ],
    output:  [
      {name: 'B', id: 2},
      {name: 'B', id: 1},
      {name: 'A', id: 2, tag: "Y"},
      {name: 'A', id: 2, tag: "X"},
      {name: 'A', id: 1},
    ],
  },
]) {
  test(`testing Sorter with sort: ${JSON.stringify(sort)}`, () => {
    expect(new Sorter(sort).sort(entries)).toStrictEqual(output);
  });
}

//
// Selector
//

for (const { keys, entries, output } of [
  {
    keys:     null,
    entries:  [ {name: 'foo', id: 1234} ],
    output:   [ {name: 'foo', id: 1234} ],
  },
  {
    keys:     undefined,
    entries:  [ {name: 'foo', id: 1234} ],
    output:   [ {name: 'foo', id: 1234} ],
  },
  {
    keys:     ["name"],
    entries:  [ {name: 'foo', id: 1234, url: 'https://example.com'} ],
    output:   [ {name: 'foo'} ],
  },
  {
    keys:     ["url", "name"],
    entries:  [ {name: 'foo', id: 1234, url: 'https://example.com'} ],
    output:   [ {name: 'foo', url: 'https://example.com'} ],
  },
  {
    keys:     ["url", "id"],
    entries:  [
      {name: 'v1.1', id: 1234, url: 'https://example.com/v1.1'},
      {name: 'v1.2', id: 1235, url: 'https://example.com/v1.2'},
    ],
    output:   [
      {id: 1234, url: 'https://example.com/v1.1'},
      {id: 1235, url: 'https://example.com/v1.2'},
    ],
  },
]) {
  test(`testing Selector with keys: ${JSON.stringify(keys)}`, () => {
    expect(new Selector(keys).select(entries)).toStrictEqual(output);
  });
}

//
// Slicer
//

for (const { slice, entries, output } of [
  {
    slice:   null,
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },

  {
    slice:   undefined,
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },

  {
    slice:   {type: 'A'},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },

  {
    slice:   {type: 'A'},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },

  {
    slice:   {type: 'F'},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [0],
  },

  {
    slice:   {type: 'F', count: 1},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [0],
  },

  {
    slice:   {type: 'F', count: 4},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [0, 1, 2, 3],
  },

  {
    slice:   {type: 'F', count: 123},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },

  {
    slice:   {type: 'L'},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [9],
  },

  {
    slice:   {type: 'L', count: 1},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [9],
  },

  {
    slice:   {type: 'L', count: 4},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [6, 7, 8, 9],
  },

  {
    slice:   {type: 'L', count: 123},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },

  {
    slice:   {type: 'R'},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },

  {
    slice:   {type: 'R', to: 4},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [0, 1, 2, 3, 4],
  },

  {
    slice:   {type: 'R', from: 4},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [4, 5, 6, 7, 8, 9],
  },

  {
    slice:   {type: 'R', from: 4, to: 7},
    entries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    output:  [4, 5, 6, 7],
  },
]) {
  test(`testing Slicer with slice: ${JSON.stringify(slice)}`, () => {
    expect(new Slicer(slice).slice(entries)).toStrictEqual(output);
  });
}

//
// Processor
//
for (const {inputs, entries, output} of [
  {
    inputs: {},
    entries: [],
    output: []
  },

  {
    inputs: {},
    entries: [1, 2, 3, 4],
    output:  [1, 2, 3, 4],
  },

  {
    inputs: {
      name: null,
      tag_name: null,
      draft: null,
      prerelease: null,
      sort: null,
      order: "A",
      slice: {
        type: "A"
      },
      select: null
    },
    entries: [1, 2, 3, 4],
    output:  [1, 2, 3, 4],
  },

  {
    inputs: {
      name: 'foo'
    },
    entries: [
      {},
    ],
    output: [
    ]
  },

  {
    inputs: {
      name: 'foo',
    },
    entries: [
      {name: 'foo'},
      {name: 'bar'},
    ],
    output: [
      {name: 'foo'},
    ]
  },

  {
    inputs: {
      name: /^v?\d+\.\d+$/,
      sort: [['name', 'D']],
      select: ['id', 'url'],
      slice: {type: 'F', count: 3},
    },
    entries: [
      {name: 'v1.0',   id: 1, url: 'https://hello.org/v1.0'},
      {name: 'v2.0',   id: 3, url: 'https://hello.org/v2.0'},
      {name: 'master', id: 5, url: 'https://hello.org/master'},
      {name: 'v1.1',   id: 2, url: 'https://hello.org/v1.1'},
      {name: 'v2.1',   id: 4, url: 'https://hello.org/v2.1'},
    ],
    output: [
      {id: 4, url: 'https://hello.org/v2.1'},
      {id: 3, url: 'https://hello.org/v2.0'},
      {id: 2, url: 'https://hello.org/v1.1'},
    ]
  },
]) {
  test(`testing Processor with inputs: ${JSON.stringify(inputs)}`, () => {
    expect(new Processor(inputs).process(entries)).toStrictEqual(output);
  });
}

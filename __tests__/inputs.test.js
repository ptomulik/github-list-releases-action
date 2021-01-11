'use strict'

/*eslint camelcase: [error, {allow: ["per_page", "max_entries", "tag_name"]}]*/

const {validate, ValidationError, getInputs} = require('../src/inputs')
const core = require('@actions/core')

describe('inputs', () => {
  const errorMessage = (key, value) =>
    `validation failed for input ${key}: ${JSON.stringify(value)}`

  const errorTestInfo = (key, value) => ({
    message: errorMessage(key, value),
    description: `throws ValidationError('${errorMessage(key, value)}')`,
  })

  const ensure = key => ({
    returnsExpectedValue: (args, expected) => {
      it(`returns ${JSON.stringify(expected)}`, () => {
        expect.assertions(1)
        expect(validate[key](...args)).toStrictEqual(expected)
      })
    },

    returnsFirstArgument: args => {
      it(`returns ${JSON.stringify(args[0])}`, () => {
        expect.assertions(1)
        expect(validate[key](...args)).toBe(args[0])
      })
    },

    throwsValidationError: args => {
      const [value] = args
      const {description, message} = errorTestInfo(key, value)
      it(`${description}`, () => {
        expect.assertions(1)
        const call = () => validate[key](...args)
        expect(call).toThrow(new ValidationError(message))
      })
    },

    throwsSyntaxError: args => {
      it('throws SyntaxError', () => {
        expect.assertions(1)
        const call = () => validate[key](...args)
        expect(call).toThrow(SyntaxError)
      })
    },
  })

  const adjust = entry => [entry[0].map(JSON.stringify).join(', '), entry]

  describe('.validate', () => {
    //
    // .token()
    //

    describe.each(
      [
        [[''], null],
        [['0'], '0'],
        [['null'], 'null'],
      ].map(adjust)
    )(`.token(%s)`, (_, [args, expected]) => {
      ensure('token').returnsExpectedValue(args, expected)
    })

    //
    // .owner()
    //

    describe.each(
      [
        [['j']],
        [['john']],
        [['John-Smith']],
        [['john1']],
        [['john1smith']],
        [['john1-smith']],
        [['john-1smith']],
        [['1']],
        [['123456789012345678901234567890123456789']],
      ].map(adjust)
    )(`.owner(%s)`, (_, [args]) => {
      ensure('owner').returnsFirstArgument(args)
    })

    describe.each(
      [
        [['']],
        [['#$%^']],
        [['-john']],
        [['John Smith']],
        [['john--smith']],
        [['1234567890123456789012345678901234567890']],
        [['1-3-5-7-9-1-3-5-7-9-1-3-5-7-9-1-3-5-7-90']],
      ].map(adjust)
    )(`.owner(%s)`, (_, [args]) => {
      ensure('owner').throwsValidationError(args)
    })

    //
    // .repo()
    //
    describe.each(
      [
        [['-']],
        [['_']],
        [['r']],
        [['repo']],
        [['Repo1']],
        [['My-Awesome_Repo']],
        [['My--Awesome__Repo']],
        [['_My.Awesome.Repo']],
        [['-repo']],
        [['_repo']],
        [['.repo']],
        [['..repo']],
        [['.r.epo']],
      ].map(adjust)
    )(`.repo(%s)`, (_, [args]) => {
      ensure('repo').returnsFirstArgument(args)
    })

    describe.each([[['']], [['.']], [['..']], [['re%po']]].map(adjust))(
      `.repo(%s)`,
      (_, [args]) => {
        ensure('repo').throwsValidationError(args)
      }
    )

    //
    // .per_page()
    //

    describe.each(
      [
        [['  '], null],
        [['1'], 1],
        [['100'], 100],
        [['  100  '], 100],
      ].map(adjust)
    )(`.per_page(%s)`, (_, [args, expected]) => {
      ensure('per_page').returnsExpectedValue(args, expected)
    })

    describe.each([[['.']], [['123$#']], [['-1']], [['101']]].map(adjust))(
      `.per_page(%s)`,
      (_, [args]) => {
        ensure('per_page').throwsValidationError(args)
      }
    )

    //
    // .max_entries()
    //

    describe.each(
      [
        [['  '], null],
        [['1'], 1],
        [['123'], 123],
        [['  123  '], 123],
      ].map(adjust)
    )(`.max_entries(%s)`, (_, [args, expected]) => {
      ensure('max_entries').returnsExpectedValue(args, expected)
    })

    describe.each([[['.']], [['123$#']], [['-1']]].map(adjust))(
      `.max_entries(%s)`,
      (_, [args]) => {
        ensure('max_entries').throwsValidationError(args)
      }
    )

    //
    // .name()
    //

    describe.each(
      [
        [[''], null],
        [['*'], null],
        [['-'], '-'],
        [['.'], '.'],
        [['v1.0'], 'v1.0'],
        [['latest'], 'latest'],
        [['&EJH$#'], '&EJH$#'],
        [['//'], new RegExp('', '')],
        [['/asdf/ig'], new RegExp('asdf', 'ig')],
        [['/\\//'], new RegExp('\\/', '')],
        [['/\\//g'], new RegExp('\\/', 'g')],
      ].map(adjust)
    )(`.name(%s)`, (_, [args, expected]) => {
      ensure('name').returnsExpectedValue(args, expected)
    })

    describe.each([[['/\\/\\/g']]].map(adjust))(
      `.tag_name(%s)`,
      (_, [args]) => {
        ensure('tag_name').throwsSyntaxError(args)
      }
    )

    //
    // .tag_name()
    //

    describe.each(
      [
        [[''], null],
        [['*'], null],
        [['-'], '-'],
        [['.'], '.'],
        [['v1.0'], 'v1.0'],
        [['latest'], 'latest'],
        [['&EJH$#'], '&EJH$#'],
        [['//'], new RegExp('', '')],
        [['/asdf/ig'], new RegExp('asdf', 'ig')],
        [['/\\//'], new RegExp('\\/', '')],
        [['/\\//g'], new RegExp('\\/', 'g')],
      ].map(adjust)
    )(`.tag_name(%s)`, (_, [args, expected]) => {
      ensure('tag_name').returnsExpectedValue(args, expected)
    })

    describe.each([[['/\\/\\/g']]].map(adjust))(
      `.tag_name(%s)`,
      (_, [args]) => {
        ensure('tag_name').throwsSyntaxError(args)
      }
    )

    //
    // .draft()
    //

    describe.each(
      [
        [[''], null],
        [['*'], null],
        [['true'], true],
        [['false'], false],
      ].map(adjust)
    )(`.draft(%s)`, (_, [args, expected]) => {
      ensure('draft').returnsExpectedValue(args, expected)
    })

    describe.each([[['foo']]].map(adjust))(`.draft(%s)`, (_, [args]) => {
      ensure('draft').throwsValidationError(args)
    })

    //
    // .prerelease()
    //

    describe.each(
      [
        [[''], null],
        [['*'], null],
        [['true'], true],
        [['false'], false],
      ].map(adjust)
    )(`.prerelease(%s)`, (_, [args, expected]) => {
      ensure('prerelease').returnsExpectedValue(args, expected)
    })

    describe.each([[['foo']]].map(adjust))(`.prerelease(%s)`, (_, [args]) => {
      ensure('prerelease').throwsValidationError(args)
    })

    //
    // .sort()
    //

    describe.each(
      [
        [[''], null],
        [['url'], [['url', 'A']]],
        [[' \turl '], [['url', 'A']]],
        [['url \t'], [['url', 'A']]],
        [['assets_url'], [['assets_url', 'A']]],
        [['upload_url'], [['upload_url', 'A']]],
        [['htlm_url'], [['htlm_url', 'A']]],
        [['id'], [['id', 'A']]],
        [['node_id'], [['node_id', 'A']]],
        [['tag_name'], [['tag_name', 'A']]],
        [['target_commitish'], [['target_commitish', 'A']]],
        [['name'], [['name', 'A']]],
        [['draft'], [['draft', 'A']]],
        [['prerelease'], [['prerelease', 'A']]],
        [['created_at'], [['created_at', 'A']]],
        [['published_at'], [['published_at', 'A']]],
        [['tarball_url'], [['tarball_url', 'A']]],
        [['zipball_url'], [['zipball_url', 'A']]],
        [['body'], [['body', 'A']]],
        [
          ['url, id'],
          [
            ['url', 'A'],
            ['id', 'A'],
          ],
        ],
        [['url A'], [['url', 'A']]],
        [['url D'], [['url', 'D']]],
        [['url', 'A'], [['url', 'A']]],
        [['url', 'ASC'], [['url', 'A']]],
        [['url', 'D'], [['url', 'D']]],
        [['url', 'DSC'], [['url', 'D']]],
        [['url', 'DESC'], [['url', 'D']]],
        [['url = A'], [['url', 'A']]],
        [['url = ASC'], [['url', 'A']]],
        [['url = D'], [['url', 'D']]],
        [['url = DSC'], [['url', 'D']]],
        [['url = DESC'], [['url', 'D']]],
        [['url = asc'], [['url', 'A']]],
        [['url = dsc'], [['url', 'D']]],
        [
          ['url A, id D'],
          [
            ['url', 'A'],
            ['id', 'D'],
          ],
        ],
        [
          ['url D, id A'],
          [
            ['url', 'D'],
            ['id', 'A'],
          ],
        ],
        [
          ['url, id D', 'A'],
          [
            ['url', 'A'],
            ['id', 'D'],
          ],
        ],
        [
          ['url, id A', 'D'],
          [
            ['url', 'D'],
            ['id', 'A'],
          ],
        ],
        [
          ['url D, id', 'A'],
          [
            ['url', 'D'],
            ['id', 'A'],
          ],
        ],
        [
          ['url D, id', 'D'],
          [
            ['url', 'D'],
            ['id', 'D'],
          ],
        ],
        [
          ['url, id', 'A'],
          [
            ['url', 'A'],
            ['id', 'A'],
          ],
        ],
        [
          ['url, id', 'D'],
          [
            ['url', 'D'],
            ['id', 'D'],
          ],
        ],
        [
          ['url, id', 'a'],
          [
            ['url', 'A'],
            ['id', 'A'],
          ],
        ],
        [
          ['url, id', 'd'],
          [
            ['url', 'D'],
            ['id', 'D'],
          ],
        ],
      ].map(adjust)
    )(`.sort(%s)`, (_, [args, expected]) => {
      ensure('sort').returnsExpectedValue(args, expected)
    })

    describe.each(
      [
        [['foo']],
        [['foo A, id D']],
        [['id X']],
        [[',']],
        [[',,']],
        [['id, url X']],
      ].map(adjust)
    )(`.sort(%s)`, (_, [args]) => {
      ensure('sort').throwsValidationError(args)
    })

    //
    // .order()
    //

    describe.each(
      [
        [[''], 'A'],
        [['  \t'], 'A'],
        [['A'], 'A'],
        [['ASC'], 'A'],
        [['D'], 'D'],
        [['DSC'], 'D'],
        [['DESC'], 'D'],
        [['a'], 'A'],
        [['asc'], 'A'],
        [['d'], 'D'],
        [['dsc'], 'D'],
        [['desc'], 'D'],
        [['\t D \t'], 'D'],
        [['\t DSC \t'], 'D'],
      ].map(adjust)
    )(`.order(%s)`, (_, [args, expected]) => {
      ensure('order').returnsExpectedValue(args, expected)
    })

    describe.each([[['foo']], [['A ASC']], [['D DSC']]].map(adjust))(
      `.order(%s)`,
      (_, [args]) => {
        ensure('order').throwsValidationError(args)
      }
    )

    //
    // .select()
    //

    describe.each(
      [
        [[''], null],
        [['*'], null],
        [[' \t '], null],
        [[' *\t '], null],
        [[' url\t '], ['url']],
        [['url'], ['url']],
        [['assets_url'], ['assets_url']],
        [['upload_url'], ['upload_url']],
        [['htlm_url'], ['htlm_url']],
        [['id'], ['id']],
        [['author'], ['author']],
        [['node_id'], ['node_id']],
        [['tag_name'], ['tag_name']],
        [['target_commitish'], ['target_commitish']],
        [['name'], ['name']],
        [['draft'], ['draft']],
        [['prerelease'], ['prerelease']],
        [['created_at'], ['created_at']],
        [['published_at'], ['published_at']],
        [['assets'], ['assets']],
        [['tarball_url'], ['tarball_url']],
        [['zipball_url'], ['zipball_url']],
        [['body'], ['body']],
        [[' url, id  '], ['url', 'id']],
        [[' url  id  '], ['url', 'id']],
      ].map(adjust)
    )(`.select(%s)`, (_, [args, expected]) => {
      ensure('select').returnsExpectedValue(args, expected)
    })

    describe.each([[['foo']], [[',']], [[' , ']]].map(adjust))(
      `.select(%s)`,
      (_, [args]) => {
        ensure('select').throwsValidationError(args)
      }
    )

    //
    // .slice()
    //

    describe.each(
      [
        [[''], {type: 'A'}],
        [[' \t'], {type: 'A'}],
        [['A'], {type: 'A'}],
        [['ALL'], {type: 'A'}],
        [['a'], {type: 'A'}],
        [['all'], {type: 'A'}],
        [['  a  '], {type: 'A'}],
        [[' all '], {type: 'A'}],
        [['f'], {type: 'F', count: 1}],
        [['f 3'], {type: 'F', count: 3}],
        [['f = 3'], {type: 'F', count: 3}],
        [['first'], {type: 'F', count: 1}],
        [['first 3'], {type: 'F', count: 3}],
        [['first = 3'], {type: 'F', count: 3}],
        [['l'], {type: 'L', count: 1}],
        [['l 9'], {type: 'L', count: 9}],
        [['l = 9'], {type: 'L', count: 9}],
        [['last'], {type: 'L', count: 1}],
        [['last 9'], {type: 'L', count: 9}],
        [['last = 9'], {type: 'L', count: 9}],
        [['12 ...'], {type: 'R', from: 12, to: null}],
        [['12 ... 21'], {type: 'R', from: 12, to: 21}],
      ].map(adjust)
    )(`.slice(%s)`, (_, [args, expected]) => {
      ensure('slice').returnsExpectedValue(args, expected)
    })

    describe.each(
      [
        [['foo']],
        [['A ?']],
        [['f ?']],
        [['f 3 ?']],
        [['f = ?']],
        [['first ?']],
        [['first = ?']],
        [['l ?']],
        [['l = ?']],
        [['last ?']],
        [['last = ?']],
        [['? ...']],
        [['12 ... ?']],
        [['? ... 21']],
      ].map(adjust)
    )(`.slice(%s)`, (_, [args]) => {
      ensure('slice').throwsValidationError(args)
    })
  })

  //
  // getInputs()
  //

  describe.each([
    [
      {
        name: 'with minimal config',

        config: {
          token: '',
          owner: 'octokit',
          repo: 'hello-world',
          per_page: '',
          max_entries: '',
          name: '',
          tag_name: '',
          draft: '',
          prerelease: '',
          sort: '',
          order: '',
          slice: '',
          select: '',
        },

        output: {
          token: null,
          owner: 'octokit',
          repo: 'hello-world',
          per_page: null,
          max_entries: null,
          name: null,
          tag_name: null,
          draft: null,
          prerelease: null,
          sort: null,
          order: 'A',
          slice: {type: 'A'},
          select: null,
        },
      },
    ],
    [
      {
        name: 'with complete config',

        config: {
          token: '$3Cret',
          owner: 'octokit',
          repo: 'hello-world',
          per_page: '3',
          max_entries: '12',
          name: 'v5.3.1',
          tag_name: '5.3.1',
          draft: 'true',
          prerelease: 'false',
          sort: 'id, draft ASC',
          order: 'DSC',
          slice: '2 ... 9',
          select: ' name, id ',
        },

        output: {
          token: '$3Cret',
          owner: 'octokit',
          repo: 'hello-world',
          per_page: 3,
          max_entries: 12,
          name: 'v5.3.1',
          tag_name: '5.3.1',
          draft: true,
          prerelease: false,
          sort: [
            ['id', 'D'],
            ['draft', 'A'],
          ],
          order: 'D',
          slice: {type: 'R', from: 2, to: 9},
          select: ['name', 'id'],
        },
      },
    ],
    [
      {
        name:
          'with regular expressions in "name" & "tag_name" and some wildcards',

        config: {
          token: '$3Cret',
          owner: 'octokit',
          repo: 'hello-world',
          per_page: '3',
          max_entries: '12',
          name: '/^v?\\d+\\.\\d+\\.\\d+$/',
          tag_name: '/^\\d+\\.\\d+\\.\\d+$/',
          draft: '*',
          prerelease: '*',
          sort: '',
          order: '',
          slice: '',
          select: 'name id',
        },

        output: {
          token: '$3Cret',
          owner: 'octokit',
          repo: 'hello-world',
          per_page: 3,
          max_entries: 12,
          name: /^v?\d+\.\d+\.\d+$/,
          tag_name: /^\d+\.\d+\.\d+$/,
          draft: null,
          prerelease: null,
          sort: null,
          order: 'A',
          slice: {type: 'A'},
          select: ['name', 'id'],
        },
      },
    ],
  ])('.getInputs()', ({name, config, output}) => {
    it(`${name}`, () => {
      expect.assertions(1)
      const spy = jest.spyOn(core, 'getInput').mockImplementation(key => {
        return config[key]
      })
      expect(getInputs()).toStrictEqual(output)
      spy.mockRestore()
    })
  })
})

// vim: set ft=javascript ts=2 sw=2 sts=2:

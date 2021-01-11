'use strict'

/* eslint camelcase: [error, {allow: ["per_page", "max_entries", "tag_name"]}] */

const core = require('@actions/core')

class ValidationError extends Error {
  static make(key, value) {
    return new ValidationError(
      `validation failed for input ${key}: ${JSON.stringify(value)}`
    )
  }
}

class InternalError extends Error {}

const validate = {
  sortable: [
    'url',
    'assets_url',
    'upload_url',
    'htlm_url',
    'id',
    'node_id',
    'tag_name',
    'target_commitish',
    'name',
    'draft',
    'prerelease',
    'created_at',
    'published_at',
    'tarball_url',
    'zipball_url',
    'body',
  ],

  selectable: [
    'url',
    'assets_url',
    'upload_url',
    'htlm_url',
    'id',
    'author',
    'node_id',
    'tag_name',
    'target_commitish',
    'name',
    'draft',
    'prerelease',
    'created_at',
    'published_at',
    'assets',
    'tarball_url',
    'zipball_url',
    'body',
  ],

  stringOrRegexp(value) {
    const re = /^(?:\/(.*)\/([a-z]*))$/
    const match = value.match(re)
    if (match) {
      return new RegExp(match[1], match[2])
    }
    return ['', '*'].includes(value) ? null : value
  },

  intOrNull(value, key) {
    const re = /^\s*(\d+|)\s*$/
    const match = value.match(re)
    if (!match) {
      throw ValidationError.make(key, value)
    }
    return match[1] ? parseInt(match[1]) : null
  },

  bool(value, key) {
    const choices = {'': null, '*': null, true: true, false: false}
    if (choices.hasOwnProperty(value)) {
      return choices[value]
    }
    throw ValidationError.make(key, value)
  },

  testWithRegExp(re, value, key) {
    if (!re.test(value)) {
      throw ValidationError.make(key, value)
    }
    return value
  },

  token(value) {
    return value ? value : null
  },

  owner(value) {
    const re = /^(?:[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38})$/i
    return this.testWithRegExp(re, value, 'owner')
  },

  repo(value) {
    const re = /^(?:(?:\.?[_a-z\d-][_a-z\d.-]*)|(?:.\.[_a-z\d.-]+))$/i
    return this.testWithRegExp(re, value, 'repo')
  },

  per_page(value) {
    const num = this.intOrNull(value, 'per_page')
    if (num > 100) {
      throw ValidationError.make('per_page', value)
    }
    return num
  },

  max_entries(value) {
    return this.intOrNull(value, 'max_entries')
  },

  name(value) {
    return this.stringOrRegexp(value)
  },

  tag_name(value) {
    return this.stringOrRegexp(value)
  },

  draft(value) {
    return this.bool(value, 'draft')
  },

  prerelease(value) {
    return this.bool(value, 'prerelease')
  },

  sort(value, defaultOrder = 'A') {
    const trimmed = value.trim()

    if (!trimmed) {
      return null
    }

    const re = new RegExp(
      `^(${this.sortable.join(
        '|'
      )})(?:(?:\\s+|\\s*=\\s*)(A(?:SC)?|D(?:E?SC)?))?$`,
      'i'
    )
    const sep = /\s*,\s*/
    const strings = trimmed.split(sep)

    const fields = []
    for (const string of strings) {
      const match = string.match(re)
      if (!match) {
        throw ValidationError.make('sort', value)
      }
      const key = match[1].toLowerCase()
      const ord = (match[2] ? match[2] : defaultOrder)
        .substring(0, 1)
        .toUpperCase()
      fields.push([key, ord])
    }
    return fields
  },

  order(value) {
    const re = /^\s*(A(?:SC)?|D(?:E?SC)?|)\s*$/i
    const match = value.match(re)

    if (!match) {
      throw ValidationError.make('order', value)
    }

    return (match[1] ? match[1] : 'A').substring(0, 1).toUpperCase()
  },

  select(value) {
    const trimmed = value.trim()

    if (!trimmed || trimmed === '*') {
      return null
    }

    const sep = /(?:\s*,\s*)|\s+/
    const strings = trimmed.split(sep)
    const invalid = strings.filter(string => !this.selectable.includes(string))

    if (invalid.length > 0) {
      throw ValidationError.make('select', value)
    }

    return strings
  },

  slice(value) {
    const re = new RegExp(
      '^\\s*(' +
        '(?:(?<all>A)(?:LL)?)' +
        '|' +
        '(?:(?:(?:(?<first>F)(?:I?RST)?)|(?:(?<last>L)(?:AST)?))(?:(?:\\s+|\\s*=\\s*)(?<count>\\d+))?)' +
        '|' +
        '(?:(?<from>\\d+)\\s*\\.\\.\\.\\s*(?<to>\\d+|))' +
        '|' +
        '' +
        ')\\s*$',
      'i'
    )
    const match = value.match(re)

    if (!match) {
      throw ValidationError.make('slice', value)
    }

    const groups = match.groups

    if (!match[1] || groups.all) {
      return {type: 'A'}
    }

    for (const type of [groups.first, groups.last]) {
      if (type) {
        const count = groups.count
        return {
          type: type.toUpperCase(),
          count: count ? parseInt(count) : 1,
        }
      }
    }

    if (groups.from) {
      return {
        type: 'R',
        from: parseInt(groups.from),
        to: groups.to ? parseInt(groups.to) : null,
      }
    }

    /* istanbul ignore next */
    throw new InternalError(`slice: ${JSON.stringify(value)}`)
  },
}

const getInputs = () => {
  const order = validate.order(core.getInput('order'))
  return {
    token: validate.token(core.getInput('token')),
    owner: validate.owner(core.getInput('owner')),
    repo: validate.repo(core.getInput('repo')),
    name: validate.name(core.getInput('name')),
    per_page: validate.per_page(core.getInput('per_page')),
    max_entries: validate.max_entries(core.getInput('max_entries')),
    tag_name: validate.tag_name(core.getInput('tag_name')),
    draft: validate.draft(core.getInput('draft')),
    prerelease: validate.prerelease(core.getInput('prerelease')),
    sort: validate.sort(core.getInput('sort'), order),
    order,
    slice: validate.slice(core.getInput('slice')),
    select: validate.select(core.getInput('select')),
  }
}

module.exports = {getInputs, validate, ValidationError, InternalError}

// vim: set ft=javascript ts=2 sw=2 sts=2:

"use strict";

const { get, validate, ValidationError, getInputs } = require('../src/inputs');
const core = require('@actions/core');

//
// validate.token()
//

test('validate.token("") is null', () => {
  expect(validate.token("")).toBe(null);
});

for (const value of [
  "0",
  "null",
]) {
  test(`validate.token("${value}") is "${value}"`, () => {
    expect(validate.token(value)).toBe(value);
  });
}

//
// validate.owner()
//

for (const value of [
  'j',
  'john',
  'John-Smith',
  'john1',
  'john1smith',
  'john1-smith',
  'john-1smith',
  '1',
  '123456789012345678901234567890123456789',
]) {
  test(`validate.owner("${value}") is "${value}"`, () => {
    expect(validate.owner(value)).toBe(value);
  });
}

for (const value of [
  '',
  '#$%^',
  '-john',
  'John Smith',
  'john--smith',
  '1234567890123456789012345678901234567890',
  '1-3-5-7-9-1-3-5-7-9-1-3-5-7-9-1-3-5-7-90',
]) {
  test(`validate.owner("${value}") throws ValidationError('validation failed for input owner: "${value}"')`, () => {
    const call = () => {
      return validate.owner(value);
    };
    expect(call).toThrowError(new ValidationError(`validation failed for input owner: "${value}"`))
  });
}

//
// validate.repo()
//

for (const value of [
  '-',
  '_',
  'r',
  'repo',
  'Repo1',
  'My-Awesome_Repo',
  'My--Awesome__Repo',
  '_My.Awesome.Repo',
  '-repo',
  '_repo',
  '.repo',
  '..repo',
  '.r.epo',
]) {
  test(`validate.repo("${value}") is "${value}"`, () => {
    expect(validate.repo(value)).toBe(value);
  });
}

for (const value of [
  '',
  '.',
  '..',
  're%po',
]) {
  test(`validate.repo("${value}") throws ValidationError('validation failed for input repo: "${value}"')`, () => {
    const call = () => {
      return validate.repo(value);
    };
    expect(call).toThrowError(new ValidationError(`validation failed for input repo: "${value}"`))
  });
}

//
// validate.per_page()
//

for (const { value, output } of [
  { value: '  ',      output: null },
  { value: '1',       output: 1 },
  { value: '100',     output: 100 },
  { value: '  100  ', output: 100 },
]) {
  test(`validate.per_page("${value}") is ${JSON.stringify(output)}"`, () => {
    expect(validate.per_page(value)).toBe(output);
  });
}

for (const value of [
  '.',
  '123$#',
  '-1',
  '101',
]) {
  test(`validate.per_page("${value}") throws ValidationError('validation failed for input per_page: "${value}"')`, () => {
    const call = () => {
      return validate.per_page(value);
    };
    expect(call).toThrowError(new ValidationError(`validation failed for input per_page: "${value}"`))
  });
}

//
// validate.max_entries()
//

for (const { value, output } of [
  { value: '  ',      output: null },
  { value: '1',       output: 1 },
  { value: '123',     output: 123 },
  { value: '  123  ', output: 123 },
]) {
  test(`validate.max_entries("${value}") is ${JSON.stringify(output)}"`, () => {
    expect(validate.max_entries(value)).toBe(output);
  });
}

for (const value of [
  '.',
  '123$#',
  '-1',
]) {
  test(`validate.max_entries("${value}") throws ValidationError('validation failed for input max_entries: "${value}"')`, () => {
    const call = () => {
      return validate.max_entries(value);
    };
    expect(call).toThrowError(new ValidationError(`validation failed for input max_entries: "${value}"`))
  });
}

//
// validate.name()
//

for (const value of [
  "",
  "*",
]) {
  test(`validate.name("${value}") is null`, () => {
    expect(validate.name(value)).toBe(null);
  });
}

for (const value of [
  "-",
  ".",
  "v1.0",
  "latest",
  "&EJH$#",
]) {
  test(`validate.name("${value}") is "${value}"`, () => {
    expect(validate.name(value)).toBe(value);
  });
}

for (const { value, pattern, flags } of [
  {value: "//",       pattern: "",      flags: ""},
  {value: "/asdf/ig", pattern: "asdf",  flags: "ig"},
  {value: "/\\//",    pattern: "\\/",   flags: ""},
  {value: "/\\//g",   pattern: "\\/",   flags: "g"},
]) {
  test(`validate.name("${value}") equals RegExp("${pattern}", "${flags}")`, () => {
    expect(validate.name(value)).toStrictEqual(new RegExp(pattern, flags));
  });
}

for (const value of [
  "/\\/\\/g"
]) {
  test(`validate.name("${value}") throws SyntaxError)`, () => {
    const call = () => {
      return validate.name(value)
    };
    expect(call).toThrowError(SyntaxError);
  });
}

//
// validate.tag_name()
//

for (const value of [
  "",
  "*",
]) {
  test(`validate.tag_name("${value}") is null`, () => {
    expect(validate.tag_name(value)).toBe(null);
  });
}

for (const value of [
  "-",
  ".",
  "v1.0",
  "latest",
  "&EJH$#",
]) {
  test(`validate.tag_name("${value}") is "${value}"`, () => {
    expect(validate.tag_name(value)).toBe(value);
  });
}

for (const { value, pattern, flags } of [
  {value: "//",       pattern: "",     flags: ""},
  {value: "/asdf/ig", pattern: "asdf", flags: "ig"},
  {value: "/\\//",    pattern: "\\/",  flags: ""},
  {value: "/\\//g",   pattern: "\\/",  flags: "g"},
]) {
  test(`validate.tag_name("${value}") equals RegExp("${pattern}", "${flags}")`, () => {
    expect(validate.tag_name(value)).toStrictEqual(new RegExp(pattern, flags));
  });
}

for (const value of [
  "/\\/\\/g"
]) {
  test(`validate.tag_name("${value}") throws SyntaxError)`, () => {
    const call = () => {
      return validate.tag_name(value)
    };
    expect(call).toThrowError(SyntaxError);
  });
}

//
// validate.draft()
//

for (const {input, output} of [
  { input: "",      output: null },
  { input: "*",     output: null },
  { input: "true",  output: true},
  { input: "false", output: false},
]) {
  test(`validate.draft("${input}") is ${JSON.stringify(output)}`, () => {
    expect(validate.draft(input)).toBe(output);
  });
}

for (const value of [
  'foo',
]) {
  test(`validate.draft("${value}") throws ValidationError('validation failed for input draft: "${value}"')`, () => {
    const call = () => {
      return validate.draft(value);
    };
    expect(call).toThrowError(new ValidationError(`validation failed for input draft: "${value}"`))
  });
}

//
// validate.prerelease()
//

for (const {input, output} of [
  { input: "",      output: null },
  { input: "*",     output: null },
  { input: "true",  output: true},
  { input: "false", output: false},
]) {
  test(`validate.prerelease("${input}") is ${JSON.stringify(output)}`, () => {
    expect(validate.prerelease(input)).toBe(output);
  });
}

for (const value of [
  'foo',
]) {
  test(`validate.prerelease("${value}") throws ValidationError('validation failed for input prerelease: "${value}"')`, () => {
    const call = () => {
      return validate.prerelease(value);
    };
    expect(call).toThrowError(new ValidationError(`validation failed for input prerelease: "${value}"`))
  });
}

//
// validate.sort()
//
for (const {input, output} of [
  { input: [""],                 output: null },
  { input: ["url"],              output: [["url", "A"]]},
  { input: [" \turl "],          output: [["url", "A"]]},
  { input: ["url \t"],           output: [["url", "A"]]},
  { input: ["assets_url"],       output: [["assets_url", "A"]] },
  { input: ["upload_url"],       output: [["upload_url", "A"]] },
  { input: ["htlm_url"],         output: [["htlm_url", "A"]] },
  { input: ["id"],               output: [["id", "A"]] },
  { input: ["node_id"],          output: [["node_id", "A"]] },
  { input: ["tag_name"],         output: [["tag_name", "A"]] },
  { input: ["target_commitish"], output: [["target_commitish", "A"]] },
  { input: ["name"],             output: [["name", "A"]] },
  { input: ["draft"],            output: [["draft", "A"]] },
  { input: ["prerelease"],       output: [["prerelease", "A"]] },
  { input: ["created_at"],       output: [["created_at", "A"]] },
  { input: ["published_at"],     output: [["published_at", "A"]] },
  { input: ["tarball_url"],      output: [["tarball_url", "A"]] },
  { input: ["zipball_url"],      output: [["zipball_url", "A"]] },
  { input: ["body"],             output: [["body", "A"]] },
  { input: ["url, id"],          output: [["url", "A"], ["id", "A"]]},
  { input: ["url A"],            output: [["url", "A"]]},
  { input: ["url D"],            output: [["url", "D"]]},
  { input: ["url", "A"],         output: [["url", "A"]]},
  { input: ["url", "ASC"],       output: [["url", "A"]]},
  { input: ["url", "D"],         output: [["url", "D"]]},
  { input: ["url", "DSC"],       output: [["url", "D"]]},
  { input: ["url", "DESC"],      output: [["url", "D"]]},
  { input: ["url = A"],          output: [["url", "A"]]},
  { input: ["url = ASC"],        output: [["url", "A"]]},
  { input: ["url = D"],          output: [["url", "D"]]},
  { input: ["url = DSC"],        output: [["url", "D"]]},
  { input: ["url = DESC"],       output: [["url", "D"]]},
  { input: ["url = asc"],        output: [["url", "A"]]},
  { input: ["url = dsc"],        output: [["url", "D"]]},
  { input: ["url A, id D"],      output: [["url", "A"], ["id", "D"]]},
  { input: ["url D, id A"],      output: [["url", "D"], ["id", "A"]]},
  { input: ["url, id D", "A"],   output: [["url", "A"], ["id", "D"]]},
  { input: ["url, id A", "D"],   output: [["url", "D"], ["id", "A"]]},
  { input: ["url D, id", "A"],   output: [["url", "D"], ["id", "A"]]},
  { input: ["url D, id", "D"],   output: [["url", "D"], ["id", "D"]]},
  { input: ["url, id", "A"],     output: [["url", "A"], ["id", "A"]]},
  { input: ["url, id", "D"],     output: [["url", "D"], ["id", "D"]]},
  { input: ["url, id", "a"],     output: [["url", "A"], ["id", "A"]]},
  { input: ["url, id", "d"],     output: [["url", "D"], ["id", "D"]]},
]) {
  test(`validate.sort(${input.map(JSON.stringify).join(', ')}) is ${JSON.stringify(output)}`, () => {
    expect(validate.sort(...input)).toStrictEqual(output);
  });
}

for (const input of [
  ["foo"],
  ["foo A, id D"],
  ["id X"],
  [","],
  [",,"],
  ["id, url X"],
]) {
  test(`validate.sort(${input.map(JSON.stringify).join(', ')}) throws ValidationError('validation failed for input sort: "${input[0]}"')`, () => {
    const call = () => {
      return validate.sort(...input);
    };
    expect(call).toThrowError(new ValidationError(`validation failed for input sort: "${input[0]}"`));
  });
}

//
// validate.order()
//

for (const {input, output} of [
  { input: "",          output: "A"},
  { input: "  \t",      output: "A"},
  { input: "A",         output: "A"},
  { input: "ASC",       output: "A"},
  { input: "D",         output: "D"},
  { input: "DSC",       output: "D"},
  { input: "DESC",      output: "D"},
  { input: "a",         output: "A"},
  { input: "asc",       output: "A"},
  { input: "d",         output: "D"},
  { input: "dsc",       output: "D"},
  { input: "desc",      output: "D"},
  { input: "\t D \t",   output: "D"},
  { input: "\t DSC \t", output: "D"},
]) {
  test(`validate.order("${input}") is ${JSON.stringify(output)}`, () => {
    expect(validate.order(input)).toBe(output);
  });
}

for (const value of [
  "foo",
  "A ASC",
  "D DSC",
]) {
  test(`validate.order("${value}") throws ValidationError('validation failed for input order: "${value}"')`, () => {
    const call = () => {
      return validate.order(value);
    };
    expect(call).toThrowError(new ValidationError(`validation failed for input order: "${value}"`))
  });
}

//
// validate.select()
//
for (const {input, output} of [
  { input: "",                 output: null },
  { input: "*",                output: null },
  { input: " \t ",             output: null },
  { input: " *\t ",            output: null },
  { input: " url\t ",          output: ["url"] },
  { input: "url",              output: ["url"] },
  { input: "assets_url",       output: ["assets_url"] },
  { input: "upload_url",       output: ["upload_url"] },
  { input: "htlm_url",         output: ["htlm_url"] },
  { input: "id",               output: ["id"] },
  { input: "author",           output: ["author"] },
  { input: "node_id",          output: ["node_id"] },
  { input: "tag_name",         output: ["tag_name"] },
  { input: "target_commitish", output: ["target_commitish"] },
  { input: "name",             output: ["name"] },
  { input: "draft",            output: ["draft"] },
  { input: "prerelease",       output: ["prerelease"] },
  { input: "created_at",       output: ["created_at"] },
  { input: "published_at",     output: ["published_at"] },
  { input: "assets",           output: ["assets"] },
  { input: "tarball_url",      output: ["tarball_url"] },
  { input: "zipball_url",      output: ["zipball_url"] },
  { input: "body",             output: ["body"] },
  { input: " url, id  ",       output: ["url", "id"] },
  { input: " url  id  ",       output: ["url", "id"] },
]) {
  test(`validate.select(${JSON.stringify(input)}) is ${JSON.stringify(output)}`, () => {
    expect(validate.select(input)).toStrictEqual(output);
  });
}

for (const input of [
  "foo",
  ",",
  " , ",
]) {
  test(`validate.select(${JSON.stringify(input)}) throws ValidationError('validation failed for input select: ${JSON.stringify(input)}')`, () => {
    const call = () => {
      return validate.select(input);
    };
    expect(call).toThrowError(new ValidationError(`validation failed for input select: ${JSON.stringify(input)}`));
  });
}

//
// validate.slice()
//

for (const {input, output} of [
  { input: "",          output: { type: "A" }},
  { input: " \t",       output: { type: "A" }},
  { input: "A",         output: { type: "A" }},
  { input: "ALL",       output: { type: "A" }},
  { input: "a",         output: { type: "A" }},
  { input: "all",       output: { type: "A" }},
  { input: "  a  ",     output: { type: "A" }},
  { input: " all ",     output: { type: "A" }},
  { input: "f",         output: { type: "F", count: 1}},
  { input: "f 3",       output: { type: "F", count: 3}},
  { input: "f = 3",     output: { type: "F", count: 3}},
  { input: "first",     output: { type: "F", count: 1}},
  { input: "first 3",   output: { type: "F", count: 3}},
  { input: "first = 3", output: { type: "F", count: 3}},
  { input: "l",         output: { type: "L", count: 1}},
  { input: "l 9",       output: { type: "L", count: 9}},
  { input: "l = 9",     output: { type: "L", count: 9}},
  { input: "last",      output: { type: "L", count: 1}},
  { input: "last 9",    output: { type: "L", count: 9}},
  { input: "last = 9",  output: { type: "L", count: 9}},
  { input: "12 ...",    output: { type: "R", from: 12, to: null}},
  { input: "12 ... 21", output: { type: "R", from: 12, to: 21}},
]) {
  test(`validate.slice("${input}") is ${JSON.stringify(output)}`, () => {
    expect(validate.slice(input)).toStrictEqual(output);
  });
}

for (const value of [
  "foo",
  "A ?",
  "f ?",
  "f 3 ?",
  "f = ?",
  "first ?",
  "first = ?",
  "l ?",
  "l = ?",
  "last ?",
  "last = ?",
  "? ...",
  "12 ... ?",
  "? ... 21",
]) {
  test(`validate.slice("${value}") throws ValidationError('validation failed for input slice: "${value}"')`, () => {
    const call = () => {
      return validate.slice(value);
    };
    expect(call).toThrowError(new ValidationError(`validation failed for input slice: "${value}"`))
  });
}


//
// getInputs()
//

for ( const { name, config, output } of [
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
      slice: { type: 'A' },
      select: null,
    }
  },

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
      select: ' name, id '
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
      sort: [['id', 'D'], ['draft', 'A']],
      order: 'D',
      slice: { type: 'R', from: 2, to: 9 },
      select: ['name', 'id'],
    }
  },

  {
    name: 'with regular expressions in "name" & "tag_name" and some wildcards',

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
      slice: { type: 'A' },
      select: ['name', 'id']
    }
  },
]) {
  test(`getInputs() ${name}`, () => {

    const spy = jest.spyOn(core, 'getInput').mockImplementation(
      (key) => { return config[key]; }
    );
    expect(getInputs()).toStrictEqual(output);
    spy.mockRestore();
  });
}

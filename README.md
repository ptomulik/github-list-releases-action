# List Releases

![tests](https://github.com/ptomulik/github-list-releases-action/workflows/Tests/badge.svg?branch=master)
![build](https://github.com/ptomulik/github-list-releases-action/workflows/Build/badge.svg?branch=master)
![code](https://github.com/ptomulik/github-list-releases-action/workflows/Code%20Quality/badge.svg?branch=master)
[![coverage](https://coveralls.io/repos/github/ptomulik/github-list-releases-action/badge.svg?branch=master)](https://coveralls.io/github/ptomulik/github-list-releases-action?branch=master)

### WARNING!

This action is still under development and may change essentially! Do not use
in production.

### Description

This action retrieves an array of releases from a remote GitHub repository by
using GitHub [list releases](https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#list-releases)
API. By default, complete array of remote releases is returned, as retrieved by
the API client. By configuring certain options (action's inputs), the retrieved
array may be processed (filtered, sorted, etc..) before it gets outputted.

### Rationale

Some GitHub repositories depend on assets released by upstream repositories. A
repository that generates Docker images containing such assets is an example.
Whenever a new version of the downstream repository is tagged or a new upstream
release is published, we should build and publish new versions of docker
images. This requires, however, some knowledge about existing upstream
releases. A list of releases with URLs pointing to assets is essential. It can
be retrieved easily with the
[github-list-releases-action](https://github.com/ptomulik/github-list-releases-action).

## Table of Contents

- [Inputs](#inputs)
  - [token](#token)
  - [owner](#owner)\*, [repo](#repo)\*
  - [per\_page](#per_page), [max\_entries](#max_entries)
  - [name](#name), [tag\_name](#tag_name), [draft](#draft),
    [prerelease](#prerelease)
  - [sort](#sort), [order](#order), [select](#select), [slice](#slice)
- [Outputs](#outputs)
  - [json](#json), [base64](#base64), [count](#count)
- [Examples](#examples)
  - [Get & Print Releases](#get--print-releases)

## Inputs

Here is a short summary of inputs. Inputs denoted with * are required.

| input                         | description                                                 |
| ----------------------------- | ----------------------------------------------------------- |
| [token](#token)               | Personal token provided to GitHub API client                |
| [owner](#owner)\*             | Owner of the upstream repository                            |
| [repo](#repo)\*               | Name of the upstream repository                             |
| [per\_page](#per_page)        | Page size used by paginator                                 |
| [max\_entries](#max_entries)  | Max number of requested entries                             |
| [name](#name)                 | Used to filter retrieved releases by name                   |
| [tag\_name](#tag_name)        | Used to filter releases by tag\_name                        |
| [draft](#draft)               | Used to filter releases by draft status                     |
| [prerelease](#prerelease)     | Used to filter retrieved releases by prerelease status      |
| [sort](#sort)                 | Used for sorting the retrieved releases                     |
| [order](#order)               | Default sort order                                          |
| [select](#select)             | List of properties to be included                           |
| [slice](#slice)               | The range of entries to be returned                         |

### token

Personal token may be provided to perform authentication in order to avoid rate
limiting and other GitHub restrictions that apply to anonymous users. If token
is missing or empty, authentication is not performed and requests are sent
anonymously.

### owner

**Required** Repository owner.

Owner of the remote repository being queried, for example ``github`` for
[github/docs](https://github.com/github/docs) repository.

### repo

**Required** Repository name.

Name of the remote repository being queried, for example ``docs`` for
[github/docs](https://github.com/github/docs) repository.

### per\_page

GitHub API enforces pagination. The page size is settable, maximum page
size is 100. Default page size is 30. This input changes the default page size
used by paginator, the whole list is retrieved page by page and assembled on
client side.

### max\_entries

Max number of entries retrieved from remote repository.

### name

String used to filter retrieved releases by name.

Selects releases with certain name(s). The parameter may be set
to a specific release name, may be a regular expression (possibly with
flags) or may be missing or empty to allow any name (the same may be achieved
by setting ``name: '*'``).

**Examples**:

Allow any name,

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        name: '*'
```

Select release(s) with name == 'specific'

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        name: 'specific'
```

Select releases whose names match a regular expression.

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        name: '/^v?5.3.\d+$/'
```
The regular expression may also contain flags

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        name: '/^latest$/i'
```

### tag\_name

String used to filter retrieved releases by tag\_name.

Selects releases with certain tag name(s). The parameter may be set to a
specific name, may be a regular expression (possibly with flags) or may be
missing or empty to allow any name (the same may be achieved by setting
``name: '*'``).


### draft

Allows selecting draft/non-draft releases. Supported values are ``false``,
``true`` and ``*``. If missing or empty, allows releases with any draft status.

### prerelease

Allows selecting prereleases/non-prereleases. Supported values are ``false``,
``true`` and ``*``. If missing or empty, allows releases with any draft status.

### sort

Comma-separated list of release properties that shall be used as sort keys when
sorting the resultant array. Each property may optionally be followed by order
specifier - ``'A'``|``'ASC'`` (ascending) or ``'D'``|``'DSC'``|``'DESC'`` (descending). If
order specifier is omitted for given key, the default [order](#order) is used.

**Note**: the order of keys in [sort](#sort) is important.

**Supported (sortable) properties**:

|                  |                      |                 |                 |                |                |
| ---------------- | -------------------- | --------------- | --------------- | -------------- | -------------- |
| ``url``          | ``assets_url``       | ``upload_url``  | ``htlm_url``    | ``id``         | ``node_id``    |
| ``tag_name``     | ``target_commitish`` | ``name``        | ``draft``       | ``prerelease`` | ``created_at`` |
| ``published_at`` | ``tarball_url``      | ``zipball_url`` | ``body``        | ``body_html``  | ``body_text``  |

**Examples**:

Sort by ``id``.

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        sort: 'id'
```

Sort by ``id`` in descending order.

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        sort: 'id DSC'
```

Sort by ``draft`` status in ascending order (``false`` goes before ``true``)
then by ``name`` in descending order.

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        sort: 'draft = ASC, name = DSC'
```

### order

Default sort order. Allowed values are ``'A'``|``'ASC'`` (ascending) or
``'D'``|``'DSC'``|``'DESC'`` (descending). If missing or empty, the default
sort order is ascending.

### select

List of properties to be included in each entry of the result. This should
be a space or comma separated list of keywords. If missing or empty, allows all
properties (the same may be achieved with ``'*'``).

**Supported (selectable) properties**:

|                |                  |                      |                 |                 |                |
| -------------- | ---------------- | -------------------- | ----------------| ----------------| -------------- |
| ``url``        | ``assets_url``   | ``upload_url``       | ``htlm_url``    | ``id``          | ``author``     |
|``node_id``     | ``tag_name``     | ``target_commitish`` | ``name``        | ``draft``       | ``prerelease`` |
| ``created_at`` | ``published_at`` | ``assets``           | ``tarball_url`` | ``zipball_url`` | ``body``       |
| ``body_html``  | ``body_text``    |                      |                 |                 |                |

**Examples**:

Select only ``name`` and ``url``

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        select: 'name, url'
```

### slice

The range of entries to be returned.

Determines the range of entries to be sliced after sorting.

**Examples**:

Return all entries

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        slice: 'all'
```

Return first entry

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        slice: 'first'
```

Return up to 3 first entries

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        slice: 'first 3'
```

Return last entry

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        slice: 'last'
```

Return up to 3 last entries

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        slice: 'last 3'
```

Return entries 2 to 4 (zero-based indices)

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        slice: '2 ... 4'
```

Return entries from 2 to end of array

```yaml
  - uses: ptomulik/github-list-releases-action@v0
    with:
        slice: '2 ...'
```

## Outputs

Here is a short summary of outputs.

| output                        | description                                                 |
| ----------------------------- | ------------------------------------------ |
| [json](#json)                 | The result as JSON string.                 |
| [base64](#base64)             | The [json](#json) string encoded in BASE64 |
| [count](#count)               | The number of entries outputted            |

### json

The result as JSON string.

### base64

The [json](#json) string encoded in BASE64.

### count

Number of entries on output.

## Examples

### Get & Print Releases

The following workflow prints to console releases retrieved from remote
repository. The workflow may be triggered
[manually](https://github.blog/changelog/2020-07-06-github-actions-manual-triggers-with-workflow_dispatch/),
and most of the action's inputs may be provided via HTML form.

Note that ``work_dispatch`` only works on default branch.

```yaml
---
name: Get & Print Releases

on:
    workflow_dispatch:
        inputs:
            owner:
                description: 'owner'
                required: true
                default: 'ptomulik'
            repo:
                description: 'repo'
                required: true
                default: 'github-list-releases-action'
            name:
                description: 'name (e.g. "Release v1.2.3")'
                required: false
            tag_name:
                description: 'tag_name (e.g. "v1.2.3")'
                required: false
                default: '/v0\.\d+.\d+/'
            draft:
                description: 'draft ("true" or "false")'
                required: false
            prerelease:
                description: 'prerelease ("true" or "false")'
                required: false
            sort:
                description: 'sort (e.g. "tag_name DSC, id DSC")'
                required: false
                default: id DSC
            select:
                description: 'select (e.g. "id, tag_name, url")'
                required: false
                default: id, name, tag_name, created_at, published_at, url
            slice:
                description: 'slice (e.g. "first 3")'
                required: false

jobs:
    main:
        name: Get & Print Releases
        runs-on: ubuntu-latest

        steps:

            - name: List Releases
              id: releases
              uses: ptomulik/github-list-releases-action@v0
              with:
                  token: ${{ secrets.GET_RELEASES_TOKEN }}
                  owner: ${{ github.event.inputs.owner }}
                  repo: ${{ github.event.inputs.repo }}
                  name: ${{ github.event.inputs.name }}
                  tag_name: ${{ github.event.inputs.tag_name }}
                  draft: ${{ github.event.inputs.draft }}
                  prerelease: ${{ github.event.inputs.prerelease }}
                  sort: ${{ github.event.inputs.sort }}
                  select: ${{ github.event.inputs.select }}
                  slice: ${{ github.event.inputs.slice }}

            - name: Print Releases
              run: |
                  echo -n 'releases: ' && jq '' <<'!'
                  ${{ steps.releases.outputs.json }}
                  !
                  echo 'count: ${{ steps.releases.outputs.count }}'

# vim: set ft=yaml ts=4 sw=4 sts=2 et:
```

Console output for workflow's default inputs:

```console
releases: [
  {
    "id": 36197357,
    "name": "Release v0.1.0",
    "tag_name": "v0.1.0",
    "created_at": "2021-01-10T16:22:17Z",
    "published_at": "2021-01-10T16:24:35Z",
    "url": "https://api.github.com/repos/ptomulik/github-list-releases-action/releases/36197357"
  },
  {
    "id": 36185784,
    "name": "Release v0.0.1",
    "tag_name": "v0.0.1",
    "created_at": "2021-01-09T22:44:38Z",
    "published_at": "2021-01-09T22:45:16Z",
    "url": "https://api.github.com/repos/ptomulik/github-list-releases-action/releases/36185784"
  },
  {
    "id": 36185144,
    "name": "Release v0.0.0",
    "tag_name": "v0.0.0",
    "created_at": "2021-01-09T21:41:45Z",
    "published_at": "2021-01-09T21:54:33Z",
    "url": "https://api.github.com/repos/ptomulik/github-list-releases-action/releases/36185144"
  }
]
count: 3
```

## LICENSE

Copyright (c) 2021 by Paweł Tomulik <ptomulik@meil.pw.edu.pl>

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

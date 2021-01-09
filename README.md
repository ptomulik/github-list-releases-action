# Get Releases

This action retrieves an array of releases from a remote GitHub repository
returning it as JSON content.

## Inputs

### token

Personal token.

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

Page size.

GitHub API enforces pagination. The page size is settable, maximum page
size is 100. Default page size is 30. This input changes the default page size
used by paginator, the whole list is retrieved page by page and assembled on
client side.

### max\_entries

Max number of entries retrieved from remote repository.

### name

String used to filter retrieved releases by name.

Select releases whose names match given criteria. The parameter may be set
to a specific release name, may be a regular expression (possibly with
flags) or may be missing or empty to allow any name (the same may be achieved
by name to ``*``).

#### Examples:

Allow any name,

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        name: "*"
```

Select release(s) with name == "specific"

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        name: "specific"
```

Select releases whose names match a regular expession, the regular expession
may also contain flags

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        name: "/^v?5.3.\d+$/"
```

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        name: "/^latest$/i"
```

### tag\_name

String used to filter retrieved releases by tag_name.

Select releases whose tag names match given criteria. The parameter may be set
to a specific name, may be a regular expression (possibly with flags) or may be
missing or empty to allow any name (the same may be achieved by name to ``*``).


### draft

Value used to filter retrieved releases by draft status.

Allows selecting draft/non-draft releases. Suported values are ``false``,
``true`` and ``*``. If missing or empty, allows releases with any draft status.

### prerelease

Value used to filter retrieved releases by prerelease status.

Allows selecting prereleases/non-prereleases.Suported values are ``false``,
``true`` and ``*``. If missing or empty, allows releases with any draft status.

### sort

List of properties used for sorting the retrieved releases.

Comma-separated list of property names, each optionally followed by order
specifier - ``"A"``|``"ASC"`` (ascending) or ``"D"``|``"DSC"``|``"DESC"``
(descending). Used to sort the resultant array.'

### Examples:

Sort by ``id``.

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        sort: 'id'
```

Sort by ``id`` in descending order.

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        sort: 'id DSC'
```

Sort by ``draft`` status in ascendig order (``false`` goes first) then by
``name`` in descending order.

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        sort: 'draft = ASC, name = DSC'
```

### order

Default sort order.

Allowed values are ``"A"``|``"ASC"`` (ascending) or ``"D"``|``"DSC"``|``"DESC"``
(descending). If missing or empty, the default sort order is ascending.

### select

List of properties to be returned.

List of properties to be included in each entry of the result. This should
be a space or comma separated list of keywords. If missing or empty, allows all
properties (the same may be achieved with ``"*"``).

#### Examples:

Select only ``name`` and ``url``

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        select: 'name, url'
```

### slice

The range of entries to be returned.

Determines the range of entries to be sliceed after sorting.

### Examples

Return all entries

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        slice: 'all'
```

Return first entry

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        slice: 'first'
```

Return up to 3 first entries

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        slice: 'first 3'
```

Return last entry

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        slice: 'last'
```

Return up to 3 last entries

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        slice: 'last 3'
```

Return entries 2 to 4 (zero-based indices)

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        slice: '2 ... 4'
```

Return entries from 2 to end of array

```yaml
  - uses: ptomulik/github-action-get-releases@v0
    with:
        slice: '2 ...'
```

## Outputs

### json

The result as JSON string.

### base64

The ``json`` string encoded in BASE64.

### count

Number of entries on output.

## Example usage

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
                description: 'Owner'
                required: true
                default: 'code-lts'
            repo:
                description: 'Repo'
                required: true
                default: 'doctum'
            name:
                description: 'Name'
                required: false
            tag_name:
                description: 'Tag'
                required: false
                default: '/v5\.2\.\d+/'
            draft:
                description: 'Draft'
                required: false
            prerelease:
                description: 'Prerelease'
                required: false
            sort:
                description: 'Sort'
                required: false
                default: id DSC
            select:
                description: 'Select'
                required: false
                default: id, name, tag_name, created_at, published_at, url
            slice:
                description: 'Slice'
                required: false

jobs:
    main:
        name: Get & Print Releases
        runs-on: ubuntu-latest

        steps:

            - name: Get Releases
              id: releases
              uses: ptomulik/github-action-get-releases@v0
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

# vim: set ft=yaml ts=4 sw=4 sts=4 et:
```

Console output for default workflow inputs

```console
releases: [
  {
    "id": 34601898,
    "name": "v5.2.1",
    "tag_name": "v5.2.1",
    "created_at": "2020-11-30T21:08:01Z",
    "published_at": "2020-11-30T21:10:57Z",
    "url": "https://api.github.com/repos/code-lts/doctum/releases/34601898"
  },
  {
    "id": 34553342,
    "name": "v5.2.0",
    "tag_name": "v5.2.0",
    "created_at": "2020-11-29T21:45:55Z",
    "published_at": "2020-11-29T21:54:06Z",
    "url": "https://api.github.com/repos/code-lts/doctum/releases/34553342"
  }
]
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

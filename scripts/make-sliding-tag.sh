#!/bin/sh

getSlidingTag() {
  sed -e '/^v[0-9]\+\.[0-9]\+\.[0-9]\+/!d' \
      -e 's/^\(v[0-9]\+\)\.[0-9]\+\.[0-9]\+/\1/';
}


if [ $# -lt 1 ]; then
  echo "error: missing argument" >&2;
  exit 1;
fi

nextVersion="$1";
slidingTag=`echo "$nextVersion" | getSlidingTag`;

if [ -z "$slidingTag" ]; then
  echo "error: invalid argument {$nextVersion}" >&2;
  exit 1;
fi

echo "$slidingTag";

#!/bin/bash

set -e

if [[ "$(git status --porcelain)" != "" ]]; then
  echo '::error::Unstaged changes detected.'
  echo ''
  echo '-----------------------------------------'
  echo git status
  echo '-----------------------------------------'
  git status
  echo '-----------------------------------------'
  echo git diff
  echo '-----------------------------------------'
  git diff
  exit 1
fi

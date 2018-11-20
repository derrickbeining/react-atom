#!/bin/sh

npm run lint;
npm test;

STAGED_FILES=$(git diff --name-only --cached)

if [[ $STAGED_FILES =~ 'src' || $STAGED_FILES =~ 'README' ]]; then
  echo
  echo "Detected doc-related changes"
  echo "Building docs..."
  echo
  npm run build:docs;
  git add docs;
fi

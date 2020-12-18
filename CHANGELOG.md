# Changelog

## UNRELEASED FORK
- Change default behaviour to resolve files using node's resolve algorithm.
- Add argument to disable resolve, fall back to finding in the defined `basedir`.
- Add support for `--basedir` argument to define base for resolving/finding.
- Parse CLI arguments using [`yargs`](https://github.com/yargs/yargs) library.
- Remove support for nested "import" statements.
- TODO: Remove resolve/search cli argument and change to a different control string.
- TODO: Fix tests

## 4.1.1
- Updated README.

## 4.1.0
- Updated README.

## 4.0.1
- Changed: `Used before` validation is now only optional (using -u or --unique).
- Changed: improved output messages.
- Added: circular reference detection validation.
- Fix: bug not concatenating first line import statements sometimes.

## 4.0.0
- Unpublished.

## 3.0.2
- Fix: typo in README.md.

## 3.0.1
- Changed: README.md changes.

## 3.0.0
- Changed: syntax of the `@import` statement must now include parentheses.
- Added: syntax validation of the `@import` statement.

## 2.1.1
- Fix: Removed unused dependencies.

## 2.1.0
- Added: -s, --silent options to run silently if no errors occur.

## 2.0.1
- Changed: create destination directory recursively.

## 2.0.0
- Changed: create destination directory if it does not exists.
- Changed: @import filename paths must be relative to the containing file.

## 1.1.1
- Added: npm package.json file with correct keywords.

## 1.1.0
- Added: -v, --version options to display the current version.

## 1.0.1
- Added: functionality: concatenation of files.
- Added: validation: @import statement: uniqueness.
- Added: validation: @import statement: existence.

## 1.0.0
- Skipped due to publish error.

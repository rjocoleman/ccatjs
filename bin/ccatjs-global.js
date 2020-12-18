#! /usr/bin/env node

const lib = require('../index.js');
const fs = require('fs');
var args = require('yargs/yargs')(process.argv.slice(2))
    .usage('Usage: $0 [options] <source> <dest>')
    .alias('s', 'silent')
    .describe('s', 'Runs silent when no errors occur')
    .default('s', false)
    .alias('u', 'unique')
    .describe('u', 'Enables check to see if all file references are unique')
    .default('u', false)
    .boolean('f')
    .alias('s', 's')
    .describe('s', 'Search the directories up from `basedir` will be searched (if false resolve using node\'s algorithm)')
    .alias('b', 'basedir')
    .describe('b', 'Base Directory to resolve/find from')
    .default('b', process.cwd())
    .help('h')
    .alias('h', 'help')
    .demandCommand(2)
    .argv;

_entryFile = args._[0];
_destFile  = args._[1];

// Check to ensure _entryFile exists
if (!fs.existsSync(_entryFile)) {
    console.error("Cannot find `<source>` file: `" + _entryFile + "`.");
    process.exit(1);
}

// Process ccatjs.
lib.concatJs(_entryFile, _destFile, args.silent, args.unique, args.search, args.basedir);

#! /usr/bin/env node

const lib = require("../index.js");
const fs = require("fs");

// Get arguments without the first two.
var args = process.argv.splice(2);

// Vars.
var _entryFile;
var _destFile;
var _silent = false;
var _unique = false;

// Process args.
processArgs();

// Process ccatjs.
lib.concatJs(_entryFile, _destFile, _silent, _unique);

function processArgs()
{
    if (args.length >= 1)
    {

        // Help.
        if (hasAnyArgs("-h", "--help"))
        {
            showHelp();
            process.exit();
        }

        // Version.
        if (hasAnyArgs("-v", "--version"))
        {
            showVersion();
            process.exit();
        }

        // Unique.
        if (hasAnyArgs("-u", "--unique"))
        {
            _unique = true;
        }

        // Silent.
        if (hasAnyArgs("-s", "--silent"))
        {
            _silent = true;
        }

    }

    // Minimal two required.
    if (args.length < 2) {
        console.error("Missing required arguments. Use -h or --help for help.");
        process.exit(1);
    }

    // Set and validate entryFile.
    _entryFile = args[0];
    if (!fs.existsSync(_entryFile)) {
        console.error("Cannot find part of the `entryFile` path: `" + _entryFile + "`.");
        process.exit(1);
    }

    // Set destFile.
    _destFile = args[1];

}

function hasAnyArgs()
{
    if (arguments.length == 0) return false;

    for (var i = 0; i < arguments.length; i++)
    {
        if (hasArg(arguments[i])) return true;
    }

    return false;
}

function hasArg(arg)
{
    return args.indexOf(arg) != -1;    
}

function showHelp()
{
    console.log("");
    console.log("Usage: ccatjs <source> <dest> [options]");
    console.log("");
    console.log("<source> \t The entry js file to process.");
    console.log("<dest> \t\t The destination js file.");
    console.log("");
    console.log("Options:");
    console.log("-h, --help \t\t Prints help.");
    console.log("-v, --version \t\t Prints current version.");
    console.log("-u, --unique \t\t Enables check to see if all file references are unique.");
    console.log("-s, --silent \t\t Runs silent when no errors occur.");    
    console.log("");
}

function showVersion()
{
    var pk = require("../package.json");
    console.log(pk.version);
}
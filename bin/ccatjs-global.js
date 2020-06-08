#! /usr/bin/env node

const lib = require("../index.js");
const fs = require("fs");

// Get arguments without the first two.
var args = process.argv.splice(2);

// Vars.
var _entryFile;
var _destFile;
var _minify = false;

// Process args.
processArgs();

// Process ccatjs.
lib.concatJs(_entryFile, _destFile, _minify);

function processArgs()
{
    if (args.length >= 1)
    {

        // Help.
        if (args.indexOf("-h") != -1 || args.indexOf("--help") != -1)
        {
            showHelp();
            process.exit();
        }
    }

    // Minimal two required.
    if (args.lenght < 2) {
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

    // Set minify.
    _minify = args.indexOf("-m") != -1 || args.indexOf("--minify") != -1;

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
   console.log("");
}
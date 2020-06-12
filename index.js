const fs = require("fs");
const path = require("path");
const util = require("./util.js");
const entry = require("./entry.js").entry;

exports.concatJs = function (entryFile, destinationFile, silent, unique) {

    // Validate import statements.
    validateImportStatements(entryFile, unique);

    // Concat.
    var result = concatFiles(entryFile);

    // Write destination file.
    util.writeFile(destinationFile, result.toString());

    // OK.
    if (!silent) {
        console.log();
        util.consoleSuccess(`Successfully concatenated ${_allFiles.length} entries.`);
    }
}

function validateImportStatements(entryFile, uniqueOpt) {

    // Get full file name.
    var fullEntryFile = fs.realpathSync(entryFile);

    // Parse file reference tree.
    parseFile(fullEntryFile, uniqueOpt);

    // Check errors.
    if (_fileValidationErrors.size > 0) {

        for (let val of _fileValidationErrors.values())
        {
            for (var i = 0; i < val.length; i++)
            {
                util.consoleError(val[i]);
            }
        }

        process.exit(1);

    }
}

var _entry = new entry('root');
var _allFiles = [];
var _fileValidationErrors = new Map();

function parseFile(fileName, uniqueOpt) {

    _allFiles.push(fileName);

    var child = _entry.addChild(fileName);
    _entry = child;

    var content = util.getFileContent(fileName);
    var contentParsed = relativeToStaticReferences(fileName, content);
    var lines = util.getLines(contentParsed);

    for (var lineNumber = 0; lineNumber < lines.length; lineNumber++) {

        var line = lines[lineNumber];

        if (isImportLine(line)) {

            var referenceFile = getImportLineFileRef(line);

            // Check import line syntax.
            if (!isImportLineValid(line)) {
                addFileValidationError(fileName, `File reference malformed. Correct syntax is: @import:(path/file.ext). Notice parenthesis. File \`${fileName}\`. Line: \`${lineNumber + 1}\`.`);
                continue;
            }

            // Check if file exists.
            if (!util.fileExists(referenceFile)) {
                addFileValidationError(fileName, `File reference: \`${referenceFile}\` cannot be found. File \`${fileName}\`. Line: \`${lineNumber + 1}\`.`);
                continue;
            }

            if (uniqueOpt) {

                // Check if used before.
                if (_allFiles.indexOf(referenceFile) != -1) {
                    addFileValidationError(fileName, `File reference: \`${referenceFile}\` imported before. File \`${fileName}\`. Line: \`${lineNumber + 1}\`.`);
                    continue;
                }

            }

            // Check for circular reference.
            if (_entry.isCircular(referenceFile)) {
                addFileValidationError(fileName, `File reference: \`${referenceFile}\` causes circular reference. File \`${fileName}\`. Line: \`${lineNumber + 1}\`.`);
                continue;
            }

            // Recursive.
            parseFile(referenceFile, uniqueOpt);

        }
    }

    _entry = _entry.parent;

}

function addFileValidationError(file, error) {
    if (!_fileValidationErrors.has(file)) {
        var errors = [];
        errors.push(error);
        _fileValidationErrors.set(file, errors);
    }
    else {
        var _validationErrors = _fileValidationErrors.get(file);

        // Only add error once.
        if (_validationErrors.indexOf(error) == -1) {
            _validationErrors.push(error);
        }
    }
}

// Do not call this function before validation passes.
function concatFiles(entryFile) {

    // Get full file name.
    var fullEntryFile = fs.realpathSync(entryFile);

    var content = util.getFileContent(fullEntryFile);
    var contentWithStaticFileRefs = relativeToStaticReferences(fullEntryFile, content);
    var lines = util.getLines(contentWithStaticFileRefs);
    var lineNumber = 0;

    do {

        var line = lines[lineNumber];

        if (isImportLine(line)) {

            var refFullFileName = getImportLineFileRef(line);
            var newContent = util.getFileContent(refFullFileName);
            var newContentWithStaticFileRefs = relativeToStaticReferences(refFullFileName, newContent);
            var newLines = util.getLines(newContentWithStaticFileRefs);

            // Remove reference line.
            lines.splice(lineNumber, 1);

            // Insert the new lines.
            for (var i = 0; i < newLines.length; i++) {
                lines.splice(lineNumber + i, 0, newLines[i]);
            }

        }
        else {
            lineNumber++;
        }
    }
    while (lineNumber < lines.length);

    return util.joinLines(lines);

}

function isImportLine(line) {
    var r = line.toString().indexOf("@import:") != -1;
    return r;
}

function isImportLineValid(line) {

    var indx1 = line.indexOf("(");
    var indx2 = line.indexOf(")");

    // Missing parentheses.
    if (indx1 == -1 || indx2 == -1) return false;

    // @import:(file.ext)
    if (indx1 - indx2 < -1) return true;

    return false;
}

function getImportLineFileRef(line) {
    var lineWithoutSpaces = line.replace(/ /g, "");
    return lineWithoutSpaces.substring(lineWithoutSpaces.indexOf("@import:(") + 9, lineWithoutSpaces.indexOf(")"));
}

function setImportLineFileRef(line, fileRef) {
    var lineWithoutSpaces = line.replace(/ /g, "");
    var startIndex = lineWithoutSpaces.indexOf("@import:(") + 9;
    var endIndex = lineWithoutSpaces.indexOf(")");
    var newImportLine = lineWithoutSpaces.substring(0, startIndex) + fileRef + lineWithoutSpaces.substring(endIndex, lineWithoutSpaces.length);
    return newImportLine;
}

function relativeToStaticReferences(fname, content) {

    var dirname = path.dirname(fname);
    var lines = util.getLines(content);

    for (var i = 0; i < lines.length; i++) {

        var line = lines[i];

        if (isImportLine(line)) {

            var relativeFileRef = getImportLineFileRef(line);
            var staticFileRef = path.join(dirname, relativeFileRef);

            lines[i] = setImportLineFileRef(line, staticFileRef);

        }

    }

    return util.joinLines(lines);
}
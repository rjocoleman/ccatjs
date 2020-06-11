const fs = require("fs");
const path = require("path");

exports.concatJs = function (entryFile, destinationFile, silent, unique) {

    // Validate import statements.
    validateImportStatements(entryFile, unique);

    // Concat.
    var result = concatFiles(entryFile);

    // Write destination file.
    writeFile(destinationFile, result.toString());

    // OK.
    if (!silent) {
        console.log();
        consoleSuccess(`Successfully concatenated ${_valFiles.length} entries.`);
    }
}

var _valFiles = [];
var _valErrors = [];

function validateImportStatements(entryFile, uniqueOpt) {

    // Get full file name.
    var fullEntryFile = fs.realpathSync(entryFile);

    // Add entry file.
    _valFiles.push(new pair(null, fullEntryFile));

    var fileIndex = 0;

    do {

        var fullFileName = _valFiles[fileIndex].child;
        var content = getFileContent(fullFileName);
        var contentWithStaticFileRefs = relativeToStaticReferences(fullFileName, content);
        var lines = getLines(contentWithStaticFileRefs);
        var lineNumber = 0;
        var parent = fullFileName;

        do {
            var line = lines[lineNumber];

            if (isImportLine(line)) {

                // Get filename from import statement.
                var referenceFullFileName = getImportLineFileRef(line);
                var child = referenceFullFileName;

                // Check import line syntax.
                if (!isImportLineValid(line)) {
                    _valErrors.push(`File reference malformed. Correct syntax is: @import:(path/file.ext). Notice parenthesis. File \`${fullFileName}\`. Line: \`${lineNumber + 1}\`.`);
                    lineNumber++;
                    continue;
                }

                // Check if file exists.
                if (!fileExists(referenceFullFileName)) {
                    _valErrors.push(`File reference: \`${referenceFullFileName}\` cannot be found. File \`${fullFileName}\`. Line: \`${lineNumber + 1}\`.`);
                    lineNumber++;
                    continue;
                }

                if (uniqueOpt) {

                    // Check if used before.
                    if (containsChild(_valFiles, referenceFullFileName)) {
                        _valErrors.push(`File reference: \`${referenceFullFileName}\` imported before. File \`${fullFileName}\`. Line: \`${lineNumber + 1}\`.`);
                        lineNumber++;
                        break;
                    }

                }

                // Check for circular reference.
                var pairReversed = new pair(child, parent);
                if (containsPair(_valFiles, pairReversed)) {
                    _valErrors.push(`File reference: \`${referenceFullFileName}\` causes circular reference. File \`${fullFileName}\`. Line: \`${lineNumber + 1}\`.`);
                    lineNumber++;
                    continue;
                }

                // If here, all is fine.
                // =====

                var p = new pair(parent, child);
                _valFiles.push(p);

            }
            lineNumber++;
        }
        while (lineNumber < lines.length);
        fileIndex++;
    }
    while (fileIndex < _valFiles.length);

    if (_valErrors.length > 0) {

        for (var i = 0; i < _valErrors.length; i++) {
            consoleError(_valErrors[i]);
        }

        process.exit(1);
    }

}

function concatFiles(entryFile) {

    // Get full file name.
    var fullEntryFile = fs.realpathSync(entryFile);

    var content = getFileContent(fullEntryFile);
    var contentWithStaticFileRefs = relativeToStaticReferences(fullEntryFile, content);
    var lines = getLines(contentWithStaticFileRefs);
    var lineNumber = 0;

    do {
        var line = lines[lineNumber];

        if (isImportLine(line)) {
            var refFullFileName = getImportLineFileRef(line);
            var newContent = getFileContent(refFullFileName);
            var newContentWithStaticFileRefs = relativeToStaticReferences(refFullFileName, newContent);
            var newLines = getLines(newContentWithStaticFileRefs);

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

    return joinLines(lines);

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

function writeFile(fname, content) {
    var pth = path.dirname(fname);

    if (!fs.existsSync(pth)) {
        fs.mkdirSync(pth, { recursive: true });
    }

    fs.writeFileSync(fname, content.toString());

}

function relativeToStaticReferences(fname, content) {

    var dirname = path.dirname(fname);
    var lines = getLines(content);

    for (var i = 0; i < lines.length; i++) {

        var line = lines[i];

        if (isImportLine(line)) {

            var relativeFileRef = getImportLineFileRef(line);
            var staticFileRef = path.join(dirname, relativeFileRef);

            lines[i] = setImportLineFileRef(line, staticFileRef);

        }

    }

    return joinLines(lines);
}

// Helper functions.
// =================

function fileExists(fn) {
    return fs.existsSync(fn);
}

function getFileContent(fn) {
    if (!fs.existsSync(fn)) {
        consoleError('File: `' + fn + '` not found.');
        process.exit(1);
    }

    return fs.readFileSync(fn).toString();
}

function getLines(content) {
    return content.split('\n');
}

function joinLines(lines) {
    return lines.join('\n');
}

// Console functions.
// ==================

function consoleSuccess(msg) {
    consoleMsg('\x1b[42m', '\x1b[37m', msg);
}

function consoleError(msg) {
    consoleMsg('\x1b[41m', '\x1b[37m', msg);
}

function consoleMsg(bg, fg, msg) {
    console.log(bg, fg, msg, '\x1b[0m');
    console.log('\n');
}

class pair {
    constructor(parent, child) {
        this.parent = parent;
        this.child = child;
    }
    equals(p) {
        return (this.parent === p.parent && this.child === p.child);
    }
}

function containsPair(a, p) {
    for (var i = 0; i < a.length; i++) {
        if (a[i].equals(p)) return true;
    }
    return false;
}

function containsChild(a, c) {
    for (var i = 0; i < a.length; i++) {
        if (a[i].child === c) return true;
    }
}
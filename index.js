const fs = require("fs");
const path = require("path");

exports.concatJs = function (entryFile, destinationFile) {

    // Validate import statements.
    validateImportStatements(entryFile);

    // Concat.
    var result = concatFiles(entryFile);

    // Write destination file.
    writeFile(destinationFile, result.toString());

    // OK.
    console.log();
    consoleSuccess(`Successfully concatenated ${_valFiles.length} files.`);

}

var _valFiles = [];
var _valErrors = [];

function validateImportStatements(entryFile) {

    // Get full file name.
    var fullEntryFile = fs.realpathSync(entryFile);

    // Add entry file.
    _valFiles.push(fullEntryFile);

    var fileIndex = 0;

    do {

        var fullFileName = _valFiles[fileIndex];
        var content = getFileContent(fullFileName);
        var contentWithStaticFileRefs = relativeToStaticReferences(fullFileName, content);
        var lines = getLines(contentWithStaticFileRefs);
        var lineNumber = 0;

        do {
            var line = lines[lineNumber];

            if (isImportLine(line)) {

                // Get filename from import statement.
                var referenceFullFileName = getImportLineFileRef(line);

                // Check if file exists.
                if (!fileExists(referenceFullFileName)) {
                    _valErrors.push(`File reference: \`${referenceFullFileName}\` cannot be found. File \`${fullFileName}\`. Line: \`${lineNumber + 1}\`.`);
                }
                else {

                    // Check if used before.
                    if (_valFiles.indexOf(referenceFullFileName) != -1) {
                        _valErrors.push(`File reference: \`${referenceFullFileName}\` imported before. File can only be imported once per output file. File \`${fullFileName}\`. Line: \`${lineNumber + 1}\`.`);
                    }
                    else {
                        _valFiles.push(referenceFullFileName);
                    }
                }
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
        lineNumber++;
    }
    while (lineNumber < lines.length);

    return joinLines(lines);

}

function isImportLine(line) {
    return line.toString().indexOf("@import:") != -1;
}

function getImportLineFileRef(line) {
    var lineWithoutSpaces = line.replace(/ /g, "");
    return lineWithoutSpaces.substring(lineWithoutSpaces.indexOf(":") + 1, lineWithoutSpaces.length);
}

function writeFile(fname, content) {
    var pth = path.dirname(fname);

    if (!fs.existsSync(pth)) {
        fs.mkdirSync(pth);
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

            lines[i] = `// @import: ${staticFileRef}`;

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
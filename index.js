const fs = require("fs");

exports.concatJs = function (entryFile, destinationFile) {

    // Get file content.
    var fileContent = getFileContent(entryFile);

    // Validate import statements.
    validateImportStatements(entryFile);

    // Concat.
    var result = concat(fileContent);
    var output = result.output;
    var count = result.count;

    // Write dest file.
    fs.writeFileSync(destinationFile, output.toString());

    // OK.
    console.log();
    consoleSuccess(`Successfully concatenated ${_valFiles.length} files.`);

}

var _valFiles = [];
var _valErrors = [];

function validateImportStatements(entryFile) {

    // Add entry file.
    _valFiles.push(fs.realpathSync(entryFile));

    // FileIndex.
    var fi = 0;

    do {

        var cfile = _valFiles[fi];
        var content = getFileContent(cfile);
        var lines = getLines(content);
        var ln = 0;

        do {
            var sline = lines[ln];

            if (sline.indexOf("@import:") != -1) {

                // Get filename from import statement.            
                var fn = getFnFromStatementLine(sline);

                // Check if exists.
                if (!fileExists(fn)) {
                    _valErrors.push(`File reference: \`${fn}\` cannot be found. File \`${cfile}\`. Line: \`${ln + 1}\`.`);
                }
                else {

                    // Get file full path.
                    var fpath = fs.realpathSync(fn).toLowerCase();

                    // Check if used before.
                    if (_valFiles.indexOf(fpath) != -1) {
                        _valErrors.push(`File reference: \`${fpath}\` imported before. File can only be imported once per output file. File \`${cfile}\`. Line: \`${ln + 1}\`.`);
                    }
                    else {
                        _valFiles.push(fpath);
                    }
                }
            }
            ln++;
        }
        while (ln < lines.length);

        fi++;
    }
    while (fi < _valFiles.length);

    if (_valErrors.length > 0) {

        for (var i = 0; i < _valErrors.length; i++)
        {
            consoleError(_valErrors[i]);
        }
        process.exit(1);
    }

}

function concat(content) {

    // Concat by searching for the import
    // statement on a line by line basis.

    var lines = getLines(content);
    var ln = 0;

    do {
        var sline = lines[ln];

        if (sline.indexOf("@import:") != -1) {

            var fn = getFnFromStatementLine(sline);
            var newContent = getFileContent(fn);
            var newLines = getLines(newContent);

            // Remove the import statement line.
            lines.splice(ln, 1);

            // Insert the new lines.
            for (var i = 0; i < newLines.length; i++) {
                lines.splice(ln + i, 0, newLines[i]);
            }

        }
        ln++;
    }
    while (ln < lines.length - 1);

    var result = {
        output: joinLines(lines)
    }

    return result;

}

function getFnFromStatementLine(sline) {

    // Case: @import: filename.js
    if (sline.indexOf("'") == -1 && sline.indexOf("\"") == -1) {
        var sl = sline.replace(/ /g, "");
        return sl.substring(sl.indexOf(":") + 1, sl.indexOf(".js") + 3);
    }

    return "";

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
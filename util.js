const fs = require("fs");
const path = require("path");

module.exports = {

    // Helpers.
    // ========

    writeFile: function(fname, content)
    {
        var pth = path.dirname(fname);

        if (!fs.existsSync(pth)) {
            fs.mkdirSync(pth, { recursive: true });
        }

        fs.writeFileSync(fname, content.toString());
    },

    fileExists: function (fn)
    {
        return fs.existsSync(fn);
    },

    getFileContent: function(fn) {

        if (!fs.existsSync(fn)) {
            this.consoleError('File: `' + fn + '` not found.');
            process.exit(1);
        }

        return fs.readFileSync(fn).toString();

    },

    getLines: function(content) {
        return content.split('\n');
    },

    joinLines: function(lines) {
        return lines.join('\n');
    },

    // Console.
    // ========

    consoleSuccess: function(msg) {
        this.consoleMsg('\x1b[42m', '\x1b[37m', msg);
    },

    consoleError: function(msg) {
        this.consoleMsg('\x1b[41m', '\x1b[37m', msg);
    },

    consoleMsg: function(bg, fg, msg) {
        console.log(bg, fg, msg, '\x1b[0m');
        console.log('\n');
    }
}

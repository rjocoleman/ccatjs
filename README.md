# ccatjs
Concatenate different javascript files using easy in-file comments.

## Prerequisites
nodejs and npm installed.

## Installing
Install the ccatjs package using the node package manager like so:
```bash
npm install ccatjs -g
```

## Usage
Asume a javascript project consisting of mulitiple js files in multiple directories.

To include a javascript file inside another, just use the following comment:

```js
// @import: file.js
```

Example:

src/main.js
```js
// @import: helpers/strings.js
// @import: helpers/arrays.js
function main() {
    var specialString = getString();
    var specialArray = getSpecialArray();
}
```

src/helpers/strings.js
```js
function getString() {
    return 'birds' + getString2();
}
// @import: helpers/strings2.js
```

src/helpers/strings2.js
```js
function getString2() {
    return 'aura';
}
```

src/helpers/arrays.js
```js
function getSpecialArray() {
    var a = [1,2,3];
    return a;
}
```

## Running ccatjs
```bash
ccatjs <entryFile> <destFile>
```

In this example:

```bash
ccatjs src/main.js dist/out.js
```

Result:

dist/out.js
```js
function getString() {
    return 'birds' + getString2();
}
function getString2() {
    return 'aura';
}
function getSpecialArray() {
    var a = [1,2,3];
    return a;
}
function main() {
    var specialString = getString();
    var specialArray = getSpecialArray();
}
```
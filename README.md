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

Example:

main.js
```js
// import: ../helpers/strings.js
// import: ../helpers/arrays.js
function main() {
    var specialString = getString();
    var specialArray = getSpecialArray();
}
```
../helpers/strings.js
```js
function getString() {
    return 'birds' + getString2();
}
// @import: ../helpers/strings2.js
```

../helpers/strings2.js
```js
function getString2() {
    return 'aura';
}
```

../helpers/arrays.js
```js
function getSpecialArray() {
    var a = [1,2,3];
    return a;
}
```
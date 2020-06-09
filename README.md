# ccatjs
Concatenate different javascript files using easy in-file @import comments.

## Prerequisites
nodejs and npm installed.

## Installing
Install the ccatjs package using npm:
```bash
npm install ccatjs -g
```

## Usage
Asume a javascript project consisting of mulitiple js files in multiple directories.

To include a javascript file inside another, use the `@import: file.js` statement in a javascript comment.

### Path
*IMPORTANT* The path specified in the `@import` statement must be relative to the containing file.

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
// @import: strings2.js
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

## Output results

**Success:**

```diff
+ Succesfully concatenated 4 files. 
```
**Errors:**

Error checks:
- Non existing references.
- Multiple references.

Errors are reported including filename and linenumber.

```diff
- File reference: `../file3.js` cannot be found. File `main.js`. Line: `22`. 

- File reference: `../file4.js` imported before. File can only be imported once per output file. File `main.js`. Line: `27`. 
```

## License
This project is licensed under the MIT License.
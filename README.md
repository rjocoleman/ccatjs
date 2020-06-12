# ccatjs
Concatenate files using in-file @import: statements.

## Prerequisites
NodeJS and npm installed.

## Installing
Install the ccatjs package using npm:
```bash
npm install ccatjs -g
```

## Usage
Assume a project containing multiple files in multiple directories.

To include a file inside another, use `@import:(file.js)` on a (comment) line.

### Path
*IMPORTANT* The path specified in the `@import:` statement must be relative to the containing file.

js
```js
// @import:(file.js)
```

html
```html
<!-- @import:(file.html) -->
```

css
```css
/* @import:(file.css) */
```

etc
```
@import:(file.txt) 
```

As long as the string `@import:(<yourfile>)` is found the line gets replaced by the referenced file content.

Example: (see test/ folder in repository)

src/main.js
```js
// @import:(helpers/strings.js)
// @import:(helpers/arrays.js)
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
// @import:(strings2.js)
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
+ Successfully concatenated 4 entries. 
```
**Errors:**

Error checks:
- Syntax.
- Non existing references.
- Imported before.

Errors are reported including filename and line number.

```diff
- File reference: `../file3.js` cannot be found. File `main.js`. Line: `22`. 

- File reference: `../file4.js` imported before. File `main.js`. Line: `27`. 

- File reference: `../file4.js` causes circular reference. File `main.js`. Line: `29`. 
```

## License
This project is licensed under the MIT license.
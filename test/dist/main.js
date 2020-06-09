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
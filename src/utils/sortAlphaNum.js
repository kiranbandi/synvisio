// Sorting the available chromosome markers alpha numerically code blurb sourced from stackoverflow
// https://stackoverflow.com/questions/41972652/how-to-sort-mixed-numeric-alphanumeric-array-in-javascript
export default function sortAlphaNum(a, b) {
    let reA = /[^a-zA-Z]/g;
    let reN = /[^0-9]/g;
    let aA = a[0].replace(reA, "");
    let bA = b[0].replace(reA, "");
    if (aA === bA) {
        let aN = parseInt(a[0].replace(reN, ""), 10);
        let bN = parseInt(b[0].replace(reN, ""), 10);
        return aN === bN ? 0 : aN > bN ? 1 : -1;
    } else {
        return aA > bA ? 1 : -1;
    }
}
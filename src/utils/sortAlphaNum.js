// Sorting the available chromosome markers alpha numerically code blurb sourced from stackoverflow
// https://stackoverflow.com/questions/41972652/how-to-sort-mixed-numeric-alphanumeric-array-in-javascript

// The function is curried to return a sort function acting on a specific key

export default function getSortFunction(key) {
    return function sortAlphaNum(a, b) {
        let reA = /[^a-zA-Z]/g;
        let reN = /[^0-9]/g;
        let aA = a[key].replace(reA, "");
        let bA = b[key].replace(reA, "");
        if (aA === bA) {
            let aN = parseInt(a[key].replace(reN, ""), 10);
            let bN = parseInt(b[key].replace(reN, ""), 10);
            return aN === bN ? 0 : aN > bN ? 1 : -1;
        } else {
            return aA > bA ? 1 : -1;
        }
    }
}
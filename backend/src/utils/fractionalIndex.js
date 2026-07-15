// Fractional/lexicographic ordering keys, base62, ASCII-ascending — so
// MongoDB's default string sort matches insertion-order intent with no
// custom collation, and a future single-step reorder can compute one new
// key between two neighbors instead of rewriting a whole array.
const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

// Returns a string strictly between a and b under plain string comparison.
// a === null -> no lower bound (treat as smallest/"").
// b === null -> no upper bound (treat as beyond the last digit).
export const keyBetween = (a, b) => {
    a = a ?? "";
    let i = 0;
    let prefix = "";
    while (true) {
        const digitA = i < a.length ? DIGITS.indexOf(a[i]) : 0;
        const digitB = b !== null && i < b.length ? DIGITS.indexOf(b[i]) : DIGITS.length;
        if (digitB - digitA > 1) {
            return prefix + DIGITS[digitA + Math.floor((digitB - digitA) / 2)];
        }
        prefix += DIGITS[digitA] ?? DIGITS[0];
        i += 1;
    }
};

// Assigns fresh, evenly-spaced keys for n items in order — used whenever a
// whole steps[] array is (re)written in one shot (the admin editor's Save),
// rather than computing a single midpoint key per edit.
export const evenlySpacedKeys = (n) => {
    const keys = [];
    let prev = null;
    for (let i = 0; i < n; i++) {
        prev = keyBetween(prev, null);
        keys.push(prev);
    }
    return keys;
};

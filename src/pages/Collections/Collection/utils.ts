// export function sid() {
//     return new Date().getTime();
// }

export function difference(lstStr: string, nwStr: string) {
    // Use two pointers
    let l = 0;
    let r = lstStr.length - 1;
    let nr = nwStr.length - 1;
    let foundLeft = false;
    let foundRight = false;

    while (!foundLeft && l <= r) {
        if (l < nwStr.length && nwStr[l] === lstStr[l]) {
            l++;
        } else {
            foundLeft = true;
        }
    }

    // Find the rightmost difference
    // Both nr and r should not go under the l
    while (!foundRight && r >= l && nr >= l && nr >= 0) {
        if (nwStr[nr] === lstStr[r]) {
            nr--;
            r--;
        } else {
            foundRight = true;
        }
    }

    // Calculating number of characters to delete
    const numCharsToDelete = r - l + 1;
    // Extracting the string to insert
    const stringToInsert = nwStr.substring(l, nr + 1);

    return {
        index: l,
        deleteCount: numCharsToDelete,
        insert: stringToInsert,
    };
}

export const enum Mode {
  EDITOR = 1,
  READ = 2,
  BOTH = 3,
}
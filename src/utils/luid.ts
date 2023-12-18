

// Locally unique identifier
// Starts to work badly in incognito
// export default function luid(username?: string | null) {
//     let counter= Number(localStorage.getItem("counter") ?? 1)
//     let luid = String(counter++)
//     if(counter > 2_000_000_000) {
//         // Reset counter at some point
//         counter = 1
//     }
//     if(username) {
//         luid = `${username}:${luid}`;
//     }
//     localStorage.setItem("counter", counter.toString())
//     return luid
// }

import { v4 } from "uuid";

// Maybe it sends more data but at least acknowledges are not guessable
export default function luid(username?: string | null) {
    // I am sorry but the not use of username was preventing the app from compiling
    return username ? v4() : v4();
}
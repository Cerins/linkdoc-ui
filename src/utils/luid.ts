let counter = 1

// Locally unique identifier
export default function luid(username?: string | null) {
    let luid = String(counter++)
    if(username) {
        luid = `${username}:${luid}`;
    }
    return luid
}
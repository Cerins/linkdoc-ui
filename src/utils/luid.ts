let counter = 1

// Locally unique identifier
export default function luid() {
    return String(counter++)
}
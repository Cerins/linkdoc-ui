import type { Locale } from "../../contexts/Text";
type Term = Record<Locale, {
    short: string;
    long: string;
}>


// Keep the terms in the TS file
export default [
    {
        'lv': {
            'short': 'Lietošanas noteikumi',
            'long': `1. Ir aizliegts pieslēgties šai sistēmai, ja netika dota atļauja.

2. Ir aizliegts izmantot šo sistēmu, lai veiktu kādas nelikumīgas darbības.

3. Aizliegts mēģināt uzlauzt sistēmu.`
        },
        'en': {
            'short': 'Terms of Service',
            'long': `1. It is forbidden to access this system without permission.

2. It is forbidden to use this system for illegal activities.

3. It is forbidden to attempt to hack the system.`
        }
    }
] as Term[];
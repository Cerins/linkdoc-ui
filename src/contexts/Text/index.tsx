import React, { createContext, useContext, useMemo, useState } from "react"

type TextCode = 'LOGIN_USERNAME' 
                | 'LOGIN_PASSWORD'
                | 'LOGIN_ACTION'
                | 'ERROR_GENERIC'
                | 'LOGIN_ERROR_BAD_CREDS'

type Locale = 'lv' | 'en'

interface ITextContext {
    text(code: TextCode): string
    setLocale(locale: Locale): void;
}


const TextContext = createContext<ITextContext | null>(null);

function useTextContext() {
    const context = useContext(TextContext);
    if(context === null){
        throw new Error('Text context is not defined');
    }
    return context;
}

// TODO
// Right now this will mean, that the entire localization collection
// or dictionary for short means that it will be bundled within a file javascript
// which is fine for smaller locales, but can really backfire on larger sizes
// inspect this later
// --
// Alternatively an issue may arise if we want to hide a part of the locale
const dictionary: Record<Locale, Record<TextCode, string>> = {
    'lv': {
        'LOGIN_USERNAME': 'Lietotājvārds',
        'LOGIN_PASSWORD': 'Parole',
        'LOGIN_ACTION': 'Pieslēgties',
        'ERROR_GENERIC': 'Notika neparedzēta kļūda',
        'LOGIN_ERROR_BAD_CREDS': 'Nepareizs lietotājvārds vai parole'
    },
    'en': {
        'LOGIN_USERNAME': 'Username',
        'LOGIN_PASSWORD': 'Password',
        'LOGIN_ACTION': 'Login',
        'ERROR_GENERIC': 'Unknkown error happened',
        'LOGIN_ERROR_BAD_CREDS': 'Invalid username or password'
    }

}

function TextProvider({ children }: { children: React.JSX.Element }) {
        const [locale, setLocaleState] = useState<Locale>('lv');
        function setLocale(locale: Locale) {
            setLocaleState(locale);
        }
        function text(code: TextCode) {
            return dictionary[locale][code];
        }

        const value = useMemo(()=>({
            text,
            setLocale
        }), [locale]);
        return (
            <TextContext.Provider value={value}>
                {children}
            </TextContext.Provider>
        )
}
// TODO fast refresh  works a file export component
export default useTextContext;
export {
    TextProvider,
    TextContext
}

export type {
    TextCode, ITextContext
}

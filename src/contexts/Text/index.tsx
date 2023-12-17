import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type TextCodeRemote = "NAME_MAX" | "NAME_MIN";

type TextCode =
  | TextCodeRemote
  | "BUTTON_OK"
  | "BUTTON_YES"
  | "BUTTON_CANCEL"
  | "DELETE_CONFIRM"
  | "LOGIN_USERNAME"
  | "LOGIN_PASSWORD"
  | "LOGIN_ACTION"
  | "LOGIN_ERR_BAD_CREDS"
  | "ERROR_GENERIC"
  | "LANDING_STATUS"
  | "LANDING_DISCONNECTED"
  | "LOADING"
  | "COLLECTIONS_NAME"
  | "COLLECTIONS_USER"
  | "COLLECTIONS_TIME"
  | "COLLECTIONS_CREATE_ERR_EMPTY"
  | "COLLECTIONS_CREATE_ERR_EXISTS"
  | "COLLECTIONS_CREATE_PLACEHOLDER"
  | "DOCUMENTS_NAME"
  | "LOGIN"
  | "LOGOUT"
  | "REMEMBER_ME"
  | "SHARE"
  | "READ_ONLY"
  | "WRITE"
  | "PRIVATE"

type Locale = "lv" | "en";

interface ITextContext {
  text(code: TextCode): string;
  setLocale(locale: Locale): void;
  locale: Locale;
}

const TextContext = createContext<ITextContext | null>(null);

function useTextContext() {
    const context = useContext(TextContext);
    if (context === null) {
        throw new Error("Text context is not defined");
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
    lv: {
        NAME_MIN: 'Nosaukums pārāk īss',
        NAME_MAX: 'Nosaukums pārsniedz maksimālo atļauto garumu',
        BUTTON_OK: 'Ok',
        BUTTON_YES: 'Jā',
        BUTTON_CANCEL: 'Atcelt',
        DELETE_CONFIRM: 'Vai tiešām vēlaties izdzēst šo elementu? Darbība ir neatgriezniska.',
        LOGIN_USERNAME: "Lietotājvārds",
        LOGIN_PASSWORD: "Parole",
        LOGIN_ACTION: "Pieslēgties",
        ERROR_GENERIC: "Notika neparedzēta kļūda",
        LOGIN_ERR_BAD_CREDS: "Nepareizs lietotājvārds vai parole",
        LANDING_DISCONNECTED: "Nav pieslēguma. Pieslēgties ir iespējams: ",
        LANDING_STATUS: "Šobridējais stāvoklis ir ",
        LOADING: "Lādejas",
        COLLECTIONS_NAME: "Nosaukums",
        COLLECTIONS_USER: "Izveidoja",
        COLLECTIONS_TIME: "Pēdējā piekļušana",
        COLLECTIONS_CREATE_ERR_EMPTY: "Nosaukumu vajag ievadīt",
        COLLECTIONS_CREATE_ERR_EXISTS: "Kolekcija jau eksistē",
        COLLECTIONS_CREATE_PLACEHOLDER: "Kolekcijas nosaukums",
        DOCUMENTS_NAME: "Nosaukums",
        LOGIN: 'Pieslēgties',
        LOGOUT: 'Iziet',
        REMEMBER_ME: 'Atcerēties pieslēgšanos',
        SHARE: "Koplietot",
        READ_ONLY: "Tikai lasīt",
        WRITE: "Rakstīt",
        PRIVATE: "Privāts"
    },
    en: {
        NAME_MIN: 'Name too short',
        NAME_MAX: 'Name too long',
        BUTTON_OK: 'Ok',
        BUTTON_YES: 'Yes',
        BUTTON_CANCEL: 'Cancel',
        DELETE_CONFIRM: 'Confirm deletion? The action is irreversible.',
        LOGIN_USERNAME: "Username",
        LOGIN_PASSWORD: "Password",
        LOGIN_ACTION: "Login",
        ERROR_GENERIC: "Unknkown error happened",
        LOGIN_ERR_BAD_CREDS: "Invalid username or password",
        LANDING_DISCONNECTED: "Not connect. It is possible to connect through",
        LANDING_STATUS: "The current connection state is ",
        LOADING: "Loading",
        COLLECTIONS_NAME: "Name",
        COLLECTIONS_USER: "Created by",
        COLLECTIONS_TIME: "Last accessed",
        COLLECTIONS_CREATE_ERR_EMPTY: "Can not have empty collection",
        COLLECTIONS_CREATE_ERR_EXISTS: "Collection already exists",
        COLLECTIONS_CREATE_PLACEHOLDER: "Collection name",
        DOCUMENTS_NAME: "Name",
        LOGIN: 'Login',
        LOGOUT: 'Logout',
        REMEMBER_ME: 'Remember login',
        SHARE: "Share",
        READ_ONLY: "Read only",
        WRITE: "Write",
        PRIVATE: "Private"
    },
};

function localeFromLocalStorage(): Locale {
    const potentialMatch = window.localStorage.getItem('locale')
    return (potentialMatch ?? 'lv') as Locale
}

function localeToLocalStorage(locale: Locale) {
    window.localStorage.setItem('locale', locale)
}

function TextProvider({ children }: { children: React.JSX.Element }) {
    const [locale, setLocaleState] = useState<Locale>(
        localeFromLocalStorage()
    );
    function setLocale(locale: Locale) {
        setLocaleState(locale);
    }
    function text(code: TextCode) {
        return dictionary[locale][code] ?? `__${code}__`;
    }

    useEffect(()=>{
        // Update the local storage locale
        localeToLocalStorage(locale);
    }, [locale])

    const value = useMemo(
        () => ({
            text,
            setLocale,
            locale,
        }),
        [locale]
    );
    return <TextContext.Provider value={value}>{children}</TextContext.Provider>;
}
// TODO fast refresh  works a file export component
export default useTextContext;
export { TextProvider, TextContext };

export type { TextCode, ITextContext, Locale };

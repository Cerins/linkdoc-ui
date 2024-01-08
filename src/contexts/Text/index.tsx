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
  | "LOGIN_NOT_ACCEPTED"
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
  | "SHARE_ADD_USER"
  | "SHARE_USERS"
  | "SHARE_REMOVE"
  | "404"
  | "READ_ONLY"
  | "WRITE"
  | "PRIVATE"
  | "FILE_TOO_LARGE"
  | 'OPERATION_FORBIDDEN';

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
        LOGIN_NOT_ACCEPTED: "Nav pieņemti noteikumi",
        LOGIN_ERR_BAD_CREDS: "Nepareizs lietotājvārds vai parole",
        LANDING_DISCONNECTED: "Nav pieslēguma. Pieslēgties ir iespējams: ",
        LANDING_STATUS: "Šobridējais stāvoklis ir ",
        LOADING: "Lādejas",
        COLLECTIONS_NAME: "Nosaukums",
        COLLECTIONS_USER: "Izveidoja",
        COLLECTIONS_TIME: "Pēdējā piekļūšana",
        COLLECTIONS_CREATE_ERR_EMPTY: "Nosaukumu vajag ievadīt",
        COLLECTIONS_CREATE_ERR_EXISTS: "Kolekcija jau eksistē",
        COLLECTIONS_CREATE_PLACEHOLDER: "Kolekcijas nosaukums",
        DOCUMENTS_NAME: "Nosaukums",
        LOGIN: 'Pieslēgties',
        LOGOUT: 'Iziet',
        REMEMBER_ME: 'Atcerēties pieslēgšanos',
        SHARE: "Kopīgot",
        SHARE_ADD_USER: "Pievienot lietotāju",
        SHARE_REMOVE: "Noņemt",
        "404": "Lapa netika atrasta! Pārliecināties, ka jums ir piekļuve šim resursam.",
        SHARE_USERS: "Lietotāji",
        READ_ONLY: "Tikai lasīt",
        WRITE: "Rakstīt",
        PRIVATE: "Privāts",
        FILE_TOO_LARGE: "Fails nedrīkst būt lielāks 10MB",
        OPERATION_FORBIDDEN: "Nebija iespējams veikt redīģēšanu. Saglabājiet izmaiņas ārpus redaktora un pārlādējiet lapu.",
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
        LOGIN_NOT_ACCEPTED: "Terms of service not accepted",
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
        SHARE_ADD_USER: "Add user",
        SHARE_USERS: "Users",
        "404": "Page not found! Make sure you have access to this resource.",
        SHARE_REMOVE: "Remove",
        READ_ONLY: "Read only",
        WRITE: "Write",
        PRIVATE: "Private",
        FILE_TOO_LARGE: "File must not be larger than 10MB",
        OPERATION_FORBIDDEN: "Could not perform operation. Save changes outside of editor and reload page.",
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

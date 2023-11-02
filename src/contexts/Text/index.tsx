import React, { createContext, useContext, useMemo } from "react"

type TextCode = 'LOGIN_USERNAME' 
                | 'LOGIN_PASSWORD'
                | 'LOGIN_ACTION'


interface ITextContext {
    text(code: TextCode): string
}


const TextContext = createContext<ITextContext | null>(null);

function useTextContext() {
    const context = useContext(TextContext);
    if(context === null){
        throw new Error('Text context is not defined');
    }
    return context;
}


function TextProvider({ children }: { children: React.JSX.Element }) {
        function text(code: TextCode) {
            return `__${code}__`;
        }
        const value = useMemo(()=>({
            text
        }), []);
        return (
            <TextContext.Provider value={value}>
                {children}
            </TextContext.Provider>
        )
}
// TDOO fast refreshg  works a file export component
export default useTextContext;
export {
    TextProvider,
    TextContext
}

export type {
    TextCode, ITextContext
}


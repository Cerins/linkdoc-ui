import useTextContext, { Locale } from "../../contexts/Text"

function Flag({
    locale
}: {
    locale: Locale
}) {
    const { setLocale } = useTextContext();
    return (
        <img 
            className="h-6 hover:opacity-75"
            src={`/flags/${locale}.svg`}
            onClick={()=>setLocale(locale)}
        />
    )

}

export default function Header() {
    return (
        <div className="flex h-12 justify-end items-center space-x-3 p-2 border-b-4">
            <Flag locale="en" />
            <Flag locale="lv" />
        </div>
    )
}

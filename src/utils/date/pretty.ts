import { format } from "date-fns";
import { lv, enGB } from "date-fns/locale";
import { Locale } from "../../contexts/Text";

export default function prettyDate(date: string, locale: Locale) {
    const local = locale === "lv" ? lv : enGB;
    const pattern = "PPP p";
    return format(new Date(date), pattern, {
        locale: local,
    });
}

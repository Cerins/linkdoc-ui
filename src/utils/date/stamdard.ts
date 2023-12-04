import { format } from "date-fns"

export default function standardDate(date: Date) {
    return format(date, 'yyyy-MM-dd')
}
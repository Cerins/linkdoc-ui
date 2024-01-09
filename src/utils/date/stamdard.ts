import { format } from "date-fns"

// Format the date to a standard format
export default function standardDate(date: Date) {
    return format(date, 'yyyy-MM-dd')
}
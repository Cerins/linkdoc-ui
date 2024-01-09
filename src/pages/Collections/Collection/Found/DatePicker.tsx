import { useState } from "react";
import useTextContext from "../../../../contexts/Text";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar } from "@fortawesome/free-solid-svg-icons";
import Calendar from "react-calendar";
import { apply } from "../../../../utils/css";

// Allow to pick a date
export default function DatePicker({
    date,
    setDate,
}: {
  date: Date | null;
  setDate: (date: Date | null) => void;
}) {
    const { locale } = useTextContext();
    const [visible, setVisible] = useState(false);
    return (
        <div>
            <FontAwesomeIcon
                icon={faCalendar}
                className="hover:text-gray-600 p-2"
                onClick={() => {
                    setVisible((v) => !v);
                }}
            />
            <Calendar
                className={`absolute z-10 ${apply(visible, "visible", "invisible")}`}
                locale={locale}
                value={date}
                selectRange={false}
                onChange={(e) => {
                    setVisible(false);
                    setDate(e as Date | null);
                }}
            />
        </div>
    );
}
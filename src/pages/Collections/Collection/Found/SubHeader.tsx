import { useNavigate, useParams } from "react-router-dom";
import collectionURL from "../../../../utils/collections/url";
import standardDate from "../../../../utils/date/stamdard";
import DatePicker from "./DatePicker";
import SearchButton from "./SearchButton";
import Share from "./Share";
import { Mode } from "../utils";
import { apply } from "../../../../utils/css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faEye } from "@fortawesome/free-solid-svg-icons";

export default function SubHeader({
    showEditor,
    showRead,
    setMode,
}:{
    showEditor: boolean;
    showRead: boolean;
    setMode: React.Dispatch<React.SetStateAction<Mode>>;
}) {
    const navigator = useNavigate();
    const { uuid: colUUID } = useParams();
    
    function onDatePick(date: Date | null) {
        if (date === null) return;
        const stDate = standardDate(date);
        navigator(collectionURL(colUUID!, stDate));
    }
    function onToggleClick() {
        setMode((mode) => (mode % Mode.BOTH) + 1);
    }
    return (
        <div className="flex">
            <div className="flex items-center grow">
                <SearchButton />
                <DatePicker date={null} setDate={onDatePick} />
            </div>
            <div className="flex gap-2 items-center shrink justify-end px-2">
                <Share />
                <button className="border p-2" onClick={onToggleClick}>
                    {
                        <FontAwesomeIcon
                            className={`${apply(showEditor, "visible", "invisible")} mr-2`}
                            icon={faPen}
                        />
                    }
                    {
                        <FontAwesomeIcon
                            className={`${apply(showRead, "visible", "invisible")}`}
                            icon={faEye}
                        />
                    }
                </button>
            </div>
        </div>
    )
}
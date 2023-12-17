import { useNavigate, useParams } from "react-router-dom";
import useTextContext from "../../../../contexts/Text";
import { ChangeEventHandler, MouseEventHandler, useEffect, useState } from "react";
import collectionURL from "../../../../utils/collections/url";
import { apply } from "../../../../utils/css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function SearchButton() {
    const isInputDisabled = false;
    const isButtonDisabled = false;
    const error = "";
    const { docName, uuid: colUUID } = useParams();
    const { text } = useTextContext();
    const navigate = useNavigate();

    const [name, setName] = useState(docName!);
    useEffect(() => {
        setName(docName!);
    }, [docName]);
    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setName(e.target.value);
    };
    const handleButtonClick: MouseEventHandler<HTMLButtonElement> = () => {
        navigate(collectionURL(colUUID!, name));
    };

    return (
        <div
            className={`
                    flex
                    items-center
                    border
                    rounded
                    ${apply(
            isInputDisabled,
            "border-gray-200",
            "border-gray-300"
        )}
                `}
        >
            <input
                disabled={isInputDisabled}
                type="text"
                value={name}
                onChange={handleInputChange}
                className={`flex-grow 
                        appearance-none
                        bg-transparent
                        w-full
                        text-gray-700
                        py-1
                        px-2
                        leading-tight
                        focus:outline-none 
                        ${apply(error, "border-red-500")}
                        ${apply(
            isInputDisabled,
            "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}`}
                placeholder={text("DOCUMENTS_NAME")}
            />
            <button
                disabled={isButtonDisabled}
                type="button"
                onClick={handleButtonClick}
                className={`
                    flex-shrink-0
                    text-sm
                    py-1
                    px-2
                    rounded-r
                    ${apply(
            isButtonDisabled,
            "bg-gray-200 text-gray-400 cursor-not-allowed",
            "bg-gray-300 hover:bg-gray-400 text-gray-700"
        )}
                    `}
            >
                <FontAwesomeIcon icon={faSearch} />
            </button>
        </div>
    );
}
import {
    ChangeEventHandler,
    FormEventHandler,
    useEffect,
    useRef,
    useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { Collection } from ".";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store";
import useTextContext, { TextCode } from "../../contexts/Text";
import { apply } from "../../utils/css";
import {
    endCreateCollection,
    startCreateCollection,
} from "../../reducers/collections";
import luid from "../../utils/luid";
import { useNavigate } from "react-router-dom";
import useSocket, { SocketMessage } from "../../contexts/Socket";
import useModalContext from "../../contexts/Modal";
import standardDate from "../../utils/date/stamdard";
import collectionURL from "../../utils/collections/url";

export function CollectionCreate({
    collections,
}: {
  collections: Collection[];
}) {
    const [name, setName] = useState("");
    const [error, setError] = useState<TextCode | "">("");
    const { text } = useTextContext();
    const createActive = useSelector(
        (root: IState) => root.collections.createActive
    );
    const username = useSelector((root: IState) => root.login.username);
    const acknowledge = useRef<string>("");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { emitter, send } = useSocket();
    const { showMessage } = useModalContext();

    // Checks if has errors
    // and mutates the error variable
    const hasErrors = (name: string) => {
        let error: TextCode | "" = "";
        if (name === "") {
            error = "COLLECTIONS_CREATE_ERR_EMPTY";
        } else if (collections.some((c) => c.name === name && c.user === username)) {
            error = "COLLECTIONS_CREATE_ERR_EXISTS";
        }
        setError(error);
        return error === "";
    };

    const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
        setName(e.target.value);
        hasErrors(e.target.value);
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!error) {
            acknowledge.current = luid(username);
            dispatch(startCreateCollection());
            send(
                "COL.CREATE",
                {
                    name,
                },
                acknowledge.current
            );
        }
    };

    useEffect(() => {
        const listener = (lastMessage: SocketMessage) => {
            if (lastMessage === null) return;
            const { type, payload, acknowledge: incoming } = lastMessage;
            if (incoming === acknowledge.current) {
                if (type === "COL.CREATE.OK") {
                    const collection = payload;
                    dispatch(
                        endCreateCollection({
                            ...collection,
                            time: new Date().toISOString(),
                        })
                    );
                    navigate(collectionURL(payload.uuid, standardDate(new Date())));
                } else if (type === "COL.CREATE.BAD_REQUEST") {
                    setError(payload.code);
                    dispatch(endCreateCollection());
                } else {
                    console.error("unk error", payload);
                    showMessage({
                        message: text("ERROR_GENERIC"),
                        buttons: [
                            {
                                name: text("BUTTON_OK"),
                                callback: () => {},
                            },
                        ],
                    });
                    dispatch(endCreateCollection());
                }
            }
        }
        emitter.addListener('message', listener);
        return ()=>{
            emitter.removeListener('message', listener);
        }
    }, []);

    const isInputDisabled = createActive;
    const isButtonDisabled = createActive || Boolean(error);

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-xs">
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
                    placeholder={text("COLLECTIONS_CREATE_PLACEHOLDER")}
                />
                <button
                    disabled={isButtonDisabled}
                    type="submit"
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
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            </div>
            {error && (
                <p className="text-red-500 text-xs italic mt-2">{text(error)}</p>
            )}
        </form>
    );
}

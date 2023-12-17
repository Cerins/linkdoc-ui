import {
    ChangeEventHandler,
    Dispatch,
    MouseEventHandler,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from "react";
import { Header, Layout } from "../../../components/Header";
import Markdown from "react-markdown";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import Spinner from "../../../components/Spinner";
import useSocket, { SocketMessage } from "../../../contexts/Socket";
import { IState } from "../../../store";
import { useSelector } from "react-redux";
import luid from "../../../utils/luid";
import { Link, useNavigate, useParams } from "react-router-dom";
import useModalContext from "../../../contexts/Modal";
import useTextContext from "../../../contexts/Text";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendar,
    faEye,
    faPen,
    faSearch,
} from "@fortawesome/free-solid-svg-icons";
import "./index.css";
import { apply } from "../../../utils/css";
import collectionURL from "../../../utils/collections/url";
import Calendar from "react-calendar";
import standardDate from "../../../utils/date/stamdard";
import { faShare } from '@fortawesome/free-solid-svg-icons';
import { sid } from "./utils";


interface CollectionState {
  status:
    | "fresh"
    | "init"
    | "not found"
    | "forbidden"
    | "bad request"
    | "system error";
  text: string;
}

function initDocument(document: {
    text: string,
    visibility: "read" | "write"
}) {
    return {
        type: "INIT_DOCUMENT",
        payload: {
            ...document,
        },
    } as const;
}

function setText(text: string) {
    return {
        type: "SET_TEXT",
        payload: {
            text,
        },
    } as const;
}

function failedLoad(code: "system error") {
    return {
        type: "FAILED_LOAD",
        payload: {
            code,
        },
    } as const;
}

function setState(state: CollectionState) {
    return {
        type: "SET_STATE",
        payload: {
            state,
        },
    } as const;
}

type Transform =
  | {
      type: "WRITE";
      payload: {
        index: number;
        text: string;
      };
    }
  | {
      type: "ERASE";
      payload: {
        index: number;
        count: number;
      };
    };

function transformText(transform: Transform) {
    return {
        type: "TRANSFORM_TEXT",
        payload: transform,
    } as const;
}

type CollectionAction =
  | ReturnType<typeof initDocument>
  | ReturnType<typeof setText>
  | ReturnType<typeof failedLoad>
  | ReturnType<typeof setState>
  | ReturnType<typeof transformText>;

function collectionReducer(
    state: CollectionState,
    action: CollectionAction
): CollectionState {
    switch (action.type) {
    case "INIT_DOCUMENT": {
        return {
            status: "init",
            text: action.payload.text,
        };
    }
    case "TRANSFORM_TEXT": {
        let nText = state.text;
        const { type, payload } = action.payload;
        if (type === "WRITE") {
            nText =
          nText.substring(0, payload.index) +
          payload.text +
          nText.substring(payload.index);
        }
        if (type === "ERASE") {
            nText =
          nText.substring(0, payload.index) +
          nText.substring(payload.index + payload.count);
        }
        return {
            ...state,
            text: nText,
        };
    }
    case "SET_TEXT": {
        return {
            ...state,
            text: action.payload.text,
        };
    }
    case "FAILED_LOAD": {
        return {
            ...state,
            status: action.payload.code,
        };
    }
    case "SET_STATE": {
        return action.payload.state;
    }
    default:
        throw new Error("Unknown collection type");
    }
}

const initialState: CollectionState = {
    status: "fresh",
    text: "",
};

function CollectionFresh() {
    {
    /* Fancier loading animation */
    }

    return (
        <div className="h-screen">
            <Layout header={<Header />}>
                <div className="flex flex-column justify-center h-full">
                    <Spinner />
                </div>
            </Layout>
        </div>
    );
}

function CollectionNotFound() {
    return <p>404</p>;
}

function difference(lstStr: string, nwStr: string) {
    // Use two pointers
    let l = 0;
    let r = lstStr.length - 1;
    let nr = nwStr.length - 1;
    let foundLeft = false;
    let foundRight = false;

    while (!foundLeft && l <= r) {
        if (l < nwStr.length && nwStr[l] === lstStr[l]) {
            l++;
        } else {
            foundLeft = true;
        }
    }

    // Find the rightmost difference
    // Both nr and r should not go under the l
    while (!foundRight && r >= l && nr >= l && nr >= 0) {
        if (nwStr[nr] === lstStr[r]) {
            nr--;
            r--;
        } else {
            foundRight = true;
        }
    }

    // Calculating number of characters to delete
    const numCharsToDelete = r - l + 1;
    // Extracting the string to insert
    const stringToInsert = nwStr.substring(l, nr + 1);

    return {
        index: l,
        deleteCount: numCharsToDelete,
        insert: stringToInsert,
    };
}

const enum Mode {
  EDITOR = 1,
  READ = 2,
  BOTH = 3,
}

function SearchButton() {
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

function DatePicker({
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


function Share() {
    const { text } = useTextContext();
    return (
        <button
            type="button"
            className={`
                flex-shrink-0
                text-sm
                py-1
                px-2
                rounded-full
                bg-white
                border border-gray-300
                ${apply(
            false,
            "text-gray-400 cursor-not-allowed",
            "hover:bg-gray-400 hover:text-gray-700"
        )}
            `}
        >
            <span className="pr-1">{text("SHARE")}</span>
            <FontAwesomeIcon icon={faShare} className="rounded-none" />
        </button>
    );
}

function CollectionInit({
    state,
    dispatch,
}: {
  state: CollectionState;
  dispatch: Dispatch<CollectionAction>;
}) {
    const acknowledges = useRef(new Set<string>());
    const { send } = useSocket();
    const username = useSelector((root: IState) => root.login.username);
    const { docName, uuid: colUUID } = useParams();
    const { emitter } = useSocket();
    const navigate = useNavigate();

    const onChange = useCallback(
        (val: string) => {
            const diff = difference(state.text, val);
            if (diff.deleteCount > 0) {
                const ack = luid(username);
                send(
                    "DOC.ERASE",
                    {
                        docName,
                        colUUID,
                        payload: {
                            index: diff.index,
                            sid: sid(),
                            count: diff.deleteCount,
                        },
                    },
                    ack
                );
                acknowledges.current.add(ack);
            }
            if (diff.insert !== "") {
                const ack = luid(username);
                send(
                    "DOC.WRITE",
                    {
                        docName,
                        colUUID,
                        payload: {
                            index: diff.index,
                            sid: sid(),
                            text: diff.insert,
                        },
                    },
                    ack
                );
                acknowledges.current.add(ack);
            }
            dispatch(setText(val));
        },
        [docName, colUUID, state.text]
    );
    useEffect(() => {
        const listener = (lastMessage: SocketMessage) => {
            if (lastMessage === null) return;
            if (
                lastMessage.acknowledge &&
        acknowledges.current.has(lastMessage.acknowledge)
            ) {
                acknowledges.current.delete(lastMessage.acknowledge);
                return;
            }
            if (
                lastMessage.type === "DOC.WRITE.OK" ||
                lastMessage.type === "DOC.ERASE.OK"
            ) {
                const transform = lastMessage.payload.transform;
                dispatch(transformText(transform));
            }
        };
        emitter.addListener("message", listener);
        return () => {
            emitter.removeListener("message", listener);
        };
    }, []);
    const [mode, setMode] = useState<Mode>(Mode.BOTH);
    const showEditor = useMemo(
        () => (mode & Mode.EDITOR) === Mode.EDITOR,
        [mode]
    );
    const showRead = useMemo(() => (mode & Mode.READ) === Mode.READ, [mode]);
    const [panelWidth, setPanelWidth] = useState(
        Math.floor(window.innerWidth / 2)
    ); // Initial panel width in percentage
    const dragging = useRef(false);

    const onMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        dragging.current = true;
    };

    const onMouseUp = (e: React.MouseEvent) => {
        e.preventDefault();
        dragging.current = false;
    };

    useEffect(() => {
        const fn = (e: any) => {
            if (dragging.current) {
                const newWith = e.clientX;
                setPanelWidth(newWith);
            }
        };
        addEventListener("mousemove", fn);
        return () => {
            removeEventListener("mousemove", fn);
        };
    }, []);

    function onToggleClick() {
        setMode((mode) => (mode % Mode.BOTH) + 1);
    }

    function onDatePick(date: Date | null) {
        if (date === null) return;
        const stDate = standardDate(date);
        navigate(collectionURL(colUUID!, stDate));
    }
    const processCustomLinks = (markdown: string) => {
        // TODO []([[]]) syntax
        // Have to allow custom [[]] syntax
        return markdown.replace(/\[\[(.*?)\]\]/g, (_, content) => {
            // Create a custom URL or perform other logic based on 'content'
            const customUrl = collectionURL(colUUID!, content);
            return `[${content}](${customUrl})`;
        });
    };
    const UseLink = ({ children, href }: any) => {
    // Check if the href should be handled by React Router
        if (href.startsWith("/")) {
            return <Link to={href}>{children}</Link>;
        }

        // For external links, use a regular <a> tag
        return (
            <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
            </a>
        );
    };

    return (
        <Layout header={<Header />}>
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
            <div className="split-view">
                {showEditor && (
                    <div
                        className="panel"
                        style={{
                            flex: showRead ? `0 0 ${panelWidth}px` : "1 1",
                        }}
                    >
                        <CodeMirror
                            height="100%"
                            value={state.text}
                            extensions={[markdown()]}
                            onChange={onChange}
                        />
                    </div>
                )}
                {showEditor && showRead && (
                    <div
                        className="resizer"
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                    ></div>
                )}
                {showRead && (
                    <div
                        className="panel"
                        style={{
                            flex: `1 1`,
                        }}
                    >
                        <Markdown
                            components={{
                                a: UseLink,
                            }}
                            className={"markdown"}
                        >
                            {processCustomLinks(state.text)}
                        </Markdown>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default function Collection() {
    const [state, dispatch] = useReducer(collectionReducer, initialState);
    const { emitter, send } = useSocket();
    const acknowledge = useRef<string>("");
    const username = useSelector((root: IState) => root.login.username);
    const { docName, uuid: colUUID } = useParams();
    const { showMessage } = useModalContext();
    const { text } = useTextContext();
    useEffect(() => {
        dispatch(setState(initialState));
        acknowledge.current = luid(username);
        send(
            "DOC.READ",
            {
                colUUID,
                docName,
            },
            acknowledge.current
        );
    }, [docName, colUUID]);

    useEffect(() => {
        const listener = (lastMessage: SocketMessage) => {
            if (lastMessage === null) return;
            const { type, payload, acknowledge: cAck } = lastMessage;
            if (acknowledge.current === cAck) {
                if (type === "DOC.READ.OK") {
                    const { text, visibility } = payload;
                    dispatch(initDocument({
                        text,
                        visibility: visibility === 2 ? "write" : "read",
                    }));
                } else {
                    showMessage({
                        message: text("ERROR_GENERIC"),
                        buttons: [
                            {
                                name: text("BUTTON_OK"),
                                callback: () => {},
                            },
                        ],
                    });
                    dispatch(failedLoad("system error"));
                }
            }
        };
        emitter.addListener("message", listener);
        return () => {
            emitter.removeListener("message", listener);
        };
    }, []);

    switch (state.status) {
    case "fresh": {
        return <CollectionFresh />;
    }
    case "init": {
        return <CollectionInit state={state} dispatch={dispatch} />;
    }
    default: {
        return <CollectionNotFound />;
    }
    }
}

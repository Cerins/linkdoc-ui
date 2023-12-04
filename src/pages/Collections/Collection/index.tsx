import {
    Dispatch,
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
import useSocket from "../../../contexts/Socket";
import { IState } from "../../../store";
import { useSelector } from "react-redux";
import luid from "../../../utils/luid";
import { useParams } from "react-router-dom";
import useModalContext from "../../../contexts/Modal";
import useTextContext from "../../../contexts/Text";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen } from "@fortawesome/free-solid-svg-icons";
import "./index.css";
import { apply } from "../../../utils/css";

function sid() {
    return new Date().getTime();
}

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

function initDocument(text: string) {
    return {
        type: "INIT_DOCUMENT",
        payload: {
            text,
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

type CollectionAction =
  | ReturnType<typeof initDocument>
  | ReturnType<typeof setText>
  | ReturnType<typeof failedLoad>;

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
    while (!foundRight && r >= l && nr >= 0) {
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

function CollectionInit({
    state,
    dispatch,
}: {
  state: CollectionState;
  dispatch: Dispatch<CollectionAction>;
}) {
    const lastText = useRef(state.text);
    const acknowledges = useRef(new Set<string>());
    const { send } = useSocket();
    const username = useSelector((root: IState) => root.login.username);
    const { docName, uuid: colUUID } = useParams();

    const onChange = useCallback((val: string) => {
        const diff = difference(lastText.current, val);
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
            send("DOC.WRITE", {
                docName,
                colUUID,
                payload: {
                    index: diff.index,
                    sid: sid(),
                    text: diff.insert,
                },
            });
            acknowledges.current.add(ack);
        }
        dispatch(setText(val));
        lastText.current = val;
    }, []);
    const [isEditorVisible, setEditorVisible] = useState(true);
    const [isViewerVisible, setViewerVisible] = useState(true);
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

    return (
        <Layout header={<Header />}>
            <div className="flex justify-end px-2 border">
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
                        <Markdown className={"markdown"}>{state.text}</Markdown>
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default function Collection() {
    const [state, dispatch] = useReducer(collectionReducer, initialState);
    const { lastMessage, send } = useSocket();
    const acknowledge = useRef<string>("");
    const username = useSelector((root: IState) => root.login.username);
    const { docName, uuid: colUUID } = useParams();
    const { showMessage } = useModalContext();
    const { text } = useTextContext();
    useEffect(() => {
        console.log(docName, colUUID);
        acknowledge.current = luid(username);
        send(
            "DOC.READ",
            {
                colUUID,
                docName,
            },
            acknowledge.current
        );
    }, []);

    useEffect(() => {
        if (lastMessage === null) return;
        const { type, payload, acknowledge: cAck } = lastMessage;
        if (acknowledge.current === cAck) {
            if (type === "DOC.READ.OK") {
                const { text } = payload;
                dispatch(initDocument(text));
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
            console.log(type, payload);
        }
    }, [lastMessage]);

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

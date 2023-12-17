import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import useSocket, { SocketMessage } from "../../../../../contexts/Socket";
import { Dispatch, useCallback, useEffect, useRef } from "react";
import { difference, sid } from "../../utils";
import luid from "../../../../../utils/luid";
import { useSelector } from "react-redux";
import { IState } from "../../../../../store";
import { useParams } from "react-router-dom";
import { CollectionAction, setText, transformText } from "../../reducer";

export default function Editor({
    showRead,
    panelWidth,
    state,
    dispatch,
}: {
    showRead: boolean;
    panelWidth: number;
    state: {
        text: string;
    };
    dispatch: Dispatch<CollectionAction>;
}) {
    const { emitter, send } = useSocket();
    const username = useSelector((root: IState) => root.login.username);
    const { docName, uuid: colUUID } = useParams();
    const acknowledges = useRef(new Set<string>());
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
    return (
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
    )
}
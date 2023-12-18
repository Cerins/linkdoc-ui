import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import useSocket from "../../../../../contexts/Socket";
import { Dispatch, useCallback } from "react";
import { difference, sid } from "../../utils";
import luid from "../../../../../utils/luid";
import { useSelector } from "react-redux";
import { IState } from "../../../../../store";
import { useParams } from "react-router-dom";
import { CollectionAction, setText } from "../../reducer";

export default function Editor({
    showRead,
    panelWidth,
    state,
    dispatch,
    acknowledges,
}: {
    showRead: boolean;
    panelWidth: number;
    state: {
        text: string;
    };
    dispatch: Dispatch<CollectionAction>;
    acknowledges: React.MutableRefObject<Set<string>>;
}) {
    const { send } = useSocket();
    const username = useSelector((root: IState) => root.login.username);
    const { docName, uuid: colUUID } = useParams();
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
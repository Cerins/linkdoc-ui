import CodeMirror, { EditorSelection, EditorView } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import useSocket, { SocketMessage } from "../../../../../contexts/Socket";
import { Dispatch, useCallback, useEffect, useRef, useState  } from "react";
import { difference, sid } from "../../utils";
import luid from "../../../../../utils/luid";
import { useSelector } from "react-redux";
import { IState } from "../../../../../store";
import { useParams } from "react-router-dom";
import { CollectionAction, setCursor, setText, transformText } from "../../reducer";

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
        cursor: number;
    };
    dispatch: Dispatch<CollectionAction>;
    acknowledges: React.MutableRefObject<Set<string>>;
}) {
    const { send, emitter } = useSocket();
    const username = useSelector((root: IState) => root.login.username);
    const { docName, uuid: colUUID } = useParams();
    const editorView = useRef<EditorView>();
    const waiter = useRef<{
        textOld: string;
        textCurrent: string;
        sid: number;
    }|undefined>(undefined);


    useEffect(() => {
        const listener = (lastMessage: SocketMessage) => {
            if (
                lastMessage.type === "DOC.WRITE.OK" ||
                lastMessage.type === "DOC.ERASE.OK"
            ) {
                
            }
        };
        emitter.addListener("message", listener);
        return () => {
            emitter.removeListener("message", listener);
        };
    }, []);
    const onChange = useCallback(
        (val: string) => {
            // if(waiter.current === undefined) {
            //     waiter.current = {
            //         textOld: state.text,
            //         textCurrent: val,
            //         sid: sid()
            //     }
            //     setTimeout(()=>{
            //         const diff = difference(
            //             waiter.current!.textOld,
            //             waiter.current!.textCurrent
            //         );
            //         if (diff.deleteCount > 0) {
            //             const ack = luid(username);
            //             send(
            //                 "DOC.ERASE",
            //                 {
            //                     docName,
            //                     colUUID,
            //                     payload: {
            //                         index: diff.index,
            //                         sid: waiter.current!.sid,
            //                         count: diff.deleteCount,
            //                     },
            //                 },
            //                 ack
            //             );
            //             acknowledges.current.add(ack);
            //             // dispatch(transformText({
            //             //     type: 'ERASE',
            //             //     payload: {
            //             //         index: diff.index,
            //             //         count: diff.deleteCount,
            //             //     }
            //             // }, true))
            //         }
            //         if (diff.insert !== "") {
            //             const ack = luid(username);
            //             send(
            //                 "DOC.WRITE",
            //                 {
            //                     docName,
            //                     colUUID,
            //                     payload: {
            //                         index: diff.index,
            //                         sid: waiter.current!.sid,
            //                         text: diff.insert,
            //                     },
            //                 },
            //                 ack
            //             );
            //             acknowledges.current.add(ack);
            //             // dispatch(transformText({
            //             //     type: 'WRITE',
            //             //     payload: {
            //             //         index: diff.index,
            //             //         text: diff.insert,
            //             //     }
            //             // }, true))
            //         }
            //         waiter.current = undefined;
            //     }, 200)
            // } else {
            //     waiter.current = {
            //         textOld: waiter.current.textOld,
            //         textCurrent: val,
            //         sid: waiter.current.sid
            //     }
            // }
            const diff = difference(
                state.text,
                val
            );
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
    useEffect(()=>{
        if(editorView.current){
            // console.log('Setting cursor', state.cursor)
            editorView.current.dispatch({
                selection: EditorSelection.cursor(state.cursor)
            })
        }
    }, [state.cursor, state.text])
    return (
        <div
            className="panel"
            style={{
                flex: showRead ? `0 0 ${panelWidth}px` : "1 1",
            }}
        >
            <CodeMirror
                // key={state.text+state.cursor}
                height="100%"
                value={state.text}
                extensions={[markdown()]}
                onChange={onChange}
                onUpdate={(view)=>{
                    // console.log('Updated', view)
                    if(view.selectionSet) {
                        // console.log('Selection set', view.state.selection.main.head)
                        dispatch(
                            setCursor(
                                view.state.selection.main.head
                            )
                        )
                    }
                }}
                onCreateEditor={(e)=>{
                    // console.log('Created', e, s)
                    editorView.current = e;
                }}
                // selection={EditorSelection.cursor(state.cursor)}
                autoFocus
                // onUpdate={(view)=>{
                //     const current = view.state.selection.main.head;
                //     if (
                //         current !== state.cursor
                //     ){
                //         if(canJump.current){
                //             dispatch(
                //                 setCursor(
                //                     current
                //                 )
                //             )
                //         } else {
                //             canJump.current = true;
                //         }
                //     }

                // }}
            />
        </div>
    )
}
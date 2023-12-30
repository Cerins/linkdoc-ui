import CodeMirror, { EditorSelection, EditorView } from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import useSocket, { SocketMessage } from "../../../../../contexts/Socket";
import { Dispatch, useCallback, useEffect, useRef } from "react";
import { difference } from "../../utils";
import luid from "../../../../../utils/luid";
import { useSelector } from "react-redux";
import { IState } from "../../../../../store";
import { useParams } from "react-router-dom";
import { CollectionAction, setCursor, setText } from "../../reducer";

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
        sid: number;
    };
    dispatch: Dispatch<CollectionAction>;
    acknowledges: React.MutableRefObject<Set<string>>;
}) {
    const { send, emitter } = useSocket();
    const username = useSelector((root: IState) => root.login.username);
    const { docName, uuid: colUUID } = useParams();
    const editorView = useRef<EditorView>();
    // const waiter = useRef<{
    //     textOld: string;
    //     textCurrent: string;
    //     sid: number;
    // } | undefined>(undefined);
    // const old = useRef<string>(state.text);
    const latest = useRef<string>(state.text);
    // const activeRequest = useRef<{
    //     type: "DOC.WRITE" | "DOC.ERASE";
    //     payload: {
    //         index: number;
    //         sid: number;
    //         text?: string;
    //         count?: number;
    //     };
    //     ack: string;
    // }|undefined>(undefined)

    // function buildRequest(

    // ) {
    //     if(activeRequest.current !== undefined) return;
    //     const diff = difference(
    //         old.current,
    //         latest.current
    //     );
    //     console.log('Diff', diff, old.current, latest.current)
    //     if (diff.deleteCount > 0) {
    //         const ack = luid(username);
    //         activeRequest.current = {
    //             type: "DOC.ERASE",
    //             payload: {
    //                 index: diff.index,
    //                 sid: state.sid,
    //                 count: diff.deleteCount,
    //             },
    //             ack,
    //         };
    //     }
    //     if (diff.insert !== "") {
    //         const ack = luid(username);
    //         activeRequest.current = {
    //             type: "DOC.WRITE",
    //             payload: {
    //                 index: diff.index,
    //                 sid: state.sid,
    //                 text: diff.insert,
    //             },
    //             ack,
    //         };
    //     }
    //     old.current = state.text;
    // }

    // function completeRequest() {
    //     if(activeRequest.current === undefined) return;
    //     const { type, payload, ack } = activeRequest.current;
    //     send(type, {
    //         docName,
    //         colUUID,
    //         payload,
    //     }, ack);
    //     acknowledges.current.add(ack);
    //     // activeRequest.current = undefined;
    // }


    useEffect(() => {
        const listener = (lastMessage: SocketMessage) => {
            if (
                lastMessage.type === "DOC.WRITE.OK" ||
                lastMessage.type === "DOC.ERASE.OK"
            ) {
                // latest.current = state.text;
                // // If last message is an ACK, then we can send the next request
                // if(lastMessage.acknowledge === activeRequest.current?.ack) {
                //     activeRequest.current = undefined;
                //     buildRequest();
                //     completeRequest();
                // }
            }
        };
        emitter.addListener("message", listener);
        return () => {
            emitter.removeListener("message", listener);
        };
    }, []);
    const onChange = useCallback(
        (val: string) => {
            latest.current = val;
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
            //     }, 1000)
            // } else {
            //     waiter.current = {
            //         textOld: waiter.current.textOld,
            //         textCurrent: val,
            //         sid: waiter.current.sid
            //     }
            // }
            // const diff = difference(
            //     state.text,
            //     val
            // );
            // if (diff.deleteCount > 0) {
            //     const ack = luid(username);
            //     send(
            //         "DOC.ERASE",
            //         {
            //             docName,
            //             colUUID,
            //             payload: {
            //                 index: diff.index,
            //                 sid: state.sid,
            //                 count: diff.deleteCount,
            //             },
            //         },
            //         ack
            //     );
            //     acknowledges.current.add(ack);
            // }
            // if (diff.insert !== "") {
            //     const ack = luid(username);
            //     send(
            //         "DOC.WRITE",
            //         {
            //             docName,
            //             colUUID,
            //             payload: {
            //                 index: diff.index,
            //                 sid: state.sid,
            //                 text: diff.insert,
            //             },
            //         },
            //         ack
            //     );
            //     acknowledges.current.add(ack);
            // }
            // if(activeRequest.current === undefined) {
            //     buildRequest();
            //     completeRequest();
            // }
            dispatch(setText(val));
            // dispatch(setText(state.text));
        },
        [docName, colUUID, state.text]
    );

    const crater = useRef<{
        index: number;
        content: string;
        sid: number;
    } | undefined>(undefined);
    const insert = useCallback(
        (index: number, text: string) => {

            if(crater.current === undefined) {
                crater.current = {
                    index,
                    content: text,
                    sid: state.sid
                }
                setTimeout(()=>{
                    const ack = luid(username);
                    send(
                        "DOC.WRITE",
                        {
                            docName,
                            colUUID,
                            payload: {
                                index: crater.current!.index,
                                sid: crater.current!.sid,
                                text: crater.current!.content,
                            },
                        },
                        ack
                    );
                    acknowledges.current.add(ack);
                    crater.current = undefined;
                }, 500)
            } else {
                crater.current.content += text;
            }
        },
        [docName, colUUID, state.sid]
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
                onKeyDown={(e)=>{
                    // If enter then send \n
                    if(e.key === 'Enter') {
                        insert(
                            editorView.current!.state.selection.main.head,
                            '\n')
                    }
                    // If backspace then send delete
                    if(e.key === 'Backspace') {
                        const {from, to} = editorView.current!.state.selection.main;
                        if(from === to) {
                            del(from, 1);
                        }
                    }
                    // If normal character then send it
                    if(e.key.length === 1) {
                        insert(
                            editorView.current!.state.selection.main.head,
                            e.key)
                    }
                    

                }}
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
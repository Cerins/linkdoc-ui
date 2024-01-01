import CodeMirror from 'codemirror';
import "codemirror/lib/codemirror.css";
import { Dispatch, useEffect, useRef } from "react";
import { CollectionAction, setText } from "../../reducer";
import CodeMirrorAdapter from './ot/codemirror-adapter';
import SocketAdapter from "./ot/socketAdapter";
import useSocket from "../../../../../contexts/Socket";
import EditorClient from "./ot/editor-client";
import { useParams } from "react-router-dom";

export default function Editor({
    showRead,
    panelWidth,
    state,
    dispatch,
    // acknowledges,
    display
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
    display: boolean
}) {
    const { send, emitter } = useSocket();
    const { docName, uuid: colUUID } = useParams();
    const cmRef = useRef<CodeMirror.Editor>();
    useEffect(()=>{
        const cm = CodeMirror.fromTextArea(document.getElementById('note') as HTMLTextAreaElement, {
            lineNumbers: true,
        })
        cmRef.current = cm;
        cm.setValue(state.text);
        cm.getWrapperElement().style.height = '100%';
        const serverAdapter = new SocketAdapter(
            {
                send,
                emitter,
            },
            {
                docName: docName!,
                colUUID: colUUID!,
            }
        )
        // Listen on cm and get the current value
        // To dispatch the action to update the state
        const listener = (cm: CodeMirror.Editor) => {
            const text = cm.getValue();
            dispatch(setText(text));
        }
        cm.on('change', listener);
        
        // This is a proof of concept
        // Every 1000 seconds append Hihi in new line at the end of the document inside of the editor
        // setInterval(() => {
        //     cm.replaceRange('Hihi\n', { line: cm.lastLine() + 1, ch: 0 }, { line: cm.lastLine() + 1, ch: 0 })
        // }, 1000)



        const editorAdapter = new CodeMirrorAdapter(cm);
        const client = new EditorClient(state.sid, {}, serverAdapter, editorAdapter);
        return () => {
            // Clean up the code mirror instance
            cm.off('change', listener);
            // Clean up the server adapter
            // This is needed because server adapter has a listener on the socket
            serverAdapter.cleanup()
        }

    }, [docName, colUUID])
    useEffect(()=>{
        if(!cmRef.current) return;
        cmRef.current.refresh();
    }, [display])
    return (
        <div
            className="panel"
            style={{
                flex: showRead ? `0 0 ${panelWidth}px` : "1 1",
                display: display ? "block" : "none",
            }}
        >
            <textarea
                key={`${colUUID}-${docName}`}
                style={{
                    width: "100%",
                    height: "100%",
                }}
                id="note"></textarea>
        </div>
    )
}
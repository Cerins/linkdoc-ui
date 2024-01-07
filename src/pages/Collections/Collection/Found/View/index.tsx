import { Dispatch, useEffect, useMemo, useRef, useState } from "react";
import { CollectionAction, CollectionState, setSid, transformText } from "../../reducer";
import { Mode } from "../../utils";
import { Layout, Header } from "../../../../../components/Header";
import SubHeader from "../SubHeader";
import Editor from "./Editor";
import Viewer from "./Viewer";
import useSocket, { SocketMessage } from "../../../../../contexts/Socket";

export default function CollectionFound({
    state,
    dispatch,
}: {
  state: CollectionState;
  dispatch: Dispatch<CollectionAction>;
}) {
    const [mode, setMode] = useState<Mode>(Mode.BOTH);
    const { emitter} = useSocket();
    const acknowledges = useRef(new Set<string>());
    const cmRef = useRef<CodeMirror.Editor | undefined>(undefined);
    const showEditor = useMemo(
        () => (mode & Mode.EDITOR) === Mode.EDITOR && state.visibility === "write",
        [mode, state.visibility]
    );
    const showRead = useMemo(() => (mode & Mode.READ) === Mode.READ || state.visibility !== "write", [mode, state.visibility]);
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
        const onMouseMove = (e: any) => {
            if (dragging.current) {
                const newWith = e.clientX;
                setPanelWidth(newWith);
            }
        };
        const onResize = () => {
            setPanelWidth(Math.floor(window.innerWidth / 2));
        }
        addEventListener("mousemove", onMouseMove);
        addEventListener("resize", onResize);
        return () => {
            removeEventListener("mousemove", onMouseMove);
            removeEventListener("resize", onResize);
        };
    }, []);
    useEffect(() => {
        const listener = (lastMessage: SocketMessage) => {
            if (lastMessage === null) return;
            const sid = lastMessage.payload.sid;
            if (
                lastMessage.acknowledge &&
        acknowledges.current.has(lastMessage.acknowledge)
            ) {
                acknowledges.current.delete(lastMessage.acknowledge);
                // Return not needed only because own messages are broadcasted
                // return;
            }
            if (
                lastMessage.type === "DOC.WRITE.OK" ||
                lastMessage.type === "DOC.ERASE.OK"
            ) {
                const transform = lastMessage.payload.transform;
                dispatch(transformText(transform));
            }
            if(sid !== undefined) {
                dispatch(setSid(sid));
            }
        };
        emitter.addListener("message", listener);
        return () => {
            emitter.removeListener("message", listener);
        };
    }, []);
    return (
        <Layout header={<Header />}>
            <SubHeader 
                showEditor={showEditor}
                showRead={showRead}
                setMode={setMode}
                cmRef={cmRef}
            />
            <div className="split-view">
                <Editor
                    cmRef={cmRef}
                    showRead={showRead}
                    panelWidth={panelWidth}
                    state={state}
                    dispatch={dispatch}
                    acknowledges={acknowledges}
                    display={showEditor}
                />
                {showEditor && showRead && (
                    <div
                        className="resizer"
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                    ></div>
                )}
                {showRead && (
                    <Viewer 
                        
                        state={state}
                    />
                )}
            </div>
        </Layout>
    );
}
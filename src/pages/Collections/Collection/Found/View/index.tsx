import { Dispatch, useEffect, useMemo, useRef, useState } from "react";
import { CollectionAction, CollectionState } from "../../reducer";
import { Mode } from "../../utils";
import { Layout, Header } from "../../../../../components/Header";
import SubHeader from "../SubHeader";
import Editor from "./Editor";
import Viewer from "./Viewer";

export default function CollectionFound({
    state,
    dispatch,
}: {
  state: CollectionState;
  dispatch: Dispatch<CollectionAction>;
}) {
    const [mode, setMode] = useState<Mode>(Mode.BOTH);
    const showEditor = useMemo(
        () => (mode & Mode.EDITOR) === Mode.EDITOR && state.visibility === "write",
        [mode, state.visibility]
    );
    const showRead = useMemo(() => (mode & Mode.READ) === Mode.READ || state.visibility !== "write", [mode]);
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
    return (
        <Layout header={<Header />}>
            <SubHeader showEditor={showEditor} showRead={showRead} setMode={setMode} />
            <div className="split-view">
                {showEditor && (
                    <Editor
                        showRead={showRead}
                        panelWidth={panelWidth}
                        state={state}
                        dispatch={dispatch}
                    />
                )}
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
import {
    useEffect,
    useReducer,
    useRef,
} from "react";
import useSocket, { SocketMessage } from "../../../contexts/Socket";
import { IState } from "../../../store";
import { useSelector } from "react-redux";
import luid from "../../../utils/luid";
import { useParams } from "react-router-dom";
import "./index.css";
import CollectionFresh from "./Fresh";
import CollectionNotFound from "./NotFound";
import collectionReducer, { failedLoad, initDocument, initialState, setState } from "./reducer";
import CollectionFound from "./Found/View";


export default function Collection() {
    const [state, dispatch] = useReducer(collectionReducer, initialState);
    const { emitter, send } = useSocket();
    const acknowledge = useRef<string>("");
    const username = useSelector((root: IState) => root.login.username);
    const { docName, uuid: colUUID } = useParams();
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
                    // showMessage({
                    //     message: text("ERROR_GENERIC"),
                    //     buttons: [
                    //         {
                    //             name: text("BUTTON_OK"),
                    //             callback: () => {},
                    //         },
                    //     ],
                    // });
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
        return <CollectionFound state={state} dispatch={dispatch} />;
    }
    default: {
        return <CollectionNotFound />;
    }
    }
}

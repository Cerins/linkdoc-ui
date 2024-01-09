import { Link } from "react-router-dom";
import { Collection } from ".";
import useTextContext from "../../contexts/Text";
import prettyDate from "../../utils/date/pretty";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import useModalContext from "../../contexts/Modal";
import { apply } from "../../utils/css";
import useSocket, { SocketMessage } from "../../contexts/Socket";
import luid from "../../utils/luid";
import { useDispatch, useSelector } from "react-redux";
import { IState } from "../../store";
import {
    endDeleteCollection,
    startDeleteCollection,
} from "../../reducers/collections";
import standardDate from "../../utils/date/stamdard";

function List({ children }: { children: ReactNode }) {
    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
            }}
        >
            {children}
        </div>
    );
}

function ListHeader() {
    const { text } = useTextContext();
    return (
        <>
            <h2 className="p-2 bg-gray-100">{text("COLLECTIONS_NAME")}</h2>
            <h2 className="p-2 bg-gray-100">{text("COLLECTIONS_USER")}</h2>
            <h2 className="p-2 bg-gray-100">{text("COLLECTIONS_TIME")}</h2>
            <h2 className="p-2 bg-gray-100" />
        </>
    );
}

function DeleteButton({
    collection,
    disabled,
    setDisabled,
}: {
  collection: { uuid: string, user: string };
  disabled: boolean;
  setDisabled: (disabled: boolean) => void;
}) {
    const { showMessage } = useModalContext();
    const { text } = useTextContext();
    const { send, emitter } = useSocket();
    const username = useSelector((root: IState) => root.login.username);
    const acknowledge = useRef<string>("");
    const dispatch = useDispatch();
    // Have to confirm the delete
    const confirmedDelete = () => {
        setDisabled(true);
        acknowledge.current = luid(username);
        dispatch(startDeleteCollection());
        send(
            "COL.DELETE",
            {
                uuid: collection.uuid,
            },
            acknowledge.current
        );
    };
    useEffect(() => {
        // Listen if there was a response
        // TODO use the sendCb
        const listener = (lastMessage: SocketMessage) => {
            if (lastMessage === null) return;
            const { acknowledge: cAck, type } = lastMessage;
            if (acknowledge.current === cAck) {
                let deletedItem: string | undefined;
                if (type === "COL.DELETE.OK") {
                    deletedItem = collection.uuid;
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
                }
                dispatch(endDeleteCollection(deletedItem));
            }
        }
        emitter.addListener('message', listener);
        return ()=>{
            emitter.removeListener('message', listener);
        }
    }, []);
    // If the user clicks to delete
    // Then show a confirmation message
    // Do not allow to delete without confirmation
    const handleDelete = () => {
        showMessage({
            message: text("DELETE_CONFIRM"),
            buttons: [
                {
                    name: text("BUTTON_CANCEL"),
                    callback: () => {},
                },
                {
                    name: text("BUTTON_YES"),
                    callback: () => confirmedDelete(),
                },
            ],
        });
    };

    // Only show the delete button if the user is the owner
    return (
        <button
            onClick={handleDelete}
            className={`
            invisible
            ${apply(username === collection.user, "group-hover:visible")}
            text-white
            font-bold
            px-2
            border
            ${apply(
            !disabled,
            `
            bg-red-500
            border-red-700
            rounded hover:bg-red-600
            hover:border-red-800`,
            `
            bg-red-300
            border-red-600
            `
        )}
            `}
        >
            <FontAwesomeIcon icon={faTrash} />
        </button>
    );
}

function ListItem({ collection: col }: { collection: Collection }) {
    const [disabled, setDisabled] = useState(false);
    const { locale } = useTextContext();
    // This calculate the link to the collection
    // Either use the default document or the current date
    const to = useMemo(()=> `/collections/${col.uuid}/${col.defaultDocument ?? standardDate(new Date())}`, [col.uuid])
    // Have to make everything a link since contents ignores on click
    return (
        <div key={col.uuid} className="group contents">
            <Link
                to={apply(!disabled, to, "#")}
                className="font-semibold border-b border-l border-t p-2 group-hover:bg-gray-100"
            >
                {col.name}
            </Link>
            <Link
                to={apply(!disabled, to, "#")}
                className="border-b border-t p-2 group-hover:bg-gray-100"
            >
                {col.user}
            </Link>
            <Link
                to={apply(!disabled, to, "#")}
                className="text-sm text-gray-600 border-b border-t p-2 group-hover:bg-gray-100"
            >
                {prettyDate(col.time, locale)}
            </Link>
            <div className="border-b border-r border-t p-2 group-hover:bg-gray-100">
                <DeleteButton
                    disabled={disabled}
                    setDisabled={setDisabled}
                    collection={col}
                />
            </div>
        </div>
    );
}

function ListBody({ collections }: { collections: Collection[] }) {
    // Display the collections
    return (
        <>
            {collections.map((col) => (
                <ListItem key={col.uuid} collection={col} />
            ))}
        </>
    );
}

export default function CollectionList({
    collections,
}: {
  collections: Collection[];
}) {
    return (
        <List>
            <ListHeader />
            <ListBody collections={collections} />
        </List>
    );
}

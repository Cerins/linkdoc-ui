import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useTextContext from "../../../../contexts/Text";
import { apply } from "../../../../utils/css";
import { faClose, faCopy, faEye, faPen, faShare } from "@fortawesome/free-solid-svg-icons";
import { useEffect,  useState } from "react";
import { ModalLike } from "../../../../contexts/Modal";
import useSocket from "../../../../contexts/Socket";
import { useParams } from "react-router-dom";
import Spinner from "../../../../components/Spinner";
import collectionURL from "../../../../utils/collections/url";
import standardDate from "../../../../utils/date/stamdard";
import { useSelector } from "react-redux";
import { IState } from "../../../../store";

type PopupState = {
    status: "ok";
    owner: false;
    defaultDocument: string | null
} |
{
    status: "ok";
    owner: boolean;
    defaultDocument: string | null
    visibility: 0 | 1 | 2
    users: {
        name: string;
        visibility: 0 | 1 | 2
    }[]
} | {
    status: "error";
    error: string;
} | null


// The popup that allows to share a collection
function Popup(
    {
        setOpen
    }: {
        setOpen: (open: boolean) => void;
    }
) {
    const [state, setState] = useState<PopupState>(null);
    const  { sendCb }  = useSocket();
    const { uuid: colUUID } = useParams();
    const { text } = useTextContext();
    const activeUser = useSelector((state: IState) => state.login.username);
    
    useEffect(()=>{
        // Get the information about the collection
        // Which is the owner, the default document, the visibility and the users
        if(state === null){
            sendCb(
                "COL.SHARE.INFO", 
                {
                    colUUID
                }, 
                (err, data) => {
                    if(err){
                        setState({
                            status: "error",
                            error: err.message
                        })
                    }
                    setState({
                        status: "ok",
                        owner: data.payload.owner,
                        defaultDocument: data.payload.defaultDocument,
                        visibility: data.payload.visibility,
                        users: data.payload.users
                    });
                })
        }
    }, [])
    // The popup part which show the collection url and allows to copy it
    const ShareDoc = () => {
        if(state === null || state.status !== 'ok'){ 
            return <></>
        }
        const colUrl = collectionURL(colUUID!, state?.defaultDocument ?? standardDate(new Date));
        const colFullUrl = `${window.location.origin}${colUrl}`;
        return (
            <div className="w-full border flex justify-between items-center">
                <div className="flex items-center">
                    <input
                        type="text"
                        value={colFullUrl}
                        readOnly
                        className="text-black-700 overflow-scroll"
                    />
                </div>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(colFullUrl);
                    }}
                    className="border p-2 flex items-center text-gray-500 hover:text-gray-700"
                >
                    <FontAwesomeIcon icon={faCopy} className="mr-1" />
                </button>
            </div>
        )
    }
    // The actual content of the popup
    // All the cases
    const ModalInner = () => {
        // If the state is null, then we are loading
        if(state === null){
            return <Spinner />
        }
        // IF error happened then show the error
        if(state.status === "error"){
            return <p>{text('ERROR_GENERIC')}</p>
        }
        // Otherwise more branching
        // status ok is needed for typescript
        // there is no other possible status here
        if(state.status === "ok"){

            // If not the owner then only allow to see the URL and copy it
            if(state.owner === false) {
                return <ShareDoc />
            }
            // The option to change the general visibility of the collection
            const ChangeVisibility = () => {
                return (
                    <div className="border w-full">
                        <select
                            value={state.visibility}
                            onChange={(e) => {
                                const selectedVisibility = parseInt(e.target.value);
                                setState((prevState) => ({
                                    ...prevState,
                                    visibility: selectedVisibility
                                } as any));
                                // Use optimistic update
                                // First update the local state
                                // And only then complain if something went wrong
                                sendCb(
                                    'COL.SHARE',
                                    {
                                        colUUID,
                                        visibility: selectedVisibility
                                    },
                                    (err, data) => {
                                        if(err){
                                            setState({
                                                status: "error",
                                                error: err.message
                                            })
                                        }
                                        if(data.type !== "COL.SHARE.OK"){
                                            setState({
                                                status: "error",
                                                error: "Unknown error"
                                            })
                                        }
                                    }
                                )
                            }}
                            className="p-2 text-black-700 overflow-scroll w-full"
                        >
                            <option value={0}>{text("PRIVATE")}</option>
                            <option value={1}>{text("READ_ONLY")}</option>
                            <option value={2}>{text("WRITE")}</option>
                        </select>
                    </div>
                )
            }
            const UserList = () => {
                // Show all the users that have access to the collection
                if(state.users === undefined) return <></>
                if(state.users.filter((usr)=>usr.visibility > 0).length === 0) return <></>
                return (
                    <div className="mt-2">
                        <h2>{text("SHARE_USERS")}</h2>
                        <div className="border w-full">
                            <ul>
                                {
                                    state.users
                                        .filter((usr) => usr.visibility > 0)
                                        .map((user, index) => (
                                            // Furthermore for each user allow them to be removed
                                            // Use the optimistic update
                                            // Visibility 0 means that the user does not have access
                                            // Visibility 1 means that the user has read only access
                                            // Visibility 2 means that the user has write access
                                            <li key={index} className="flex justify-between items-center">
                                                <span>{user.name}</span>
                                                {user.visibility === 1 && <FontAwesomeIcon icon={faEye} />}
                                                {user.visibility === 2 && <FontAwesomeIcon icon={faPen} />}
                                                <button
                                                    onClick={() => {
                                                        const updatedUsers = state.users.map((usr) => {
                                                            if (usr.name === user.name) {
                                                                return { ...usr, visibility: 0 };
                                                            }
                                                            return usr;
                                                        });
                                                        setState((prevState) => ({
                                                            ...prevState,
                                                            users: updatedUsers,
                                                        }) as any);
                                                        sendCb(
                                                            'COL.SHARE',
                                                            {
                                                                colUUID,
                                                                users: [
                                                                    {
                                                                        name: user.name,
                                                                        role: 0
                                                                    }
                                                                ]
                                                            },
                                                            ()=>{}
                                                        )
                                                    }}
                                                    className="text-red-500"
                                                >
                                                    {text("SHARE_REMOVE")}
                                                </button>
                                            </li>
                                        ))
                                }
                            </ul>
                        </div>
                    </div>
                )
            }
            // The final part is to add a new user
            const AddUser = () => {
                const [active, setActive] = useState(true);
                const [username, setUsername] = useState("");
                // By default allow only read only access
                // But that can be changed
                const [permission, setPermission] = useState(1);
                return (
                    <div className="mt-2">
                        <h2>{text("SHARE_ADD_USER")}</h2>
                        <div className="border w-full">
                            <input
                                disabled={!active}
                                type="text"
                                placeholder={text("LOGIN_USERNAME")}
                                className="p-2 text-black-700 overflow-scroll w-full"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                }}
                            />
                        </div>
                        {/* Selection of permission */}

                        <div className="flex">
                            <div className="w-1/2">
                                <div className="border w-full">
                                    <select
                                        disabled={!active}
                                        value={permission}
                                        onChange={(e) => {
                                            const selectedPermission = parseInt(e.target.value);
                                            setPermission(selectedPermission);
                                        }}
                                        className="p-2 text-black-700 overflow-scroll w-full"
                                    >
                                        <option value={1}>{text("READ_ONLY")}</option>
                                        <option value={2}>{text("WRITE")}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="w-1/2">
                                <button className="w-full border hover:bg-gray-400 hover:text-gray-700 h-full disabled:opacity-50"
                                    disabled={!active}
                                    onClick={()=>{
                                        setActive(false);
                                        // Simply ignore if the user is trying to add themselves
                                        if(username === activeUser) {
                                            setPermission(1);
                                            setUsername("");
                                            setActive(true);
                                            return;
                                        }
                                        // Use optimistic update
                                        // And also do not complain if something went wrong
                                        // Simply showcase that the user was not added
                                        sendCb(
                                            'COL.SHARE',
                                            {
                                                colUUID,
                                                users: [
                                                    {
                                                        name: username,
                                                        role: permission
                                                    }
                                                ]
                                            },
                                            (err, data) => {
                                                if(err){
                                                    // setState({
                                                    //     status: "error",
                                                    //     error: err.message
                                                    // })
                                                    setUsername("");
                                                    setPermission(1);
                                                    setActive(true);

                                                    return
                                                }
                                                if(data.type !== "COL.SHARE.OK"){
                                                    // setState({
                                                    //     status: "error",
                                                    //     error: "Unknown error"
                                                    // })
                                                    setUsername("");
                                                    setPermission(1);
                                                    setActive(true);
                                                    return
                                                }
                                                setState((prevState) => ({
                                                    ...prevState,
                                                    users: [
                                                        ...((prevState as any)?.users ?? []).filter((user: any) => user.name !== username),
                                                        {
                                                            name: username,
                                                            visibility: permission
                                                        }
                                                    ]
                                                } as any))
                                            }
                                        )

                                    }}
                                >
                                    {text("SHARE_ADD_USER")}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            // The entire possibility of the popup for the owner
            return (
                <div className="w-full">
                    <ChangeVisibility />
                    <UserList />
                    <AddUser />
                    <ShareDoc />
                </div>
            )

        }
    }
    // And the modal itself
    return (
        <ModalLike>
            <div className="flex justify-end">
                <button onClick={() => setOpen(false)} className="flex justify-end">
                    <FontAwesomeIcon icon={faClose} className="rounded-none" />
                </button>
            </div>
            <h2 className="py-2 text-xl font-bold">{text("SHARE")}</h2>
            <div className="py-2 flex justify-center items-center w-72">
                {ModalInner()}
            </div>
        </ModalLike>
    )
}

export default function Share() {
    const { text } = useTextContext();
    const [open, setOpen] = useState(false);
    // This allows to open the popup
    return (
        <>
            {open && <Popup setOpen={setOpen} />}
            <button
                type="button"
                className={`
                flex-shrink-0
                text-sm
                py-1
                px-2
                rounded-full
                bg-white
                border border-gray-300
                ${apply(
            false,
            "text-gray-400 cursor-not-allowed",
            "hover:bg-gray-400 hover:text-gray-700"
        )}
            `}
                onClick={() => setOpen(true)}
            >
                <span className="pr-1">{text("SHARE")}</span>
                <FontAwesomeIcon icon={faShare} className="rounded-none" />
            </button>
        </>
    );
}
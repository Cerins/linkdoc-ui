import { ReactNode } from "react";
import useSocket, { SocketStatus } from "../contexts/Socket";
import { Navigate, useLocation } from "react-router-dom";

function Disconnected() {
    // Have to save the location so the user is not annoyed by
    // Having to navigate back to the page they were on
    const location = useLocation();
    return (
        <div>
            <Navigate state={{
                from: location
            }} to="/login" />
        </div>
    );
}

export default function PrivatePath({
    children
} : {
    children: ReactNode
}) {
    const { status } = useSocket()
    // Private path only is available if the user is connected
    if(status === SocketStatus.CONNECTED) {
        return children
    }
    return <Disconnected />
}
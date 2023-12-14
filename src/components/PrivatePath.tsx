import { ReactNode } from "react";
import useSocket, { SocketStatus } from "../contexts/Socket";
import { Navigate, useLocation } from "react-router-dom";

// Handle other two cases
function Disconnected() {
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
    if(status === SocketStatus.CONNECTED) {
        return children
    }
    return <Disconnected />
}
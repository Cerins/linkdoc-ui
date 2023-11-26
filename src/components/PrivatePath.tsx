import { ReactNode } from "react";
import useSocket, { SocketStatus } from "../contexts/Socket";
import { Navigate } from "react-router-dom";

// Handle other two cases
function Disconnected() {
    return (
        <div>
            <Navigate to="/login" />
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
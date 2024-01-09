import { Link } from "react-router-dom";
import logo from "./logo.svg";
import { useMemo } from "react";
import useSocket, { SocketStatus } from "../../contexts/Socket";

export default function Logo({
    className
}: {
    className?: string
}) {
    const { status } = useSocket()
    // If user is connected then redirect to /collections otherwise root
    const to = useMemo(()=> status === SocketStatus.CONNECTED ? '/collections' : '/',[status])
    return (
        <Link to={to}>
            <img className={className ?? ""} src={logo} alt='LinkDoc'/>
        </Link>
    )
}
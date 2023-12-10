import { Link } from "react-router-dom";
import logo from "./logo.svg";

export default function Logo({
    className
}: {
    className?: string
}) {

    return (
        <Link to='/'>
            <img className={className ?? ""} src={logo} alt='LinkDoc'/>
        </Link>
    )
}
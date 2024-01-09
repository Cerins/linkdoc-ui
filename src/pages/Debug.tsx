import { FormEventHandler, useEffect, useState } from "react";
import useSocket, { SocketMessage } from "../contexts/Socket";
import useTextContext from "../contexts/Text";
import { Link } from "react-router-dom";
import { Header, Layout } from "../components/Header";

// A debug page to test the socket
// NOT USED
export default function Landing() {
    const { status, send, emitter } = useSocket();
    const { text } = useTextContext();
    const [type, setType] = useState("");
    const [payload, setPayload] = useState("");
    const [messages, setMessages] = useState<SocketMessage[]>([]);
    useEffect(() => {
        const listener = (lastMessage: SocketMessage) => {
            if (lastMessage !== null) {
                setMessages((msges) => [lastMessage, ...msges]);
            }
        }
        emitter.addListener('message', listener);
        return ()=>{
            emitter.removeListener('message', listener);
        }
    }, []);
    const onSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        const payloadJSON = JSON.parse(payload);
        send(type, payloadJSON);
        setType("");
        setPayload("");
    };
    return (
        <Layout header={<Header />}>
            <div>
                <p>
                    {text("LANDING_STATUS")}
                    {status}
                </p>
                <form onSubmit={onSubmit}>
                    <input
                        className="border"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    />
                    <br></br>
                    <textarea
                        className="border"
                        value={payload}
                        onChange={(e) => setPayload(e.target.value)}
                    />
                    <br></br>
                    <button className="border" type="submit">
            Send msg
                    </button>
                    <br></br>
                </form>
                <div>
                    {messages.map((msg, i) => (
                        <p key={i}>{JSON.stringify(msg)}</p>
                    ))}
                </div>
                <Link to={"/collections"}>To collections</Link>
            </div>
        </Layout>
    );
}

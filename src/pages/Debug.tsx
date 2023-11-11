import { FormEventHandler, useEffect, useState } from "react";
import useSocket, { SocketMessage, SocketStatus } from "../contexts/Socket";
import useTextContext from "../contexts/Text";
import { Navigate } from "react-router-dom";

function Disconnected() {
//   const { text } = useTextContext();
  return (
    <div>
      {/* <p>{text("LANDING_DISCONNECTED")}</p> */}
      <Navigate to="/login" />
    </div>
  );
}

function Connected() {
  const { status, send, lastMessage } = useSocket();
  const { text } = useTextContext();
  const [type, setType] =useState("");
  const [payload, setPayload] = useState("");
  const [messages, setMessages] = useState<SocketMessage[]>([])
  useEffect(()=>{
    if(lastMessage !== null) {
      setMessages((msges)=>[lastMessage, ...msges]);
    }
  }, [lastMessage])
  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault()
    const payloadJSON = JSON.parse(payload);
    send(type, payloadJSON);
    setType("");
    setPayload("");
  }
  return (
    <div>
        <p>
        {text("LANDING_STATUS")}
        {status}
        </p>
        <form onSubmit={onSubmit} >
            <input className="border" value={type} onChange={(e)=>setType(e.target.value)} />
            <br></br>
            <textarea className="border" value={payload} onChange={(e)=>setPayload(e.target.value)} />
            <br></br>
            <button className="border" type="submit">Send msg</button>
            <br></br>
        </form>
        <div>
          {
            messages.map((msg)=>(
              <p>{JSON.stringify(msg)}</p>
            ))
          }
        </div>
    </div>

  );
}

export default function Landing() {
  const { status } = useSocket();
  if (status === SocketStatus.CONNECTED) {
    return <Connected />;
  }
  return <Disconnected />;
}

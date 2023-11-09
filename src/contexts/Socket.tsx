import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface SocketMessage<T = unknown> {
  type: string;
  payload: T;
}

type EventListerType = "open" | "message" | "close" | "error";

type Event = unknown

type EventListener<Target> = (this: Target, event: Event) => void


interface ISocket {
  addEventListener: (
    type: EventListerType,
    listener: EventListener<ISocket>
  ) => void
  removeEventListener: (
    type: EventListerType,
    listener: EventListener<ISocket>
  ) => void
  disconnect: () => void
  send: (type: string, payload: unknown) => void
}

class Socket implements ISocket {
  #socket?: WebSocket;

  private get socket() {
    if (this.#socket === undefined) {
      throw new Error("Socket is not available");
    }
    return this.#socket;
  }


  #handlers = {
    open: new Set<EventListener<Socket>>(),
    message: new Set<EventListener<Socket>>(),
    close: new Set<EventListener<Socket>>(),
    error: new Set<EventListener<Socket>>(),
  } as const;

  public send(type: string, payload: unknown) {
    this.socket.send(JSON.stringify({
      type,
      payload
    }))
  }

  public addEventListener(
    type: EventListerType,
    listener: EventListener<Socket>
  ) {
    this.#handlers[type].add(listener);
  }

  public removeEventListener(
    type: EventListerType,
    listener: EventListener<Socket>
  ) {
    this.#handlers[type].delete(listener);
  }

  private callHandler(type: EventListerType, event: Event) {
    this.#handlers[type].forEach((handler)=>{
      handler.call(this, event)
    })
  }

  private onOpen = (event: Event) => {
      this.callHandler('open', event);
  }

  private onClose = (event: Event) => {
    this.callHandler('close', event);
  }

  private onMessage = (event: Event) => {
    this.callHandler('message', event)
  }

  private onError = (event: Event) => {
    this.callHandler('error', event)
  }

  private removeEventListeners() {
    this.socket.removeEventListener("open", this.onOpen)
    this.socket.removeEventListener("close", this.onClose)
    this.socket.removeEventListener("message", this.onMessage)
    this.socket.removeEventListener("error", this.onError)
  }


  public disconnect() {
    if(this.#socket) {
        this.#socket.close();
        this.removeEventListeners();
        this.#socket = undefined;
    }
  }

  private addEventListeners() {
    this.socket.addEventListener("open", this.onOpen)
    this.socket.addEventListener("close", this.onClose)
    this.socket.addEventListener("message", this.onMessage)
    this.socket.addEventListener("error", this.onError)
  }


  public connect(url: string) {
    this.disconnect();
    this.#socket = new WebSocket(url);
    this.addEventListeners()
  }

  // This is all the code to make socket a singleton
  private static instance?: Socket;

  private constructor() {}

  public static getInstance() {
    if (this.instance === undefined) {
      this.instance = new Socket();
    }
    return this.instance;
  }
}

const enum SocketStatus {
  DISCONNECTED = "DISCONNECTED",
  ERROR = "ERROR",
  CONNECTED = "CONNECTED",
  CONNECTING = "CONNECTING",
}

interface ISocketContext {
  connect: (url: string) => void;
  disconnect: () => void;
  lastMessage: SocketMessage | null;
  status: SocketStatus;
  send: (type: string, payload: unknown) => void;
}

const SocketContext = createContext<ISocketContext | undefined>(undefined);

function useSocket() {
  const socket = useContext(SocketContext);
  if (socket === undefined) {
    throw new Error("Socket context undefined");
  }
  return socket;
}

function SocketProvider({ children }: { children: React.ReactNode }) {
  const socket = useMemo(() => Socket.getInstance(), []);
  const [message, setMessage] = useState<SocketMessage | null>(null);
  const [status, setStatus] =useState<SocketStatus>(SocketStatus.DISCONNECTED);

  useEffect(() => {
    const onOpen = (event: Event)=>{
      setStatus(SocketStatus.CONNECTED)
      console.log('onOpen', event)
    }
    const onClose = (event: Event)=>{
      setStatus(SocketStatus.DISCONNECTED);
      console.log('onClose', event)
    }
    const onMessage = (event: Event)=>{
      console.log('onMessage', event)
    }

    const onError = (event: Event)=>{
      setStatus(SocketStatus.ERROR);
      console.log('onError', event)
    }
    socket.addEventListener('open', onOpen)
    socket.addEventListener('close', onClose)
    socket.addEventListener('message', onMessage)
    socket.addEventListener('error', onError)
    return ()=>{
      socket.removeEventListener('open', onOpen)
      socket.removeEventListener('close', onClose)
      socket.removeEventListener('message', onMessage)
      socket.removeEventListener('error', onError)
    }
  }, []);
  const value = useMemo(
    () => ({
      connect: (url: string) => {
        setStatus(SocketStatus.CONNECTING)
        socket.connect(url)
      },
      disconnect: () => {
        socket.disconnect()
        setStatus(SocketStatus.DISCONNECTED)
      },
      send: (type: string, payload: unknown) => {
        socket.send(type, payload);
      },
      status,
      lastMessage: message,
    }),
    [status, setStatus, message, socket]
  );
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export default useSocket;
export { SocketProvider, SocketStatus };

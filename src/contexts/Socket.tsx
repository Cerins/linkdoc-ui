import { EventEmitter } from "events";
import React, {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import luid from "../utils/luid";

interface SocketMessage<T = any> {
  type: string;
  payload: T;
  acknowledge?: string;
}

type EventListerType = "open" | "message" | "close" | "error";

type Event = unknown;

type EventListener<Target> = (this: Target, event: Event) => void;

type ISend = (type: string, payload: unknown, acknowledge?: string) => void;

type IEmitter = EventEmitter;

interface ISocket {
  addEventListener: (
    type: EventListerType,
    listener: EventListener<ISocket>
  ) => void;
  removeEventListener: (
    type: EventListerType,
    listener: EventListener<ISocket>
  ) => void;
  disconnect: () => void;
  send: ISend;
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

    public send(type: string, payload: unknown, acknowledge?: string) {
        this.socket.send(
            JSON.stringify({
                type,
                payload,
                acknowledge,
            })
        );
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
        this.#handlers[type].forEach((handler) => {
            handler.call(this, event);
        });
    }

    private onOpen = (event: Event) => {
        this.callHandler("open", event);
    };

    private onClose = (event: Event) => {
        this.callHandler("close", event);
    };

    private onMessage = (event: Event) => {
        this.callHandler("message", event);
    };

    private onError = (event: Event) => {
        this.callHandler("error", event);
    };

    private removeEventListeners() {
        this.socket.removeEventListener("open", this.onOpen);
        this.socket.removeEventListener("close", this.onClose);
        this.socket.removeEventListener("message", this.onMessage);
        this.socket.removeEventListener("error", this.onError);
    }

    public disconnect() {
        if (this.#socket) {
            this.#socket.close();
            this.removeEventListeners();
            this.#socket = undefined;
        }
    }

    private addEventListeners() {
        this.socket.addEventListener("open", this.onOpen);
        this.socket.addEventListener("close", this.onClose);
        this.socket.addEventListener("message", this.onMessage);
        this.socket.addEventListener("error", this.onError);
    }

    public connect(url: string) {
        this.disconnect();
        this.#socket = new WebSocket(url);
        this.addEventListeners();
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
  emitter: EventEmitter;
  status: SocketStatus;
  send: (type: string, payload: unknown, acknowledge?: string) => void;
  sendCb: (type: string, payload: unknown, cb: SocketCb) => void;
}

const SocketContext = createContext<ISocketContext | undefined>(undefined);

function useSocket() {
    const socket = useContext(SocketContext);
    if (socket === undefined) {
        throw new Error("Socket context undefined");
    }
    return socket;
}

type SocketCb = (err: null | Error, data: SocketMessage) => void;

function SocketProvider({ children }: { children: React.ReactNode }) {
    const socket = useMemo(() => Socket.getInstance(), []);
    const [status, setStatus] = useState<SocketStatus>(SocketStatus.DISCONNECTED);
    const emitter = useMemo(() => new EventEmitter(), []);
    const ackCallbacks = useRef(new Map<string, SocketCb>());

    useEffect(() => {
        const onOpen = (
            event: Event
        ) => {
            console.log("onOpen", event);
            setStatus(SocketStatus.CONNECTED);
        };
        const onClose = (
            event: Event
        ) => {
            console.log("onClose", event);
            setStatus(SocketStatus.DISCONNECTED);
        };
        const onMessage = (event: Event) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data = (event as any).data;
            const newMsg = JSON.parse(data) as SocketMessage;
            console.log("onMessage", event);
            const { acknowledge } = newMsg;
            if (acknowledge) {
                const cb = ackCallbacks.current.get(acknowledge);
                if (cb) {
                    ackCallbacks.current.delete(acknowledge);
                    cb(null, newMsg);
                }
            }
            emitter.emit("message", newMsg);
        };

        const onError = (
            event: Event
        ) => {
            console.log("onError", event);
            setStatus(SocketStatus.ERROR);
        };
        socket.addEventListener("open", onOpen);
        socket.addEventListener("close", onClose);
        socket.addEventListener("message", onMessage);
        socket.addEventListener("error", onError);
        return () => {
            socket.removeEventListener("open", onOpen);
            socket.removeEventListener("close", onClose);
            socket.removeEventListener("message", onMessage);
            socket.removeEventListener("error", onError);
        };
    }, []);
    const value = useMemo(
        () => ({
            connect: (url: string) => {
                setStatus(SocketStatus.CONNECTING);
                socket.connect(url);
            },
            disconnect: () => {
                socket.disconnect();
                setStatus(SocketStatus.DISCONNECTED);
            },
            send: (type: string, payload: unknown, acknowledge?: string) => {
                socket.send(type, payload, acknowledge);
            },
            sendCb: (type: string, payload: unknown, cb: SocketCb) => {
                const acknowledge = luid();
                ackCallbacks.current.set(acknowledge, cb);
                socket.send(type, payload, acknowledge);
            },
            status,
            emitter,
        }),
        [status, setStatus, emitter, socket]
    );
    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
}

export default useSocket;
export { SocketProvider, SocketStatus };
export type { SocketMessage };
export type { IEmitter, ISend };

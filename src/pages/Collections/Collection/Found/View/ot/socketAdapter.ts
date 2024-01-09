import { IEmitter, ISend, SocketMessage } from "../../../../../../contexts/Socket";

type IRevision = unknown;
type IOperation = unknown;
type ISelection = unknown;
type IEvent = string;
type IData = unknown;
type ICallbacks = undefined | Record<string, 
((
    ...args: IData[]
) => void) | undefined>


// This adapts our communication schema to allow to be used with the ot library
export default class SocketAdapter

{
    send: ISend;
    emitter: IEmitter;
    callbacks: ICallbacks;
    docName: string;
    colUUID: string;
    listener: ((lastMessage: SocketMessage)=>void) | undefined;
    constructor(
        manipulator: {
            send: ISend,
            emitter: IEmitter
        },
        meta: {
            docName: string,
            colUUID: string
        }
    ) {
        this.send = manipulator.send;
        this.emitter = manipulator.emitter;
        this.docName = meta.docName;
        this.colUUID = meta.colUUID;
        // Listen on the socket for messages
        const listener = (lastMessage: SocketMessage)=>{
            if(lastMessage === null) return;
            const { type, payload } = lastMessage;
            if(type === 'ROOM.LEFT') {
                const roomName = payload.roomName;
                const clientID = payload.clientID;
                if(roomName === `${this.colUUID}:${this.docName}`) {
                    this.trigger('client_left', clientID);
                }
            } else if(type === 'DOC.ACK') {
                this.trigger('ack', undefined);
            } else if(type === 'DOC.OPERATION.OK') {
                const clientID = payload.clientID;
                const operation = payload.operation;
                const selection = payload.selection;
                this.trigger('operation', operation);
                this.trigger('selection', clientID, selection);
            } else if(type === 'DOC.SELECTION.OK') {
                const clientID = payload.clientID;
                const selection = payload.selection;
                this.trigger('selection', clientID, selection);
            }
        }
        this.emitter.on('message', listener);
        this.listener = listener;
    }
    // Send the desired transformation to the server
    sendOperation(revision: IRevision, operation: IOperation, selection: ISelection) {
        this.send(
            'DOC.OPERATION',
            {
                revision,
                operation,
                selection,
                docName: this.docName,
                colUUID: this.colUUID
            }
        )
    }
    // Send the current selection to the server
    sendSelection(selection: ISelection) {
        this.send(
            'DOC.SELECTION',
            {
                selection,
                docName: this.docName,
                colUUID: this.colUUID
            }
        )
    }
    // Register callbacks for the events
    registerCallbacks(callbacks: ICallbacks) {
        this.callbacks = callbacks;
    }
    // Trigger the event
    trigger(event: IEvent, ...args: IData[]) {
        const action = this.callbacks && this.callbacks[event];
        if (action) {
            action.apply(this, args);
        }
    }
    // Have to do cleanup since do not want the page to have a lot of listeners
    // That are not in use
    cleanup() {
        if(this.listener) {
            this.emitter.removeListener('message', this.listener);
        }
    }


}
import React, {
    createContext,
    useContext,
    useState,
    ReactNode,
    useCallback,
} from "react";

interface IMessage {
  message: string;
  buttons: {
    name: string;
    callback: () => void;
  }[];
}

type ModalContextType = {
  showMessage: (message: IMessage) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export default function useModalContext() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}

// A component which shows a modal with a message and buttons
// Also it possible to have multiple buttons
export function ModalLike({
    children
}: {
    children: ReactNode;
}) {
    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
            {/* Respect new lines in the message */}
            <div className="bg-white p-8 rounded-lg shadow-lg"
                style={{ whiteSpace: "pre-wrap" }}
            >
                {children}
            </div>
        </div>
    )
}

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [queue, setQueue] = useState<IMessage[]>([]);
    // Keep the messages in the queue
    // First in first out
    const [currentMessage, setCurrentMessage] = useState<IMessage | null>(null);

    // Update the queue if the app wants to show a message
    const showMessage = useCallback((message: IMessage) => {
        setQueue((prev) => [...prev, message]);
    }, []);

    // When a button is clicked, remove the message from the queue
    const handleClick = useCallback(() => {
        setQueue((prev) => {
            const updatedQueue = prev.slice(1);
            setCurrentMessage(updatedQueue.length > 0 ? updatedQueue[0] : null);
            return updatedQueue;
        });
    }, []);

    // Update the current message if the queue is not empty
    React.useEffect(() => {
        if (queue.length > 0 && currentMessage === null) {
            setCurrentMessage(queue[0]);
        }
    }, [queue, currentMessage]);
    return (
        <ModalContext.Provider value={{ showMessage }}>
            {children}
            {currentMessage && (
                <ModalLike>
                    <p>{currentMessage.message}</p>
                    <div className="flex justify-end mt-8 gap-2">
                        {currentMessage.buttons.map((btn) => {
                            return (
                                <button
                                    onClick={() => {
                                        handleClick();
                                        btn.callback();
                                    }}
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    {btn.name}
                                </button>
                            );
                        })}
                    </div>
                </ModalLike>
            )}
        </ModalContext.Provider>
    );
};

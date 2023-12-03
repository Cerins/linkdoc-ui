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

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [queue, setQueue] = useState<IMessage[]>([]);
    const [currentMessage, setCurrentMessage] = useState<IMessage | null>(null);

    const showMessage = useCallback((message: IMessage) => {
        setQueue((prev) => [...prev, message]);
    }, []);

    const handleClick = useCallback(() => {
        setQueue((prev) => {
            const updatedQueue = prev.slice(1);
            setCurrentMessage(updatedQueue.length > 0 ? updatedQueue[0] : null);
            return updatedQueue;
        });
    }, []);

    React.useEffect(() => {
        if (queue.length > 0 && currentMessage === null) {
            setCurrentMessage(queue[0]);
        }
    }, [queue, currentMessage]);
    return (
        <ModalContext.Provider value={{ showMessage }}>
            {children}
            {currentMessage && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
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
                    </div>
                </div>
            )}
        </ModalContext.Provider>
    );
};

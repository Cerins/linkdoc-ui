import ReactDOM from 'react-dom/client'
import App from './App.tsx';
import { Provider } from 'react-redux';
import './index.css'
import store from './store.ts'
import { TextProvider } from './contexts/Text/index.tsx'
import { SocketProvider } from './contexts/Socket.tsx';
import { ModalProvider } from './contexts/Modal.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <TextProvider>
        <Provider store={store}>
            <ModalProvider>
                <SocketProvider>
                    <App />
                </SocketProvider>
            </ModalProvider>
        </Provider>
    </TextProvider>
)

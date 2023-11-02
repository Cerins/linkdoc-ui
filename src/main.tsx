import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx';
import { Provider } from 'react-redux';
import './index.css'
import store from './store.ts'
import { TextProvider } from './contexts/Text/index.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <TextProvider>
        <Provider store={store}>
            <App />
        </Provider>
      </TextProvider>
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'

import '@/popup/assets/styles/index.scss'
import App from '@/popup/App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

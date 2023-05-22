import React from 'react'
import ReactDOM from 'react-dom/client'

import App from './App.js'
import './index.css'

if (import.meta.hot) {
  // avoid the page reload when change the code at `@beat-wallet/server` or other etc.
  import.meta.hot.on('vite:beforeFullReload', () => {
    throw 'skipping full reload, please refresh manually'
  })
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

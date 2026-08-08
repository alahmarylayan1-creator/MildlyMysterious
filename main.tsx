import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { audio } from './sound/engine'
import { LangProvider } from './LangContext'

// Start the global soundtrack as early as possible.
// Autoplay will succeed on browsers that allow it; on others it falls
// back to the visitor's first interaction — always with a gentle fade-in.
audio.initSoundtrack()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>,
)

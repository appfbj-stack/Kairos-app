import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  caches.keys().then(nomes => Promise.all(nomes.map(n => caches.delete(n))))
  navigator.serviceWorker.getRegistrations().then(regs =>
    regs.forEach(reg => reg.unregister())
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

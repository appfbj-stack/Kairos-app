import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  (async () => {
    const regs = await navigator.serviceWorker.getRegistrations();
    regs.forEach(reg => reg.unregister());
    const nomes = await caches.keys();
    await Promise.all(nomes.map(n => caches.delete(n)));
  })();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

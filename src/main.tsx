import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRouter from './Router/router.tsx'
import { AiProvider } from './contexts/AiContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AiProvider>
        <AppRouter />
      </AiProvider>
    </BrowserRouter>
  </StrictMode>,
)

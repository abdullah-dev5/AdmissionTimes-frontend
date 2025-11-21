import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRouter from './Router/router.tsx'
import { AiProvider } from './contexts/AiContext'
import { StudentDataProvider } from './contexts/StudentDataContext'
import { UniversityDataProvider } from './contexts/UniversityDataContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <StudentDataProvider>
        <UniversityDataProvider>
          <AiProvider>
            <AppRouter />
          </AiProvider>
        </UniversityDataProvider>
      </StudentDataProvider>
    </BrowserRouter>
  </StrictMode>,
)

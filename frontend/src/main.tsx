import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { initErrorTracking, ErrorTrackingBoundary } from './utils/errorTracking'

// ── Clean up stale demo mode flag (no longer used) ────────────────────────
try { localStorage.removeItem('fathom_demo_mode'); } catch {}

// ── Initialize error tracking ──────────────────────────────────────────────
initErrorTracking({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION || '1.0.0',
  enabled: import.meta.env.PROD,
})

const root = document.getElementById('root')

// Remove pre-loader (CSS-only spinner shown before React mounts)
const preLoader = document.getElementById('pre-loader')
if (preLoader) preLoader.remove()

createRoot(root).render(
  <StrictMode>
    <ErrorTrackingBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorTrackingBoundary>
  </StrictMode>,
)

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
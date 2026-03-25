import { StrictMode } from 'react'
import { createRoot, Root } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { isDemoMode, getDemoData } from './utils/demoData.js'

// ── Global fetch interceptor for demo mode ──────────────────────────────────
// Catches ALL fetch calls (including those that bypass api.js) and returns
// demo data when demo mode is active and the URL targets an API endpoint.

interface FetchInput {
  url?: string;
  [key: string]: any;
}

interface FetchInit {
  [key: string]: any;
}

const _origFetch = window.fetch;
window.fetch = function(
  input: RequestInfo | FetchInput,
  init?: FetchInit
): Promise<Response> {
  if (isDemoMode()) {
    const url = typeof input === 'string' ? input : (input as any)?.url || '';
    // Only intercept API calls (not fonts, CSS, external resources, etc.)
    if (url.includes('/api/') || url.includes('/health')) {
      const path = url.replace(/^https?:\/\/[^/]+/, ''); // strip origin
      const data = getDemoData(path);
      return Promise.resolve(new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }));
    }
  }
  return _origFetch.apply(window, arguments as any);
};

const root: Root = createRoot(document.getElementById('root')!)
root.render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

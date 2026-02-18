import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx' // Ensure .jsx extension is used
import './index.css'

// Error Boundary to catch "White Screen" errors
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("React Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: 20, color: '#f87171', background: '#1a1a1a', height: '100vh' }}>
                    <h2>Something went wrong.</h2>
                    <pre>{this.state.error?.toString()}</pre>
                    <p>Check the console (F12) for more details.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </React.StrictMode>,
)
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Add error boundary for better error handling
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Application error:', error, errorInfo);
    
    // Send error to monitoring service in production
    if (import.meta.env.PROD) {
      // You could integrate with services like Sentry here
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        errorInfo,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Something went wrong</h2>
            <p className="text-neutral-600 mb-6">
              The application encountered an error. This might be due to missing configuration or network issues.
            </p>
            <div className="text-xs text-neutral-500 mb-4 p-3 bg-neutral-100 rounded">
              If this problem persists, please check that all environment variables are configured correctly.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          theme="light"
          limit={3}
        />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
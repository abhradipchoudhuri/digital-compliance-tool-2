import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';

// ===== TEMPORARILY DISABLED FOR DEBUGGING =====
// These imports require dependencies that may not exist yet:
// import PropTypes from 'prop-types';
// import { ExcelService } from './services/excelService';
// import { Logger } from './utils/logger';

// Simple logger replacement for debugging
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args)
};

// ===== SIMPLE ERROR BOUNDARY =====
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-blue-900 flex items-center justify-center p-8">
          <div className="max-w-md text-center text-yellow-400">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="mb-4">{this.state.error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-yellow-400 text-blue-900 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ===== RENDER APP DIRECTLY (NO COMPLEX LOADING) =====
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

logger.info('Digital Compliance Tool renderer started');

// ===== COMMENTED OUT: ORIGINAL COMPLEX INITIALIZATION =====
/*
// This was blocking the app from rendering:

class AppWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      error: null,
      excelData: null,
      appReady: false
    };
    this.excelService = new ExcelService();
  }

  async componentDidMount() {
    // This check was blocking browser dev mode:
    if (!window.electronAPI) {
      throw new Error('Electron API not available...');
    }
    // ... rest of initialization
  }
  // ... rest of AppWrapper code
}

// ExcelDataProvider and context also commented out
// We'll add these back once basic rendering works
*/
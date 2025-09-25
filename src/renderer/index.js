import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';

// Import services (with fallback if not available)
let ExcelService, Logger;
try {
  ExcelService = require('./services/excelService').ExcelService;
  Logger = require('./utils/logger').Logger;
} catch (e) {
  console.warn('Services not found, using mock implementations');
  ExcelService = class {
    async loadData() {
      return { 
        success: false, 
        error: 'ExcelService not implemented yet',
        data: {} 
      };
    }
  };
  Logger = class {
    info(...args) { console.log('[INFO]', ...args); }
    error(...args) { console.error('[ERROR]', ...args); }
    warn(...args) { console.warn('[WARN]', ...args); }
  };
}

const logger = new Logger('App');

// ===== EXCEL DATA CONTEXT =====
const ExcelDataContext = React.createContext(null);

export const useExcelData = () => {
  const context = React.useContext(ExcelDataContext);
  if (!context) {
    throw new Error('useExcelData must be used within ExcelDataProvider');
  }
  return context;
};

const ExcelDataProvider = ({ children, data }) => {
  const contextValue = {
    rawData: data,
    getBrands: () => {
      const config = data['Trademark Config'] || [];
      return config
        .filter(row => row['Trademark Type'] === 'Brand')
        .map(row => ({
          id: row['Brand Names']?.toLowerCase().replace(/[^a-z0-9]/g, '-') || '',
          name: row['Brand Names'] || '',
          entity: row['Entity Names'] || ''
        }));
    },
    getCountries: () => {
      const countryLang = data['CountryLanguage'] || [];
      const unique = [...new Map(countryLang.map(r => [r['Abbv'], r])).values()];
      return unique.map(row => ({
        code: row['Abbv'] || '',
        name: row['Country'] || '',
        language: row['Language'] || ''
      }));
    },
    getAssetTypes: () => {
      const config = data['Trademark Config'] || [];
      return config
        .filter(row => row['Trademark Type'] === 'Asset Type')
        .map(row => ({
          id: row['Brand Names']?.toLowerCase().replace(/[^a-z0-9]/g, '-') || '',
          name: row['Brand Names'] || '',
          description: row['Asset Type Instructions'] || ''
        }));
    }
  };

  return (
    <ExcelDataContext.Provider value={contextValue}>
      {children}
    </ExcelDataContext.Provider>
  );
};

// ===== APP WRAPPER WITH EXCEL LOADING =====
class AppWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      error: null,
      excelData: null,
      mode: 'unknown'
    };
    this.excelService = new ExcelService();
  }

  async componentDidMount() {
    try {
      logger.info('Initializing Digital Compliance Tool...');
      
      const isElectron = !!window.electronAPI;
      const mode = isElectron ? 'electron' : 'browser';
      
      logger.info(`Running in ${mode} mode`);
      
      this.setState({ mode });
      
      await this.loadExcelData();
      
    } catch (error) {
      logger.error('Initialization error:', error);
      this.setState({
        isLoading: false,
        error: error.message
      });
    }
  }

  async loadExcelData() {
    try {
      logger.info('Attempting to load Excel data...');
      
      const result = await this.excelService.loadData();
      
      if (result.success) {
        logger.info('✅ Excel data loaded successfully');
        logger.info('Available sheets:', Object.keys(result.data));
        
        this.setState({
          isLoading: false,
          excelData: result.data,
          error: null
        });
      } else {
        logger.warn('⚠️ Excel data not available:', result.error);
        
        this.setState({
          isLoading: false,
          excelData: this.getMockData(),
          error: `Running in demo mode: ${result.error}`
        });
      }
    } catch (error) {
      logger.warn('Excel loading failed, using mock data');
      
      this.setState({
        isLoading: false,
        excelData: this.getMockData(),
        error: `Demo mode: ${error.message}`
      });
    }
  }

  getMockData() {
    return {
      'Trademark Config': [
        { 'Trademark Type': 'Brand', 'Brand Names': 'Chambord', 'Entity Names': 'Brown-Forman' },
        { 'Trademark Type': 'Brand', 'Brand Names': 'Jack Daniel\'s', 'Entity Names': 'Brown-Forman' },
        { 'Trademark Type': 'Asset Type', 'Brand Names': 'Website Copy', 'Asset Type Instructions': 'Web content' },
        { 'Trademark Type': 'Asset Type', 'Brand Names': 'Social Media', 'Asset Type Instructions': 'Social posts' }
      ],
      'CountryLanguage': [
        { 'Abbv': 'US', 'Country': 'United States', 'Language': 'English' },
        { 'Abbv': 'GB', 'Country': 'United Kingdom', 'Language': 'English' }
      ],
      'Trademark Language': [],
      'Trademark Structure': [],
      'Language Dependent Variables': [],
      'Overall Structure': [],
      'Help Text': []
    };
  }

  render() {
    const { isLoading, error, excelData, mode } = this.state;

    if (isLoading) {
      return (
        <div className="min-h-screen bg-blue-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-yellow-400 mb-2">
              Loading Digital Compliance Tool
            </h2>
            <p className="text-yellow-400 opacity-80">
              Initializing Excel data...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {error && (
          <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-sm">
            ⚠️ {mode === 'browser' ? 'Browser Dev Mode' : 'Demo Mode'}: {error}
          </div>
        )}
        
        <ExcelDataProvider data={excelData}>
          <App />
        </ExcelDataProvider>
      </div>
    );
  }
}

// ===== ERROR BOUNDARY =====
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Error caught:', error, errorInfo);
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

// ===== RENDER =====
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ErrorBoundary>
    <AppWrapper />
  </ErrorBoundary>
);

logger.info('Digital Compliance Tool started');

export { ExcelDataContext };
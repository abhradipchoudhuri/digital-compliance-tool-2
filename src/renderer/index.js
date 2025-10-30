// src/renderer/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';

// ✅ Import excelService singleton directly
import excelService from './services/excelService';

// Import Logger with fallback
let Logger;
try {
  Logger = require('./utils/logger').Logger;
} catch (e) {
  console.warn('Logger not found, using console');
  Logger = class {
    constructor(name) {
      this.name = name;
    }
    info(...args) { console.log(`[${this.name}] INFO:`, ...args); }
    error(...args) { console.error(`[${this.name}] ERROR:`, ...args); }
    warn(...args) { console.warn(`[${this.name}] WARN:`, ...args); }
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
      if (!data || !data['Trademark Config']) {
        console.warn('⚠️ Trademark Config not available');
        return [];
      }
      
      return data['Trademark Config']
        .map(row => ({
          id: (row['Brand Names'] || row['Display Names'] || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: row['Display Names'] || row['Brand Names'] || '',
          entity: row['Entity Names'] || '',
          brandNames: row['Brand Names'] || '',
          displayNames: row['Display Names'] || '',
          trademarkType: row['Trademark Type'] || '',
          ttbType: row['TTB Type'] || 'Full'
        }))
        .filter(brand => brand.name);
    },
    
    getCountries: () => {
      if (!data || !data['CountryLanguage']) {
        console.warn('⚠️ CountryLanguage not available');
        return [];
      }
      
      const uniqueCountries = new Map();
      
      data['CountryLanguage'].forEach(row => {
        const code = row.Abbv || row.CountryCode || row['Country Code'];
        const name = row.Country || row.CountryName || row['Country Name'];
        const language = row.Language || 'English';
        
        if (code && !uniqueCountries.has(code)) {
          uniqueCountries.set(code, {
            code: code,
            name: name || code,
            language: language
          });
        }
      });
      
      return Array.from(uniqueCountries.values());
    },
    
    getAssetTypes: () => {
      if (!data || !data['Overall Structure']) {
        console.warn('⚠️ Overall Structure not available');
        return [];
      }
      
      return data['Overall Structure']
        .map(row => ({
          id: (row['Asset Type'] || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: row['Asset Type'] || '',
          description: row.Structure || ''
        }))
        .filter(type => type.name);
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
    // ✅ Use the singleton instance directly
    this.excelService = excelService;
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
        
        // ✅ CRITICAL: Initialize templateService with Excel data
        try {
          const templateService = require('./services/templateService').default;
          const initResult = await templateService.initialize(result.data);
          
          if (initResult.success) {
            logger.info('✅ TemplateService initialized successfully');
          } else {
            logger.warn('⚠️ TemplateService initialization failed:', initResult.error);
          }
        } catch (tsError) {
          logger.error('❌ Error initializing TemplateService:', tsError);
        }
        
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
        { 
          'Trademark Type': 'Brand',
          'Brand Names': 'Chambord',
          'Display Names': 'Chambord',
          'Entity Names': 'Brown-Forman',
          'TTB Type': 'Full'
        },
        { 
          'Trademark Type': 'Brand',
          'Brand Names': 'Jack Daniel\'s',
          'Display Names': 'Jack Daniel\'s',
          'Entity Names': 'Brown-Forman',
          'TTB Type': 'Full'
        },
        { 
          'Trademark Type': 'Brand',
          'Brand Names': 'Woodford Reserve',
          'Display Names': 'Woodford Reserve',
          'Entity Names': 'Brown-Forman',
          'TTB Type': 'Tightened'
        }
      ],
      'CountryLanguage': [
        { 'Abbv': 'US', 'Country': 'United States', 'Language': 'English' },
        { 'Abbv': 'GB', 'Country': 'United Kingdom', 'Language': 'English' },
        { 'Abbv': 'CA', 'Country': 'Canada', 'Language': 'English' }
      ],
      'Overall Structure': [
        { 'Asset Type': 'Website Copy', 'Structure': 'Full website legal copy' },
        { 'Asset Type': 'Social Media', 'Structure': 'Social media post copy' },
        { 'Asset Type': 'Email', 'Structure': 'Email marketing copy' }
      ],
      'Trademark Language': [],
      'Trademark Structure': [],
      'Language Dependent Variables': [],
      'TTB Statements': [],
      'Brand Availability': [],
      'Help Text': []
    };
  }

  render() {
    const { isLoading, error, excelData, mode } = this.state;

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-yellow-400 mb-2">
              Loading Digital Compliance Tool
            </h2>
            <p className="text-yellow-300 opacity-80">
              Initializing Excel data...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {error && (
          <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-sm font-medium">
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
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center p-8">
          <div className="max-w-md bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
              <p className="text-gray-600 mb-6">{this.state.error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Reload Application
              </button>
            </div>
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
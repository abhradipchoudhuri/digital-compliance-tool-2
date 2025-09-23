import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';

// Import services
import { ExcelService } from './services/excelService';
import { Logger } from './utils/logger';

// Initialize logger
const logger = new Logger('App');

// App wrapper component with Excel data loading
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
    try {
      logger.info('Initializing Digital Compliance Tool...');
      
      // Check if we're in Electron environment
      if (!window.electronAPI) {
        throw new Error('Electron API not available. Please run this app in Electron.');
      }

      // Initialize Excel service and load data
      await this.initializeApp();
      
    } catch (error) {
      logger.error('Failed to initialize app:', error);
      this.setState({
        isLoading: false,
        error: error.message,
        appReady: false
      });
    }
  }

  async initializeApp() {
    try {
      // Load Excel data
      logger.info('Loading Excel data...');
      const result = await this.excelService.loadData();
      
      if (!result.success) {
        throw new Error(`Failed to load Excel data: ${result.error}`);
      }

      // Validate essential data sheets
      const requiredSheets = [
        'Trademark Config',
        'CountryLanguage', 
        'Trademark Language',
        'Trademark Structure',
        'Language Dependent Variables',
        'Overall Structure',
        'Help Text'
      ];

      const availableSheets = Object.keys(result.data);
      const missingSheets = requiredSheets.filter(sheet => !availableSheets.includes(sheet));
      
      if (missingSheets.length > 0) {
        throw new Error(`Missing required Excel sheets: ${missingSheets.join(', ')}`);
      }

      // Set up data in state
      this.setState({
        isLoading: false,
        error: null,
        excelData: result.data,
        appReady: true
      });

      logger.info('App initialization complete');
      logger.info(`Loaded ${availableSheets.length} Excel sheets:`, availableSheets);

    } catch (error) {
      throw error;
    }
  }

  handleRetry = async () => {
    this.setState({ isLoading: true, error: null });
    await this.initializeApp();
  };

  render() {
    const { isLoading, error, excelData, appReady } = this.state;

    // Loading screen
    if (isLoading) {
      return (
        <div className="min-h-screen bg-bf-blue flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-bf-gold mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-bf-gold mb-2">
              Loading Digital Compliance Tool
            </h2>
            <p className="text-bf-gold opacity-80">
              Initializing Excel data and services...
            </p>
          </div>
        </div>
      );
    }

    // Error screen
    if (error && !appReady) {
      return (
        <div className="min-h-screen bg-bf-blue flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Application Error
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={this.handleRetry}
              className="bg-bf-gold text-bf-blue px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              Retry Loading
            </button>
            
            <div className="mt-4 text-xs text-bf-gold opacity-60">
              <p>If this error persists:</p>
              <p>1. Check that the Excel file exists in data/templates/</p>
              <p>2. Verify the Excel file contains all required sheets</p>
              <p>3. Restart the application</p>
            </div>
          </div>
        </div>
      );
    }

    // Main app with data context
    if (appReady && excelData) {
      return (
        <ExcelDataProvider data={excelData}>
          <App />
        </ExcelDataProvider>
      );
    }

    return null;
  }
}

// Excel data context provider
const ExcelDataContext = React.createContext();

export const useExcelData = () => {
  const context = React.useContext(ExcelDataContext);
  if (!context) {
    throw new Error('useExcelData must be used within an ExcelDataProvider');
  }
  return context;
};

const ExcelDataProvider = ({ children, data }) => {
  const [excelData] = React.useState(data);
  
  // Helper functions to access specific sheets
  const getTrademarkConfig = () => excelData['Trademark Config'] || [];
  const getCountryLanguage = () => excelData['CountryLanguage'] || [];
  const getTrademarkLanguage = () => excelData['Trademark Language'] || [];
  const getTrademarkStructure = () => excelData['Trademark Structure'] || [];
  const getLanguageDependentVariables = () => excelData['Language Dependent Variables'] || [];
  const getOverallStructure = () => excelData['Overall Structure'] || [];
  const getHelpText = () => excelData['Help Text'] || [];
  
  // Helper to get brands list
  const getBrands = () => {
    const config = getTrademarkConfig();
    return config.filter(row => row.Type === 'Brand').map(row => ({
      id: row.ID,
      name: row.Name,
      entity: row.Entity
    }));
  };
  
  // Helper to get asset types
  const getAssetTypes = () => {
    const config = getTrademarkConfig();
    return config.filter(row => row.Type === 'Asset Type').map(row => ({
      id: row.ID,
      name: row.Name,
      description: row.Description
    }));
  };
  
  // Helper to get countries
  const getCountries = () => {
    const countryLang = getCountryLanguage();
    const uniqueCountries = [...new Map(
      countryLang.map(row => [row.CountryCode, row])
    ).values()];
    
    return uniqueCountries.map(row => ({
      code: row.CountryCode,
      name: row.CountryName,
      language: row.Language
    }));
  };

  const contextValue = {
    // Raw data
    rawData: excelData,
    
    // Sheet accessors
    getTrademarkConfig,
    getCountryLanguage,
    getTrademarkLanguage,
    getTrademarkStructure,
    getLanguageDependentVariables,
    getOverallStructure,
    getHelpText,
    
    // Processed data accessors
    getBrands,
    getAssetTypes,
    getCountries,
    
    // Data statistics
    stats: {
      totalSheets: Object.keys(excelData).length,
      totalBrands: getBrands().length,
      totalAssetTypes: getAssetTypes().length,
      totalCountries: getCountries().length
    }
  };

  return (
    <ExcelDataContext.Provider value={contextValue}>
      {children}
    </ExcelDataContext.Provider>
  );
};

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Error boundary for the entire app
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
        <div className="min-h-screen bg-bf-blue flex items-center justify-center p-8">
          <div className="max-w-md text-center text-bf-gold">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="mb-4">The application encountered an unexpected error.</p>
            <p className="text-sm opacity-80 mb-6">{this.state.error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-bf-gold text-bf-blue px-6 py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
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

// Render the app with error boundary
root.render(
  <ErrorBoundary>
    <AppWrapper />
  </ErrorBoundary>
);

// Log app startup
logger.info('Digital Compliance Tool renderer started');

// Performance monitoring
if (process.env.NODE_ENV === 'development') {
  if ('measureUserAgentSpecificMemory' in performance) {
    performance.measureUserAgentSpecificMemory().then(result => {
      logger.info('Memory usage:', result);
    });
  }
}

// Export the Excel data context for use in other components
export { ExcelDataContext, useExcelData };
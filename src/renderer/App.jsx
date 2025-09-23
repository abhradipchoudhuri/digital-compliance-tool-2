// src/renderer/App.jsx
// Main App component for Digital Compliance Tool

import React from 'react';
import PropTypes from 'prop-types';
import { useExcelData } from './index';

const App = () => {
  const excelContext = useExcelData();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-bf-blue text-bf-gold p-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Digital Compliance Tool</h1>
          <p className="text-sm opacity-90">Brown-Forman Legal Copy Generator</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-bf-blue">
            Excel Data Status
          </h2>
          
          {/* Display Excel data stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-bf-blue text-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{excelContext.stats.totalSheets}</div>
              <div className="text-sm opacity-90">Sheets</div>
            </div>
            <div className="bg-bf-gold text-bf-blue p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{excelContext.stats.totalBrands}</div>
              <div className="text-sm opacity-90">Brands</div>
            </div>
            <div className="bg-bf-blue text-white p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{excelContext.stats.totalCountries}</div>
              <div className="text-sm opacity-90">Countries</div>
            </div>
            <div className="bg-bf-gold text-bf-blue p-4 rounded-lg text-center">
              <div className="text-2xl font-bold">{excelContext.stats.totalAssetTypes}</div>
              <div className="text-sm opacity-90">Asset Types</div>
            </div>
          </div>

          {/* Status message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              🎯 Application Status
            </h3>
            <p className="text-blue-700">
              Enhanced index.js is working! Excel data is loaded and ready for processing.
              Continue with artifacts 5-10 to build the complete application.
            </p>
          </div>

          {/* Placeholder for future components */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              🚀 Ready for Components
            </h3>
            <p className="text-gray-500 mb-4">
              This is where your form components, copy generation, and output will go.
            </p>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Asset Type Selector</li>
              <li>• Country Selector</li>
              <li>• Brand Selector</li>
              <li>• Copy Generation Engine</li>
              <li>• Output & History</li>
            </ul>
          </div>

          {/* Development info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 bg-gray-50 border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Development Info
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Total Sheets: {excelContext.stats.totalSheets}</div>
                <div>Last Updated: {excelContext.stats.lastUpdated}</div>
                <div>Context Methods: {Object.keys(excelContext).length}</div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-bf-blue text-bf-gold p-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-sm opacity-90">
            Built with ❤️ for Brown-Forman Corporation
          </p>
          <p className="text-xs opacity-70 mt-1">
            Digital Compliance Tool v1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
};

// PropTypes validation
App.propTypes = {
  // No props expected for main app component
};

export default App;
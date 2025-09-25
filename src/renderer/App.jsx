// src/renderer/App.jsx
// Quick fix to handle undefined stats

import React, { useState } from 'react';
import { useExcelData } from './index';

const App = () => {
  const excelContext = useExcelData();
  
  // ✅ SAFE: Provide fallback values if stats is undefined
  const stats = excelContext?.stats || {
    totalSheets: 0,
    totalBrands: 0,
    totalCountries: 0,
    totalAssetTypes: 0
  };

  // Get methods from context safely
  const getBrands = excelContext?.getBrands || (() => []);
  const getCountries = excelContext?.getCountries || (() => []);
  const getAssetTypes = excelContext?.getAssetTypes || (() => []);

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
            📊 Excel Data Status
          </h2>
          
          {/* Display Excel data stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg text-center shadow-md">
              <div className="text-3xl font-bold">{stats.totalSheets}</div>
              <div className="text-sm opacity-90">Excel Sheets</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center shadow-md">
              <div className="text-3xl font-bold">{stats.totalBrands}</div>
              <div className="text-sm opacity-90">Brands</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center shadow-md">
              <div className="text-3xl font-bold">{stats.totalCountries}</div>
              <div className="text-sm opacity-90">Countries</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center shadow-md">
              <div className="text-3xl font-bold">{stats.totalAssetTypes}</div>
              <div className="text-sm opacity-90">Asset Types</div>
            </div>
          </div>

          {/* Status Messages */}
          <div className="space-y-3">
            {stats.totalSheets > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h3 className="font-semibold text-green-900">Excel File Loaded</h3>
                    <p className="text-sm text-green-700">
                      Successfully loaded {stats.totalSheets} sheets from Excel file
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">❌</span>
                  <div>
                    <h3 className="font-semibold text-red-900">Excel File Not Loaded</h3>
                    <p className="text-sm text-red-700">
                      Unable to load Excel data. Check console for errors.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {stats.totalBrands === 0 && stats.totalSheets > 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-yellow-900">Column Name Mismatch Detected</h3>
                    <p className="text-sm text-yellow-700">
                      Excel loaded but no data extracted. Your Excel column names don't match the filter logic.
                    </p>
                    <div className="mt-2 text-xs bg-yellow-100 rounded p-2">
                      <strong>Your Excel columns:</strong><br/>
                      • Trademark Config: Display Names, Brand Names, Entity Names<br/>
                      • CountryLanguage: Abbv, Country, Language<br/><br/>
                      <strong>Expected by filter logic:</strong><br/>
                      • Trademark Config: Type, ID, Name, Entity<br/>
                      • CountryLanguage: CountryCode, CountryName, Language<br/><br/>
                      → Update excelService.js to match your column names (see fix below)
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Debug Info */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-3">🔍 Debug Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Sheets Loaded:</strong> {stats.totalSheets}</p>
              <p><strong>Brands Extracted:</strong> {stats.totalBrands}</p>
              <p><strong>Countries Extracted:</strong> {stats.totalCountries}</p>
              <p><strong>Asset Types Extracted:</strong> {stats.totalAssetTypes}</p>
              <p className="mt-2 pt-2 border-t border-gray-300">
                <strong>Next Step:</strong> {stats.totalBrands === 0 ? 
                  'Update excelService.js with the fixed version to match your Excel column names' : 
                  'Excel data connected successfully! Continue building your app.'
                }
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">📝 To Fix the Column Mismatch:</h3>
            <ol className="text-sm text-blue-700 space-y-2 ml-4 list-decimal">
              <li>Replace your <code className="bg-blue-100 px-1 rounded">excelService.js</code> with the FIXED version (see artifact)</li>
              <li>Restart the app: <code className="bg-blue-100 px-1 rounded">npm start</code></li>
              <li>Check the stats above - all numbers should be {'>'} 0</li>
              <li>Once working, add the DataDebugger component to inspect data structure</li>
            </ol>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-bf-blue text-bf-gold p-4 mt-8">
        <div className="container mx-auto text-center">
          <p className="text-sm opacity-90">
            Digital Compliance Tool - Brown-Forman Corporation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
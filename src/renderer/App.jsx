// src/renderer/App.jsx
// Main Application Component with DataDebugger Integration

import React, { useState } from 'react';
import { useExcelData } from './index';
import DataDebugger from './components/DataDebugger';

const App = () => {
  const excelContext = useExcelData();
  const [showDebugger, setShowDebugger] = useState(true); // Show during development
  
  // Get processed data from context
  const brands = excelContext.getBrands();
  const assetTypes = excelContext.getAssetTypes();
  const countries = excelContext.getCountries();
  
  // Form state
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);

  // Toggle brand selection
  const toggleBrand = (brandId) => {
    setSelectedBrands(prev => 
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="bg-bf-blue text-bf-gold p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Digital Compliance Tool</h1>
            <p className="text-sm opacity-90">Brown-Forman Legal Copy Generator</p>
          </div>
          
          {/* Debugger Toggle Button */}
          <button
            onClick={() => setShowDebugger(!showDebugger)}
            className="bg-bf-gold text-bf-blue px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            {showDebugger ? '🔽 Hide' : '🔼 Show'} Debugger
          </button>
        </div>
      </header>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <main className="container mx-auto p-6 space-y-6">
        
        {/* DATA DEBUGGER - Shows during development */}
        {showDebugger && (
          <div className="animate-fadeIn">
            <DataDebugger />
          </div>
        )}

        {/* ============================================ */}
        {/* DATA STATS DASHBOARD */}
        {/* ============================================ */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-bf-blue">
            📊 Excel Data Status
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg text-center shadow-md">
              <div className="text-3xl font-bold">{excelContext.stats.totalSheets}</div>
              <div className="text-sm opacity-90">Excel Sheets</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center shadow-md">
              <div className="text-3xl font-bold">{brands.length}</div>
              <div className="text-sm opacity-90">Brands Available</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center shadow-md">
              <div className="text-3xl font-bold">{countries.length}</div>
              <div className="text-sm opacity-90">Countries</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center shadow-md">
              <div className="text-3xl font-bold">{assetTypes.length}</div>
              <div className="text-sm opacity-90">Asset Types</div>
            </div>
          </div>

          {/* Success/Warning Messages */}
          <div className="mt-4 space-y-2">
            {brands.length > 0 && countries.length > 0 && assetTypes.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <h3 className="font-semibold text-green-900">Excel Data Connected Successfully</h3>
                    <p className="text-sm text-green-700">
                      All data loaded correctly. Ready to generate compliance copy.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">⚠️</span>
                  <div>
                    <h3 className="font-semibold text-yellow-900">Data Issue Detected</h3>
                    <p className="text-sm text-yellow-700">
                      Some data categories are empty. Check the Data Debugger for details.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* COPY GENERATION FORM */}
        {/* ============================================ */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 text-bf-blue">
            🎯 Generate Compliance Copy
          </h2>

          <div className="space-y-6">
            
            {/* Asset Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                1. Select Asset Type *
              </label>
              <select
                value={selectedAssetType}
                onChange={(e) => setSelectedAssetType(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-bf-blue focus:border-transparent transition-all"
              >
                <option value="">-- Select Asset Type --</option>
                {assetTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                    {type.description && ` - ${type.description}`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {assetTypes.length > 0 
                  ? `✅ ${assetTypes.length} asset types available` 
                  : '❌ No asset types loaded'}
              </p>
            </div>

            {/* Country Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                2. Select Country/Market *
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-bf-blue focus:border-transparent transition-all"
              >
                <option value="">-- Select Country --</option>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name} ({country.code}) - {country.language}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {countries.length > 0 
                  ? `✅ ${countries.length} countries available` 
                  : '❌ No countries loaded'}
              </p>
            </div>

            {/* Brand Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                3. Select Brand(s) *
              </label>
              <div className="border-2 border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
                {brands.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => toggleBrand(brand.id)}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          selectedBrands.includes(brand.id)
                            ? 'bg-bf-blue text-bf-gold border-bf-blue shadow-md'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-bf-blue hover:bg-blue-50'
                        }`}
                      >
                        <div className="font-semibold text-sm">{brand.name}</div>
                        <div className="text-xs opacity-75 mt-1">{brand.entity}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    ❌ No brands available. Check Data Debugger for details.
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {brands.length > 0 
                  ? `✅ ${brands.length} brands available • ${selectedBrands.length} selected` 
                  : '❌ No brands loaded'}
              </p>
            </div>

            {/* Generate Button */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {selectedAssetType && selectedCountry && selectedBrands.length > 0 ? (
                  <span className="text-green-600 font-medium">
                    ✅ Ready to generate copy
                  </span>
                ) : (
                  <span className="text-gray-500">
                    ℹ️ Please complete all required fields
                  </span>
                )}
              </div>
              
              <button
                disabled={!selectedAssetType || !selectedCountry || selectedBrands.length === 0}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  selectedAssetType && selectedCountry && selectedBrands.length > 0
                    ? 'bg-bf-blue text-bf-gold hover:opacity-90 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => {
                  console.log('Generate copy:', {
                    assetType: selectedAssetType,
                    country: selectedCountry,
                    brands: selectedBrands
                  });
                  alert('Copy generation will be implemented next!');
                }}
              >
                Generate Copy
              </button>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* NEXT STEPS GUIDE */}
        {/* ============================================ */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 text-lg">
            🚀 Development Status
          </h3>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              <span>Excel data loads from backend (main.js with ExcelJS)</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              <span>Data flows to frontend (excelService.js)</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              <span>Filter logic works (brands, countries, asset types)</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              <span>UI components populate with real data</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⏭️</span>
              <span>Next: Implement copy generation engine</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⏭️</span>
              <span>Next: Build output display component</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">⏭️</span>
              <span>Next: Add clipboard functionality</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
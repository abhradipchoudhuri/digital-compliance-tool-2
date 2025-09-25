// src/renderer/App.jsx
import React, { useState } from 'react';
import { useExcelData } from './index';
import { ChevronDown, Search, Check, Copy, Download, History, AlertCircle, Info } from 'lucide-react';

const App = () => {
  const excelContext = useExcelData();
  
  // Form state
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showMultiBrandNote, setShowMultiBrandNote] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Get data from Excel context - NOT hardcoded
  const brands = excelContext.getBrands() || [];
  const countries = excelContext.getCountries() || [];
  const assetTypes = excelContext.getAssetTypes() || [];

  const filteredBrands = searchQuery
    ? brands.filter(brand => brand.toLowerCase().includes(searchQuery.toLowerCase()))
    : brands;

  const handleBrandToggle = (brand) => {
    const newSelectedBrands = new Set(selectedBrands);
    if (newSelectedBrands.has(brand)) {
      newSelectedBrands.delete(brand);
    } else {
      newSelectedBrands.add(brand);
    }
    setSelectedBrands(newSelectedBrands);
    setShowMultiBrandNote(newSelectedBrands.size > 1);
  };

  const handleGenerateCopy = () => {
    if (!selectedAssetType || !selectedCountry || selectedBrands.size === 0) return;
    
    setIsGenerating(true);
    
    setTimeout(() => {
      const copy = {
        assetType: selectedAssetType,
        country: selectedCountry,
        brands: Array.from(selectedBrands),
        copy: "Generated legal copy will appear here based on your selections...",
        timestamp: new Date().toLocaleString()
      };
      setGeneratedCopy(copy);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopyCopy = () => {
    if (generatedCopy) {
      navigator.clipboard.writeText(generatedCopy.copy);
    }
  };

  const isFormValid = selectedAssetType && selectedCountry && selectedBrands.size > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-900 to-amber-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Digital Compliance Legal Copy Generator</h1>
              <p className="text-amber-100 mt-2">Brown-Forman Corporation</p>
            </div>
            <button className="p-2 hover:bg-amber-700 rounded-lg transition-colors">
              <History className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Parameters</h2>
              
              <div className="space-y-6">
                {/* Asset Type Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedAssetType}
                      onChange={(e) => setSelectedAssetType(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer transition-all"
                    >
                      <option value="">Select Asset Type</option>
                      {assetTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Country Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country/Market <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none cursor-pointer transition-all"
                    >
                      <option value="">Select Country</option>
                      {countries.map(country => (
                        <option key={country} value={country}>{country}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Brand Multi-Select */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand(s) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                    {filteredBrands.length > 0 ? (
                      filteredBrands.map(brand => (
                        <label
                          key={brand}
                          className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedBrands.has(brand)}
                            onChange={() => handleBrandToggle(brand)}
                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                          />
                          <span className="ml-3 text-gray-700">{brand}</span>
                          {selectedBrands.has(brand) && (
                            <Check className="ml-auto w-5 h-5 text-green-600" />
                          )}
                        </label>
                      ))
                    ) : (
                      <div className="px-4 py-8 text-center text-gray-500">
                        No brands found
                      </div>
                    )}
                  </div>

                  {selectedBrands.size > 0 && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800">
                        <strong>{selectedBrands.size}</strong> brand{selectedBrands.size !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}

                  {showMultiBrandNote && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        Multiple brands selected. Generated copy will include all applicable brand disclaimers.
                      </p>
                    </div>
                  )}
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateCopy}
                  disabled={!isFormValid || isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {isGenerating ? 'Generating...' : 'Generate Legal Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Output */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Copy</h2>
              
              {generatedCopy ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p><strong>Asset Type:</strong> {generatedCopy.assetType}</p>
                      <p><strong>Country:</strong> {generatedCopy.country}</p>
                      <p><strong>Brands:</strong> {generatedCopy.brands.join(', ')}</p>
                      <p className="text-xs text-gray-500 mt-2">{generatedCopy.timestamp}</p>
                    </div>
                    
                    <div className="p-4 bg-white rounded border border-gray-200 text-sm text-gray-800 leading-relaxed">
                      {generatedCopy.copy}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleCopyCopy}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">
                    Select parameters and click "Generate Legal Copy" to see your compliance text here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
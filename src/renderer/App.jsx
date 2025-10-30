// src/renderer/App.jsx
import React, { useState } from 'react';
import { useExcelData } from './index';
import templateService from './services/templateService';
import { ChevronDown, Search, Check, Copy, Download, History, AlertCircle, Info } from 'lucide-react';

const App = () => {
  const excelContext = useExcelData();
  
  // Form state
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [availableBrands, setAvailableBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMultiBrandNote, setShowMultiBrandNote] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyError, setCopyError] = useState(null);
  
  // Get data from Excel context
  const rawBrands = excelContext.getBrands() || [];
  const countries = excelContext.getCountries() || [];
  const assetTypes = excelContext.getAssetTypes() || [];

  // Handle country selection and filter brands
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedBrands(new Set());
    
    if (countryCode) {
      const { default: excelService } = require('./services/excelService');
      const brandsForCountry = excelService.getBrandsForCountry(countryCode);
      
      const processedBrands = brandsForCountry.map((brand, index) => ({
        id: `${brand.id}-${index}`,
        name: brand.name,
        originalId: brand.id,
        entity: brand.entity
      }));
      
      setAvailableBrands(processedBrands);
      console.log(`📋 Loaded ${processedBrands.length} brands for ${countryCode}`);
    } else {
      setAvailableBrands([]);
    }
  };

  const filteredBrands = searchQuery
    ? availableBrands.filter(brand => 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (brand.entity && brand.entity.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : availableBrands;

  const handleBrandToggle = (brandId) => {
    const newSelected = new Set(selectedBrands);
    if (newSelected.has(brandId)) {
      newSelected.delete(brandId);
    } else {
      newSelected.add(brandId);
    }
    setSelectedBrands(newSelected);
    setShowMultiBrandNote(newSelected.size > 1);
  };

  const handleSelectAll = () => {
    if (selectedBrands.size === filteredBrands.length) {
      setSelectedBrands(new Set());
      setShowMultiBrandNote(false);
    } else {
      const allIds = new Set(filteredBrands.map(b => b.id));
      setSelectedBrands(allIds);
      setShowMultiBrandNote(allIds.size > 1);
    }
  };

  const handleGenerate = async () => {
    // Validation
    if (!selectedAssetType) {
      alert('Please select an Asset Type');
      return;
    }
    if (!selectedCountry) {
      alert('Please select a Country');
      return;
    }
    if (selectedBrands.size === 0) {
      alert('Please select at least one Brand');
      return;
    }

    setIsGenerating(true);
    setCopyError(null);
    
    try {
      console.log('🎯 App: Starting copy generation...');
      
      // Get actual brand names from selected IDs
      const selectedBrandNames = Array.from(selectedBrands)
        .map(id => {
          const brand = availableBrands.find(b => b.id === id);
          return brand?.name;
        })
        .filter(Boolean);
      
      // ✅ FIXED: Get the asset type NAME from the ID
      const assetTypeObj = assetTypes.find(at => at.id === selectedAssetType);
      const assetTypeName = assetTypeObj ? assetTypeObj.name : selectedAssetType;
      
      console.log('📋 Selected brands:', selectedBrandNames);
      console.log('📋 Selected asset type ID:', selectedAssetType);
      console.log('📋 Selected asset type NAME:', assetTypeName);
      console.log('📋 Selected country:', selectedCountry);
      
      // ✅ FIXED: Pass the asset type NAME, not the ID
      const result = await templateService.generateCopy({
        assetType: assetTypeName,  // Use name instead of ID
        countryCode: selectedCountry,
        brandIds: selectedBrandNames
      });
      
      console.log('📦 Generation result:', result);
      
      if (result.success) {
        setGeneratedCopy({
          plainText: result.result.copy.plainText,
          html: result.result.copy.html,
          metadata: result.result.metadata
        });
        console.log('✅ Copy generated successfully!');
        
        setTimeout(() => {
          document.getElementById('generated-copy-section')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }, 100);
      } else {
        const errorMsg = result.error || 'Unknown error occurred';
        setCopyError(errorMsg);
        console.error('❌ Generation failed:', errorMsg);
      }
      
    } catch (error) {
      console.error('❌ Error in handleGenerate:', error);
      setCopyError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleDownload = (text, filename = 'legal-copy.txt') => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Digital Compliance Legal Copy Generator
              </h1>
              <p className="text-slate-600">
                Generate compliant legal copy for digital assets across markets
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Data Status</div>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${rawBrands.length > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-slate-700">
                  {rawBrands.length} Total Brands | {countries.length} Countries | {assetTypes.length} Asset Types
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Type Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Asset Type*
              </label>
              <div className="relative">
                <select
                  value={selectedAssetType}
                  onChange={(e) => setSelectedAssetType(e.target.value)}
                  className="w-full px-4 py-3 pr-10 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all appearance-none bg-white text-slate-900 font-medium cursor-pointer hover:border-slate-300"
                >
                  <option value="">Select Asset Type</option>
                  {assetTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Country Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Please select the Country*
              </label>
              <div className="relative">
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Brand Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Please select the Brands (Check all that apply)*
              </label>
              
              {!selectedCountry && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-blue-800 text-sm flex items-center gap-2">
                    <Info size={16} />
                    Please select a country first to see available brands
                  </p>
                </div>
              )}
              
              {selectedCountry && availableBrands.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                  <p className="text-green-800 text-sm font-medium">
                    ✅ {availableBrands.length} brand{availableBrands.length !== 1 ? 's' : ''} available in {countries.find(c => c.code === selectedCountry)?.name}
                  </p>
                </div>
              )}
              
              {selectedCountry && (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    />
                  </div>

                  <div className="border border-gray-300 rounded-lg p-4 max-h-80 overflow-y-auto bg-white">
                    {filteredBrands.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredBrands.map((brand) => (
                          <label
                            key={brand.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-amber-50 cursor-pointer transition-colors duration-200 group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBrands.has(brand.id)}
                              onChange={() => handleBrandToggle(brand.id)}
                              className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500 focus:ring-2"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm group-hover:text-amber-700 transition-colors">
                                {brand.name}
                              </div>
                              {brand.entity && (
                                <div className="text-xs text-gray-500">
                                  {brand.entity}
                                </div>
                              )}
                            </div>
                            {selectedBrands.has(brand.id) && (
                              <Check className="text-amber-600" size={16} />
                            )}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No brands found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedBrands.size > 0 && (
                    <div className="mt-3 text-sm text-gray-600">
                      Selected: {selectedBrands.size} brand{selectedBrands.size !== 1 ? 's' : ''}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedAssetType || !selectedCountry || selectedBrands.size === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </span>
              ) : (
                'Generate Legal Copy'
              )}
            </button>
          </div>

          {/* Right Panel - Output */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 sticky top-6" id="generated-copy-section">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Generated Copy
              </h2>

              {copyError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-red-900 mb-1">Error</div>
                      <div className="text-sm text-red-700">{copyError}</div>
                    </div>
                  </div>
                </div>
              )}

              {!generatedCopy && !copyError ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">
                    No copy generated yet. Fill in the form and click Generate.
                  </p>
                </div>
              ) : generatedCopy ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Asset Type:</span>
                      <span className="font-medium text-slate-900">{generatedCopy.metadata.assetType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Country:</span>
                      <span className="font-medium text-slate-900">{generatedCopy.metadata.countryCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Language:</span>
                      <span className="font-medium text-slate-900">{generatedCopy.metadata.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Brands:</span>
                      <span className="font-medium text-slate-900">{generatedCopy.metadata.brandCount}</span>
                    </div>
                  </div>

                  <div className="border-2 border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <div 
                      className="text-sm text-slate-700 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: generatedCopy.html }}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyToClipboard(generatedCopy.plainText)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button
                      onClick={() => handleDownload(generatedCopy.plainText)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Development Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Development Status</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>✅ All Brands in DB: {rawBrands.length}</div>
              <div>✅ Brands for Selected Country: {availableBrands.length}</div>
              <div>✅ Countries loaded: {countries.length}</div>
              <div>✅ Asset Types loaded: {assetTypes.length}</div>
              <div>✅ Template Service: Initialized</div>
              <div>✅ Copy Generator: Ready</div>
              {selectedCountry && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="font-semibold">Selected Country: {selectedCountry}</div>
                  <div>Available Brands: {availableBrands.map(b => b.name).join(', ')}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

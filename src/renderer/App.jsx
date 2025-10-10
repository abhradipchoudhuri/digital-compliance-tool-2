// src/renderer/App.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useExcelData } from './hooks/useDataLoader';
import templateService from './services/templateService';
import { ChevronDown, Search, Check, Copy, Download, History, AlertCircle, Info } from 'lucide-react';

const App = () => {
  // Get data from Excel hook
  const { brands: rawBrands = [], countries: rawCountries = [], assetTypes: rawAssetTypes = [], loading, error } = useExcelData();
  
  // Form state
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showMultiBrandNote, setShowMultiBrandNote] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyError, setCopyError] = useState(null);

  // Process brands with unique IDs
  const brands = rawBrands.map((brand, index) => ({
    id: `${brand.id}-${index}`,
    name: brand.name,
    originalId: brand.id,
    entity: brand.entity
  }));

  // Sort countries alphabetically
  const countries = [...rawCountries].sort((a, b) => a.name.localeCompare(b.name));

  // Process asset types
  const assetTypes = rawAssetTypes;

  const filteredBrands = searchQuery
    ? brands.filter(brand => 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (brand.entity && brand.entity.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : brands;

  const handleBrandToggle = (brandId) => {
    const newSelection = new Set(selectedBrands);
    if (newSelection.has(brandId)) {
      newSelection.delete(brandId);
    } else {
      newSelection.add(brandId);
    }
    setSelectedBrands(newSelection);
    
    if (newSelection.size > 1) {
      setShowMultiBrandNote(true);
      setTimeout(() => setShowMultiBrandNote(false), 3000);
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
          const brand = brands.find(b => b.id === id);
          return brand?.name;
        })
        .filter(Boolean);
      
      console.log('📋 Selected brands:', selectedBrandNames);
      console.log('📋 Selected asset type:', selectedAssetType);
      console.log('📋 Selected country:', selectedCountry);
      
      // Call the real copy generation service
      const result = await templateService.generateCopy({
        assetType: selectedAssetType,
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
        
        // Scroll to the generated copy
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
      });
  };

  const handleCopyAndClose = () => {
    if (generatedCopy) {
      copyToClipboard(generatedCopy.plainText);
      // Optionally reset the form
      setTimeout(() => {
        setGeneratedCopy(null);
        setSelectedAssetType('');
        setSelectedCountry('');
        setSelectedBrands(new Set());
        setSearchQuery('');
      }, 1000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/20 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Excel data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/20 to-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-red-800 font-semibold mb-2">Error Loading Data</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-amber-50/20 to-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-b from-gray-50 to-white border-b-2 border-amber-600 shadow-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col items-center text-center">
            {/* Title - Larger and Bolder */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Legal Copy Generator
            </h1>
            
            {/* Subtitle */}
            <p className="text-base text-amber-700 font-medium">
              Brown-Forman Corporation
            </p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Instructions Panel - Enhanced Layout */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-amber-50/30 border border-blue-200 rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                <Info size={18} className="text-white" />
              </div>
              Instructions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Left Column - Steps 1-3 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">1</div>
                  <p className="text-gray-700 pt-0.5">Select your Asset Type</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">2</div>
                  <p className="text-gray-700 pt-0.5">Select your Country</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">3</div>
                  <p className="text-gray-700 pt-0.5">Select the brand(s) associated with your asset</p>
                </div>
              </div>
              
              {/* Right Column - Steps 4-5 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">4</div>
                  <p className="text-gray-700 pt-0.5">Click Generate</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-amber-600 text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">5</div>
                  <p className="text-gray-700 pt-0.5">Copy the generated text to your clipboard</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes - Enhanced Cards */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 border border-green-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-green-900 text-base">Country/Market Specifics</h3>
              </div>
              <p className="text-green-800 text-sm leading-relaxed">
                Additional detailed instructions will be included with your copy if your market has local requirements.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-amber-900 text-base">Multi-Brand Assets</h3>
              </div>
              <p className="text-amber-800 text-sm leading-relaxed">
                For multi-brand items (e.g., Bar-Fabric), please DO NOT select any other single brands as the copy will not generate correctly.
              </p>
            </div>
          </div>

          {showMultiBrandNote && (
            <div className="bg-amber-100 border border-amber-400 rounded-lg p-4 mb-6 animate-pulse">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle size={20} />
                <span className="font-medium">Multi-Brand Selection Notice</span>
              </div>
              <p className="text-amber-700 text-sm mt-1">
                You have selected multiple brands. Please ensure this is correct.
              </p>
            </div>
          )}

          {/* Error Display */}
          {copyError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle size={20} />
                <span className="font-medium">Generation Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">{copyError}</p>
            </div>
          )}

          <div className="bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20 rounded-xl shadow-md border border-amber-200/50 p-8 backdrop-blur-sm">
            {/* Form Section */}
            <div className="space-y-8">
              {/* Asset Type Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Please select the Asset Type*
                </label>
                <div className="relative">
                  <select
                    value={selectedAssetType}
                    onChange={(e) => setSelectedAssetType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                  >
                    <option value="">Select Asset Type</option>
                    {assetTypes.map((type) => (
                      <option key={type.id} value={type.name}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>

              {/* Country Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Please select the Country*
                </label>
                <div className="relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
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
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Please select the Brands (Check all that apply)*
                </label>
                
                {/* Search Box */}
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

                {/* Brand Grid */}
                <div className="border border-gray-300 rounded-lg p-4 max-h-80 overflow-y-auto bg-white">
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
                </div>
                
                {selectedBrands.size > 0 && (
                  <div className="mt-3 text-sm text-gray-600">
                    Selected: {selectedBrands.size} brand{selectedBrands.size !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <div className="flex justify-center pt-6">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-10 py-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-800 hover:to-amber-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 disabled:transform-none shadow-lg hover:shadow-2xl active:scale-95"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </span>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </div>

            {/* Generated Copy Output */}
            {generatedCopy && (
              <div id="generated-copy-section" className="mt-12 border-t border-gray-200 pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                  Generated Legal Copy
                </h3>
                
                {/* Metadata */}
                {generatedCopy.metadata && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-200 rounded-lg p-4 mb-4 text-sm">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <span className="font-semibold text-amber-900">Asset Type:</span>
                        <p className="text-amber-800">{generatedCopy.metadata.assetType}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-amber-900">Country:</span>
                        <p className="text-amber-800">{generatedCopy.metadata.countryCode}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-amber-900">Language:</span>
                        <p className="text-amber-800">{generatedCopy.metadata.language}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-amber-900">Brands:</span>
                        <p className="text-amber-800">{generatedCopy.metadata.brands?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: generatedCopy.html }} />
                  </div>
                  
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-300">
                    <button
                      onClick={handleCopyAndClose}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Copy size={16} />
                      Copy & Close
                    </button>
                    
                    <button
                      onClick={() => {
                        const element = document.createElement('a');
                        const file = new Blob([generatedCopy.plainText], { type: 'text/plain' });
                        element.href = URL.createObjectURL(file);
                        element.download = `legal-copy-${Date.now()}.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                      }}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    
                    <button
                      onClick={() => copyToClipboard(generatedCopy.plainText)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <Copy size={16} />
                      Copy Plain Text
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Development Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-sm">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Development Status</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>✅ Brands loaded: {brands.length}</div>
                <div>✅ Countries loaded: {countries.length}</div>
                <div>✅ Asset Types loaded: {assetTypes.length}</div>
                <div>✅ Template Service: Initialized</div>
                <div>✅ Copy Generator: Ready</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">Built for Brown-Forman Corporation</p>
          <p className="text-xs text-gray-400 mt-1">Digital Compliance Tool v1.0.0</p>
        </div>
      </footer>
    </div>
  );
};

App.propTypes = {};

export default App;
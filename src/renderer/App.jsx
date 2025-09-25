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
    
    setTimeout(() => {
      const selectedBrandNames = Array.from(selectedBrands)
        .map(id => brands.find(b => b.id === id)?.name)
        .filter(Boolean);
      
      const countryName = countries.find(c => c.code === selectedCountry)?.name;
      
      setGeneratedCopy({
        plainText: `Generated legal copy for ${selectedAssetType} in ${countryName}:\n\nBrands: ${selectedBrandNames.join(', ')}\n\nThis is a placeholder for the actual generated compliance copy. The real implementation will use the templateService and Excel data to generate proper legal text with all required disclaimers, trademark notices, and compliance statements.`,
        html: `<div><h3>Generated Legal Copy</h3><p><strong>Asset Type:</strong> ${selectedAssetType}</p><p><strong>Country:</strong> ${countryName}</p><p><strong>Brands:</strong> ${selectedBrandNames.join(', ')}</p><div style="margin-top: 20px; padding: 15px; border: 1px solid #ccc; background: #f9f9f9;"><p>This is a placeholder for the actual generated compliance copy. The real implementation will use the templateService and Excel data to generate proper legal text with all required disclaimers, trademark notices, and compliance statements.</p></div></div>`
      });
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center font-bold text-blue-900">
              BF
            </div>
            <div>
              <h1 className="text-2xl font-bold">Digital Compliance Legal Copy Generator</h1>
              <p className="text-sm text-blue-200">Brown-Forman Corporation</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Instructions Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <Info size={20} />
              Instructions
            </h2>
            <div className="text-blue-800 space-y-2 text-sm">
              <p><strong>1.</strong> Select your Asset Type</p>
              <p><strong>2.</strong> Select your Country</p>
              <p><strong>3.</strong> Select the brand(s) associated with your asset</p>
              <p><strong>4.</strong> Click Generate</p>
              <p><strong>5.</strong> Copy the generated text to your clipboard</p>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Country/Market Specifics
              </h3>
              <p className="text-green-700 text-sm">
                There will be additional detailed instructions included with your copy if your market has local requirements.
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Multi-Brands
              </h3>
              <p className="text-amber-700 text-sm">
                If you need copy for a multi-brand item, please DO NOT select any other single brands.
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            {/* Form Section */}
            <div className="space-y-8">
              {/* Asset Type Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Please select the Asset Type*
                </label>
                <div className="relative">
                  <select
                    value={selectedAssetType}
                    onChange={(e) => setSelectedAssetType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Please select the Country*
                </label>
                <div className="relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg appearance-none bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                <label className="block text-sm font-semibold text-gray-700 mb-3">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Brand Grid */}
                <div className="border border-gray-300 rounded-lg p-4 max-h-80 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredBrands.map((brand) => (
                      <label
                        key={brand.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.has(brand.id)}
                          onChange={() => handleBrandToggle(brand.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 text-sm group-hover:text-blue-700 transition-colors">
                            {brand.name}
                          </div>
                          {brand.entity && (
                            <div className="text-xs text-gray-500">
                              {brand.entity}
                            </div>
                          )}
                        </div>
                        {selectedBrands.has(brand.id) && (
                          <Check className="text-blue-600" size={16} />
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
                  className="px-8 py-4 bg-blue-800 hover:bg-blue-900 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl"
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
              <div className="mt-12 border-t border-gray-200 pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Generated Legal Copy
                </h3>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: generatedCopy.html }} />
                  </div>
                  
                  <div className="flex gap-3 mt-6 pt-6 border-t border-gray-300">
                    <button
                      onClick={() => copyToClipboard(generatedCopy.plainText)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
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
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <Download size={16} />
                      Download
                    </button>
                    
                    <button
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <History size={16} />
                      Save to History
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Development Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 bg-gray-100 border rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Development Status</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Brands loaded: {brands.length}</div>
                <div>Countries loaded: {countries.length}</div>
                <div>Asset Types loaded: {assetTypes.length}</div>
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

export default App;
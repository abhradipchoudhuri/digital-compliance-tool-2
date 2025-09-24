// src/renderer/App.jsx
// Enhanced App component with Brown-Forman Digital Compliance Tool UI

import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
  
  // Mock data - will be replaced by real Excel data
  const assetTypes = [
    'Select Asset Type',
    'Facebook Post', 
    'Instagram Story',
    'Twitter Post',
    'LinkedIn Post',
    'Email Template',
    'Banner Ad',
    'Video Description',
    'Website Copy'
  ];

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'AU', name: 'Australia' },
    { code: 'CA', name: 'Canada' },
    { code: 'MX', name: 'Mexico' },
    { code: 'BR', name: 'Brazil' }
  ];

  // Brown-Forman brands from screenshot
  const brands = [
    { id: 'amigos-herradura', name: 'Amigos de Herradura', category: 'Tequila' },
    { id: 'bf-portfolio', name: 'B-F Portfolio (multi-brand)', category: 'Portfolio' },
    { id: 'botucal', name: 'Botucal', category: 'Rum' },
    { id: 'chambord', name: 'Chambord', category: 'Liqueur' },
    { id: 'cheers-host', name: 'Cheers to the Host (multi-brand)', category: 'Portfolio' },
    { id: 'coopers-craft', name: 'Cooper\'s Craft', category: 'Bourbon' },
    { id: 'diplomatico', name: 'Diplomático', category: 'Rum' },
    { id: 'el-jimador-new', name: 'el Jimador New Mix', category: 'Tequila' },
    { id: 'fords-gin', name: 'Ford\'s Gin', category: 'Gin' },
    { id: 'gentleman-jack', name: 'Gentleman Jack', category: 'Whiskey' },
    { id: 'gentleman-whiskey', name: 'Gentleman Jack Whiskey Sour (RTD)', category: 'RTD' },
    { id: 'gin-mare', name: 'Gin Mare', category: 'Gin' },
    { id: 'glenglassaugh', name: 'Glenglassaugh', category: 'Scotch' },
    { id: 'herradura-tequila', name: 'Herradura Tequila', category: 'Tequila' },
    { id: 'jack-apple-fizz', name: 'Jack Apple Fizz (RTD)', category: 'RTD' },
    { id: 'jack-cola-ginger', name: 'Jack & Cola / Ginger / Berry (RTD)', category: 'RTD' },
    { id: 'jack-apple-tonic', name: 'Jack Apple & Tonic (RTD)', category: 'RTD' },
    { id: 'jack-daniels-bonded', name: 'Jack Daniel\'s Bonded Series', category: 'Whiskey' },
    { id: 'jack-daniels-bottled', name: 'Jack Daniel\'s Bottled in Bond', category: 'Whiskey' },
    { id: 'jack-daniels-country', name: 'Jack Daniel\'s Country Cocktails', category: 'RTD' },
    { id: 'jack-daniels-fob', name: 'Jack Daniel\'s FOB (multi-brand)', category: 'Portfolio' },
    { id: 'jack-daniels-lynchburg', name: 'Jack Daniel\'s Lynchburg Lemonade (RTD)', category: 'RTD' },
    { id: 'jack-daniels-27', name: 'Jack Daniel\'s No. 27 Gold', category: 'Whiskey' },
    { id: 'jack-daniels-old-7', name: 'Jack Daniel\'s Old No 7', category: 'Whiskey' },
    { id: 'jack-daniels-sinatra', name: 'Jack Daniel\'s Sinatra Select', category: 'Whiskey' },
    { id: 'jack-daniels-single-barrel', name: 'Jack Daniel\'s Single Barrel Series', category: 'Whiskey' },
    { id: 'jack-daniels-tennessee-apple', name: 'Jack Daniel\'s Tennessee Apple', category: 'Flavored Whiskey' },
    { id: 'jack-daniels-tennessee-fire', name: 'Jack Daniel\'s Tennessee Fire', category: 'Flavored Whiskey' },
    { id: 'jack-daniels-tennessee-honey', name: 'Jack Daniel\'s Tennessee Honey', category: 'Flavored Whiskey' },
    { id: 'jack-daniels-tennessee-rye', name: 'Jack Daniel\'s Tennessee Rye', category: 'Whiskey' },
    { id: 'jack-daniels-triple-mash', name: 'Jack Daniel\'s Triple Mash', category: 'Whiskey' },
    { id: 'jack-daniels-winter-jack', name: 'Jack Daniel\'s Winter Jack', category: 'Flavored Whiskey' },
    { id: 'jack-honey-lemonade', name: 'Jack Honey & Lemonade (RTD)', category: 'RTD' },
    { id: 'master-craft-academy', name: 'Master Craft Academy (multi-brand)', category: 'Portfolio' },
    { id: 'old-forester', name: 'Old Forester', category: 'Bourbon' },
    { id: 'slane-irish-whiskey', name: 'Slane Irish Whiskey', category: 'Irish Whiskey' },
    { id: 'the-glendronnach', name: 'The GlenDronach', category: 'Scotch' },
    { id: 'woodford-reserve', name: 'Woodford Reserve', category: 'Bourbon' }
  ];

  const filteredBrands = searchQuery
    ? brands.filter(brand => 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.category.toLowerCase().includes(searchQuery.toLowerCase())
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
    
    // Show multi-brand note if more than one brand selected
    if (newSelection.size > 1) {
      setShowMultiBrandNote(true);
      setTimeout(() => setShowMultiBrandNote(false), 3000);
    }
  };

  const handleGenerate = async () => {
    if (!selectedAssetType || selectedAssetType === 'Select Asset Type') {
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
    
    // Simulate copy generation
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
    // You could add a toast notification here
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
              <p><strong>1.</strong> Select your Asset Type ▶ Please visit our <a href="#" className="text-blue-600 underline">Resource Library</a> for further guidance on the Asset Types.</p>
              <p><strong>2.</strong> Select your Country</p>
              <p><strong>3.</strong> Select the brand(s) associated with your asset</p>
              <p><strong>4.</strong> Click Generate. Your results may take up to 5 seconds to load. You may need to scroll up to see the generated copy.</p>
              <p><strong>5.</strong> Once your copy is generated, click the "Copy & Close" button to copy the generated text to your clipboard. Repeat steps 1 through 5 for any additional copy needs.</p>
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
                If you need copy for a multi-brand item, such as Bar-Fabric, please DO NOT select any other single brands, ie. Benriach, because the copy will not generate.
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
                You have selected multiple brands. Please ensure this is correct or select only multi-brand items like Bar-Fabric.
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
                    {assetTypes.map((type, index) => (
                      <option key={index} value={type} disabled={index === 0}>
                        {type}
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
                          <div className="text-xs text-gray-500">
                            {brand.category}
                          </div>
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
                <div>Excel Context: {Object.keys(excelContext).length} methods</div>
                <div>UI Components: ✅ Complete</div>
                <div>Copy Generation: ⚠️ Using mock data - connect to templateService</div>
                <div>Brand Data: ✅ Real Brown-Forman brands loaded</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm">Built with ❤️ for Brown-Forman Corporation</p>
          <p className="text-xs text-gray-400 mt-1">Digital Compliance Tool v1.0.0 - Ensuring legal compliance worldwide</p>
        </div>
      </footer>
    </div>
  );
};

App.propTypes = {};

export default App;
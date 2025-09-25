// src/renderer/App.jsx
// Matches the exact UI from your screenshot

import React, { useState } from 'react';
import { useExcelData } from './index';

const App = () => {
  const excelContext = useExcelData();
  
  // Get data from context
  const brands = excelContext.getBrands ? excelContext.getBrands() : [];
  const countries = excelContext.getCountries ? excelContext.getCountries() : [];
  const assetTypes = excelContext.getAssetTypes ? excelContext.getAssetTypes() : [];

  // Form state
  const [selectedAssetType, setSelectedAssetType] = useState('Facebook Post');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');

  // Filter brands by search
  const filteredBrands = brands.filter(brand =>
    brand.name?.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // Toggle brand selection
  const toggleBrand = (brandId) => {
    setSelectedBrands(prev =>
      prev.includes(brandId)
        ? prev.filter(id => id !== brandId)
        : [...prev, brandId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-bf-blue text-white p-4 shadow-md">
        <div className="container mx-auto flex items-center">
          <div className="w-12 h-12 rounded-full bg-bf-gold flex items-center justify-center text-bf-blue font-bold text-xl mr-4">
            BF
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Digital Compliance Legal Copy Generator</h1>
            <p className="text-sm opacity-90">Brown-Forman Corporation</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-6xl">
        
        {/* Instructions Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start mb-4">
            <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h2 className="text-lg font-semibold text-blue-900">Instructions</h2>
          </div>
          <ol className="space-y-2 text-blue-800">
            <li className="flex">
              <span className="font-semibold mr-2">1.</span>
              <span>Select your Asset Type ▶ Please visit our <a href="#" className="text-blue-600 underline">Resource Library</a> for further guidance on the Asset Types.</span>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">2.</span>
              <span>Select your Country</span>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">3.</span>
              <span>Select the brand(s) associated with your asset</span>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">4.</span>
              <span>Click Generate. Your results may take up to 5 seconds to load. You may need to scroll up to see the generated copy.</span>
            </li>
            <li className="flex">
              <span className="font-semibold mr-2">5.</span>
              <span>Once your copy is generated, click the "Copy & Close" button to copy the generated text to your clipboard. Repeat steps 1 through 5 for any additional copy needs.</span>
            </li>
          </ol>
        </div>

        {/* Alert Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Country/Market Specifics */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-3 mt-1"></div>
              <div>
                <h3 className="font-semibold text-green-900 mb-1">Country/Market Specifics</h3>
                <p className="text-sm text-green-800">
                  There will be additional detailed instructions included with your copy if your market has local requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Multi-Brands */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-3 mt-1"></div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Multi-Brands</h3>
                <p className="text-sm text-orange-800">
                  If you need copy for a multi-brand item, such as Bar-Fabric, please DO NOT select any other single brands, ie. Benriach, because the copy will not generate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          
          {/* Asset Type Dropdown */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Please select the Asset Type<span className="text-red-500">*</span>
            </label>
            <select
              value={selectedAssetType}
              onChange={(e) => setSelectedAssetType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select Asset Type</option>
              {assetTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Country Dropdown */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Please select the Country<span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full p-3 border-2 border-yellow-400 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
            >
              <option value="">Select Country</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Brands Section */}
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Please select the Brands (Check all that apply)<span className="text-red-500">*</span>
            </label>
            
            {/* Search Box */}
            <div className="relative mb-4">
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search brands..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Brands Grid */}
            <div className="border border-gray-300 rounded-md p-4 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredBrands.map((brand) => (
                  <label key={brand.id} className="flex items-start cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand.id)}
                      onChange={() => toggleBrand(brand.id)}
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3">
                      <div className="text-gray-900 font-medium">{brand.name}</div>
                      <div className="text-sm text-gray-500">{brand.entity}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              disabled={!selectedAssetType || !selectedCountry || selectedBrands.length === 0}
              className={`px-8 py-3 rounded-md font-semibold transition-colors ${
                selectedAssetType && selectedCountry && selectedBrands.length > 0
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={() => {
                console.log('Generate clicked:', {
                  assetType: selectedAssetType,
                  country: selectedCountry,
                  brands: selectedBrands
                });
                alert('Copy generation will be implemented next!');
              }}
            >
              Generate
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
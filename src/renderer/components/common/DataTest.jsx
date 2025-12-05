// src/renderer/components/common/DataTest.jsx
// Component for testing and debugging Excel data loading

import React, { useState } from 'react';
import { useExcelData } from '@hooks/useDataLoader';

const DataTest = () => {
  const {
    loading,
    error,
    brands,
    assetTypes,
    countries,
    helpText,
    reloadData,
    searchBrands
  } = useExcelData();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  /**
   * Handle brand search
   */
  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchBrands(searchQuery);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-bf-blue"></div>
        <p className="mt-2 text-gray-600">Loading Excel data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800">Error Loading Data</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button 
          onClick={reloadData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-bf-blue">Excel Data Test</h2>
      
      {/* Data Summary Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Brands</h3>
          <p className="text-2xl font-bold text-blue-600">{brands.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Asset Types</h3>
          <p className="text-2xl font-bold text-green-600">{assetTypes.length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Countries</h3>
          <p className="text-2xl font-bold text-purple-600">{countries.length}</p>
        </div>
      </div>

      {/* Brand Search Testing Interface */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Brand Search Test</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brands..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-bf-blue text-white rounded hover:bg-opacity-90"
          >
            Search
          </button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium">Results ({searchResults.length}):</p>
            {searchResults.slice(0, 5).map((brand, index) => (
              <div key={index} className="text-sm bg-white p-2 rounded">
                <strong>{brand.displayName}</strong> - {brand.entityName}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sample Data Display */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Sample Brands (first 5)</h3>
          <div className="space-y-1 text-sm">
            {brands.slice(0, 5).map((brand, index) => (
              <div key={index}>
                <strong>{brand.displayName}</strong> - {brand.entityName}
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Sample Asset Types (first 5)</h3>
          <div className="space-y-1 text-sm">
            {assetTypes.slice(0, 5).map((asset, index) => (
              <div key={index}>
                {asset.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help Text Preview */}
      {helpText && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Help Text Preview</h3>
          <div 
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: helpText.substring(0, 200) + '...' }}
          />
        </div>
      )}
    </div>
  );
};

export default DataTest;
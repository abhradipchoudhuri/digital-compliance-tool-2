// src/renderer/components/DataDebugger.jsx
// Excel Data Debugger Component - Inspect loaded Excel data structure

import React, { useState, useMemo } from 'react';
import { useExcelData } from '../index';
import { ChevronDown, ChevronUp, Database, FileSpreadsheet, Filter, Search } from 'lucide-react';

const DataDebugger = () => {
  const context = useExcelData();
  const [selectedSheet, setSelectedSheet] = useState('Trademark Config');
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    rawData: true,
    processed: true
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Get data from context
  const brands = context.getBrands();
  const countries = context.getCountries();
  const assetTypes = context.getAssetTypes();
  const sheets = Object.keys(context.rawData || {});
  const currentSheetData = context.rawData?.[selectedSheet] || [];

  // Filter brands by search term
  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brands.slice(0, 10);
    return brands.filter(brand =>
      brand.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.entity?.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [brands, searchTerm]);

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Section Header Component
  const SectionHeader = ({ title, icon: Icon, section, count }) => (
    <div
      className="flex items-center justify-between p-4 bg-gradient-to-r from-bf-blue to-blue-600 text-bf-gold cursor-pointer hover:from-blue-600 hover:to-bf-blue transition-all"
      onClick={() => toggleSection(section)}
    >
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5" />
        <h3 className="text-lg font-semibold">{title}</h3>
        {count !== undefined && (
          <span className="bg-bf-gold text-bf-blue px-2 py-1 rounded-full text-xs font-bold">
            {count}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-5 h-5" />
      ) : (
        <ChevronDown className="w-5 h-5" />
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-xl border-2 border-bf-blue overflow-hidden">
      {/* Header */}
      <div className="bg-bf-blue text-bf-gold p-6">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold"> Excel Data Debugger</h2>
            <p className="text-sm opacity-90">Inspect loaded Excel data structure and values</p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="border-b border-gray-200">
        <SectionHeader
          title="Data Summary"
          icon={FileSpreadsheet}
          section="summary"
        />
        
        {expandedSections.summary && (
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
                <div className="text-sm text-gray-600 font-medium">Total Sheets</div>
                <div className="text-3xl font-bold text-green-600">{sheets.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
                <div className="text-sm text-gray-600 font-medium">Brands Found</div>
                <div className="text-3xl font-bold text-blue-600">{brands.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
                <div className="text-sm text-gray-600 font-medium">Countries Found</div>
                <div className="text-3xl font-bold text-purple-600">{countries.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500">
                <div className="text-sm text-gray-600 font-medium">Asset Types</div>
                <div className="text-3xl font-bold text-orange-600">{assetTypes.length}</div>
              </div>
            </div>

            {/* Sheet List */}
            <div className="mt-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Available Sheets:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {sheets.map(sheet => (
                  <div key={sheet} className="flex items-center justify-between bg-white p-3 rounded border border-gray-200">
                    <span className="font-medium text-gray-700">{sheet}</span>
                    <span className="bg-bf-blue text-bf-gold px-3 py-1 rounded-full text-xs font-bold">
                      {context.rawData[sheet].length} rows
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Raw Data Inspector */}
      <div className="border-b border-gray-200">
        <SectionHeader
          title="Raw Data Inspector"
          icon={Search}
          section="rawData"
          count={currentSheetData.length}
        />
        
        {expandedSections.rawData && (
          <div className="p-6 bg-gray-50">
            {/* Sheet Selector */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Sheet to Inspect:
              </label>
              <select
                value={selectedSheet}
                onChange={(e) => setSelectedSheet(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-bf-blue focus:border-transparent transition-all"
              >
                {sheets.map(sheet => (
                  <option key={sheet} value={sheet}>
                    {sheet} ({context.rawData[sheet].length} rows)
                  </option>
                ))}
              </select>
            </div>

            {currentSheetData.length > 0 ? (
              <>
                {/* Headers Display */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                      {Object.keys(currentSheetData[0]).length}
                    </span>
                    Column Headers:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(currentSheetData[0]).map(header => (
                      <span
                        key={header}
                        className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-sm"
                      >
                        {header}
                      </span>
                    ))}
                  </div>
                </div>

                {/* First Row Data */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    First Row (Sample Data):
                  </h4>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                    <pre className="text-green-400 text-sm font-mono">
                      {JSON.stringify(currentSheetData[0], null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Second Row Data (if exists) */}
                {currentSheetData.length > 1 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Second Row (Comparison):
                    </h4>
                    <div className="bg-gray-900 rounded-lg p-4 overflow-auto">
                      <pre className="text-blue-400 text-sm font-mono">
                        {JSON.stringify(currentSheetData[1], null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Row Count Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      <strong>Total Rows in "{selectedSheet}":</strong>
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {currentSheetData.length}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileSpreadsheet className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p>No data in this sheet</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Processed Data Display */}
      <div className="border-b border-gray-200">
        <SectionHeader
          title="Processed Data (Filtered)"
          icon={Filter}
          section="processed"
        />
        
        {expandedSections.processed && (
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Brands */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3">
                  <h3 className="font-bold flex items-center justify-between">
                    <span>Brands</span>
                    <span className="bg-white text-blue-600 px-2 py-1 rounded text-xs">
                      {brands.length}
                    </span>
                  </h3>
                </div>
                <div className="p-4">
                  {/* Search */}
                  <div className="mb-3">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search brands..."
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredBrands.length > 0 ? (
                      filteredBrands.map((brand, idx) => (
                        <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="font-semibold text-blue-900 text-sm">{brand.name}</div>
                          <div className="text-xs text-blue-600 mt-1">{brand.entity}</div>
                          <div className="text-xs text-gray-500 mt-1">ID: {brand.id}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        {searchTerm ? 'No brands match search' : 'No brands found'}
                      </p>
                    )}
                    {brands.length > 10 && !searchTerm && (
                      <div className="text-xs text-center text-gray-500 pt-2 border-t">
                        ...and {brands.length - 10} more
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Asset Types */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3">
                  <h3 className="font-bold flex items-center justify-between">
                    <span>Asset Types</span>
                    <span className="bg-white text-orange-600 px-2 py-1 rounded text-xs">
                      {assetTypes.length}
                    </span>
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {assetTypes.length > 0 ? (
                      assetTypes.map((type, idx) => (
                        <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                          <div className="font-semibold text-orange-900 text-sm">{type.name}</div>
                          {type.description && (
                            <div className="text-xs text-orange-600 mt-1">{type.description}</div>
                          )}
                          <div className="text-xs text-gray-500 mt-1">ID: {type.id}</div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No asset types found</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Countries */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-3">
                  <h3 className="font-bold flex items-center justify-between">
                    <span>Countries</span>
                    <span className="bg-white text-purple-600 px-2 py-1 rounded text-xs">
                      {countries.length}
                    </span>
                  </h3>
                </div>
                <div className="p-4">
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {countries.length > 0 ? (
                      countries.slice(0, 15).map((country, idx) => (
                        <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="font-semibold text-purple-900 text-sm">{country.name}</div>
                          <div className="text-xs text-purple-600 mt-1">
                            Code: {country.code} • Language: {country.language}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No countries found</p>
                    )}
                    {countries.length > 15 && (
                      <div className="text-xs text-center text-gray-500 pt-2 border-t">
                        ...and {countries.length - 15} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Logic Info */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                🔍 Filter Logic Applied:
              </h4>
              <div className="text-xs text-yellow-700 space-y-1">
                <p>• <strong>Brands:</strong> Filters 'Trademark Config' where Type === 'Brand'</p>
                <p>• <strong>Asset Types:</strong> Filters 'Trademark Config' where Type === 'Asset Type'</p>
                <p>• <strong>Countries:</strong> Unique values from 'CountryLanguage' by CountryCode</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Tips */}
      <div className="bg-gray-100 p-4 border-t border-gray-300">
        <div className="flex items-start space-x-2 text-sm text-gray-600">
          <div className="flex-shrink-0 mt-0.5">💡</div>
          <div>
            <strong>Debugging Tips:</strong> If processed data shows 0 results, check the Raw Data Inspector 
            to verify column names match the filter logic in excelService.js (Type, ID, Name, etc.)
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataDebugger;
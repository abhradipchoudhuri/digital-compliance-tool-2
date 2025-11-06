// src/renderer/App.jsx
// Main Application Component - Legal Copy Generator Interface
// Handles UI, form state, and copy generation workflow

import React, { useState } from 'react';
import { useExcelData } from './index';
import templateService from './services/templateService';
import { ChevronDown, Search, Check, Copy, AlertCircle, Info, Sparkles } from 'lucide-react';

const App = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const excelContext = useExcelData();
  
  // Form state
  const [selectedAssetType, setSelectedAssetType] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedBrands, setSelectedBrands] = useState(new Set());
  const [availableBrands, setAvailableBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMultiBrandNote, setShowMultiBrandNote] = useState(false);
  
  // Generation state
  const [generatedCopy, setGeneratedCopy] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copyError, setCopyError] = useState(null);
  const [justCopied, setJustCopied] = useState(false);
  const [assetTypeInstructions, setAssetTypeInstructions] = useState(null);
  
  // Get data from Excel context
  const rawBrands = excelContext.getBrands() || [];
  const countries = excelContext.getCountries() || [];
  const assetTypes = excelContext.getAssetTypes() || [];

  // ============================================
  // EVENT HANDLERS
  // ============================================

  /**
   * Handle country selection and load available brands
   * Filters brands by country and sorts alphabetically
   * @param {string} countryCode - Selected country code
   */
  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setSelectedBrands(new Set());
    setAssetTypeInstructions(null);
    
    if (countryCode) {
      const { default: excelService } = require('./services/excelService');
      const brandsForCountry = excelService.getBrandsForCountry(countryCode);
      
      const processedBrands = brandsForCountry
        .map((brand, index) => ({
          id: `${brand.id}-${index}`,
          name: brand.name,
          originalId: brand.id,
          entity: brand.entity
        }))
        // Sort alphabetically by brand name
        .sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB);
        });
      
      setAvailableBrands(processedBrands);
      console.log(`Loaded ${processedBrands.length} brands for ${countryCode} (sorted alphabetically)`);
    } else {
      setAvailableBrands([]);
    }
  };

  /**
   * Handle brand selection toggle
   * @param {string} brandId - Brand ID to toggle
   */
  const handleBrandToggle = (brandId) => {
    const newSelected = new Set(selectedBrands);
    if (newSelected.has(brandId)) {
      newSelected.delete(brandId);
    } else {
      newSelected.add(brandId);
    }
    setSelectedBrands(newSelected);
    setShowMultiBrandNote(newSelected.size > 1);
    setAssetTypeInstructions(null);
  };

  /**
   * Handle select all / deselect all brands
   */
  const handleSelectAll = () => {
    if (selectedBrands.size === filteredBrands.length) {
      setSelectedBrands(new Set());
      setShowMultiBrandNote(false);
    } else {
      const allIds = new Set(filteredBrands.map(b => b.id));
      setSelectedBrands(allIds);
      setShowMultiBrandNote(allIds.size > 1);
    }
    setAssetTypeInstructions(null);
  };

  /**
   * Handle copy generation
   * Validates inputs, calls templateService, and displays results
   */
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
    setAssetTypeInstructions(null);
    
    try {
      console.log('App: Starting copy generation...');
      
      // Get actual brand names from selected IDs
      const selectedBrandNames = Array.from(selectedBrands)
        .map(id => {
          const brand = availableBrands.find(b => b.id === id);
          return brand?.name;
        })
        .filter(Boolean);
      
      // Get the asset type NAME from the ID
      const assetTypeObj = assetTypes.find(at => at.id === selectedAssetType);
      const assetTypeName = assetTypeObj ? assetTypeObj.name : selectedAssetType;
      
      console.log('Selected brands:', selectedBrandNames);
      console.log('Selected asset type ID:', selectedAssetType);
      console.log('Selected asset type NAME:', assetTypeName);
      console.log('Selected country:', selectedCountry);
      
      // Get Asset Type Instructions from raw data
      const trademarkConfig = excelContext.rawData?.['Trademark Config'] || [];
      const assetTypeRow = trademarkConfig.find(row => 
        row['Asset Type'] === assetTypeName
      );
      
      if (assetTypeRow && assetTypeRow['Asset Type Instructions']) {
        setAssetTypeInstructions(assetTypeRow['Asset Type Instructions']);
        console.log('Found Asset Type Instructions for:', assetTypeName);
      } else {
        console.log('No Asset Type Instructions found for:', assetTypeName);
      }
      
      const result = await templateService.generateCopy({
        assetType: assetTypeName,
        countryCode: selectedCountry,
        brandIds: selectedBrandNames
      });
      
      console.log('Generation result:', result);
      
      if (result.success) {
        setGeneratedCopy({
          plainText: result.result.copy.plainText,
          html: result.result.copy.html,
          metadata: result.result.metadata
        });
        console.log('Copy generated successfully!');
        
        setTimeout(() => {
          document.getElementById('generated-copy-section')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center'
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

  /**
   * Copy generated text to clipboard
   * @param {string} text - Text to copy
   */
  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 2000);
  };

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Determine if entity should be shown for a brand
   * Hides entity if it's redundant or causes confusion
   * @param {Object} brand - Brand object
   * @returns {boolean} Whether to show entity
   */
  const shouldShowEntity = (brand) => {
    if (!brand.entity) return false;
    
    // Special case: Don't show "Benriach" for "The Glendronach"
    if (brand.name.toLowerCase().includes('glendronach') && 
        brand.entity.toLowerCase().includes('benriach')) {
      return false;
    }
    
    // Don't show entity if it's the same as the brand name
    const brandLower = brand.name.toLowerCase();
    const entityLower = brand.entity.toLowerCase();
    
    // Check if brand name contains entity (e.g., "Jack Daniel's Tennessee Whiskey" contains "Jack Daniel's")
    if (brandLower.includes(entityLower) || entityLower.includes(brandLower)) {
      return false;
    }
    
    // Show entity for other brands where it adds useful context
    return true;
  };

  /**
   * Filter brands based on search query
   */
  const filteredBrands = searchQuery
    ? availableBrands.filter(brand => 
        brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (brand.entity && brand.entity.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : availableBrands;

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-orange-50/30 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #a2674f 1px, transparent 1px)`,
        backgroundSize: '32px 32px'
      }}></div>
      
      <div className="relative max-w-7xl mx-auto p-6">
        {/* ============================================
            HEADER SECTION
            ============================================ */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-slate-200 animate-slide-down relative overflow-hidden">
          {/* Subtle copper accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#a2674f] to-transparent"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#a2674f] to-[#8b5a42] rounded-xl flex items-center justify-center shadow-lg animate-float">
                <Sparkles className="w-7 h-7 text-white animate-pulse-soft" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2 hover-lift">
                  Legal Copy Generator
                </h1>
                <p className="text-slate-600">
                  Generate legal copy for digital and traditional marketing materials across entire global portfolio
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">Data Status</div>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${rawBrands.length > 0 ? 'bg-green-500 animate-pulse-soft' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-slate-700">
                  {rawBrands.length} Total Brands | {countries.length} Countries | {assetTypes.length} Asset Types
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============================================
              LEFT PANEL - FORM
              ============================================ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Type Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover-lift-subtle animate-slide-right">
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a2674f] animate-pulse-soft"></div>
                Asset Type*
              </label>
              <div className="relative group">
                <select
                  value={selectedAssetType}
                  onChange={(e) => {
                    setSelectedAssetType(e.target.value);
                    setAssetTypeInstructions(null);
                  }}
                  className="w-full px-4 py-3 pr-10 border-2 border-slate-200 rounded-xl focus:border-[#a2674f] focus:ring-4 focus:ring-[#a2674f]/10 outline-none transition-all appearance-none bg-white text-slate-900 font-medium cursor-pointer hover:border-[#a2674f]/50 hover:shadow-md"
                >
                  <option value="">Select Asset Type</option>
                  {assetTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none transition-transform group-hover:rotate-180 duration-300" />
              </div>
            </div>

            {/* Country Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover-lift-subtle animate-slide-right" style={{ animationDelay: '0.1s' }}>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a2674f] animate-pulse-soft" style={{ animationDelay: '0.5s' }}></div>
                Please select the Country*
              </label>
              <div className="relative group">
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl appearance-none bg-white text-gray-900 focus:ring-4 focus:ring-[#a2674f]/10 focus:border-[#a2674f] transition-all duration-200 hover:border-[#a2674f]/50 hover:shadow-md"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none transition-transform group-hover:rotate-180 duration-300" size={20} />
              </div>
            </div>

            {/* Brand Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover-lift-subtle animate-slide-right" style={{ animationDelay: '0.2s' }}>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#a2674f] animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
                Please select the Brands (Check all that apply)*
              </label>
              
              {!selectedCountry && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 animate-fade-in">
                  <p className="text-blue-800 text-sm flex items-center gap-2">
                    <Info size={16} />
                    Please select a country first to see available brands
                  </p>
                </div>
              )}
              
              {selectedCountry && availableBrands.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-4 animate-fade-in">
                  <p className="text-green-800 text-sm font-medium">
                    {availableBrands.length} brand{availableBrands.length !== 1 ? 's' : ''} available in {countries.find(c => c.code === selectedCountry)?.name} (sorted A-Z)
                  </p>
                </div>
              )}
              
              {selectedCountry && (
                <>
                  <div className="relative mb-4 group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors group-hover:text-[#a2674f]" size={18} />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-4 focus:ring-[#a2674f]/10 focus:border-[#a2674f] transition-all duration-200 hover:border-[#a2674f]/50"
                    />
                  </div>

                  <div className="border-2 border-gray-300 rounded-lg p-4 max-h-80 overflow-y-auto bg-white custom-scrollbar">
                    {filteredBrands.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredBrands.map((brand) => (
                          <label
                            key={brand.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gradient-to-r hover:from-[#a2674f]/5 hover:to-[#a2674f]/10 cursor-pointer transition-all duration-200 group border border-transparent hover:border-[#a2674f]/20 hover-lift-micro"
                          >
                            <input
                              type="checkbox"
                              checked={selectedBrands.has(brand.id)}
                              onChange={() => handleBrandToggle(brand.id)}
                              className="w-4 h-4 text-[#a2674f] bg-gray-100 border-gray-300 rounded focus:ring-[#a2674f] focus:ring-2"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 text-sm group-hover:text-[#a2674f] transition-colors">
                                {brand.name}
                              </div>
                              {/* Only show entity when it adds useful context, formatted as "by Entity" */}
                              {shouldShowEntity(brand) && (
                                <div className="text-xs text-gray-500 italic mt-0.5">
                                  by {brand.entity}
                                </div>
                              )}
                            </div>
                            {selectedBrands.has(brand.id) && (
                              <Check className="text-[#a2674f] animate-scale-in" size={16} />
                            )}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 animate-fade-in">
                        <p>No brands found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedBrands.size > 0 && (
                    <div className="mt-3 text-sm text-gray-600 flex items-center gap-2 animate-fade-in">
                      <div className="w-2 h-2 rounded-full bg-[#a2674f] animate-pulse-soft"></div>
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
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl relative overflow-hidden group"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
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

          {/* ============================================
              RIGHT PANEL - OUTPUT
              ============================================ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-slate-200 hover-lift-subtle animate-slide-left relative overflow-hidden" id="generated-copy-section">
              {/* Copper accent corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#a2674f]/10 to-transparent rounded-bl-full"></div>
              
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#a2674f] to-[#8b5a42] rounded-full animate-pulse-soft"></div>
                Generated Copy
              </h2>

              {copyError && (
                <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg animate-shake">
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
                <div className="text-center py-12 animate-fade-in">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center animate-float">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">
                    No copy generated yet. Fill in the form and click Generate.
                  </p>
                </div>
              ) : generatedCopy ? (
                <div className="space-y-4 animate-fade-in">
                  <div className="bg-gradient-to-br from-slate-50 to-[#a2674f]/5 rounded-lg p-4 space-y-2 text-sm border border-[#a2674f]/10">
                    <div className="flex justify-between items-center hover:bg-white/50 p-1 rounded transition-colors">
                      <span className="text-slate-600">Asset Type:</span>
                      <span className="font-medium text-slate-900">{generatedCopy.metadata.assetType}</span>
                    </div>
                    <div className="flex justify-between items-center hover:bg-white/50 p-1 rounded transition-colors">
                      <span className="text-slate-600">Country:</span>
                      <span className="font-medium text-slate-900">{generatedCopy.metadata.countryCode}</span>
                    </div>
                    <div className="flex justify-between items-center hover:bg-white/50 p-1 rounded transition-colors">
                      <span className="text-slate-600">Language:</span>
                      <span className="font-medium text-slate-900">{generatedCopy.metadata.language}</span>
                    </div>
                    <div className="flex justify-between items-center hover:bg-white/50 p-1 rounded transition-colors">
                      <span className="text-slate-600">Brands:</span>
                      <span className="font-medium text-slate-900">{generatedCopy.metadata.brandCount}</span>
                    </div>
                  </div>

                  <div className="border-2 border-[#a2674f]/20 rounded-lg p-4 max-h-96 overflow-y-auto custom-scrollbar hover:border-[#a2674f]/40 transition-colors">
                    <div 
                      className="text-sm text-slate-700 generated-legal-copy"
                      dangerouslySetInnerHTML={{ __html: generatedCopy.html }}
                      style={{ 
                        whiteSpace: 'pre-wrap',
                        pointerEvents: 'auto'
                      }}
                      onClick={(e) => {
                        if (e.target.tagName === 'A') {
                          e.stopPropagation();
                        }
                      }}
                    />
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopyToClipboard(generatedCopy.plainText)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group ${
                      justCopied 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    
                    {justCopied ? (
                      <>
                        <Check className="w-4 h-4 animate-scale-in" />
                        <span className="animate-fade-in">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 transition-transform group-hover:scale-110" />
                        Copy to Clipboard
                      </>
                    )}
                  </button>
                </div>
              ) : null}
            </div>

            {/* Asset Type Instructions Card */}
            {assetTypeInstructions && generatedCopy && (
              <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-amber-200 hover-lift-subtle animate-fade-in relative overflow-hidden">
                {/* Amber accent corner */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-300/20 to-transparent rounded-bl-full"></div>
                
                <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full animate-pulse-soft"></div>
                  Asset Type Instructions
                </h2>

                <div 
                  className="text-sm text-amber-900 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: assetTypeInstructions }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ============================================
            DEVELOPMENT INFO (DEV ONLY)
            ============================================ */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-sm animate-fade-in">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Development Status</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>✓ All Brands in DB: {rawBrands.length}</div>
              <div>✓ Brands for Selected Country: {availableBrands.length}</div>
              <div>✓ Countries loaded: {countries.length}</div>
              <div>✓ Asset Types loaded: {assetTypes.length}</div>
              <div>✓ Template Service: Initialized</div>
              <div>✓ Copy Generator: Ready</div>
              {selectedCountry && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="font-semibold">Selected Country: {selectedCountry}</div>
                  <div>Available Brands: {availableBrands.map(b => b.name).join(', ')}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================
            FOOTER
            ============================================ */}
        <footer className="mt-12 pb-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-lg border-2 border-[#a2674f]/20 hover:border-[#a2674f]/40 transition-all hover-lift-subtle">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#a2674f] to-[#8b5a42] animate-pulse-soft"></div>
            <span className="text-sm font-medium text-slate-700">
              Made with care by <span className="text-[#a2674f] font-semibold">Marketing Compliance Team</span>
            </span>
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#a2674f] to-[#8b5a42] animate-pulse-soft" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
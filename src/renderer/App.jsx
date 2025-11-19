// src/renderer/App.jsx
// Main Application Component - Legal Copy Generator Interface
// Handles UI, form state, and copy generation workflow

import React, { useState } from 'react';
import { useExcelData } from './index';
import templateService from './services/templateService';
import { ChevronDown, Search, Check, Copy, AlertCircle, Info, X } from 'lucide-react';

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
  
  // Error popup state
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [errorPopupMessage, setErrorPopupMessage] = useState('');
  
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
  // HELPER FUNCTIONS FOR BRAND TYPES
  // ============================================

  /**
   * Check if a brand is a multi-brand
   * @param {string} brandName - Brand name to check
   * @returns {boolean}
   */
  const isMultiBrand = (brandName) => {
    if (!brandName) return false;
    const normalized = brandName.toLowerCase().replace(/\s+/g, '');
    return normalized.includes('(multi-brand)') || normalized.includes('(multibrand)');
  };

  /**
   * Check if a brand is FOB
   * @param {string} brandName - Brand name to check
   * @returns {boolean}
   */
  const isFOBBrand = (brandName) => {
    if (!brandName) return false;
    const normalized = brandName.toLowerCase().replace(/\s+/g, '');
    return normalized.includes('(fob)') || normalized.includes('fob');
  };

  /**
   * Get selected brand names
   * @returns {Array<string>}
   */
  const getSelectedBrandNames = () => {
    return Array.from(selectedBrands)
      .map(id => availableBrands.find(b => b.id === id)?.name)
      .filter(Boolean);
  };

  /**
   * Check if any selected brands are multi-brand
   * @returns {boolean}
   */
  const hasMultiBrandSelected = () => {
    const selectedNames = getSelectedBrandNames();
    return selectedNames.some(name => isMultiBrand(name));
  };

  /**
   * Check if any selected brands are FOB
   * @returns {boolean}
   */
  const hasFOBSelected = () => {
    const selectedNames = getSelectedBrandNames();
    const result = selectedNames.some(name => isFOBBrand(name));
    console.log('hasFOBSelected check:', { selectedNames, result });
    return result;
  };

  /**
   * Check if brand should be disabled
   * @param {Object} brand - Brand object
   * @returns {boolean}
   */
  const isBrandDisabled = (brand) => {
    if (selectedBrands.has(brand.id)) {
      return false;
    }

    const hasMultiBrand = hasMultiBrandSelected();
    const hasFOB = hasFOBSelected();
    const brandIsMulti = isMultiBrand(brand.name);
    const brandIsFOB = isFOBBrand(brand.name);

    console.log('isBrandDisabled check:', {
      brandName: brand.name,
      hasMultiBrand,
      hasFOB,
      brandIsMulti,
      brandIsFOB,
      selectedCount: selectedBrands.size
    });

    // If multi-brand is selected, disable all other brands
    if (hasMultiBrand) {
      return true;
    }

    // If FOB is selected, disable all non-FOB brands
    if (hasFOB && !brandIsFOB) {
      console.log('Disabling non-FOB brand:', brand.name);
      return true;
    }

    // If regular brands are selected and this is multi-brand or FOB, disable it
    if (selectedBrands.size > 0 && !hasFOB && (brandIsMulti || brandIsFOB)) {
      return true;
    }

    return false;
  };

  /**
   * Get selected brand objects
   * @returns {Array<Object>}
   */
  const getSelectedBrandObjects = () => {
    return Array.from(selectedBrands)
      .map(id => availableBrands.find(b => b.id === id))
      .filter(Boolean);
  };

  /**
   * Remove a brand from selection
   * @param {string} brandId - Brand ID to remove
   */
  const handleRemoveSelectedBrand = (brandId) => {
    const newSelected = new Set(selectedBrands);
    newSelected.delete(brandId);
    setSelectedBrands(newSelected);
    setShowMultiBrandNote(newSelected.size > 1);
    setAssetTypeInstructions(null);
    setShowErrorPopup(false);
  };

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
    setShowErrorPopup(false);
    
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
   * Handle brand selection toggle with validation
   * @param {string} brandId - Brand ID to toggle
   */
  const handleBrandToggle = (brandId) => {
    const brand = availableBrands.find(b => b.id === brandId);
    if (!brand) return;

    const isSelected = selectedBrands.has(brandId);
    const brandIsMulti = isMultiBrand(brand.name);
    const brandIsFOB = isFOBBrand(brand.name);

    console.log('handleBrandToggle:', {
      brandName: brand.name,
      isSelected,
      brandIsMulti,
      brandIsFOB
    });

    // If deselecting, just remove it
    if (isSelected) {
      const newSelected = new Set(selectedBrands);
      newSelected.delete(brandId);
      setSelectedBrands(newSelected);
      setShowMultiBrandNote(newSelected.size > 1);
      setAssetTypeInstructions(null);
      setShowErrorPopup(false);
      return;
    }

    // Trying to select a brand
    const hasOtherBrands = selectedBrands.size > 0;
    const hasMultiBrand = hasMultiBrandSelected();
    const hasFOB = hasFOBSelected();

    console.log('Selection validation:', {
      hasOtherBrands,
      hasMultiBrand,
      hasFOB,
      brandIsMulti,
      brandIsFOB
    });

    // Validation rules
    if (brandIsMulti && hasOtherBrands) {
      setErrorPopupMessage('Cannot mix single brands with multi-brand selections. Please deselect other brands first.');
      setShowErrorPopup(true);
      return;
    }

    if (brandIsFOB && hasOtherBrands && !hasFOB) {
      setErrorPopupMessage('Cannot mix FOB brands with non-FOB brands. Please deselect other brands first.');
      setShowErrorPopup(true);
      return;
    }

    if (!brandIsFOB && hasFOB) {
      setErrorPopupMessage('Cannot mix non-FOB brands with FOB brands. Please deselect FOB brands first.');
      setShowErrorPopup(true);
      return;
    }

    if ((brandIsMulti || brandIsFOB) && hasOtherBrands && !hasFOB && !hasMultiBrand) {
      setErrorPopupMessage('Cannot mix single brands with multi-brand or FOB selections. Please deselect other brands first.');
      setShowErrorPopup(true);
      return;
    }

    // If all validations pass, add the brand
    const newSelected = new Set(selectedBrands);
    newSelected.add(brandId);
    setSelectedBrands(newSelected);
    setShowMultiBrandNote(newSelected.size > 1);
    setAssetTypeInstructions(null);
  };

  /**
   * Close error popup
   */
  const closeErrorPopup = () => {
    setShowErrorPopup(false);
    setErrorPopupMessage('');
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
      
      const selectedBrandNames = Array.from(selectedBrands)
        .map(id => {
          const brand = availableBrands.find(b => b.id === id);
          return brand?.name;
        })
        .filter(Boolean);
      
      const assetTypeObj = assetTypes.find(at => at.id === selectedAssetType);
      const assetTypeName = assetTypeObj ? assetTypeObj.name : selectedAssetType;
      
      console.log('Selected brands:', selectedBrandNames);
      console.log('Selected asset type ID:', selectedAssetType);
      console.log('Selected asset type NAME:', assetTypeName);
      console.log('Selected country:', selectedCountry);
      
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
        console.error('Generation failed:', errorMsg);
      }
      
    } catch (error) {
      console.error('Error in handleGenerate:', error);
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
    
    if (brand.name.toLowerCase().includes('glendronach') && 
        brand.entity.toLowerCase().includes('benriach')) {
      return false;
    }
    
    const brandLower = brand.name.toLowerCase();
    const entityLower = brand.entity.toLowerCase();
    
    if (brandLower.includes(entityLower) || entityLower.includes(brandLower)) {
      return false;
    }
    
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
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #a2674f 1px, transparent 1px)`,
        backgroundSize: '32px 32px'
      }}></div>
      
      <div className="relative max-w-7xl mx-auto p-6">
        {/* Error Popup Modal */}
        {showErrorPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border-2 border-red-200 animate-scale-in">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Selection Not Allowed</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{errorPopupMessage}</p>
                </div>
                <button
                  onClick={closeErrorPopup}
                  className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeErrorPopup}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-slate-200 animate-slide-down relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#a2674f] to-transparent"></div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2 hover-lift">
                Legal Copy Generator
              </h1>
              <p className="text-slate-600">
                Generate legal copy for digital and traditional marketing materials across entire global portfolio
              </p>
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
          {/* Left Panel - Form */}
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
                        {filteredBrands.map((brand) => {
                          const disabled = isBrandDisabled(brand);
                          return (
                            <label
                              key={brand.id}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group border ${
                                disabled
                                  ? 'opacity-40 cursor-not-allowed bg-gray-50'
                                  : 'cursor-pointer hover:bg-gradient-to-r hover:from-[#a2674f]/5 hover:to-[#a2674f]/10 border-transparent hover:border-[#a2674f]/20 hover-lift-micro'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedBrands.has(brand.id)}
                                onChange={() => handleBrandToggle(brand.id)}
                                disabled={disabled}
                                className="w-4 h-4 text-[#a2674f] bg-gray-100 border-gray-300 rounded focus:ring-[#a2674f] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div className="flex-1">
                                <div className={`font-medium text-sm ${
                                  disabled
                                    ? 'text-gray-400'
                                    : 'text-gray-900 group-hover:text-[#a2674f]'
                                } transition-colors`}>
                                  {brand.name}
                                </div>
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
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 animate-fade-in">
                        <p>No brands found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Brands Chips - Inside Brand Selector Card */}
                  {selectedBrands.size > 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#a2674f] animate-pulse-soft"></div>
                          Selected: {selectedBrands.size} brand{selectedBrands.size !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getSelectedBrandObjects().map((brand) => (
                          <div
                            key={brand.id}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-3 py-2 text-sm animate-fade-in hover:border-blue-300 transition-all group"
                          >
                            <span className="font-medium text-slate-800 max-w-[200px] truncate" title={brand.name}>
                              {brand.name}
                            </span>
                            <button
                              onClick={() => handleRemoveSelectedBrand(brand.id)}
                              className="flex-shrink-0 w-5 h-5 rounded-full hover:bg-red-100 flex items-center justify-center transition-colors"
                              title="Remove brand"
                            >
                              <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 transition-colors" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedAssetType || !selectedCountry || selectedBrands.size === 0 || showErrorPopup}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl relative overflow-hidden group"
            >
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

          {/* Right Panel - Output */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-slate-200 hover-lift-subtle animate-slide-left relative overflow-hidden" id="generated-copy-section">
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

                  <button
                    onClick={() => handleCopyToClipboard(generatedCopy.plainText)}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group ${
                      justCopied 
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
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

            {assetTypeInstructions && generatedCopy && (
              <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-amber-200 hover-lift-subtle animate-fade-in relative overflow-hidden">
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

        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-sm animate-fade-in">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Development Status</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>All Brands in DB: {rawBrands.length}</div>
              <div>Brands for Selected Country: {availableBrands.length}</div>
              <div>Countries loaded: {countries.length}</div>
              <div>Asset Types loaded: {assetTypes.length}</div>
              <div>Template Service: Initialized</div>
              <div>Copy Generator: Ready</div>
              {selectedCountry && (
                <div className="mt-2 pt-2 border-t border-gray-300">
                  <div className="font-semibold">Selected Country: {selectedCountry}</div>
                  <div>Available Brands: {availableBrands.map(b => b.name).join(', ')}</div>
                </div>
              )}
            </div>
          </div>
        )}

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
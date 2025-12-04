// src/renderer/App.jsx
// Main Application Component - Legal Copy Generator Interface
// Handles UI, form state, and copy generation workflow

import React, { useState, useEffect } from 'react';
import { useExcelData } from './index';
import templateService from './services/templateService';
import { ChevronDown, Search, Check, Copy, AlertCircle, Info, X, XCircle, Moon, Sun } from 'lucide-react';

// ============================================
// FEATURE: Console Log Buffer (for Ctrl+Shift+L copy)
// ============================================
if (!window.__consoleBuffer) {
  window.__consoleBuffer = [];
  
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  const MAX_BUFFER_SIZE = 1000;
  
  console.log = function(...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    window.__consoleBuffer.push(`[${timestamp}] [LOG] ${message}`);
    
    if (window.__consoleBuffer.length > MAX_BUFFER_SIZE) {
      window.__consoleBuffer.shift();
    }
    
    originalLog.apply(console, args);
  };
  
  console.warn = function(...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    window.__consoleBuffer.push(`[${timestamp}] [WARN] ${message}`);
    
    if (window.__consoleBuffer.length > MAX_BUFFER_SIZE) {
      window.__consoleBuffer.shift();
    }
    
    originalWarn.apply(console, args);
  };
  
  console.error = function(...args) {
    const timestamp = new Date().toISOString();
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');
    
    window.__consoleBuffer.push(`[${timestamp}] [ERROR] ${message}`);
    
    if (window.__consoleBuffer.length > MAX_BUFFER_SIZE) {
      window.__consoleBuffer.shift();
    }
    
    originalError.apply(console, args);
  };
}

const App = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const excelContext = useExcelData();
  
  // DARK MODE STATE
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
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

  // DARK MODE PERSISTENCE
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // ============================================
  // FEATURE: Keyboard Shortcut for Console Log Copy (Ctrl+Shift+L)
  // ============================================
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        copyAllConsoleLogs();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // ============================================
  // FEATURE: Copy Console Logs Function
  // ============================================
  const copyAllConsoleLogs = () => {
    try {
      const logs = window.__consoleBuffer || [];
      const logText = logs.join('\n');
      
      navigator.clipboard.writeText(logText).then(() => {
        alert(`✅ Console logs copied to clipboard!\n\n${logs.length} log entries copied.\n\nPress Ctrl+V to paste.`);
      }).catch(err => {
        console.error('Failed to copy logs:', err);
        alert('❌ Failed to copy logs to clipboard. Please check console for details.');
      });
    } catch (error) {
      console.error('Error copying console logs:', error);
      alert('❌ Error copying logs. See console for details.');
    }
  };

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

  // ============================================
  // FEATURE: Clear All Selection Handler
  // ============================================
  const handleClearAll = () => {
    console.log('Clear All: Resetting all selections');
    
    // Clear selected brands
    setSelectedBrands(new Set());
    
    // Clear generated copy
    setGeneratedCopy(null);
    
    // Clear search query
    setSearchQuery('');
    
    // Clear any errors
    setCopyError(null);
    setShowErrorPopup(false);
    
    // Clear instructions
    setAssetTypeInstructions(null);
    
    console.log('Clear All: Complete');
  };

  /**
   * Handle copy generation
   * Validates inputs, calls templateService, and displays results
   * NEW FEATURE: Combines Asset Type Instructions with Country Specific instructions
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
      
      // ============================================
      // NEW FEATURE: Fetch Asset Type Instructions + Country Specific Instructions
      // ============================================
      const trademarkConfig = excelContext.rawData?.['Trademark Config'] || [];
      const assetTypeRow = trademarkConfig.find(row => 
        row['Asset Type'] === assetTypeName
      );
      
      // Get Asset Type Instructions
      let combinedInstructions = '';
      
      if (assetTypeRow && assetTypeRow['Asset Type Instructions']) {
        combinedInstructions = assetTypeRow['Asset Type Instructions'];
        console.log('Found Asset Type Instructions for:', assetTypeName);
      } else {
        console.log('No Asset Type Instructions found for:', assetTypeName);
      }
      
      // Add Country Specific instructions if available from CountryLanguage sheet Column D
      const countryLanguageSheet = excelContext.rawData?.['CountryLanguage'] || [];
      const countryData = countryLanguageSheet.find(row => 
        row['Abbv'] === selectedCountry || 
        row['Country Code'] === selectedCountry ||
        row['CountryCode'] === selectedCountry
      );
      
      if (countryData && countryData['Country Specific']) {
        // Extract the actual string value from the cell (handles both strings and rich text objects)
        let countrySpecificText = countryData['Country Specific'];
        
        // If it's an object (rich text), extract the text property
        if (typeof countrySpecificText === 'object' && countrySpecificText !== null) {
          if (countrySpecificText.text) {
            countrySpecificText = countrySpecificText.text;
          } else if (countrySpecificText.richText) {
            // Handle rich text array
            countrySpecificText = countrySpecificText.richText.map(rt => rt.text || '').join('');
          } else {
            // Fallback: try to stringify
            countrySpecificText = String(countrySpecificText);
          }
        }
        
        // Convert to string if it's not already
        countrySpecificText = String(countrySpecificText || '');
        
        // Only use if it's not empty and not "None"
        if (countrySpecificText && countrySpecificText.trim() !== '' && countrySpecificText.trim() !== 'None') {
          if (combinedInstructions) {
            // If we have asset type instructions, add country specific after it with spacing
            combinedInstructions += '<br><br>' + countrySpecificText;
          } else {
            // If no asset type instructions, just use country specific
            combinedInstructions = countrySpecificText;
          }
          console.log('Added Country Specific instructions for:', selectedCountry);
        }
      }
      
      // Set the combined instructions
      if (combinedInstructions) {
        setAssetTypeInstructions(combinedInstructions);
        console.log('Total instructions set (Asset Type + Country Specific)');
      } else {
        setAssetTypeInstructions(null);
        console.log('No instructions to display');
      }
      // ============================================
      
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
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-slate-50 to-orange-50/30'
    }`}>
      <div className={`absolute inset-0 opacity-[0.02] ${isDarkMode ? 'opacity-[0.05]' : ''}`} style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #a2674f 1px, transparent 1px)`,
        backgroundSize: '32px 32px'
      }}></div>
      
      <div className="relative max-w-7xl mx-auto p-6">
        {/* Error Popup Modal */}
        {showErrorPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className={`rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border-2 border-red-200 animate-scale-in ${
              isDarkMode ? 'bg-slate-800' : 'bg-white'
            }`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Selection Not Allowed</h3>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{errorPopupMessage}</p>
                </div>
                <button
                  onClick={closeErrorPopup}
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                  }`}
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
        <div className={`rounded-2xl shadow-xl p-8 mb-6 border animate-slide-down relative overflow-hidden transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#a2674f] to-transparent"></div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold mb-2 hover-lift transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Legal Copy Generator
              </h1>
              <p className={`transition-colors duration-300 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Generate legal copy for digital and traditional marketing materials across entire global portfolio
              </p>
            </div>
            <div className="text-right flex items-center gap-4">
              <div>
                <div className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Data Status</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${rawBrands.length > 0 ? 'bg-green-500 animate-pulse-soft' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium transition-colors duration-300 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                    {rawBrands.length} Total Brands | {countries.length} Countries | {assetTypes.length} Asset Types
                  </span>
                </div>
              </div>
              {/* DARK MODE TOGGLE */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-lg transition-all duration-300 hover:scale-110 ${
                  isDarkMode
                    ? 'bg-slate-700 hover:bg-slate-600 text-yellow-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Asset Type Selector */}
            <div className={`rounded-2xl shadow-lg p-6 border hover-lift-subtle animate-slide-right transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-200'
            }`}>
              <label className={`block text-sm font-semibold mb-3 flex items-center gap-2 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>
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
                  className={`w-full px-4 py-3 pr-10 border-2 rounded-xl focus:border-[#a2674f] focus:ring-4 focus:ring-[#a2674f]/10 outline-none transition-all appearance-none font-medium cursor-pointer hover:border-[#a2674f]/50 hover:shadow-md ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-200 text-slate-900'
                  }`}
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
            <div className={`rounded-2xl shadow-lg p-6 border hover-lift-subtle animate-slide-right transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-200'
            }`} style={{ animationDelay: '0.1s' }}>
              <label className={`block text-sm font-semibold mb-3 flex items-center gap-2 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#a2674f] animate-pulse-soft" style={{ animationDelay: '0.5s' }}></div>
                Please select the Country*
              </label>
              <div className="relative group">
                <select
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl appearance-none focus:ring-4 focus:ring-[#a2674f]/10 focus:border-[#a2674f] transition-all duration-200 hover:border-[#a2674f]/50 hover:shadow-md ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white'
                      : 'bg-white border-slate-200 text-gray-900'
                  }`}
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
            <div className={`rounded-2xl shadow-lg p-6 border hover-lift-subtle animate-slide-right transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-200'
            }`} style={{ animationDelay: '0.2s' }}>
              <label className={`block text-sm font-semibold mb-3 flex items-center gap-2 transition-colors duration-300 ${
                isDarkMode ? 'text-slate-200' : 'text-slate-700'
              }`}>
                <div className="w-1.5 h-1.5 rounded-full bg-[#a2674f] animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
                Please select the Brands (Check all that apply)*
              </label>
              
              {!selectedCountry && (
                <div className={`border rounded-lg p-4 mb-4 animate-fade-in ${
                  isDarkMode 
                    ? 'bg-blue-900/30 border-blue-700' 
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <p className={`text-sm flex items-center gap-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                    <Info size={16} />
                    Please select a country first to see available brands
                  </p>
                </div>
              )}
              
              {selectedCountry && availableBrands.length > 0 && (
                <div className={`border rounded-lg p-3 mb-4 animate-fade-in ${
                  isDarkMode 
                    ? 'bg-green-900/30 border-green-700' 
                    : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                }`}>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                    {availableBrands.length} brand{availableBrands.length !== 1 ? 's' : ''} available in {countries.find(c => c.code === selectedCountry)?.name} (sorted A-Z)
                  </p>
                </div>
              )}
              
              {selectedCountry && (
                <>
                  <div className="relative mb-4 group">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors group-hover:text-[#a2674f] ${
                      isDarkMode ? 'text-slate-400' : 'text-gray-400'
                    }`} size={18} />
                    <input
                      type="text"
                      placeholder="Search brands..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-4 focus:ring-[#a2674f]/10 focus:border-[#a2674f] transition-all duration-200 hover:border-[#a2674f]/50 ${
                        isDarkMode
                          ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                          : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
                      }`}
                    />
                  </div>

                  <div className={`border-2 rounded-lg p-4 max-h-80 overflow-y-auto custom-scrollbar ${
                    isDarkMode 
                      ? 'border-slate-600 bg-slate-900/50' 
                      : 'border-gray-300 bg-white'
                  }`}>
                    {filteredBrands.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredBrands.map((brand) => {
                          const disabled = isBrandDisabled(brand);
                          return (
                            <label
                              key={brand.id}
                              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 group border ${
                                disabled
                                  ? 'opacity-40 cursor-not-allowed'
                                  : isDarkMode
                                    ? 'cursor-pointer hover:bg-slate-700 border-transparent hover:border-[#a2674f]/20 hover-lift-micro'
                                    : 'cursor-pointer hover:bg-gradient-to-r hover:from-[#a2674f]/5 hover:to-[#a2674f]/10 border-transparent hover:border-[#a2674f]/20 hover-lift-micro'
                              } ${disabled && isDarkMode ? 'bg-slate-800' : disabled ? 'bg-gray-50' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedBrands.has(brand.id)}
                                onChange={() => handleBrandToggle(brand.id)}
                                disabled={disabled}
                                className="w-4 h-4 text-[#a2674f] bg-gray-100 border-gray-300 rounded focus:ring-[#a2674f] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <div className="flex-1">
                                <div className={`font-medium text-sm transition-colors ${
                                  disabled
                                    ? isDarkMode ? 'text-slate-500' : 'text-gray-400'
                                    : isDarkMode ? 'text-slate-200 group-hover:text-[#a2674f]' : 'text-gray-900 group-hover:text-[#a2674f]'
                                }`}>
                                  {brand.name}
                                </div>
                                {shouldShowEntity(brand) && (
                                  <div className={`text-xs italic mt-0.5 ${
                                    isDarkMode ? 'text-slate-400' : 'text-gray-500'
                                  }`}>
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
                      <div className={`text-center py-8 animate-fade-in ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        <p>No brands found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Brands Chips - Inside Brand Selector Card */}
                  {selectedBrands.size > 0 && (
                    <div className={`mt-4 pt-4 border-t-2 ${isDarkMode ? 'border-slate-600' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`text-sm font-semibold flex items-center gap-2 transition-colors duration-300 ${
                          isDarkMode ? 'text-slate-200' : 'text-gray-700'
                        }`}>
                          <div className="w-2 h-2 rounded-full bg-[#a2674f] animate-pulse-soft"></div>
                          Selected: {selectedBrands.size} brand{selectedBrands.size !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getSelectedBrandObjects().map((brand) => (
                          <div
                            key={brand.id}
                            className={`inline-flex items-center gap-2 border rounded-lg px-3 py-2 text-sm animate-fade-in transition-all group ${
                              isDarkMode
                                ? 'bg-blue-900/30 border-blue-700 hover:border-blue-600'
                                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300'
                            }`}
                          >
                            <span className={`font-medium max-w-[200px] truncate transition-colors duration-300 ${
                              isDarkMode ? 'text-slate-200' : 'text-slate-800'
                            }`} title={brand.name}>
                              {brand.name}
                            </span>
                            <button
                              onClick={() => handleRemoveSelectedBrand(brand.id)}
                              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                                isDarkMode ? 'hover:bg-red-900/50' : 'hover:bg-red-100'
                              }`}
                              title="Remove brand"
                            >
                              <X className={`w-3.5 h-3.5 transition-colors ${
                                isDarkMode 
                                  ? 'text-slate-400 group-hover:text-red-400' 
                                  : 'text-slate-400 group-hover:text-red-600'
                              }`} />
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
            <div className={`rounded-2xl shadow-lg p-6 border-2 hover-lift-subtle animate-slide-left relative overflow-hidden transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-slate-200'
            }`} id="generated-copy-section">
              <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full ${
                isDarkMode 
                  ? 'bg-gradient-to-br from-[#a2674f]/20 to-transparent' 
                  : 'bg-gradient-to-br from-[#a2674f]/10 to-transparent'
              }`}></div>
              
              <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#a2674f] to-[#8b5a42] rounded-full animate-pulse-soft"></div>
                Generated Copy
              </h2>

              {copyError && (
                <div className={`mb-4 p-4 border-2 border-red-200 rounded-lg animate-shake ${
                  isDarkMode ? 'bg-red-900/30' : 'bg-red-50'
                }`}>
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
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-float ${
                    isDarkMode 
                      ? 'bg-gradient-to-br from-slate-700 to-slate-800' 
                      : 'bg-gradient-to-br from-slate-100 to-slate-200'
                  }`}>
                    <AlertCircle className={`w-8 h-8 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                  </div>
                  <p className={`text-sm transition-colors duration-300 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    No copy generated yet. Fill in the form and click Generate.
                  </p>
                </div>
              ) : generatedCopy ? (
                <div className="space-y-4 animate-fade-in">
                  <div className={`rounded-lg p-4 space-y-2 text-sm border transition-colors duration-300 ${
                    isDarkMode 
                      ? 'bg-slate-900/50 border-[#a2674f]/20' 
                      : 'bg-gradient-to-br from-slate-50 to-[#a2674f]/5 border-[#a2674f]/10'
                  }`}>
                    <div className={`flex justify-between items-center p-1 rounded transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-white/50'
                    }`}>
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Asset Type:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{generatedCopy.metadata.assetType}</span>
                    </div>
                    <div className={`flex justify-between items-center p-1 rounded transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-white/50'
                    }`}>
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Country:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{generatedCopy.metadata.countryCode}</span>
                    </div>
                    <div className={`flex justify-between items-center p-1 rounded transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-white/50'
                    }`}>
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Language:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{generatedCopy.metadata.language}</span>
                    </div>
                    <div className={`flex justify-between items-center p-1 rounded transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-white/50'
                    }`}>
                      <span className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Brands:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{generatedCopy.metadata.brandCount}</span>
                    </div>
                  </div>

                  <div className={`border-2 rounded-lg p-4 max-h-96 overflow-y-auto custom-scrollbar transition-colors duration-300 ${
                    isDarkMode 
                      ? 'border-slate-600 hover:border-slate-500' 
                      : 'border-[#a2674f]/20 hover:border-[#a2674f]/40'
                  }`}>
                    <div 
                      className={`text-sm generated-legal-copy transition-colors duration-300 ${
                        isDarkMode ? 'text-slate-200' : 'text-slate-700'
                      }`}
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

                  {/* FEATURE: Clear All Button - Added below Copy to Clipboard */}
                  <button
                    onClick={handleClearAll}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-lg transition-all border-2 transform hover:scale-[1.02] active:scale-[0.98] ${
                      isDarkMode
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600 hover:border-slate-500'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Clear All Selection
                  </button>
                </div>
              ) : null}
            </div>

            {/* NEW FEATURE: Asset Type Instructions + Country Specific Instructions Combined Card */}
            {assetTypeInstructions && generatedCopy && (
              <div className={`mt-6 rounded-2xl shadow-lg p-6 border-2 hover-lift-subtle animate-fade-in relative overflow-hidden transition-colors duration-300 ${
                isDarkMode 
                  ? 'bg-amber-900/20 border-amber-700' 
                  : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
              }`}>
                <div className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-amber-500/20 to-transparent' 
                    : 'bg-gradient-to-br from-amber-300/20 to-transparent'
                }`}></div>
                
                <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 transition-colors duration-300 ${
                  isDarkMode ? 'text-amber-400' : 'text-amber-900'
                }`}>
                  <div className="w-1.5 h-6 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full animate-pulse-soft"></div>
                  Asset Type Instructions
                </h2>

                <div 
                  className={`text-sm leading-relaxed transition-colors duration-300 ${
                    isDarkMode ? 'text-amber-200' : 'text-amber-900'
                  }`}
                  dangerouslySetInnerHTML={{ __html: assetTypeInstructions }}
                />
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 pb-6 text-center animate-fade-in">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full shadow-lg border-2 transition-all hover-lift-subtle duration-300 ${
            isDarkMode 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-[#a2674f]/20 hover:border-[#a2674f]/40'
          }`}>
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#a2674f] to-[#8b5a42] animate-pulse-soft"></div>
            <span className={`text-sm font-medium transition-colors duration-300 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-700'
            }`}>
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
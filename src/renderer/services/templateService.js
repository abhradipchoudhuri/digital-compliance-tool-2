// src/renderer/services/templateService.js
// Template Service - Manages copy templates and generation workflow

import copyGenerator from './copyGenerator';
import excelService from './excelService';

class TemplateService {
  constructor() {
    this.isInitialized = false;
    this.excelData = null;
  }

  /**
   * Initialize service with Excel data
   * @param {Object} excelData - Parsed Excel data from all sheets
   * @returns {Promise<Object>} Result object with success status
   */
  async initialize(excelData) {
    try {
      if (!excelData) {
        throw new Error('Excel data is required for initialization');
      }

      console.log('TemplateService: Initializing with Excel data');
      console.log('TemplateService: Available sheets:', Object.keys(excelData));
      
      this.excelData = excelData;
      
      // Initialize copy generator with Excel data and excelService reference
      console.log('TemplateService: Passing data to copyGenerator');
      copyGenerator.initialize(excelData, excelService);
      
      this.isInitialized = true;
      console.log('TemplateService: Initialization complete');
      
      return { success: true };
    } catch (error) {
      console.error('TemplateService: Initialization error:', error);
      this.isInitialized = false;
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Generate compliance copy based on provided parameters
   * @param {Object} params - Generation parameters (assetType, countryCode, brandIds)
   * @returns {Promise<Object>} Result object with generated copy and metadata
   */
  async generateCopy(params) {
    try {
      if (!this.isInitialized) {
        throw new Error('TemplateService not initialized. Load Excel data first.');
      }

      console.log('TemplateService: Generating copy with params:', params);

      // Validate parameters
      this.validateGenerationParams(params);

      // Use copy generator to create the copy
      const result = copyGenerator.generateCopy(params);

      if (!result.success) {
        throw new Error(result.error || 'Copy generation failed');
      }

      console.log('TemplateService: Copy generated successfully');

      return {
        success: true,
        result: {
          copy: result.copy,
          metadata: result.metadata
        }
      };

    } catch (error) {
      console.error('TemplateService: Generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate generation parameters
   * @param {Object} params - Parameters to validate
   * @returns {boolean} True if valid
   * @throws {Error} If validation fails
   */
  validateGenerationParams(params) {
    if (!params) {
      throw new Error('Generation parameters are required');
    }

    const { assetType, countryCode, brandIds } = params;

    if (!assetType) {
      throw new Error('Asset type is required');
    }

    if (!countryCode) {
      throw new Error('Country code is required');
    }

    if (!brandIds || !Array.isArray(brandIds) || brandIds.length === 0) {
      throw new Error('At least one brand must be selected');
    }

    return true;
  }

  /**
   * Get all available templates (asset types)
   * @returns {Array<Object>} Array of template objects with asset type and display name
   */
  getAvailableTemplates() {
    if (!this.isInitialized) {
      console.warn('TemplateService: Not initialized, returning empty templates');
      return [];
    }

    return copyGenerator.getAvailableAssetTypes().map(assetType => ({
      assetType,
      displayName: this.formatAssetTypeName(assetType)
    }));
  }

  /**
   * Get template structure for a specific asset type
   * @param {string} assetType - Asset type name
   * @param {string} countryCode - Country code (default: 'US')
   * @returns {Object|null} Template object or null if not found
   */
  getTemplate(assetType, countryCode = 'US') {
    if (!this.isInitialized) {
      console.warn('TemplateService: Not initialized, cannot get template');
      return null;
    }

    return copyGenerator.getAssetTemplate(assetType);
  }

  /**
   * Get all available countries
   * @returns {Array<Object>} Array of country objects
   */
  getAvailableCountries() {
    if (!this.isInitialized) {
      console.warn('TemplateService: Not initialized, returning empty countries');
      return [];
    }

    return copyGenerator.getAvailableCountries();
  }

  /**
   * Get all available brands with trademark data
   * @returns {Array<Object>} Array of brand objects
   */
  getAvailableBrands() {
    if (!this.isInitialized || !this.excelData) {
      console.warn('TemplateService: Not initialized, returning empty brands');
      return [];
    }

    return copyGenerator.getAvailableBrands();
  }

  /**
   * Get compliance rules for a specific country
   * @param {string} countryCode - Country code to look up
   * @returns {Object|null} Compliance rules object or null if not found
   */
  getComplianceRules(countryCode) {
    if (!this.isInitialized || !this.excelData) {
      return null;
    }

    const complianceRules = this.excelData['Compliance Rules'] || [];
    
    return complianceRules.find(rule => 
      rule['Country Code'] === countryCode
    );
  }

  /**
   * Format asset type name for cleaner display
   * Removes category prefixes like "Digital |" or "Traditional |"
   * @param {string} assetType - Full asset type name
   * @returns {string} Formatted asset type name
   */
  formatAssetTypeName(assetType) {
    return assetType
      .replace(/^(Digital|Traditional)\s*\|\s*/i, '')
      .trim();
  }

  /**
   * Check if service is ready for copy generation
   * @returns {boolean} True if service is initialized and ready
   */
  isReady() {
    const ready = this.isInitialized && copyGenerator.isReady();
    console.log('TemplateService: isReady?', ready);
    return ready;
  }

  /**
   * Reset service to uninitialized state
   */
  reset() {
    this.isInitialized = false;
    this.excelData = null;
    console.log('TemplateService: Service reset');
  }

  /**
   * Get current initialization status for debugging
   * @returns {Object} Status object with initialization details
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasExcelData: !!this.excelData,
      copyGeneratorReady: copyGenerator.isReady(),
      availableSheets: this.excelData ? Object.keys(this.excelData) : []
    };
  }
}

const templateService = new TemplateService();
export default templateService;
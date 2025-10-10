// src/renderer/services/templateService.js
// Template Service - Manages copy templates and generation

import copyGenerator from './copyGenerator';

class TemplateService {
  constructor() {
    this.isInitialized = false;
    this.excelData = null;
  }

  /**
   * Initialize service with Excel data
   */
  async initialize(excelData) {
    try {
      if (!excelData) {
        throw new Error('Excel data is required for initialization');
      }

      console.log('TemplateService: Initializing with Excel data...');
      
      this.excelData = excelData;
      
      // Initialize copy generator with Excel data
      copyGenerator.initialize(excelData);
      
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
   * Generate compliance copy
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
   * Get available templates
   */
  getAvailableTemplates() {
    if (!this.isInitialized) {
      return [];
    }

    return copyGenerator.getAvailableAssetTypes().map(assetType => ({
      assetType,
      displayName: this.formatAssetTypeName(assetType)
    }));
  }

  /**
   * Get template for specific asset type
   */
  getTemplate(assetType, countryCode = 'US') {
    if (!this.isInitialized) {
      return null;
    }

    return copyGenerator.getTemplate(assetType, countryCode);
  }

  /**
   * Get available countries
   */
  getAvailableCountries() {
    if (!this.isInitialized) {
      return [];
    }

    return copyGenerator.getAvailableCountries();
  }

  /**
   * Get brands that have trademark data
   */
  getAvailableBrands() {
    if (!this.isInitialized || !this.excelData) {
      return [];
    }

    const brandMaster = this.excelData['Brand Master'] || [];
    
    return brandMaster.map(brand => ({
      id: brand['Brand ID'],
      name: brand['Brand Name'],
      category: brand['Category'] || 'Uncategorized',
      status: brand['Status'] || 'Active'
    })).filter(brand => brand.status === 'Active');
  }

  /**
   * Get compliance rules for a country
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
   * Format asset type name for display
   */
  formatAssetTypeName(assetType) {
    return assetType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Check if service is ready
   */
  isReady() {
    return this.isInitialized && copyGenerator.isReady();
  }

  /**
   * Reset service
   */
  reset() {
    this.isInitialized = false;
    this.excelData = null;
    console.log('TemplateService: Service reset');
  }
}

// Export singleton instance
const templateService = new TemplateService();
export default templateService;
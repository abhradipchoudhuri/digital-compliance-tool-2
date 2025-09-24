// src/renderer/services/excelService.js
// Enhanced Excel Service for Template Engine (Artifact 6)

export class ExcelService {
  constructor() {
    this.isLoaded = false;
    this.data = null;
    this.cache = new Map(); // Add caching for performance
  }

  async loadData() {
    try {
      console.log('ExcelService: Loading data via Electron API...');
      
      // Use Electron IPC to load Excel file
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const result = await window.electronAPI.loadExcelData();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Store the actual parsed data when available
      // For now, create enhanced structure with sample data for template engine
      this.data = result.data || {
        'Trademark Config': [
          {
            Brand: 'Jack Daniels',
            Entity: 'Brown-Forman',
            AssetType: 'Website',
            Instructions: 'Use full trademark notation'
          }
        ],
        'CountryLanguage': [
          {
            Country: 'US',
            CountryCode: 'US',
            Language: 'English',
            MarketSpecific: 'Standard US regulations'
          }
        ],
        'Trademark Language': [
          {
            Country: 'US',
            RegisteredLanguage: '®',
            ReserveLanguage: '™',
            StructureType: 'Full'
          }
        ],
        'Trademark Structure': [
          {
            Type: 'Full',
            Template: '{BRAND_NAME}{TRADEMARK} {COMPLIANCE_TEXT}',
            CharacterLimit: null
          },
          {
            Type: 'Tightened',
            Template: '{BRAND_NAME}{TRADEMARK}',
            CharacterLimit: 50
          }
        ],
        'Language Dependent Variables': [
          {
            Country: 'US',
            ResponsibilityLanguage: 'Please drink responsibly.',
            ForwardNotice: 'Must be 21+ to view this content.'
          }
        ],
        'Overall Structure': [
          {
            AssetType: 'Website',
            TemplateStructure: 'Full',
            RequiredElements: ['Brand', 'Trademark', 'Compliance']
          }
        ],
        'Help Text': [
          {
            Section: 'General',
            Content: '<p>Select your asset type, country, and brands to generate compliant copy.</p>'
          }
        ]
      };
      
      this.isLoaded = true;
      this.cache.clear(); // Clear cache on reload

      console.log('ExcelService: Enhanced data structure loaded');

      return {
        success: true,
        data: this.data
      };
    } catch (error) {
      console.error('ExcelService: Error loading data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  isDataLoaded() {
    return this.isLoaded;
  }

  getData() {
    return this.data;
  }

  // Enhanced helper methods for template engine
  getBrands() {
    if (!this.isLoaded) return [];
    
    const cacheKey = 'brands';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const brands = this.data['Trademark Config']?.map(item => ({
      id: item.Brand,
      name: item.Brand,
      entity: item.Entity
    })) || [];
    
    this.cache.set(cacheKey, brands);
    return brands;
  }

  getCountries() {
    if (!this.isLoaded) return [];
    
    const cacheKey = 'countries';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const countries = this.data['CountryLanguage']?.map(item => ({
      code: item.CountryCode,
      name: item.Country,
      language: item.Language
    })) || [];
    
    this.cache.set(cacheKey, countries);
    return countries;
  }

  getAssetTypes() {
    if (!this.isLoaded) return [];
    
    const cacheKey = 'assetTypes';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const assetTypes = [...new Set(
      this.data['Overall Structure']?.map(item => item.AssetType) || []
    )];
    
    this.cache.set(cacheKey, assetTypes);
    return assetTypes;
  }

  // Template Engine specific methods
  getBrandById(id) {
    return this.getBrands().find(brand => brand.id === id) || null;
  }

  getCountryById(code) {
    return this.getCountries().find(country => country.code === code) || null;
  }

  getAssetTypeByName(name) {
    return this.getAssetTypes().find(type => type === name) || null;
  }

  searchBrands(query) {
    if (!query) return this.getBrands();
    
    const lowercaseQuery = query.toLowerCase();
    return this.getBrands().filter(brand => 
      brand.name.toLowerCase().includes(lowercaseQuery) ||
      brand.entity.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Template Engine core methods
  getTemplateStructureByAssetType(assetType) {
    if (!this.isLoaded) return null;
    
    const overallStructure = this.data['Overall Structure']?.find(
      item => item.AssetType === assetType
    );
    
    if (!overallStructure) return null;
    
    const templateStructure = this.data['Trademark Structure']?.find(
      item => item.Type === overallStructure.TemplateStructure
    );
    
    return templateStructure || null;
  }

  getLanguageVariablesByCountry(countryCode) {
    if (!this.isLoaded) return null;
    
    return this.data['Language Dependent Variables']?.find(
      item => item.Country === countryCode
    ) || null;
  }

  getTrademarkLanguageByCountry(countryCode, structureType = 'Full') {
    if (!this.isLoaded) return null;
    
    return this.data['Trademark Language']?.find(
      item => item.Country === countryCode && item.StructureType === structureType
    ) || null;
  }

  getTemplateStructure(assetType) {
    return this.getTemplateStructureByAssetType(assetType);
  }

  getLanguageVariables(countryCode) {
    return this.getLanguageVariablesByCountry(countryCode);
  }

  getTrademarkStructure(type) {
    if (!this.isLoaded) return null;
    
    return this.data['Trademark Structure']?.find(
      item => item.Type === type
    ) || null;
  }

  getHelpText(section = 'General') {
    if (!this.isLoaded) return '';
    
    const helpItem = this.data['Help Text']?.find(
      item => item.Section === section
    );
    
    return helpItem?.Content || '';
  }

  getRawData() {
    return this.data;
  }

  async reload() {
    this.isLoaded = false;
    this.data = null;
    this.cache.clear();
    return await this.loadData();
  }

  // Additional utility methods for template engine
  validateDataIntegrity() {
    if (!this.isLoaded) return { valid: false, errors: ['Data not loaded'] };
    
    const errors = [];
    const requiredSheets = [
      'Trademark Config', 'CountryLanguage', 'Trademark Language',
      'Trademark Structure', 'Language Dependent Variables', 
      'Overall Structure', 'Help Text'
    ];
    
    requiredSheets.forEach(sheet => {
      if (!this.data[sheet] || !Array.isArray(this.data[sheet])) {
        errors.push(`Missing or invalid sheet: ${sheet}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  clearCache() {
    this.cache.clear();
  }
}

// Create and export default instance
const excelService = new ExcelService();
export default excelService;
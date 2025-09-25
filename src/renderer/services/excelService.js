// src/renderer/services/excelService.js
// Excel Service - Loads and processes real Excel data from Electron main process

export class ExcelService {
  constructor() {
    this.isLoaded = false;
    this.data = null;
    this.metadata = null;
  }

  async loadData() {
    try {
      console.log('ExcelService: Starting Excel data load...');
      
      // Check if Electron API is available
      if (!window.electronAPI) {
        throw new Error('Electron API not available - running outside Electron environment');
      }

      // Call IPC handler to load Excel data
      const result = await window.electronAPI.loadExcelData();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load Excel data');
      }

      // Store the parsed data (already in object format from main.js)
      this.data = result.data;
      this.metadata = {
        filePath: result.filePath,
        sheetCount: result.sheetCount,
        summary: result.summary || [],
        loadedAt: new Date().toISOString()
      };
      this.isLoaded = true;

      // Log successful load
      console.log('✅ ExcelService: Excel data loaded successfully!');
      console.log('📊 Available sheets:', Object.keys(this.data));
      console.log('📈 Sheet summary:');
      Object.keys(this.data).forEach(sheetName => {
        const rowCount = this.data[sheetName].length;
        console.log(`   - ${sheetName}: ${rowCount} rows`);
        if (rowCount > 0) {
          console.log(`     Sample columns:`, Object.keys(this.data[sheetName][0]));
        }
      });

      return {
        success: true,
        data: this.data,
        metadata: this.metadata
      };

    } catch (error) {
      console.error('❌ ExcelService: Error loading data:', error);
      
      // Clear any partial data
      this.data = null;
      this.metadata = null;
      this.isLoaded = false;
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if data is loaded
  isDataLoaded() {
    return this.isLoaded && this.data !== null;
  }

  // Get all data
  getData() {
    return this.data;
  }

  // Get raw data (alias for getData)
  getRawData() {
    return this.data;
  }

  // Get metadata about loaded file
  getMetadata() {
    return this.metadata;
  }

  // ============================================
  // PROCESSED DATA ACCESSORS
  // ============================================

  /**
   * Get list of brands from Trademark Config sheet
   * Filters rows where Type === 'Brand'
   */
  getBrands() {
    if (!this.data || !this.data['Trademark Config']) {
      console.warn('⚠️ Trademark Config sheet not found');
      return [];
    }
    
    const brands = this.data['Trademark Config']
      .filter(row => row.Type === 'Brand')
      .map(row => ({
        id: row.ID || row.Id || '',
        name: row.Name || '',
        entity: row.Entity || '',
        category: row.Category || 'Spirits',
        instructions: row.Instructions || ''
      }));
    
    console.log(`📋 getBrands(): Found ${brands.length} brands`);
    return brands;
  }

  /**
   * Get list of asset types from Trademark Config sheet
   * Filters rows where Type === 'Asset Type'
   */
  getAssetTypes() {
    if (!this.data || !this.data['Trademark Config']) {
      console.warn('⚠️ Trademark Config sheet not found');
      return [];
    }
    
    const assetTypes = this.data['Trademark Config']
      .filter(row => row.Type === 'Asset Type')
      .map(row => ({
        id: row.ID || row.Id || '',
        name: row.Name || '',
        description: row.Description || '',
        instructions: row.Instructions || ''
      }));
    
    console.log(`📋 getAssetTypes(): Found ${assetTypes.length} asset types`);
    return assetTypes;
  }

  /**
   * Get list of countries from CountryLanguage sheet
   * Returns unique countries with their default language
   */
  getCountries() {
    if (!this.data || !this.data['CountryLanguage']) {
      console.warn('⚠️ CountryLanguage sheet not found');
      return [];
    }
    
    // Use Map to get unique countries by country code
    const uniqueCountries = new Map();
    
    this.data['CountryLanguage'].forEach(row => {
      const code = row.CountryCode || row['Country Code'];
      if (code && !uniqueCountries.has(code)) {
        uniqueCountries.set(code, {
          code: code,
          name: row.CountryName || row['Country Name'] || code,
          language: row.Language || 'English',
          region: row.Region || ''
        });
      }
    });
    
    const countries = Array.from(uniqueCountries.values());
    console.log(`📋 getCountries(): Found ${countries.length} unique countries`);
    return countries;
  }

  /**
   * Get all languages available for a specific country
   */
  getCountryLanguages(countryCode) {
    if (!this.data || !this.data['CountryLanguage']) return [];
    
    return this.data['CountryLanguage']
      .filter(row => (row.CountryCode || row['Country Code']) === countryCode)
      .map(row => ({
        language: row.Language || 'English',
        countryName: row.CountryName || row['Country Name'] || countryCode
      }));
  }

  /**
   * Get trademark language data for specific language
   */
  getTrademarkLanguage(language) {
    if (!this.data || !this.data['Trademark Language']) return [];
    
    return this.data['Trademark Language'].filter(
      row => row.Language === language
    );
  }

  /**
   * Get trademark structure data
   */
  getTrademarkStructure(type = null) {
    if (!this.data || !this.data['Trademark Structure']) return [];
    
    if (type) {
      return this.data['Trademark Structure'].filter(
        row => row.Type === type
      );
    }
    
    return this.data['Trademark Structure'];
  }

  /**
   * Get language dependent variables for a specific language
   */
  getLanguageVariables(language) {
    if (!this.data || !this.data['Language Dependent Variables']) return [];
    
    return this.data['Language Dependent Variables'].filter(
      row => row.Language === language
    );
  }

  /**
   * Get overall structure for an asset type
   */
  getOverallStructure(assetType = null) {
    if (!this.data || !this.data['Overall Structure']) return [];
    
    if (assetType) {
      return this.data['Overall Structure'].filter(
        row => row['Asset Type'] === assetType || row.AssetType === assetType
      );
    }
    
    return this.data['Overall Structure'];
  }

  /**
   * Get help text
   */
  getHelpText() {
    if (!this.data || !this.data['Help Text'] || this.data['Help Text'].length === 0) {
      return '';
    }
    
    // Return the help text from first row
    const helpRow = this.data['Help Text'][0];
    return helpRow.HelpText || helpRow['Help Text'] || '';
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Get brand by ID
   */
  getBrandById(id) {
    const brands = this.getBrands();
    return brands.find(brand => brand.id === id) || null;
  }

  /**
   * Get country by code
   */
  getCountryByCode(code) {
    const countries = this.getCountries();
    return countries.find(country => country.code === code) || null;
  }

  /**
   * Get asset type by name or ID
   */
  getAssetTypeByName(nameOrId) {
    const assetTypes = this.getAssetTypes();
    return assetTypes.find(
      type => type.name === nameOrId || type.id === nameOrId
    ) || null;
  }

  /**
   * Search brands by query string
   */
  searchBrands(query) {
    const brands = this.getBrands();
    if (!query) return brands;
    
    const lowerQuery = query.toLowerCase();
    return brands.filter(brand => 
      brand.name?.toLowerCase().includes(lowerQuery) ||
      brand.entity?.toLowerCase().includes(lowerQuery) ||
      brand.id?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Search countries by query string
   */
  searchCountries(query) {
    const countries = this.getCountries();
    if (!query) return countries;
    
    const lowerQuery = query.toLowerCase();
    return countries.filter(country =>
      country.name?.toLowerCase().includes(lowerQuery) ||
      country.code?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get template structure for generating copy
   */
  getTemplateStructure(assetType) {
    const structure = this.getOverallStructure(assetType);
    if (structure.length === 0) return null;
    
    return structure[0];
  }

  /**
   * Get statistics about loaded data
   */
  getStats() {
    return {
      isLoaded: this.isLoaded,
      totalSheets: this.data ? Object.keys(this.data).length : 0,
      totalBrands: this.getBrands().length,
      totalCountries: this.getCountries().length,
      totalAssetTypes: this.getAssetTypes().length,
      loadedAt: this.metadata?.loadedAt || null,
      filePath: this.metadata?.filePath || null
    };
  }

  /**
   * Validate that all required sheets are present
   */
  validateData() {
    const requiredSheets = [
      'Trademark Config',
      'CountryLanguage',
      'Trademark Language',
      'Trademark Structure',
      'Language Dependent Variables',
      'Overall Structure',
      'Help Text'
    ];

    const missingSheets = requiredSheets.filter(
      sheet => !this.data || !this.data[sheet]
    );

    if (missingSheets.length > 0) {
      return {
        valid: false,
        missingSheets: missingSheets,
        message: `Missing required sheets: ${missingSheets.join(', ')}`
      };
    }

    return {
      valid: true,
      message: 'All required sheets present'
    };
  }

  /**
   * Get sheet data by name
   */
  getSheet(sheetName) {
    return this.data?.[sheetName] || [];
  }

  /**
   * Get list of all sheet names
   */
  getSheetNames() {
    return this.data ? Object.keys(this.data) : [];
  }

  /**
   * Reload data from Excel file
   */
  async reload() {
    console.log('🔄 Reloading Excel data...');
    this.isLoaded = false;
    this.data = null;
    this.metadata = null;
    return await this.loadData();
  }

  /**
   * Clear all data
   */
  clear() {
    this.isLoaded = false;
    this.data = null;
    this.metadata = null;
    console.log('🗑️ Excel data cleared');
  }
}

// Create and export singleton instance
const excelService = new ExcelService();
export default excelService;
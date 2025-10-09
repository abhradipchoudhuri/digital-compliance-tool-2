// src/renderer/services/excelService.js
// Excel Service - FIXED to match your actual Excel column names

export class ExcelService {
  constructor() {
    this.isLoaded = false;
    this.data = null;
    this.metadata = null;
  }

  async loadData() {
    try {
      console.log('ExcelService: Starting Excel data load...');
      
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const result = await window.electronAPI.loadExcelData();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load Excel data');
      }

      this.data = result.data;
      this.metadata = {
        filePath: result.filePath,
        sheetCount: result.sheetCount,
        summary: result.summary || [],
        loadedAt: new Date().toISOString()
      };
      this.isLoaded = true;

      console.log('✅ ExcelService: Excel data loaded successfully!');
      console.log('📊 Available sheets:', Object.keys(this.data));
      console.log('🔍 FIRST BRAND ROW:', this.data['Trademark Config'][1]); // Row 1 (row 0 is headers)
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
      this.data = null;
      this.metadata = null;
      this.isLoaded = false;
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  isDataLoaded() {
    return this.isLoaded && this.data !== null;
  }

  getData() {
    return this.data;
  }

  getRawData() {
    return this.data;
  }

  getMetadata() {
    return this.metadata;
  }

  // ============================================
  // FIXED: Match YOUR actual Excel column names
  // ============================================

  /**
   * Get brands from Trademark Config
   * YOUR EXCEL COLUMNS: 'Display Names', 'Brand Names', 'Entity Names', 'Trademark Type'
   */
  getBrands() {
    if (!this.data || !this.data['Trademark Config']) {
      console.warn('⚠️ Trademark Config sheet not found');
      return [];
    }
    
    const brands = this.data['Trademark Config']
      .filter(row => {
        // Check different possible column name variations
        const type = row['Trademark Type'] || row.Type || row.type || '';
        return type.toLowerCase().includes('brand') || row['Brand Names'] || row['Display Names'];
      })
      .map(row => ({
        id: (row['Brand Names'] || row['Display Names'] || row.ID || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: row['Display Names'] || row['Brand Names'] || row.Name || '',
        entity: row['Entity Names'] || row.Entity || '',
        brandNames: row['Brand Names'] || '',
        displayNames: row['Display Names'] || ''
      }))
      .filter(brand => brand.name); // Only include rows with names
    
    console.log(`📋 getBrands(): Found ${brands.length} brands`);
    return brands;
  }

  /**
   * Get asset types from Trademark Config
   * YOUR EXCEL: Check 'Asset Type Instructions' column or 'Trademark Type'
   */
  getAssetTypes() {
    if (!this.data || !this.data['Overall Structure']) {
      console.warn('⚠️ Overall Structure sheet not found, trying Trademark Config...');
      
      // Fallback: try to get from Trademark Config if Overall Structure missing
      if (this.data && this.data['Trademark Config']) {
        const assetTypes = this.data['Trademark Config']
          .filter(row => row['Asset Type Instructions'])
          .map(row => ({
            id: (row['Asset Type Instructions'] || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '-'),
            name: row['Asset Type Instructions'] || '',
            description: ''
          }))
          .filter(type => type.name);
        
        console.log(`📋 getAssetTypes(): Found ${assetTypes.length} asset types from Trademark Config`);
        return assetTypes;
      }
      
      return [];
    }
    
    // Get from Overall Structure sheet (YOUR EXCEL: 'Asset Type' column)
    const assetTypes = this.data['Overall Structure']
      .map(row => ({
        id: (row['Asset Type'] || row.AssetType || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: row['Asset Type'] || row.AssetType || '',
        description: row.Structure || row.Description || ''
      }))
      .filter(type => type.name);
    
    console.log(`📋 getAssetTypes(): Found ${assetTypes.length} asset types`);
    return assetTypes;
  }

  /**
   * Get countries from CountryLanguage sheet
   * YOUR EXCEL COLUMNS: 'Abbv', 'Country', 'Language'
   * FIXED: Handles empty Abbv codes by generating them
   */
  getCountries() {
    if (!this.data || !this.data['CountryLanguage']) {
      console.warn('⚠️ CountryLanguage sheet not found');
      return [];
    }
    
    const uniqueCountries = new Map();
    let skippedEmptyName = 0;
    
    this.data['CountryLanguage'].forEach(row => {
      let code = row.Abbv || row.CountryCode || row['Country Code'];
      const name = row.Country || row.CountryName || row['Country Name'];
      
      // Handle empty codes: generate from country name
      if (!code || code.trim() === '') {
        // Special case for United States (Brown-Forman default market)
        if (name && name.toLowerCase().includes('united states')) {
          code = 'US';
        } 
        // Generate code from first 2 letters of country name
        else if (name) {
          code = name.substring(0, 2).toUpperCase();
        }
      }
      
      // Check if country name is empty
      if (!name || name.trim() === '') {
        console.log(`⚠️ SKIPPED ROW with code "${code}" - Empty country name`);
        skippedEmptyName++;
        return;
      }
      
      if (code && name && !uniqueCountries.has(code)) {
        uniqueCountries.set(code, {
          code: code,
          name: name,
          language: row.Language || 'English'
        });
      } else if (code && name && uniqueCountries.has(code)) {
        // LOG DUPLICATE ENTRIES
        console.log(`⚠️ DUPLICATE COUNTRY CODE "${code}": ${name} (${row.Language}) - SKIPPED (already have ${uniqueCountries.get(code).name})`);
      }
    });
    
    const countries = Array.from(uniqueCountries.values());
    console.log(`📋 getCountries(): Found ${countries.length} unique countries (skipped ${skippedEmptyName} rows with empty names)`);
    return countries;
  }

  /**
   * Get all languages for a country
   */
  getCountryLanguages(countryCode) {
    if (!this.data || !this.data['CountryLanguage']) return [];
    
    return this.data['CountryLanguage']
      .filter(row => (row.Abbv || row.CountryCode) === countryCode)
      .map(row => ({
        language: row.Language || 'English',
        countryName: row.Country || row.CountryName || countryCode
      }));
  }

  /**
   * Get trademark language data
   */
  getTrademarkLanguage(language = null) {
    if (!this.data || !this.data['Trademark Language']) return [];
    
    if (language) {
      return this.data['Trademark Language'].filter(
        row => row.Language === language
      );
    }
    
    return this.data['Trademark Language'];
  }

  /**
   * Get trademark structure
   */
  getTrademarkStructure(type = null) {
    if (!this.data || !this.data['Trademark Structure']) return [];
    
    if (type) {
      return this.data['Trademark Structure'].filter(
        row => (row['Type of Trademark'] || row.Type) === type
      );
    }
    
    return this.data['Trademark Structure'];
  }

  /**
   * Get language dependent variables
   */
  getLanguageVariables(language) {
    if (!this.data || !this.data['Language Dependent Variables']) return [];
    
    return this.data['Language Dependent Variables'].filter(
      row => row.Language === language
    );
  }

  /**
   * Get overall structure
   */
  getOverallStructure(assetType = null) {
    if (!this.data || !this.data['Overall Structure']) return [];
    
    if (assetType) {
      return this.data['Overall Structure'].filter(
        row => (row['Asset Type'] || row.AssetType) === assetType
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
    
    const helpRow = this.data['Help Text'][0];
    return helpRow.Instructions || helpRow.HelpText || helpRow['Help Text'] || '';
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  getBrandById(id) {
    const brands = this.getBrands();
    return brands.find(brand => brand.id === id) || null;
  }

  getCountryByCode(code) {
    const countries = this.getCountries();
    return countries.find(country => country.code === code) || null;
  }

  getAssetTypeByName(nameOrId) {
    const assetTypes = this.getAssetTypes();
    return assetTypes.find(
      type => type.name === nameOrId || type.id === nameOrId
    ) || null;
  }

  searchBrands(query) {
    const brands = this.getBrands();
    if (!query) return brands;
    
    const lowerQuery = query.toLowerCase();
    return brands.filter(brand => 
      brand.name?.toLowerCase().includes(lowerQuery) ||
      brand.entity?.toLowerCase().includes(lowerQuery) ||
      brand.id?.toLowerCase().includes(lowerQuery) ||
      brand.displayNames?.toLowerCase().includes(lowerQuery) ||
      brand.brandNames?.toLowerCase().includes(lowerQuery)
    );
  }

  searchCountries(query) {
    const countries = this.getCountries();
    if (!query) return countries;
    
    const lowerQuery = query.toLowerCase();
    return countries.filter(country =>
      country.name?.toLowerCase().includes(lowerQuery) ||
      country.code?.toLowerCase().includes(lowerQuery)
    );
  }

  getTemplateStructure(assetType) {
    const structure = this.getOverallStructure(assetType);
    if (structure.length === 0) return null;
    return structure[0];
  }

  /**
   * Get statistics - FIXED to always return valid object
   */
  getStats() {
    const stats = {
      isLoaded: this.isLoaded,
      totalSheets: this.data ? Object.keys(this.data).length : 0,
      totalBrands: this.getBrands().length,
      totalCountries: this.getCountries().length,
      totalAssetTypes: this.getAssetTypes().length,
      loadedAt: this.metadata?.loadedAt || null,
      filePath: this.metadata?.filePath || null
    };
    
    console.log('📊 Stats:', stats);
    return stats;
  }

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

  getSheet(sheetName) {
    return this.data?.[sheetName] || [];
  }

  getSheetNames() {
    return this.data ? Object.keys(this.data) : [];
  }

  async reload() {
    console.log('🔄 Reloading Excel data...');
    this.isLoaded = false;
    this.data = null;
    this.metadata = null;
    return await this.loadData();
  }

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
// src/renderer/services/excelService.js
// Excel Data Service - Handles loading and parsing Excel data

class ExcelService {
  constructor() {
    this.data = null;
    this.metadata = null;
    this.isLoaded = false;
  }

  /**
   * Load Excel data from main process
   */
  async loadData() {
    try {
      console.log('ExcelService: Starting Excel data load...');
      
      // Check if we're in Electron environment
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      // Call main process to load Excel
      const result = await window.electronAPI.loadExcelData();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load Excel data');
      }

      // Store the parsed data
      this.data = result.data;
      this.metadata = {
        filePath: result.filePath,
        sheetCount: result.sheetCount,
        summary: result.summary,
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
  // DATA RETRIEVAL METHODS
  // ============================================

  /**
   * Get brands from Trademark Config
   * Columns: 'Display Names', 'Brand Names', 'Entity Names', 'Trademark Type', 'TTB Type'
   */
  getBrands() {
    if (!this.data || !this.data['Trademark Config']) {
      console.warn('⚠️ Trademark Config sheet not found');
      return [];
    }
    
    const brands = this.data['Trademark Config']
      .map(row => ({
        id: (row['Brand Names'] || row['Display Names'] || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: row['Display Names'] || row['Brand Names'] || '',
        entity: row['Entity Names'] || '',
        brandNames: row['Brand Names'] || '',
        displayNames: row['Display Names'] || '',
        trademarkType: row['Trademark Type'] || '',
        ttbType: row['TTB Type'] || 'Full'
      }))
      .filter(brand => brand.name); // Only include rows with names
    
    console.log(`📋 getBrands(): Found ${brands.length} brands`);
    return brands;
  }

  /**
   * Get asset types from Overall Structure
   * Columns: 'Asset Type', 'Structure'
   */
  getAssetTypes() {
    if (!this.data || !this.data['Overall Structure']) {
      console.warn('⚠️ Overall Structure sheet not found');
      return [];
    }
    
    // Get from Overall Structure sheet
    const assetTypes = this.data['Overall Structure']
      .map(row => ({
        id: (row['Asset Type'] || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: row['Asset Type'] || '',
        description: row.Structure || ''
      }))
      .filter(type => type.name);
    
    console.log(`📋 getAssetTypes(): Found ${assetTypes.length} asset types`);
    return assetTypes;
  }

  /**
   * Get countries from CountryLanguage sheet
   * Columns: 'Abbv', 'Country', 'Language'
   */
  getCountries() {
    if (!this.data || !this.data['CountryLanguage']) {
      console.warn('⚠️ CountryLanguage sheet not found');
      return [];
    }
    
    const uniqueCountries = new Map();
    
    this.data['CountryLanguage'].forEach(row => {
      const code = row.Abbv || row.CountryCode || row['Country Code'];
      const name = row.Country || row.CountryName || row['Country Name'];
      const language = row.Language || 'English';
      
      if (code && !uniqueCountries.has(code)) {
        uniqueCountries.set(code, {
          code: code,
          name: name || code,
          language: language
        });
      } else if (code && uniqueCountries.has(code)) {
        // Handle multi-language countries (like Belgium-French)
        const existingName = uniqueCountries.get(code).name;
        if (name && name !== existingName) {
          // Create a variant entry
          const variantCode = `${code}-${language.split(' ')[0].substring(0, 2).toUpperCase()}`;
          uniqueCountries.set(variantCode, {
            code: variantCode,
            name: `${name} (${language})`,
            language: language
          });
          console.log(`✅ Multi-language country: ${name} (${language}) → Code: ${variantCode}`);
        }
      }
    });
    
    const countries = Array.from(uniqueCountries.values());
    console.log(`📋 getCountries(): Found ${countries.length} countries (including multi-language variants)`);
    return countries;
  }

  /**
   * Get TTB statement for a brand
   * @param {string} brandName - Brand name to look up
   * @param {string} ttbType - Type: Full, Tightened, or Limited Character
   * @returns {string} TTB statement or empty string
   */
  getTTBStatement(brandName, ttbType = 'Full') {
    if (!this.data || !this.data['TTB Statements']) {
      console.warn('⚠️ TTB Statements sheet not found');
      return '';
    }

    const ttbRow = this.data['TTB Statements'].find(row => 
      row['Brand Name'] === brandName
    );

    if (!ttbRow) {
      console.warn(`⚠️ No TTB statement found for brand: ${brandName}`);
      return '';
    }

    // Get the appropriate TTB statement based on type
    let statement = '';
    if (ttbType === 'Full') {
      statement = ttbRow['TTB Statement - Full'] || '';
    } else if (ttbType === 'Tightened') {
      statement = ttbRow['TTB Statement - Tightened'] || '';
    } else if (ttbType === 'Limited Character') {
      statement = ttbRow['TTB Statement - Limited Character'] || '';
    } else {
      // Default to Full if type not recognized
      statement = ttbRow['TTB Statement - Full'] || '';
    }

    console.log(`📋 TTB Statement for ${brandName} (${ttbType}):`, statement.substring(0, 50) + '...');
    return statement;
  }

  /**
   * Get brands available in a specific country
   * ✅ USES BRAND AVAILABILITY SHEET as designed
   * ✅ FUZZY MATCHING to handle name variations between sheets
   * @param {string} countryCode - Country code (e.g., 'US', 'CA', 'GB')
   * @returns {Array} Array of brand objects available in that country
   */
  getBrandsForCountry(countryCode) {
    if (!this.data || !this.data['Brand Availability']) {
      console.warn('⚠️ Brand Availability sheet not found, returning all brands');
      return this.getBrands();
    }

    // Helper function to normalize brand names for matching
    // Handles variations like "Jack Daniel's Old No. 7" vs "Jack Daniel's Old N.7"
    const normalizeBrandName = (name) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation (apostrophes, periods, hyphens)
        .replace(/\s+/g, ' ')    // Normalize multiple spaces to single space
        .trim();
    };

    // Get all brands marked as available in this country from Brand Availability sheet
    const availableBrandNames = this.data['Brand Availability']
      .filter(row => {
        const availableCountries = row['Available Countries'] || '';
        
        // If marked as "ALL", brand is available everywhere
        if (availableCountries === 'ALL') {
          return true;
        }
        
        // Check if country code is in the comma-separated list
        const countryList = availableCountries.split(',').map(c => c.trim());
        return countryList.includes(countryCode);
      })
      .map(row => row['Brand Name']);

    console.log(`📋 Brand Availability sheet has ${availableBrandNames.length} brands for ${countryCode}`);

    // Get full brand data from Trademark Config
    const allBrands = this.getBrands();
    
    // Create normalized lookup for matching
    const normalizedAvailable = availableBrandNames.map(name => ({
      original: name,
      normalized: normalizeBrandName(name)
    }));

    // Match brands using fuzzy comparison to handle naming differences
    const availableBrands = allBrands.filter(brand => {
      const brandNormalized = normalizeBrandName(brand.name);
      const brandNameNormalized = normalizeBrandName(brand.brandNames || '');
      const displayNormalized = normalizeBrandName(brand.displayNames || '');
      
      // Check if this brand matches any available brand (normalized comparison)
      const matches = normalizedAvailable.some(avail => {
        // Try various matching strategies
        return (
          // Exact normalized match
          brandNormalized === avail.normalized ||
          brandNameNormalized === avail.normalized ||
          displayNormalized === avail.normalized ||
          // Contains match (for cases like "Jack Daniel's (FOB)" matching "Jack Daniel's Old No. 7")
          brandNormalized.includes(avail.normalized) || 
          avail.normalized.includes(brandNormalized) ||
          brandNameNormalized.includes(avail.normalized) ||
          avail.normalized.includes(brandNameNormalized) ||
          displayNormalized.includes(avail.normalized) ||
          avail.normalized.includes(displayNormalized)
        );
      });
      
      return matches;
    });

    console.log(`📋 getBrandsForCountry(${countryCode}): Matched ${availableBrands.length} brands from Trademark Config`);
    
    // Log which brands matched for debugging
    if (availableBrands.length > 0 && availableBrands.length <= 20) {
      console.log('✅ Matched brands:', availableBrands.map(b => b.name).join(', '));
    }
    
    return availableBrands;
  }

  /**
   * Get TTB Type for a brand from Trademark Config
   * @param {string} brandName - Brand name
   * @returns {string} TTB Type (Full/Tightened/Limited Character)
   */
  getTTBType(brandName) {
    if (!this.data || !this.data['Trademark Config']) {
      return 'Full'; // Default
    }

    const brandRow = this.data['Trademark Config'].find(row => 
      row['Brand Names'] === brandName || row['Display Names'] === brandName
    );

    return brandRow?.['TTB Type'] || 'Full';
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
   * Get statistics
   */
  getStats() {
    const stats = {
      isLoaded: this.isLoaded,
      totalSheets: this.data ? Object.keys(this.data).length : 0,
      brands: this.isLoaded ? this.getBrands().length : 0,
      countries: this.isLoaded ? this.getCountries().length : 0,
      assetTypes: this.isLoaded ? this.getAssetTypes().length : 0,
      loadedAt: this.metadata?.loadedAt || null
    };
    
    return stats;
  }

  /**
   * Reload data
   */
  async reload() {
    this.data = null;
    this.metadata = null;
    this.isLoaded = false;
    return await this.loadData();
  }
}

// ✅ Export both the class AND the singleton instance
export { ExcelService };  // Named export for class (for 'new ExcelService()')
const excelService = new ExcelService();
export default excelService;  // Default export for singleton (for direct use)
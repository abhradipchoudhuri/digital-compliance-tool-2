// src/renderer/services/excelService.js
// Excel Data Service - Handles loading and parsing Excel data for the Legal Copy Generator

class ExcelService {
  constructor() {
    this.data = null;
    this.metadata = null;
    this.isLoaded = false;
  }

  /**
   * Load Excel data from main process via Electron IPC
   * @returns {Promise<Object>} Result object with success status and data
   */
  async loadData() {
    try {
      console.log('ExcelService: Starting Excel data load');
      
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
        summary: result.summary,
        loadedAt: new Date().toISOString()
      };
      this.isLoaded = true;

      console.log('ExcelService: Excel data loaded successfully');
      console.log('Available sheets:', Object.keys(this.data));
      console.log('First brand row:', this.data['Trademark Config'][1]);
      console.log('Sheet summary:');
      Object.keys(this.data).forEach(sheetName => {
        const rowCount = this.data[sheetName].length;
        console.log(`  - ${sheetName}: ${rowCount} rows`);
        if (rowCount > 0) {
          console.log(`    Sample columns:`, Object.keys(this.data[sheetName][0]));
        }
      });

      return {
        success: true,
        data: this.data,
        metadata: this.metadata
      };

    } catch (error) {
      console.error('ExcelService: Error loading data:', error);
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

  /**
   * Extract base brand name from full expression name
   * Handles cases like "Benriach 10 Year Old" -> "Benriach"
   * @param {string} expressionName - Full expression name
   * @returns {string} Base brand name
   */
  extractBaseBrand(expressionName) {
    if (!expressionName) return expressionName;

    const patterns = [
      /^(.+?)\s+\d+\s+Year\s+Old$/i,
      /^(.+?)\s+\d+\s*YO$/i,
      /^(.+?)\s+Single\s+Barrel$/i,
      /^(.+?)\s+Bottled\s+in\s+Bond$/i,
      /^(.+?)\s+Triple\s+Mash$/i,
      /^(.+?)\s+Bonded\s+Series$/i,
      /^(.+?)\s+Select$/i,
      /^(.+?)\s+Reserve$/i,
      /^(.+?)\s+Rye$/i,
      /^(.+?)\s+Honey$/i,
      /^(.+?)\s+Fire$/i,
      /^(.+?)\s+Apple$/i,
      /^(.+?)\s+Tennessee\s+\w+$/i,
      /^(.+?)\s+&\s+\w+.*$/i,
      /^(.+?)\s+\(RTD\)$/i,
      /^(.+?)\s+\(FOB\)$/i,
      /^(.+?)\s+Blackberry$/i,
      /^(.+?)\s+Cherry$/i,
    ];

    for (const pattern of patterns) {
      const match = expressionName.match(pattern);
      if (match) {
        const baseBrand = match[1].trim();
        console.log(`Extracted base brand: "${expressionName}" -> "${baseBrand}"`);
        return baseBrand;
      }
    }

    console.log(`No pattern match for: "${expressionName}" - using as-is`);
    return expressionName;
  }

  /**
   * Get all brands from Trademark Config sheet
   * @returns {Array<Object>} Array of brand objects with trademark configuration
   */
  getBrands() {
    if (!this.data || !this.data['Trademark Config']) {
      console.warn('Trademark Config sheet not found');
      return [];
    }
    
    const brands = this.data['Trademark Config']
      .map(row => ({
        id: (row['Brand Names'] || row['Display Names'] || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: row['Display Names'] || row['Brand Names'] || '',
        entity: row['Entity Names'] || '',
        brandNames: row['Brand Names'] || '',
        displayNames: row['Display Names'] || '',
        thirdParty: row['Third Party'] || '',
        trademarkType: row['Trademark Type'] || '',
        ttbType: row['TTB Type'] || 'Full',
        forwardNoticeType: row['Forward Notice Type'] || '',
        emailOptinDisplay: row['Email Opt-in Display '] || row['Email Opt-in Display'] || '',
        portfolio: row['Portfolio?'] || '',
        assetType: row['Asset Type'] || '',
        assetTypeInstructions: row['Asset Type Instructions'] || ''
      }))
      .filter(brand => brand.name);
    
    console.log(`getBrands(): Found ${brands.length} brands in Trademark Config`);
    return brands;
  }

  /**
   * Get all asset types from Overall Structure sheet
   * @returns {Array<Object>} Array of asset type objects
   */
  getAssetTypes() {
    if (!this.data || !this.data['Overall Structure']) {
      console.warn('Overall Structure sheet not found');
      return [];
    }
    
    const assetTypes = this.data['Overall Structure']
      .map(row => ({
        id: (row['Asset Type'] || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: row['Asset Type'] || '',
        description: row.Structure || ''
      }))
      .filter(type => type.name);
    
    console.log(`getAssetTypes(): Found ${assetTypes.length} asset types`);
    return assetTypes;
  }

  /**
   * Get all countries from CountryLanguage sheet
   * Handles multi-language variants for same country
   * @returns {Array<Object>} Array of country objects with language information
   */
  getCountries() {
    if (!this.data || !this.data['CountryLanguage']) {
      console.warn('CountryLanguage sheet not found');
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
        const existingName = uniqueCountries.get(code).name;
        if (name && name !== existingName) {
          const variantCode = `${code}-${language.split(' ')[0].substring(0, 2).toUpperCase()}`;
          uniqueCountries.set(variantCode, {
            code: variantCode,
            name: `${name} (${language})`,
            language: language
          });
          console.log(`Multi-language country: ${name} (${language}) -> Code: ${variantCode}`);
        }
      }
    });
    
    const countries = Array.from(uniqueCountries.values());
    console.log(`getCountries(): Found ${countries.length} countries (including multi-language variants)`);
    return countries;
  }

  /**
   * Get TTB statement for a specific brand
   * @param {string} brandName - Brand name to look up
   * @param {string} ttbType - Type: Full, Tightened, or Limited Character
   * @returns {string} TTB statement or empty string if not found
   */
  getTTBStatement(brandName, ttbType = 'Full') {
    if (!this.data || !this.data['TTB Statements']) {
      console.warn('TTB Statements sheet not found');
      return '';
    }

    const ttbRow = this.data['TTB Statements'].find(row => 
      row['Brand Name'] === brandName
    );

    if (!ttbRow) {
      console.warn(`No TTB statement found for brand: ${brandName}`);
      return '';
    }

    let statement = '';
    if (ttbType === 'Full') {
      statement = ttbRow['TTB Statement - Full'] || '';
    } else if (ttbType === 'Tightened') {
      statement = ttbRow['TTB Statement - Tightened'] || '';
    } else if (ttbType === 'Limited Character') {
      statement = ttbRow['TTB Statement - Limited Character'] || '';
    } else {
      statement = ttbRow['TTB Statement - Full'] || '';
    }

    console.log(`TTB Statement for ${brandName} (${ttbType}):`, statement.substring(0, 50) + '...');
    return statement;
  }

  /**
   * Get brands available in a specific country
   * Uses Brand Availability as source of truth with Entity Names and Third Party information
   * Merges with Trademark Config for trademark configuration details
   * @param {string} countryCode - Country code (e.g., 'US', 'CA', 'GB')
   * @returns {Array<Object>} Array of brand objects available in that country
   */
  getBrandsForCountry(countryCode) {
    console.log(`getBrandsForCountry called for: ${countryCode}`);
    
    if (!this.data || !this.data['Brand Availability']) {
      console.warn('Brand Availability sheet not found, returning all brands from Trademark Config');
      return this.getBrands();
    }

    const availableBrandRows = this.data['Brand Availability']
      .filter(row => {
        const availableCountries = row['Available Countries'] || '';
        
        if (availableCountries === 'ALL') {
          return true;
        }
        
        const countryList = availableCountries.split(',').map(c => c.trim());
        return countryList.includes(countryCode);
      });

    console.log(`Found ${availableBrandRows.length} brands in Brand Availability for ${countryCode}`);

    const allTrademarkConfigBrands = this.getBrands();

    const processedBrands = [];
    
    availableBrandRows.forEach(row => {
      const displayName = row['Brand Name'];
      const baseBrandName = row['Brand Names'];
      const entityName = row['Entity Names'];
      const thirdParty = row['Third Party'];
      
      const matched = this.findMatchingBrand(baseBrandName, allTrademarkConfigBrands);
      
      const brandObject = {
        id: displayName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: displayName,
        displayNames: displayName,
        brandNames: baseBrandName,
        entity: entityName || '',
        thirdParty: thirdParty || '',
        baseBrand: baseBrandName,
        isExpression: displayName !== baseBrandName,
        trademarkType: matched?.trademarkType || '',
        ttbType: matched?.ttbType || 'Full',
        forwardNoticeType: matched?.forwardNoticeType || '',
        emailOptinDisplay: matched?.emailOptinDisplay || '',
        portfolio: matched?.portfolio || '',
        assetType: matched?.assetType || '',
        assetTypeInstructions: matched?.assetTypeInstructions || '',
        missingTrademarkConfig: !matched
      };
      
      processedBrands.push(brandObject);
      
      if (matched) {
        console.log(`  Matched: "${displayName}" -> Base: "${baseBrandName}", Entity: "${entityName}"`);
      } else {
        console.log(`  No Trademark Config match: "${displayName}" -> Using Brand Availability data only`);
      }
    });
    
    console.log(`Returning ${processedBrands.length} brands for ${countryCode}`);
    
    return processedBrands;
  }

  /**
   * Find matching brand in Trademark Config using multiple matching strategies
   * @param {string} searchName - Brand name from Brand Availability
   * @param {Array<Object>} allBrands - All brands from Trademark Config
   * @returns {Object|null} Matched brand object or null if no match found
   */
  findMatchingBrand(searchName, allBrands) {
    if (!searchName) return null;

    const normalize = (str) => {
      if (!str) return '';
      return str
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '');
    };

    const normalizedSearch = normalize(searchName);

    // Try exact match on display names
    let match = allBrands.find(b => b.displayNames === searchName);
    if (match) {
      console.log(`  Exact match (Display): "${searchName}" -> "${match.displayNames}"`);
      return match;
    }

    // Try exact match on brand names
    match = allBrands.find(b => b.brandNames === searchName);
    if (match) {
      console.log(`  Exact match (Brand): "${searchName}" -> "${match.brandNames}"`);
      return match;
    }

    // Try normalized match on display names
    match = allBrands.find(b => normalize(b.displayNames) === normalizedSearch);
    if (match) {
      console.log(`  Normalized match (Display): "${searchName}" -> "${match.displayNames}"`);
      return match;
    }

    // Try normalized match on brand names
    match = allBrands.find(b => normalize(b.brandNames) === normalizedSearch);
    if (match) {
      console.log(`  Normalized match (Brand): "${searchName}" -> "${match.brandNames}"`);
      return match;
    }

    // Try partial/contains match
    match = allBrands.find(b => {
      const displayNorm = normalize(b.displayNames);
      const brandNorm = normalize(b.brandNames);
      const nameNorm = normalize(b.name);
      
      return normalizedSearch.includes(displayNorm) || 
             displayNorm.includes(normalizedSearch) ||
             normalizedSearch.includes(brandNorm) || 
             brandNorm.includes(normalizedSearch) ||
             normalizedSearch.includes(nameNorm) || 
             nameNorm.includes(normalizedSearch);
    });
    
    if (match) {
      console.log(`  Contains match: "${searchName}" -> "${match.displayNames || match.name}"`);
      return match;
    }

    console.log(`  No match found for: "${searchName}"`);
    return null;
  }

  /**
   * Get TTB Type for a brand from Trademark Config
   * @param {string} brandName - Brand name to look up
   * @returns {string} TTB Type (Full/Tightened/Limited Character)
   */
  getTTBType(brandName) {
    if (!this.data || !this.data['Trademark Config']) {
      return 'Full';
    }

    const brandRow = this.data['Trademark Config'].find(row => 
      row['Brand Names'] === brandName || row['Display Names'] === brandName
    );

    return brandRow?.['TTB Type'] || 'Full';
  }

  /**
   * Get all languages available for a specific country
   * @param {string} countryCode - Country code
   * @returns {Array<Object>} Array of language objects for the country
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
   * Get trademark language data for a specific language
   * @param {string|null} language - Language to filter by (null returns all)
   * @returns {Array<Object>} Trademark language data
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
   * Get trademark structure data
   * @param {string|null} type - Type to filter by (null returns all)
   * @returns {Array<Object>} Trademark structure data
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
   * Get language dependent variables for a specific language
   * @param {string} language - Language to look up
   * @returns {Array<Object>} Language variables data
   */
  getLanguageVariables(language) {
    if (!this.data || !this.data['Language Dependent Variables']) return [];
    
    return this.data['Language Dependent Variables'].filter(
      row => row.Language === language
    );
  }

  /**
   * Get overall structure template for asset type
   * @param {string|null} assetType - Asset type to filter by (null returns all)
   * @returns {Array<Object>} Overall structure data
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
   * Get help text from Help Text sheet
   * @returns {string} Help text instructions
   */
  getHelpText() {
    if (!this.data || !this.data['Help Text'] || this.data['Help Text'].length === 0) {
      return '';
    }
    
    const helpRow = this.data['Help Text'][0];
    return helpRow.Instructions || helpRow.HelpText || helpRow['Help Text'] || '';
  }

  /**
   * Get brand by ID
   * @param {string} id - Brand ID to look up
   * @returns {Object|null} Brand object or null if not found
   */
  getBrandById(id) {
    const brands = this.getBrands();
    return brands.find(brand => brand.id === id) || null;
  }

  /**
   * Get country by code
   * @param {string} code - Country code to look up
   * @returns {Object|null} Country object or null if not found
   */
  getCountryByCode(code) {
    const countries = this.getCountries();
    return countries.find(country => country.code === code) || null;
  }

  /**
   * Get asset type by name or ID
   * @param {string} nameOrId - Asset type name or ID
   * @returns {Object|null} Asset type object or null if not found
   */
  getAssetTypeByName(nameOrId) {
    const assetTypes = this.getAssetTypes();
    return assetTypes.find(
      type => type.name === nameOrId || type.id === nameOrId
    ) || null;
  }

  /**
   * Search brands by query string
   * @param {string} query - Search query
   * @returns {Array<Object>} Filtered array of brand objects
   */
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

  /**
   * Search countries by query string
   * @param {string} query - Search query
   * @returns {Array<Object>} Filtered array of country objects
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
   * Get template structure for a specific asset type
   * @param {string} assetType - Asset type name
   * @returns {Object|null} Template structure object or null
   */
  getTemplateStructure(assetType) {
    const structure = this.getOverallStructure(assetType);
    if (structure.length === 0) return null;
    return structure[0];
  }

  /**
   * Get service statistics
   * @returns {Object} Statistics object with counts and metadata
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
   * Reload Excel data from scratch
   * @returns {Promise<Object>} Result object with success status
   */
  async reload() {
    this.data = null;
    this.metadata = null;
    this.isLoaded = false;
    return await this.loadData();
  }
}

export { ExcelService };
const excelService = new ExcelService();
export default excelService;
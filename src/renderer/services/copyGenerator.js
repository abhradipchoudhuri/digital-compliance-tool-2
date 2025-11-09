// src/renderer/services/copyGenerator.js
// Core Copy Generation Engine
// Handles template-based copy generation with trademark, TTB statements, and compliance rules

class CopyGenerator {
  constructor() {
    // ============================================
    // INSTANCE PROPERTIES
    // ============================================
    
    // Excel data sheets
    this.trademarkData = null;
    this.templates = null;
    this.brandConfig = null;
    this.languageData = null;
    this.trademarkLanguage = null;
    this.trademarkStructure = null;
    this.countryLanguage = null;
    this.ttbStatements = null;
    this.usResponsibilityMessage = null;
    this.excelService = null;
    
    // ============================================
    // ASSET TYPE CONFIGURATION MAPPINGS
    // ============================================
    
    /**
     * Asset Type to TTB Type Mapping
     * Each asset type determines which TTB statement version to use
     * @type {Object.<string, string>}
     */
    this.ASSET_TYPE_TO_TTB_TYPE = {
      "Digital | Asset Dynamic Loop (GIF/Cinemagraph)": "Tightened",
      "Digital | Asset Static (paid)": "Tightened",
      "Digital | Asset Video (paid & organic)": "Full",
      "Digital | Bio Facebook (About Section)": "Tightened",
      "Digital | Bio Instagram": "Limited Character",
      "Digital | Bio Pinterest": "Limited Character",
      "Digital | Bio Twitter": "Limited Character",
      "Digital | Email Footer": "Full",
      "Digital | Media - Digital TV (Streaming)": "Full",
      "Digital | Media - Display Banner - Dynamic": "Limited Character",
      "Digital | Media - Display Banner - Static": "Limited Character",
      "Digital | Web Age-Gate Footer": "Full",
      "Digital | Web Footer": "Full",
      "Digital | eCommerce Content": "Tightened",
      "Traditional & Digital | Out-of-Home (OOH)": "Full",
      "Traditional & Digital | Radio/Podcast": "Tightened",
      "Traditional | Consumer Advertising Specialty (ex. Keychain)": "Limited Character",
      "Traditional | Consumer-Facing Print Media (ex. Magazine)": "Full",
      "Traditional | Point of Sale (POS) - Signage, Print": "Full",
      "Traditional | Retailer Advertising Specialty (ex. Gutter Mat)": "Full",
      "Traditional | Standard TV": "Full"
    };
    
    /**
     * Asset Type to Trademark Structure Type Mapping
     * Each asset type determines which trademark structure to use (Full/Tightened/Limited Character)
     * @type {Object.<string, string>}
     */
    this.ASSET_TYPE_TO_TRADEMARK_TYPE = {
      "Digital | Asset Dynamic Loop (GIF/Cinemagraph)": "Tightened",
      "Digital | Asset Static (paid)": "Tightened",
      "Digital | Asset Video (paid & organic)": "Full",
      "Digital | Bio Facebook (About Section)": "Tightened",
      "Digital | Bio Instagram": "Limited Character",
      "Digital | Bio Pinterest": "Limited Character",
      "Digital | Bio Twitter": "Limited Character",
      "Digital | Email Footer": "Full",
      "Digital | Email Header": "Full",
      "Digital | Media - Digital TV (Streaming)": "Full",
      "Digital | Media - Display Banner - Dynamic": "Limited Character",
      "Digital | Media - Display Banner - Static": "Limited Character",
      "Digital | Web Age-Gate Footer": "Full",
      "Digital | Web Footer": "Full",
      "Digital | eCommerce Content": "Tightened",
      "Traditional & Digital | Out-of-Home (OOH)": "Full",
      "Traditional & Digital | Radio/Podcast": "Tightened",
      "Traditional | Consumer Advertising Specialty (ex. Keychain)": "Limited Character",
      "Traditional | Consumer-Facing Print Media (ex. Magazine)": "Full",
      "Traditional | Point of Sale (POS) - Signage, Print": "Full",
      "Traditional | Retailer Advertising Specialty (ex. Gutter Mat)": "Full",
      "Traditional | Standard TV": "Full"
    };
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  /**
   * Initialize the copy generator with Excel data
   * @param {Object} excelData - Parsed Excel data with all sheets
   * @param {Object} excelService - Excel service instance
   */
  initialize(excelData, excelService) {
    if (!excelData || typeof excelData !== 'object') {
      throw new Error('Invalid Excel data provided to CopyGenerator');
    }

    console.log('CopyGenerator: Initializing with Excel data...');

    // Load all required sheets
    this.trademarkData = excelData['Trademark Config'] || [];
    this.templates = excelData['Overall Structure'] || [];
    this.trademarkStructure = excelData['Trademark Structure'] || [];
    this.languageData = excelData['Language Dependent Variables'] || [];
    this.trademarkLanguage = excelData['Trademark Language'] || [];
    this.countryLanguage = excelData['CountryLanguage'] || [];
    this.ttbStatements = excelData['TTB Statements'] || [];
    this.usResponsibilityMessage = excelData['US Responsibility Message'] || [];
    
    this.excelService = excelService;

    // Log loaded sheet counts
    console.log('Loaded sheets:', {
      trademarkData: this.trademarkData.length,
      templates: this.templates.length,
      trademarkStructure: this.trademarkStructure.length,
      languageData: this.languageData.length,
      trademarkLanguage: this.trademarkLanguage.length,
      countryLanguage: this.countryLanguage.length,
      ttbStatements: this.ttbStatements.length,
      usResponsibilityMessage: this.usResponsibilityMessage.length
    });

    // Log sample data for debugging
    if (this.ttbStatements.length > 0) {
      console.log('Sample TTB Statement columns:', Object.keys(this.ttbStatements[0]));
      console.log('First TTB brand:', this.ttbStatements[0]['Brand Name'] || this.ttbStatements[0]);
    }

    if (this.trademarkData.length > 0) {
      console.log('Trademark Config columns:', Object.keys(this.trademarkData[0]));
      const sampleBrand = this.trademarkData[0];
      console.log('Sample brand TTB Type:', sampleBrand['TTB Type']);
    }

    this.validateData();
    
    console.log('CopyGenerator: Initialization complete');
  }

  /**
   * Validate that required data sheets are loaded
   * @throws {Error} If required sheets are missing
   */
  validateData() {
    if (!this.trademarkData || this.trademarkData.length === 0) {
      throw new Error('Trademark Config sheet is empty or missing');
    }
    if (!this.templates || this.templates.length === 0) {
      throw new Error('Overall Structure sheet is empty or missing');
    }
    if (!this.trademarkStructure || this.trademarkStructure.length === 0) {
      throw new Error('Trademark Structure sheet is empty or missing');
    }
    if (!this.languageData || this.languageData.length === 0) {
      throw new Error('Language Dependent Variables sheet is empty or missing');
    }
  }

  /**
   * Check if generator is ready to use
   * @returns {boolean} True if all required data is loaded
   */
  isReady() {
    return !!(this.trademarkData && this.templates && this.trademarkStructure);
  }

  // ============================================
  // MAIN GENERATION METHOD
  // ============================================

  /**
   * Generate legal copy from template
   * @param {Object} params - Generation parameters
   * @param {string} params.assetType - Asset type name
   * @param {string} params.countryCode - Country code (e.g., 'US', 'GB')
   * @param {Array<string>} params.brandIds - Array of brand names/IDs (can include expressions)
   * @returns {Object} Generation result with success status, copy, and metadata
   */
  generateCopy(params) {
    const startTime = Date.now();

    try {
      console.log('CopyGenerator: Starting generation...', params);

      this.validateParams(params);

      const { assetType, countryCode, brandIds } = params;

      // Get template for asset type
      const template = this.getAssetTemplate(assetType);
      if (!template) {
        throw new Error(`No template found for asset type: ${assetType}`);
      }

      console.log('Template found:', template['Asset Type']);
      console.log('Template structure:', template.Structure);

      // Get language for country
      const language = this.getLanguageForCountry(countryCode);
      console.log('Language for country:', { countryCode, language });

      // Get language variables
      const langVars = this.getLanguageVariables(language);
      if (!langVars) {
        throw new Error(`No language variables found for: ${language}`);
      }

      // Get brand data - handles expressions
      const brandDataList = this.getBrandData(brandIds);
      if (brandDataList.length === 0) {
        throw new Error(`No brand data found for brands: ${brandIds.join(', ')}`);
      }

      console.log('Brands found:', brandDataList.map(b => ({
        name: b['Brand Names'] || b['Display Names'],
        expression: b.expressionName,
        isExpression: b.isExpression,
        ttbType: b['TTB Type']
      })));

      // Build the copy from template
      const generatedCopy = this.buildCopyFromTemplate(
        template,
        langVars,
        brandDataList,
        countryCode,
        language,
        assetType
      );

      const generationTime = Date.now() - startTime;

      console.log('Copy generation complete!');

      return {
        success: true,
        copy: generatedCopy,
        metadata: {
          assetType,
          countryCode,
          language,
          brandCount: brandIds.length,
          brands: brandDataList.map(b => b.expressionName || b['Brand Names'] || b['Display Names']),
          templateUsed: template['Asset Type'],
          generationTime: `${generationTime}ms`,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Copy generation error:', error);
      return {
        success: false,
        error: error.message,
        metadata: {
          generationTime: `${Date.now() - startTime}ms`,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  /**
   * Validate generation parameters
   * @param {Object} params - Parameters to validate
   * @throws {Error} If parameters are invalid
   */
  validateParams(params) {
    if (!params) {
      throw new Error('Parameters are required');
    }

    const { assetType, countryCode, brandIds } = params;

    if (!assetType || typeof assetType !== 'string') {
      throw new Error('Valid asset type is required');
    }

    if (!countryCode || typeof countryCode !== 'string') {
      throw new Error('Valid country code is required');
    }

    if (!Array.isArray(brandIds) || brandIds.length === 0) {
      throw new Error('At least one brand must be selected');
    }
  }

  // ============================================
  // DATA LOOKUP METHODS
  // ============================================

  /**
   * Get asset template by type
   * @param {string} assetType - Asset type name
   * @returns {Object|null} Template object or null if not found
   */
  getAssetTemplate(assetType) {
    return this.templates.find(t => 
      t['Asset Type'] === assetType
    );
  }

  /**
   * Get language for a country code
   * @param {string} countryCode - Country code (e.g., 'US', 'GB')
   * @returns {string} Language name
   */
  getLanguageForCountry(countryCode) {
    const countryData = this.countryLanguage.find(c => 
      c['Abbv'] === countryCode || c['CountryCode'] === countryCode || c['Country Code'] === countryCode
    );

    if (countryData) {
      return countryData['Language'];
    }

    console.warn(`No language found for country ${countryCode}, defaulting to English (Default)`);
    return 'English (Default)';
  }

  /**
   * Get language variables for a language
   * @param {string} language - Language name
   * @returns {Object|null} Language variables object or null
   */
  getLanguageVariables(language) {
    return this.languageData.find(lv => 
      lv['Language'] === language
    );
  }

  /**
   * Get brand data for multiple brand IDs
   * Handles both base brands and expressions
   * @param {Array<string>} brandIds - Array of brand names/IDs (can be expressions)
   * @returns {Array<Object>} Array of brand data objects
   */
  getBrandData(brandIds) {
    const brandDataList = [];

    for (const brandId of brandIds) {
      // First try exact match
      let brandData = this.trademarkData.find(b => 
        b['Brand Names'] === brandId || 
        b['Display Names'] === brandId
      );

      // If not found, extract base brand and try again
      if (!brandData) {
        const baseBrand = this.excelService.extractBaseBrand(brandId);
        console.log(`Expression detected: "${brandId}" -> Base: "${baseBrand}"`);
        
        brandData = this.trademarkData.find(b => 
          b['Brand Names'] === baseBrand || 
          b['Display Names'] === baseBrand
        );
        
        if (brandData) {
          // Store both expression and base brand info
          brandData = {
            ...brandData,
            expressionName: brandId,  // Keep the full expression name for TTB lookups
            isExpression: true
          };
          console.log(`Found base brand in Trademark Config for expression "${brandId}"`);
        }
      }

      if (brandData) {
        brandDataList.push(brandData);
      } else {
        console.warn(`Brand not found in Trademark Config: ${brandId}`);
      }
    }

    return brandDataList;
  }

  // ============================================
  // TTB STATEMENT METHODS
  // ============================================

  /**
   * Get the full TTB row for a brand or expression
   * Uses fuzzy matching to handle brand name variations
   * For expressions, uses the FULL expression name
   * @param {string} brandName - Brand name or expression to look up
   * @param {string} displayName - Display name to try as fallback
   * @returns {Object|null} TTB row object or null
   */
  getTTBRow(brandName, displayName = null) {
    if (!this.ttbStatements || this.ttbStatements.length === 0) {
      return null;
    }

    const aggressiveNormalize = (name) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '')
        .replace(/\bno\s+/g, 'n')
        .replace(/\bn\s+/g, 'n')
        .replace(/\bno\b/g, 'n')
        .replace(/\s+/g, '');
    };

    const tryMatch = (searchName) => {
      if (!searchName) return null;

      const normalizedSearch = aggressiveNormalize(searchName);

      // Try exact match
      let ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        return rowBrandName === searchName;
      });
      if (ttbRow) return ttbRow;

      // Try normalized match
      ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        return aggressiveNormalize(rowBrandName) === normalizedSearch;
      });
      if (ttbRow) return ttbRow;

      // Try contains match
      ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        const rowNormalized = aggressiveNormalize(rowBrandName);
        return rowNormalized.includes(normalizedSearch) || normalizedSearch.includes(rowNormalized);
      });

      return ttbRow;
    };

    let result = tryMatch(brandName);
    if (!result && displayName && displayName !== brandName) {
      result = tryMatch(displayName);
    }

    return result;
  }

  /**
   * Get TTB statement for a brand or expression
   * For expressions, uses the FULL expression name to get specific ABV
   * Uses enhanced fuzzy matching to handle name variations
   * @param {string} brandName - Brand name or expression
   * @param {string} ttbType - TTB type (Full/Tightened/Limited Character)
   * @param {string} displayName - Display name as fallback
   * @returns {string} TTB statement text
   */
  getTTBStatement(brandName, ttbType = 'Full', displayName = null) {
    console.log(`Looking up TTB statement for: "${brandName}" (Type: ${ttbType})`);
    if (displayName && displayName !== brandName) {
      console.log(`Also have Display Names: "${displayName}"`);
    }
    
    if (!this.ttbStatements || this.ttbStatements.length === 0) {
      console.warn('TTB Statements sheet is empty or not loaded');
      return '';
    }

    const availableTTBBrands = this.ttbStatements.map(row => 
      row['Brand Name'] || row['Brand'] || row['BrandName']
    ).filter(Boolean);
    console.log('Available TTB brands (first 10):', availableTTBBrands.slice(0, 10));

    const aggressiveNormalize = (name) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '')
        .replace(/\bno\s+/g, 'n')
        .replace(/\bn\s+/g, 'n')
        .replace(/\bno\b/g, 'n')
        .replace(/\s+/g, '');
    };

    const extractKeyParts = (name) => {
      if (!name) return [];
      const normalized = name.toLowerCase();
      const parts = [];
      
      const numbers = normalized.match(/\d+/g) || [];
      parts.push(...numbers);
      
      const words = normalized
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 2 && !['the', 'and', 'for', 'from'].includes(w));
      parts.push(...words);
      
      return parts;
    };

    const tryMatch = (searchName) => {
      if (!searchName) return null;
      
      const normalizedSearch = aggressiveNormalize(searchName);
      const searchKeyParts = extractKeyParts(searchName);
      
      // Try exact match
      let ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        return rowBrandName === searchName;
      });
      if (ttbRow) return { row: ttbRow, strategy: 'EXACT' };

      // Try normalized match
      ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        return aggressiveNormalize(rowBrandName) === normalizedSearch;
      });
      if (ttbRow) return { row: ttbRow, strategy: 'NORMALIZED' };

      // Try key parts match
      if (searchKeyParts.length > 0) {
        ttbRow = this.ttbStatements.find(row => {
          const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
          const rowNormalized = aggressiveNormalize(rowBrandName);
          const rowKeyParts = extractKeyParts(rowBrandName);
          
          const allPartsMatch = searchKeyParts.every(part => 
            rowNormalized.includes(part) || rowKeyParts.includes(part)
          );
          
          return allPartsMatch;
        });
        if (ttbRow) return { row: ttbRow, strategy: 'KEY_PARTS' };
      }

      // Try contains match
      ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        const rowNormalized = aggressiveNormalize(rowBrandName);
        
        const match = rowNormalized.includes(normalizedSearch) || 
                     normalizedSearch.includes(rowNormalized);
        
        return match;
      });
      if (ttbRow) return { row: ttbRow, strategy: 'CONTAINS' };

      // Try with Jack Daniel's prefix
      if (!searchName.toLowerCase().includes('jack')) {
        const withPrefix = `Jack Daniel's ${searchName}`;
        const normalizedWithPrefix = aggressiveNormalize(withPrefix);
        
        ttbRow = this.ttbStatements.find(row => {
          const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
          const rowNormalized = aggressiveNormalize(rowBrandName);
          return rowNormalized === normalizedWithPrefix || 
                 rowNormalized.includes(normalizedWithPrefix) ||
                 normalizedWithPrefix.includes(rowNormalized);
        });
        if (ttbRow) return { row: ttbRow, strategy: 'PREFIX' };
      }

      return null;
    };

    console.log(`Trying Brand Names: "${brandName}"`);
    let result = tryMatch(brandName);
    
    if (!result && displayName && displayName !== brandName) {
      console.log(`No match with Brand Names, trying Display Names: "${displayName}"`);
      result = tryMatch(displayName);
      if (result) {
        console.log(`Found match using Display Names!`);
      }
    }

    if (!result) {
      console.warn(`No TTB statement found for brand: "${brandName}"`);
      if (displayName && displayName !== brandName) {
        console.warn(`Also tried Display Names: "${displayName}"`);
      }
      console.warn(`Available brands: ${availableTTBBrands.slice(0, 5).join(', ')}...`);
      return '';
    }

    const ttbRow = result.row;
    const matchStrategy = result.strategy;
    
    console.log(`Found TTB row for: "${ttbRow['Brand Name'] || ttbRow['Brand']}" [${matchStrategy}]`);

    // Get the appropriate TTB statement based on type
    let statement = '';
    
    if (ttbType === 'Full') {
      statement = ttbRow['TTB Statement - Full'] || 
                 ttbRow['TTB Statement Full'] || 
                 ttbRow['TTBStatementFull'] ||
                 ttbRow['Full'] ||
                 '';
    } else if (ttbType === 'Tightened') {
      statement = ttbRow['TTB Statement - Tightened'] || 
                 ttbRow['TTB Statement Tightened'] || 
                 ttbRow['TTBStatementTightened'] ||
                 ttbRow['Tightened'] ||
                 '';
    } else if (ttbType === 'Limited Character') {
      statement = ttbRow['TTB Statement - Limited Character'] || 
                 ttbRow['TTB Statement Limited Character'] || 
                 ttbRow['TTBStatementLimitedCharacter'] ||
                 ttbRow['Limited Character'] ||
                 '';
    }

    if (!statement) {
      console.warn(`No statement found for type "${ttbType}", trying default...`);
      statement = ttbRow['TTB Statement'] || ttbRow['Statement'] || '';
    }

    if (statement) {
      console.log(`TTB Statement found for ${brandName} (${ttbType}): ${statement.substring(0, 100)}...`);
    } else {
      console.warn(`No TTB statement text found for ${brandName} (${ttbType})`);
    }

    return statement;
  }

  /**
   * Parse TTB statement to extract components
   * @param {string} ttbStatement - Full TTB statement
   * @returns {Object|null} Parsed components (classType, abv, company, full)
   */
  parseTTBStatement(ttbStatement) {
    if (!ttbStatement) return null;
    
    // Pattern: "Class Type, ABV, Company/Location"
    // Example: "Tennessee Whiskey, 40% Alc. by Vol., Jack Daniel Distillery, Lynchburg, TN"
    
    const parts = ttbStatement.split(',').map(p => p.trim());
    
    // Extract class type (first part)
    const classType = parts[0] || '';
    
    // Extract ABV (look for percentage)
    let abv = '';
    let companyIndex = 1;
    for (let i = 1; i < parts.length; i++) {
      if (parts[i].includes('%') || parts[i].toLowerCase().includes('alc')) {
        abv = parts[i];
        companyIndex = i + 1;
        break;
      }
    }
    
    // Extract company and location (everything after ABV)
    const companyParts = parts.slice(companyIndex);
    const company = companyParts.join(', ');
    
    return {
      classType,
      abv,
      company,
      full: ttbStatement
    };
  }

  /**
   * Build TTB section based on brand selection rules
   * Handles 4 scenarios: single brand, same class, different classes, portfolio
   * For expressions, uses FULL expression name to get specific ABV
   * @param {Array<Object>} brandDataList - Array of brand data objects
   * @param {string} ttbType - TTB type (Full/Tightened/Limited Character)
   * @returns {string} Formatted TTB section
   */
  buildTTBSection(brandDataList, ttbType) {
    console.log(`Building TTB section for ${brandDataList.length} brand(s), TTB Type: ${ttbType}`);
    
    if (brandDataList.length === 0) {
      return '';
    }
    
    // SCENARIO 1: Single Brand
    if (brandDataList.length === 1) {
      console.log('Scenario 1: Single brand - Full TTB');
      const brandData = brandDataList[0];
      // Use expression name if it exists, otherwise use brand name
      const brandName = brandData.expressionName || brandData['Brand Names'] || brandData['Display Names'];
      const displayName = brandData['Display Names'];
      return this.getTTBStatement(brandName, ttbType, displayName);
    }
    
    // For multiple brands, check if all are in the same entity/portfolio
    const entities = [...new Set(brandDataList.map(b => b['Entity Names']).filter(Boolean))];
    console.log(`Unique entities: ${entities.join(', ')}`);
    
    // Get the first brand's TTB data to check for multi-brand columns
    const firstBrandName = brandDataList[0].expressionName || brandDataList[0]['Brand Names'] || brandDataList[0]['Display Names'];
    const firstBrandDisplayName = brandDataList[0]['Display Names'];
    const firstBrandTTBRow = this.getTTBRow(firstBrandName, firstBrandDisplayName);
    
    if (firstBrandTTBRow) {
      // Check if all brands have the same entity (e.g., all are "Jack Daniel's")
      if (entities.length === 1) {
        const entity = entities[0];
        console.log(`All brands have same entity: ${entity}`);
        
        // Check for portfolio-specific TTB statement
        const portfolioStatement = firstBrandTTBRow['+1 whitin JD Portfolio'] || 
                                   firstBrandTTBRow['+1 within JD Portfolio'];
        
        if (portfolioStatement) {
          console.log(`Scenario 4: Same entity/portfolio - Using portfolio TTB from Excel`);
          return portfolioStatement;
        }
      }
      
      // Check for different brands column ("+1 of different brands")
      const differentBrandsStatement = firstBrandTTBRow['+1 of different brands'];
      
      // Check if all brands have the same class type
      const ttbData = brandDataList.map(brandData => {
        const brandName = brandData.expressionName || brandData['Brand Names'] || brandData['Display Names'];
        const displayName = brandData['Display Names'];
        const statement = this.getTTBStatement(brandName, ttbType, displayName);
        const parsed = this.parseTTBStatement(statement);
        
        return {
          brandName,
          statement,
          parsed
        };
      }).filter(data => data.statement && data.parsed);
      
      const classTypes = ttbData.map(d => d.parsed.classType).filter(Boolean);
      const uniqueClassTypes = [...new Set(classTypes)];
      
      // SCENARIO 2: Multiple Brands - Same Class
      if (uniqueClassTypes.length === 1 && classTypes.length === ttbData.length) {
        console.log('Scenario 2: Multiple brands, same class - Class + ABV range + Company');
        
        const classType = uniqueClassTypes[0];
        
        // Extract ABV values and find range
        const abvValues = ttbData
          .map(d => d.parsed.abv)
          .filter(Boolean)
          .map(abv => {
            const matches = abv.match(/(\d+\.?\d*)/g);
            if (matches) {
              return matches.map(m => parseFloat(m));
            }
            return [];
          })
          .flat();
        
        let abvRange = '';
        if (abvValues.length > 0) {
          const minABV = Math.min(...abvValues);
          const maxABV = Math.max(...abvValues);
          
          if (minABV === maxABV) {
            abvRange = `${minABV}% Alc./Vol.`;
          } else {
            abvRange = `${minABV}-${maxABV}% Alc./Vol.`;
          }
        }
        
        // Use the company from the first brand
        const company = ttbData[0].parsed.company;
        
        // Build the combined statement
        return `${classType}, ${abvRange}, ${company}`;
      }
      
      // SCENARIO 3: Multiple Brands - Different Classes
      if (differentBrandsStatement) {
        console.log('Scenario 3: Multiple brands, different classes - Using Excel different brands column');
        return differentBrandsStatement;
      }
    }
    
    // Fallback: Use the company from the first brand
    console.log('Fallback: Using parsed company from first brand');
    const firstStatement = this.getTTBStatement(firstBrandName, ttbType, firstBrandDisplayName);
    const parsed = this.parseTTBStatement(firstStatement);
    return parsed ? parsed.company : '';
  }

  /**
   * Detect if brands are in the same portfolio
   * @param {Array<Object>} brandDataList - Array of brand data
   * @returns {Object|null} Portfolio info or null
   */
  detectPortfolio(brandDataList) {
    if (brandDataList.length < 2) return null;
    
    const brandNames = brandDataList.map(b => b.expressionName || b['Brand Names'] || b['Display Names']);
    
    // Check for common portfolio prefixes
    const portfolios = [
      { name: 'Jack Daniel', distillery: 'Jack Daniel Distillery, Lynchburg, TN' },
      { name: 'Old Forester', distillery: 'Old Forester Distilling Company' },
      { name: 'Woodford Reserve', distillery: 'Woodford Reserve Distillery' }
    ];
    
    for (const portfolio of portfolios) {
      const allInPortfolio = brandNames.every(name => 
        name && name.includes(portfolio.name)
      );
      if (allInPortfolio) {
        console.log(`Detected portfolio: ${portfolio.name}`);
        return portfolio;
      }
    }
    
    return null;
  }

  // ============================================
  // US RESPONSIBILITY MESSAGE
  // ============================================

  /**
   * Get US-specific Responsibility Message for a brand
   * For expressions, tries expression first then falls back to base brand
   * @param {string} brandName - Brand name or expression
   * @returns {string} US RMD text or empty string
   */
  getUSResponsibilityMessage(brandName) {
    if (!this.usResponsibilityMessage || this.usResponsibilityMessage.length === 0) {
      console.warn('US Responsibility Message sheet is empty or not loaded');
      return '';
    }
    
    console.log(`Looking up US RMD for: "${brandName}"`);
    
    // Aggressive normalize function to handle all variations
    const normalize = (name) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .trim()
        .replace(/jack\s+daniel'?s?\s*/gi, '') // Remove "Jack Daniel's" prefix
        .replace(/\bno\.?\s*/gi, 'no') // "No.7" or "No. 7" -> "no7"
        .replace(/\bn\.?\s*/gi, 'n') // "N.7" or "N. 7" -> "n7"
        .replace(/[^\w]/g, '') // Remove all punctuation
        .replace(/\s+/g, ''); // Remove spaces
    };
    
    const normalizedSearch = normalize(brandName);
    console.log(`Normalized search: "${normalizedSearch}"`);
    
    // Try exact match first (unlikely to work but quick)
    let usRMDRow = this.usResponsibilityMessage.find(row => {
      const rowBrandName = row['Brand Name'];
      return rowBrandName === brandName;
    });
    
    if (usRMDRow) {
      console.log(`Found US RMD (exact match): ${usRMDRow['US RMD']}`);
      return usRMDRow['US RMD'] || '';
    }
    
    // Try normalized match - this should catch most variations
    usRMDRow = this.usResponsibilityMessage.find(row => {
      const rowBrandName = row['Brand Name'];
      if (!rowBrandName) return false;
      const rowNormalized = normalize(rowBrandName);
      const matches = rowNormalized === normalizedSearch;
      if (matches) {
        console.log(`Matched "${rowBrandName}" -> normalized: "${rowNormalized}"`);
      }
      return matches;
    });
    
    if (usRMDRow) {
      console.log(`Found US RMD (normalized match): ${usRMDRow['US RMD']}`);
      return usRMDRow['US RMD'] || '';
    }
    
    // Try fuzzy contains match
    usRMDRow = this.usResponsibilityMessage.find(row => {
      const rowBrandName = row['Brand Name'];
      if (!rowBrandName) return false;
      const rowNormalized = normalize(rowBrandName);
      
      // Check if one contains the other
      const matches = normalizedSearch.length >= 3 && rowNormalized.length >= 3 && 
                     (normalizedSearch.includes(rowNormalized) || rowNormalized.includes(normalizedSearch));
      
      if (matches) {
        console.log(`Fuzzy matched "${rowBrandName}" -> normalized: "${rowNormalized}"`);
      }
      return matches;
    });
    
    if (usRMDRow) {
      console.log(`Found US RMD (fuzzy match): ${usRMDRow['US RMD']}`);
      return usRMDRow['US RMD'] || '';
    }
    
    // If this is an expression, try with the base brand
    const baseBrand = this.excelService.extractBaseBrand(brandName);
    if (baseBrand !== brandName) {
      console.log(`Trying with base brand: "${baseBrand}"`);
      return this.getUSResponsibilityMessage(baseBrand);
    }
    
    console.warn(`No US Responsibility Message found for brand: "${brandName}"`);
    console.warn(`Normalized: "${normalizedSearch}"`);
    console.warn(`First 5 available: ${this.usResponsibilityMessage.slice(0, 5).map(r => `"${r['Brand Name']}" (norm: "${normalize(r['Brand Name'])}")`).join(', ')}`);
    return '';
  }

  // ============================================
  // TRADEMARK SECTION BUILDING
  // ============================================

  /**
   * Build trademark section for selected brands
   * Handles singular/plural formatting, portfolio prefixes, and entity copyrights
   * For expressions, uses BASE brand name (not the expression)
   * @param {Array<Object>} brandDataList - Array of brand data
   * @param {string} language - Language name
   * @param {string} assetType - Asset type name
   * @param {string} countryCode - Country code
   * @returns {string} Formatted trademark section
   */
  buildTrademarkSection(brandDataList, language, assetType, countryCode) {
    const currentYear = new Date().getFullYear();
    
    if (brandDataList.length === 0) {
      return '';
    }
    
    console.log(`Building trademark section for ${brandDataList.length} brand(s), Language: ${language}, Asset Type: ${assetType}`);
    
    // CRITICAL: Use NUMBER 1 instead of STRING '1' for single brand
    // Excel has Singular vs Plural = 1 (number) for single brand, not '1' (string)
    const singularOrPlural = brandDataList.length === 1 ? 1 : '1+';
    
    // Get the appropriate Trademark Language row
    const tmLangData = this.trademarkLanguage.find(tl => 
      tl['Language'] === language && tl['Singular vs Plural'] === singularOrPlural
    );
    
    if (!tmLangData) {
      console.warn(`No trademark language found for: ${language} (${singularOrPlural})`);
      return '';
    }
    
    console.log(`Using trademark language: ${language} (${singularOrPlural})`);
    
    // Check if we need to prepend portfolio name for single brand
    let usePortfolioForSingle = false;
    if (brandDataList.length === 1) {
      const brandData = brandDataList[0];
      const brandName = brandData['Brand Names'] || brandData['Display Names'];
      const entityName = brandData['Entity Names'] || '';
      
      // Only prepend portfolio for specific portfolio brands
      const isKnownPortfolio = [
        "Jack Daniel's",
        "Old Forester",
        "Woodford Reserve"
      ].includes(entityName);
      
      if (isKnownPortfolio && !brandName.includes(entityName)) {
        usePortfolioForSingle = true;
        console.log(`Single brand will use portfolio prefix, switching to plural form`);
      }
    }
    
    // If single brand needs portfolio prefix, use plural form instead
    const effectiveSingularOrPlural = usePortfolioForSingle ? '1+' : singularOrPlural;
    
    // Get the appropriate Trademark Language row
    const effectiveTmLangData = usePortfolioForSingle 
      ? this.trademarkLanguage.find(tl => tl['Language'] === language && tl['Singular vs Plural'] === '1+')
      : tmLangData;
    
    if (!effectiveTmLangData) {
      console.warn(`No trademark language found for: ${language} (${effectiveSingularOrPlural})`);
      return '';
    }
    
    // Use the ASSET_TYPE_TO_TRADEMARK_TYPE mapping based on the selected asset type
    const trademarkType = this.ASSET_TYPE_TO_TRADEMARK_TYPE[assetType] || 'Full';
    
    console.log(`Trademark structure type from asset type mapping: ${trademarkType}`);
    
    // Get the trademark structure
    const tmStructure = this.trademarkStructure.find(ts => 
      ts['Type of Trademark'] === trademarkType
    );
    
    if (!tmStructure) {
      console.warn(`No trademark structure found for type: ${trademarkType}`);
      return '';
    }
    
    console.log(`Using trademark structure: ${trademarkType}`);
    console.log(`Structure template: ${tmStructure.Structure}`);
    
    // Build the trademark text based on singular or plural
    let trademarkText = '';
    
    if (brandDataList.length === 1) {
      // SINGULAR brand trademark - use BASE brand name
      const brandData = brandDataList[0];
      let brandName = brandData['Brand Names'] || brandData['Display Names'];
      const entityName = brandData['Entity Names'] || '';
      const preBrand = this.safeGetValue(effectiveTmLangData['Pre-Brand'], 'Pre-Brand');
      
      // For single brand, if entity is a portfolio and not in brand name, prepend it
      if (usePortfolioForSingle) {
        const conjunction = this.safeGetValue(effectiveTmLangData['Conjuction'], 'Conjuction') || 'and';
        brandName = `${entityName} ${conjunction} ${brandName}`;
        console.log(`Single brand with portfolio: "${brandName}"`);
      }
      
      // Build using structure template
      trademarkText = tmStructure.Structure;
      
      // Replace placeholders
      trademarkText = trademarkText.replace(/<<Pre-Brand>>/g, preBrand);
      trademarkText = trademarkText.replace(/<<Brand>>/g, brandName);
      trademarkText = trademarkText.replace(/<<Registered Language>>/g, 
        this.safeGetValue(effectiveTmLangData['Registered Language'], 'Registered Language'));
      trademarkText = trademarkText.replace(/<<Year>>/g, currentYear.toString());
      trademarkText = trademarkText.replace(/<<Entity>>/g, entityName);
      
      // Insert Third Party info (Column E) BEFORE Reserve Language if it exists
      const thirdParty = brandData['Third Party'];
      const reserveLanguage = this.safeGetValue(
        effectiveTmLangData['Reserve Language '] || effectiveTmLangData['Reserve Language'], 
        'Reserve Language'
      );
      
      if (thirdParty && thirdParty.trim()) {
        // Insert Third Party before Reserve Language
        const reserveWithThirdParty = thirdParty.trim() + ' ' + reserveLanguage;
        trademarkText = trademarkText.replace(/<<Reserve Language>>/g, reserveWithThirdParty);
        console.log(`Added Third Party info before Reserve Language: ${thirdParty}`);
      } else {
        trademarkText = trademarkText.replace(/<<Reserve Language>>/g, reserveLanguage);
      }
      
      // Clean up extra spaces
      trademarkText = trademarkText.replace(/\s+/g, ' ').trim();
      
      console.log(`Singular trademark: ${trademarkText}`);
      
    } else {
      // PLURAL brands trademark - use BASE brand names
      
      // Check if all brands have the same entity
      const entities = [...new Set(brandDataList.map(b => b['Entity Names']).filter(Boolean))];
      const sameEntity = entities.length === 1;
      const portfolioEntity = sameEntity ? entities[0] : null;
      
      console.log(`Same entity check: ${sameEntity}, Entity: ${portfolioEntity}`);
      
      // Get all brand names - use BASE brand names
      let brandNames = brandDataList.map(b => b['Brand Names'] || b['Display Names']);
      
      // If all brands are from the same portfolio entity, prepend the entity name
      if (portfolioEntity && portfolioEntity !== 'Brown-Forman Corporation' && portfolioEntity !== 'Brown-Forman') {
        const portfolioInBrands = brandNames.some(name => name.includes(portfolioEntity));
        if (!portfolioInBrands) {
          brandNames = [portfolioEntity, ...brandNames];
          console.log(`Prepended portfolio entity "${portfolioEntity}" to brand list`);
        }
      }
      
      // Get conjunction (e.g., "and" for English, "y" for Spanish)
      const conjunction = this.safeGetValue(effectiveTmLangData['Conjuction'], 'Conjuction') || 'and';
      
      // Build brand list: "Brand1, Brand2 and Brand3"
      let brandList = '';
      if (brandNames.length === 2) {
        brandList = `${brandNames[0]} ${conjunction} ${brandNames[1]}`;
      } else {
        brandList = brandNames.slice(0, -1).join(', ') + ` ${conjunction} ${brandNames[brandNames.length - 1]}`;
      }
      
      console.log(`Brand list: ${brandList}`);
      console.log(`Entities: ${entities.join(', ')}`);
      
      // Build entity copyrights based on whether brands are from same portfolio
      let entityCopyrights = '';
      
      if (sameEntity && portfolioEntity && portfolioEntity !== 'Brown-Forman Corporation' && portfolioEntity !== 'Brown-Forman') {
        entityCopyrights = `©${currentYear} ${portfolioEntity}.`;
        console.log(`Same portfolio - using single entity: ${portfolioEntity}`);
      } else {
        const brownFormanEntity = entities.find(e => 
          e === 'Brown-Forman' || e === 'Brown-Forman Corporation'
        ) || 'Brown-Forman';
        
        entityCopyrights = `©${currentYear} ${brownFormanEntity}.`;
        console.log(`Different brands - using consolidated entity: ${brownFormanEntity}`);
      }
      
      // Get components
      const preBrand = this.safeGetValue(effectiveTmLangData['Pre-Brand'], 'Pre-Brand');
      const registeredLanguage = this.safeGetValue(effectiveTmLangData['Registered Language'], 'Registered Language');
      const reserveLanguage = this.safeGetValue(
        effectiveTmLangData['Reserve Language '] || effectiveTmLangData['Reserve Language'], 
        'Reserve Language'
      );
      
      console.log(`Reserve Language value: "${reserveLanguage}"`);
      
      // Build the complete trademark text
      const parts = [];
      
      if (preBrand) {
        parts.push(preBrand);
      }
      
      parts.push(brandList);
      parts.push(registeredLanguage);
      parts.push(entityCopyrights);
      
      if (reserveLanguage) {
        parts.push(reserveLanguage);
      }
      
      // Join with spaces and clean up
      trademarkText = parts.join(' ').replace(/\s+/g, ' ').trim();
      
      console.log(`Plural trademark: ${trademarkText}`);
    }
    
    return trademarkText;
  }

  // ============================================
  // TEMPLATE PROCESSING
  // ============================================

  /**
   * Build copy from template by replacing all placeholders
   * @param {Object} template - Template object
   * @param {Object} langVars - Language variables
   * @param {Array<Object>} brandDataList - Brand data array
   * @param {string} countryCode - Country code
   * @param {string} language - Language name
   * @param {string} assetType - Asset type name
   * @returns {Object} Copy object with html, plainText, and metadata
   */
  buildCopyFromTemplate(template, langVars, brandDataList, countryCode, language, assetType) {
    let copyText = template.Structure || '';

    console.log('Building copy from template...');
    console.log('Original template:', copyText);
    console.log('Country code:', countryCode);
    console.log('Number of brands:', brandDataList.length);
    console.log('Asset Type:', assetType);

    const ttbTypeForAsset = this.ASSET_TYPE_TO_TTB_TYPE[assetType];
    if (ttbTypeForAsset) {
      console.log(`TTB Type for "${assetType}": ${ttbTypeForAsset}`);
    } else {
      console.warn(`No TTB Type mapping found for "${assetType}", defaulting to "Full"`);
    }
    const ttbType = ttbTypeForAsset || 'Full';

    // Replace Responsibility Language
    if (copyText.includes('<<Responsibility Language>>')) {
      let respLang = '';
      
      // For US brands, use brand-specific US RMD instead of generic responsibility language
      if (countryCode === 'US' && this.usResponsibilityMessage && this.usResponsibilityMessage.length > 0) {
        if (brandDataList.length === 1) {
          const brandName = brandDataList[0].expressionName || brandDataList[0]['Brand Names'] || brandDataList[0]['Display Names'];
          const usRMD = this.getUSResponsibilityMessage(brandName);
          if (usRMD) {
            respLang = usRMD;
            console.log(`Using US-specific Responsibility Language: ${usRMD}`);
          }
        } else {
          respLang = 'Please Drink Responsibly.';
          console.log(`Using generic US Responsibility Language for multiple brands`);
        }
      }
      
      // If no US-specific message found, use default from language variables
      if (!respLang) {
        respLang = this.safeGetValue(
          langVars['Responsibility Language '] || langVars['Responsibility Language'],
          'Responsibility Language'
        );
        console.log(`Using default Responsibility Language: ${respLang}`);
      }
      
      copyText = copyText.replace(/<<Responsibility Language>>/g, respLang);
      console.log('Replaced: Responsibility Language');
    }

    // Replace TTB statement
    if (copyText.includes('<<TTB>>')) {
      console.log('Found <<TTB>> placeholder in template');
      console.log('Country check: Is US?', countryCode === 'US');
      
      if (countryCode === 'US') {
        console.log('US detected - building TTB section with multi-brand logic...');
        
        const ttbSection = this.buildTTBSection(brandDataList, ttbType);
        
        if (ttbSection) {
          const formattedTTB = '<br><br>' + ttbSection + '<br><br>';
          copyText = copyText.replace(/<<TTB>>/g, formattedTTB);
          console.log(`Replaced <<TTB>>`);
          console.log('TTB Section:', ttbSection);
        } else {
          copyText = copyText.replace(/<<TTB>>/g, '');
          console.warn('No TTB section generated - placeholder removed');
        }
      } else {
        copyText = copyText.replace(/<<TTB>>/g, '');
        console.log(`Removed <<TTB>> (non-US country: ${countryCode})`);
      }
    } else {
      console.log('No <<TTB>> placeholder found in template');
    }

    // Replace Trademark
    if (copyText.includes('<<Trademark>>')) {
      const trademarkSection = this.buildTrademarkSection(brandDataList, language, assetType, countryCode);
      copyText = copyText.replace(/<<Trademark>>/g, trademarkSection);
      console.log('Replaced: Trademark');
    }

    // Replace Forward Notice
    if (copyText.includes('<<Forward Notice>>')) {
      const forwardNotice = this.getForwardNotice(brandDataList, langVars);
      copyText = copyText.replace(/<<Forward Notice>>/g, forwardNotice);
      console.log('Replaced: Forward Notice');
    }

    // Replace All Other Trademarks
    if (copyText.includes('<<All Other Trademarks>>')) {
      const allOtherTM = this.safeGetValue(langVars['All Other Trademarks'], 'All Other Trademarks');
      copyText = copyText.replace(/<<All Other Trademarks>>/g, allOtherTM);
      console.log('Replaced: All Other Trademarks');
    }

    // Replace Responsibility Site
    if (copyText.includes('<<Responsibility Site>>')) {
      const respSite = this.safeGetValue(langVars['Responsibility Site'], 'Responsibility Site');
      copyText = copyText.replace(/<<Responsibility Site>>/g, respSite);
      console.log('Replaced: Responsibility Site');
    }

    // Replace Legal Documents (with pre-built hyperlinks from Excel)
    if (copyText.includes('<<Legal Documents>>')) {
      const prebuiltHyperlinks = this.safeGetValue(
        langVars['Website Legal Documents (Hyperlinks)'], 
        'Website Legal Documents (Hyperlinks)'
      );
      
      if (prebuiltHyperlinks) {
        copyText = copyText.replace(/<<Legal Documents>>/g, prebuiltHyperlinks);
        console.log('Replaced: Legal Documents (using pre-built hyperlinks from Excel)');
      } else {
        console.log('"Website Legal Documents (Hyperlinks)" column not found, using fallback');
        
        const termsUrl = this.safeGetValue(langVars['Terms of Use'], 'Terms of Use');
        const privacyUrl = this.safeGetValue(langVars['Privacy Policy'], 'Privacy Policy');
        const cookieUrl = this.safeGetValue(langVars['Cookie Policy'], 'Cookie Policy');
        
        const legalDocs = this.safeGetValue(langVars['Website Legal Documents'], 'Website Legal Documents');
        
        const segments = legalDocs.split('|').map(s => s.trim());
        
        const hyperlinkSegments = segments.map((segment, index) => {
          if (index === 0 && termsUrl) {
            return `<a href="${termsUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
          } else if (index === 1 && privacyUrl) {
            return `<a href="${privacyUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
          } else if (index === 2 && cookieUrl) {
            return `<a href="${cookieUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
          } else {
            return segment;
          }
        });
        
        const hyperlinkDocs = hyperlinkSegments.join(' | ');
        copyText = copyText.replace(/<<Legal Documents>>/g, hyperlinkDocs);
        console.log('Replaced: Legal Documents (using fallback position-based hyperlinks)');
      }
    }

    // Replace Email Sent By
    if (copyText.includes('<<Email Sent By>>')) {
      const emailSentBy = this.safeGetValue(langVars['Email Sent By Statement'], 'Email Sent By Statement');
      copyText = copyText.replace(/<<Email Sent By>>/g, emailSentBy);
      console.log('Replaced: Email Sent By');
    }

    // Replace Email Legal Documents
    if (copyText.includes('<<Email Legal Documents>>')) {
      const termsUrl = this.safeGetValue(langVars['Terms of Use'], 'Terms of Use');
      const privacyUrl = this.safeGetValue(langVars['Privacy Policy'], 'Privacy Policy');
      const cookieUrl = this.safeGetValue(langVars['Cookie Policy'], 'Cookie Policy');
      
      const emailLegalDocs = this.safeGetValue(langVars['Email Legal Documents'], 'Email Legal Documents');
      
      const segments = emailLegalDocs.split('|').map(s => s.trim());
      
      const hyperlinkSegments = segments.map((segment, index) => {
        if (index === 0 && termsUrl) {
          return `<a href="${termsUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
        } else if (index === 1 && privacyUrl) {
          return `<a href="${privacyUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
        } else if (index === 2 && cookieUrl) {
          return `<a href="${cookieUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
        } else {
          return segment;
        }
      });
      
      const hyperlinkDocs = hyperlinkSegments.join(' | ');
      
      copyText = copyText.replace(/<<Email Legal Documents>>/g, hyperlinkDocs);
      console.log('Replaced: Email Legal Documents (with position-based hyperlinks)');
    }

    // Replace Email Header
    if (copyText.includes('<<Email Header>>')) {
      const emailHeader = this.safeGetValue(langVars['Email Header'], 'Email Header');
      copyText = copyText.replace(/<<Email Header>>/g, emailHeader);
      console.log('Replaced: Email Header');
    }

    // Replace UGC Policy
    if (copyText.includes('<<UGC Policy>>')) {
      const ugcPolicy = this.safeGetValue(langVars['UGC Policy'], 'UGC Policy');
      copyText = copyText.replace(/<<UGC Policy>>/g, ugcPolicy);
      console.log('Replaced: UGC Policy:', ugcPolicy);
    }

    // Replace Age-Gate Statement
    if (copyText.includes('<<Age-Gate Statement>>')) {
      const ageGate = this.safeGetValue(langVars['Age-Gate Statement'], 'Age-Gate Statement');
      copyText = copyText.replace(/<<Age-Gate Statement>>/g, ageGate);
      console.log('Replaced: Age-Gate Statement');
    }

    // Replace Terms of Use (with hyperlink)
    if (copyText.includes('<<Terms of Use>>')) {
      const termsOfUseUrl = this.safeGetValue(langVars['Terms of Use'], 'Terms of Use');
      const termsOfUseLink = termsOfUseUrl ? `<a href="${termsOfUseUrl}" target="_blank" rel="noopener noreferrer">Terms of Use</a>` : 'Terms of Use';
      copyText = copyText.replace(/<<Terms of Use>>/g, termsOfUseLink);
      console.log('Replaced: Terms of Use (with hyperlink)');
    }

    // Replace Privacy Policy (with hyperlink)
    if (copyText.includes('<<Privacy Policy>>')) {
      const privacyPolicyUrl = this.safeGetValue(langVars['Privacy Policy'], 'Privacy Policy');
      const privacyPolicyLink = privacyPolicyUrl ? `<a href="${privacyPolicyUrl}" target="_blank" rel="noopener noreferrer">Privacy Policy</a>` : 'Privacy Policy';
      copyText = copyText.replace(/<<Privacy Policy>>/g, privacyPolicyLink);
      console.log('Replaced: Privacy Policy (with hyperlink)');
    }

    // Replace Cookie Policy (with hyperlink)
    if (copyText.includes('<<Cookie Policy>>')) {
      const cookiePolicyUrl = this.safeGetValue(langVars['Cookie Policy'], 'Cookie Policy');
      const cookiePolicyLink = cookiePolicyUrl ? `<a href="${cookiePolicyUrl}" target="_blank" rel="noopener noreferrer">Cookie Policy</a>` : 'Cookie Policy';
      copyText = copyText.replace(/<<Cookie Policy>>/g, cookiePolicyLink);
      console.log('Replaced: Cookie Policy (with hyperlink)');
    }

    // Replace Terms Agreement
    if (copyText.includes('<<Terms Agreement>>')) {
      const termsAgreement = this.safeGetValue(langVars['Terms Agreement'], 'Terms Agreement');
      copyText = copyText.replace(/<<Terms Agreement>>/g, termsAgreement);
      console.log('Replaced: Terms Agreement');
    }

    // Replace Email Opt-In Statement
    if (copyText.includes('<<Email Opt-In Statement>>')) {
      const optIn = this.safeGetValue(langVars['Email Opt-In Statement and Consent Statement'], 'Email Opt-In Statement');
      copyText = copyText.replace(/<<Email Opt-In Statement>>/g, optIn);
      console.log('Replaced: Email Opt-In Statement');
    }

    // Replace Abbreviated Privacy Policy
    if (copyText.includes('<<Abbreviated Privacy Policy>>')) {
      const abbrevPrivacy = this.safeGetValue(langVars['Abbreviated Privacy Policy'], 'Abbreviated Privacy Policy');
      copyText = copyText.replace(/<<Abbreviated Privacy Policy>>/g, abbrevPrivacy);
      console.log('Replaced: Abbreviated Privacy Policy');
    }

    // CRITICAL: Replace <<Brand>> at the VERY END
    // This is because <<Brand>> appears INSIDE other placeholders like <<Email Opt-In Statement>>
    if (copyText.includes('<<Brand>>')) {
      let brandNames = '';
      
      if (brandDataList.length === 1) {
        // For single brand, use the DISPLAY name (expression name if it exists)
        brandNames = brandDataList[0].expressionName || brandDataList[0]['Display Names'] || brandDataList[0]['Brand Names'];
      } else if (brandDataList.length === 2) {
        const names = brandDataList.map(b => b.expressionName || b['Display Names'] || b['Brand Names']);
        brandNames = `${names[0]} and ${names[1]}`;
      } else {
        const names = brandDataList.map(b => b.expressionName || b['Display Names'] || b['Brand Names']);
        brandNames = names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
      }
      
      copyText = copyText.replace(/<<Brand>>/g, brandNames);
      console.log(`Replaced: Brand -> ${brandNames}`);
    }

    console.log('Final copy length:', copyText.length);

    const htmlCopy = this.formatAsHtml(copyText);
    const plainText = this.stripHtml(htmlCopy);

    return {
      html: htmlCopy,
      plainText: plainText,
      rawTemplate: copyText,
      characterCount: plainText.length,
      wordCount: this.countWords(plainText)
    };
  }

  /**
   * Get forward notice for brands if required
   * @param {Array<Object>} brandDataList - Brand data array
   * @param {Object} langVars - Language variables
   * @returns {string} Forward notice text or empty string
   */
  getForwardNotice(brandDataList, langVars) {
    const needsForwardNotice = brandDataList.some(b => 
      b['Forward Notice Type'] && b['Forward Notice Type'] !== 'NA'
    );

    if (!needsForwardNotice) {
      return '';
    }

    const forwardNoticeType = brandDataList[0]['Forward Notice Type'];

    if (forwardNoticeType === 'Full') {
      return this.safeGetValue(langVars['Forward Notice Full'], 'Forward Notice Full');
    } else if (forwardNoticeType === 'Tightened') {
      return this.safeGetValue(langVars['Forward Notice Tightened'], 'Forward Notice Tightened');
    }

    return '';
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Safe value getter to prevent [object Object] errors
   * Handles null, undefined, objects, and extracts string values
   * @param {*} value - Value to extract
   * @param {string} fieldName - Field name for logging
   * @returns {string} Extracted string value
   */
  safeGetValue(value, fieldName = 'field') {
    // Handle null/undefined
    if (value === null || value === undefined) {
      return '';
    }
    
    // If it's already a string or number, return it as string
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    
    // If it's an object (this causes [object Object])
    if (typeof value === 'object') {
      console.warn(`Field "${fieldName}" returned an object, attempting to extract value...`);
      
      // Try common object structures
      if (value.text) return String(value.text);
      if (value.value) return String(value.value);
      if (value.content) return String(value.content);
      
      // If it's an array, join it
      if (Array.isArray(value)) {
        return value.join(' ');
      }
      
      console.error(`Cannot extract string from object for "${fieldName}":`, value);
      return '';
    }
    
    // Fallback: convert to string
    return String(value);
  }

  /**
   * Format text as HTML
   * @param {string} text - Text to format
   * @returns {string} HTML formatted text
   */
  formatAsHtml(text) {
    return `<div class="generated-copy">${text}</div>`;
  }

  /**
   * Strip HTML tags and convert to plain text
   * Converts hyperlinks to readable format: "Text (URL)"
   * @param {string} html - HTML text
   * @returns {string} Plain text
   */
  stripHtml(html) {
    // Convert hyperlinks to readable format: "Text (URL)"
    let text = html.replace(/<a\s+href=["']?([^"'\s>]+)["']?[^>]*>([^<]+)<\/a>/gi, '$2 ($1)');
    
    // Remove all other HTML tags
    text = text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
    
    return text;
  }

  /**
   * Count words in text
   * @param {string} text - Text to count
   * @returns {number} Word count
   */
  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  // ============================================
  // DATA EXPORT METHODS
  // ============================================

  /**
   * Get available asset types
   * @returns {Array<string>} Array of asset type names
   */
  getAvailableAssetTypes() {
    if (!this.templates) return [];
    return this.templates.map(t => t['Asset Type']).filter(Boolean);
  }

  /**
   * Get available countries
   * @returns {Array<Object>} Array of country objects
   */
  getAvailableCountries() {
    if (!this.countryLanguage) return [];
    
    return this.countryLanguage
      .map(c => ({
        code: c['Abbv'] || c['CountryCode'],
        name: c['Country'] || c['CountryName'],
        language: c['Language']
      }))
      .filter(c => c.code && c.name);
  }

  /**
   * Get available brands (sorted alphabetically)
   * @returns {Array<Object>} Array of brand objects
   */
  getAvailableBrands() {
    if (!this.trademarkData) return [];
    
    return this.trademarkData
      .map(b => ({
        id: b['Brand Names'],
        name: b['Display Names'],
        entity: b['Entity Names']
      }))
      .filter(b => b.id && b.name)
      .sort((a, b) => {
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
  }
}

// Export singleton instance
const copyGenerator = new CopyGenerator();
export default copyGenerator;
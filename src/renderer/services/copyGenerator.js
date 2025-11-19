// src/renderer/services/copyGenerator.js
// Core Copy Generation Engine
// FIXED: Jack Daniel's scenario detection order

class CopyGenerator {
  constructor() {
    this.trademarkData = null;
    this.templates = null;
    this.brandConfig = null;
    this.languageData = null;
    this.trademarkLanguage = null;
    this.trademarkStructure = null;
    this.countryLanguage = null;
    this.ttbStatements = null;
    this.usResponsibilityMessage = null;
    this.brandAvailability = null;
    this.excelService = null;
    
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

  initialize(excelData, excelService) {
    if (!excelData || typeof excelData !== 'object') {
      throw new Error('Invalid Excel data provided to CopyGenerator');
    }

    console.log('CopyGenerator: Initializing with Excel data...');

    this.trademarkData = excelData['Trademark Config'] || [];
    this.templates = excelData['Overall Structure'] || [];
    this.trademarkStructure = excelData['Trademark Structure'] || [];
    this.languageData = excelData['Language Dependent Variables'] || [];
    this.trademarkLanguage = excelData['Trademark Language'] || [];
    this.countryLanguage = excelData['CountryLanguage'] || [];
    this.ttbStatements = excelData['TTB Statements'] || [];
    this.usResponsibilityMessage = excelData['US Responsibility Message'] || [];
    this.brandAvailability = excelData['Brand Availability'] || [];
    
    this.excelService = excelService;

    console.log('Loaded sheets:', {
      trademarkData: this.trademarkData.length,
      templates: this.templates.length,
      trademarkStructure: this.trademarkStructure.length,
      languageData: this.languageData.length,
      trademarkLanguage: this.trademarkLanguage.length,
      countryLanguage: this.countryLanguage.length,
      ttbStatements: this.ttbStatements.length,
      usResponsibilityMessage: this.usResponsibilityMessage.length,
      brandAvailability: this.brandAvailability.length
    });

    if (this.ttbStatements.length > 0) {
      console.log('Sample TTB Statement columns:', Object.keys(this.ttbStatements[0]));
      console.log('First TTB brand:', this.ttbStatements[0]['Brand Name'] || this.ttbStatements[0]);
    }

    if (this.brandAvailability.length > 0) {
      console.log('Brand Availability columns:', Object.keys(this.brandAvailability[0]));
      console.log('First brand:', this.brandAvailability[0]['Brand Name']);
    }

    if (this.trademarkData.length > 0) {
      console.log('Trademark Config columns:', Object.keys(this.trademarkData[0]));
    }

    this.validateData();
    
    console.log('CopyGenerator: Initialization complete');
  }

  validateData() {
    if (!this.brandAvailability || this.brandAvailability.length === 0) {
      throw new Error('Brand Availability sheet is empty or missing');
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

  isReady() {
    return !!(this.brandAvailability && this.templates && this.trademarkStructure);
  }

  generateCopy(params) {
    const startTime = Date.now();

    try {
      console.log('CopyGenerator: Starting generation...', params);

      this.validateParams(params);

      const { assetType, countryCode, brandIds } = params;

      const template = this.getAssetTemplate(assetType);
      if (!template) {
        throw new Error(`No template found for asset type: ${assetType}`);
      }

      console.log('Template found:', template['Asset Type']);
      console.log('Template structure:', template.Structure);

      const language = this.getLanguageForCountry(countryCode);
      console.log('Language for country:', { countryCode, language });

      const langVars = this.getLanguageVariables(language);
      if (!langVars) {
        throw new Error(`No language variables found for: ${language}`);
      }

      const brandDataList = this.getBrandData(brandIds);
      if (brandDataList.length === 0) {
        throw new Error(`No brand data found for brands: ${brandIds.join(', ')}`);
      }

      console.log('Brands found:', brandDataList.map(b => ({
        name: b['Brand Names'] || b['Display Names'],
        expression: b.expressionName,
        isExpression: b.isExpression,
        entity: b['Entity Names'],
        thirdParty: b['Third Party'],
        forwardNoticeType: b['Forward Notice Type']
      })));

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

  requiresTTB(countryCode) {
    return countryCode === 'US' || countryCode === 'PR';
  }

  getAssetTemplate(assetType) {
    return this.templates.find(t => 
      t['Asset Type'] === assetType
    );
  }

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

  getLanguageVariables(language) {
    return this.languageData.find(lv => 
      lv['Language'] === language
    );
  }

  getBrandData(brandIds) {
    const brandDataList = [];

    for (const brandId of brandIds) {
      console.log(`Looking up brand: "${brandId}"`);
      
      const brandRow = this.brandAvailability.find(row => 
        row['Brand Name'] === brandId
      );

      if (!brandRow) {
        console.warn(`Brand not found in Brand Availability: ${brandId}`);
        continue;
      }

      const displayName = brandRow['Brand Name'];
      const baseBrandName = brandRow['Brand Names'];
      const entityName = brandRow['Entity Names'];
      const thirdParty = brandRow['Third Party'] || '';
      
      const isExpression = displayName !== baseBrandName;
      
      let forwardNoticeType = 'NA';
      
      const trademarkConfigRow = this.trademarkData.find(row => {
        const rowBrandNames = row['Brand Names'];
        const rowDisplayNames = row['Display Names'];
        
        return rowBrandNames === baseBrandName || 
               rowDisplayNames === displayName || 
               rowBrandNames === displayName;
      });
      
      if (trademarkConfigRow) {
        forwardNoticeType = trademarkConfigRow['Forward Notice Type'] || 'NA';
        console.log(`Found Forward Notice Type in Trademark Config for "${displayName}": ${forwardNoticeType}`);
      } else {
        console.log(`No Trademark Config entry found for "${displayName}", using default Forward Notice Type: NA`);
      }
      
      const brandData = {
        'Display Names': displayName,
        'Brand Names': baseBrandName,
        'Entity Names': entityName,
        'Third Party': thirdParty,
        expressionName: isExpression ? displayName : null,
        isExpression: isExpression,
        'Forward Notice Type': forwardNoticeType,
        'TTB Type': 'Full'
      };

      console.log(`Brand found: "${displayName}" -> Base: "${baseBrandName}", Entity: "${entityName}", Forward Notice: "${forwardNoticeType}"`);
      
      brandDataList.push(brandData);
    }

    return brandDataList;
  }

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

      let ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        return rowBrandName === searchName;
      });
      if (ttbRow) return ttbRow;

      ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        return aggressiveNormalize(rowBrandName) === normalizedSearch;
      });
      if (ttbRow) return ttbRow;

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
      
      let ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        return rowBrandName === searchName;
      });
      if (ttbRow) return { row: ttbRow, strategy: 'EXACT' };

      ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        return aggressiveNormalize(rowBrandName) === normalizedSearch;
      });
      if (ttbRow) return { row: ttbRow, strategy: 'NORMALIZED' };

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

      ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        const rowNormalized = aggressiveNormalize(rowBrandName);
        
        const match = rowNormalized.includes(normalizedSearch) || 
                     normalizedSearch.includes(rowNormalized);
        
        return match;
      });
      if (ttbRow) return { row: ttbRow, strategy: 'CONTAINS' };

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

  parseTTBStatement(ttbStatement) {
    if (!ttbStatement) return null;
    
    console.log(`Parsing TTB statement: "${ttbStatement}"`);
    
    const abvRegex = /(\d+(?:\.\d+)?(?:\s*-\s*\d+(?:\.\d+)?)?)\s*%\s*(?:Alc\.?|alc\.?|Alcohol)?(?:\s*by\s*Vol\.?|\/vol)?(?:\s*\(\d+(?:-\d+)?\s*proof\.?\))?/i;
    const abvMatch = ttbStatement.match(abvRegex);
    
    if (!abvMatch) {
      console.log('No ABV found in statement, treating as company-only');
      return {
        classType: '',
        abv: '',
        abvNumeric: [],
        company: ttbStatement.trim(),
        full: ttbStatement
      };
    }
    
    const abvStartIndex = abvMatch.index;
    const abvEndIndex = abvStartIndex + abvMatch[0].length;
    
    const classType = ttbStatement.substring(0, abvStartIndex).trim().replace(/,\s*$/, '');
    
    const abv = abvMatch[0];
    
    const numericMatch = abvMatch[1];
    const abvNumeric = numericMatch.includes('-') 
      ? numericMatch.split('-').map(v => parseFloat(v.trim()))
      : [parseFloat(numericMatch)];
    
    const company = ttbStatement.substring(abvEndIndex).trim().replace(/^[,.\s]+/, '');
    
    console.log(`Parsed: ABV="${abv}", ABV Numeric=${JSON.stringify(abvNumeric)}, Company="${company}"`);
    
    return {
      classType,
      abv,
      abvNumeric,
      company,
      full: ttbStatement
    };
  }

  buildTTBSection(brandDataList, ttbType) {
    console.log(`\n=== TTB SECTION BUILD START ===`);
    console.log(`Building TTB section for ${brandDataList.length} brand(s), TTB Type: ${ttbType}`);
    
    if (brandDataList.length === 0) {
      return '';
    }
    
    // SCENARIO 1: Single Brand
    if (brandDataList.length === 1) {
      console.log('SCENARIO 1: Single brand - Full TTB');
      const brandData = brandDataList[0];
      const brandName = brandData.expressionName || brandData['Brand Names'] || brandData['Display Names'];
      const displayName = brandData['Display Names'];
      const result = this.getTTBStatement(brandName, ttbType, displayName);
      console.log(`=== TTB SECTION BUILD END ===\n`);
      return result;
    }
    
    // Get TTB data for all brands - use Column D for class type
    const ttbData = brandDataList.map(brandData => {
      const brandName = brandData.expressionName || brandData['Brand Names'] || brandData['Display Names'];
      const displayName = brandData['Display Names'];
      const statement = this.getTTBStatement(brandName, ttbType, displayName);
      const ttbRow = this.getTTBRow(brandName, displayName);
      const parsed = this.parseTTBStatement(statement);
      
      // Get class type from Column D - try multiple column name variations
      let classTypeFromSheet = null;
      if (ttbRow) {
        classTypeFromSheet = ttbRow['Class & Type'] || 
                            ttbRow['Class&Type'] || 
                            ttbRow['ClassType'] || 
                            ttbRow['Class and Type'] ||
                            ttbRow['Class'];
        
        console.log(`Brand "${brandName}" -> Column D class: "${classTypeFromSheet}"`);
        if (!classTypeFromSheet) {
          console.warn(`Could not find class type in Column D for ${brandName}`);
          console.log('Available columns:', Object.keys(ttbRow).slice(0, 10));
        }
      }
      
      return {
        brandName,
        statement,
        ttbRow,
        parsed,
        classType: classTypeFromSheet  // Use Column D directly
      };
    }).filter(data => data.statement);  // Keep all brands that have TTB statements
    
    if (ttbData.length === 0) {
      console.log('No TTB data found for any brand');
      console.log(`=== TTB SECTION BUILD END ===\n`);
      return '';
    }
    
    console.log(`TTB data collected for ${ttbData.length} brands`);
    ttbData.forEach(d => {
      console.log(`  - ${d.brandName}: classType="${d.classType}", hasABV=${d.parsed?.abvNumeric?.length > 0}`);
    });
    
    // Extract class types from Column D
    const classTypes = ttbData.map(d => d.classType).filter(Boolean);
    const uniqueClassTypes = [...new Set(classTypes)];
    
    console.log(`Class types from Column D: [${classTypes.join(', ')}]`);
    console.log(`Unique class types: [${uniqueClassTypes.join(', ')}]`);
    
    // SCENARIO 2: Multiple Brands - Same Class (CHECK FIRST - before portfolio)
    if (uniqueClassTypes.length === 1 && classTypes.length === ttbData.length && uniqueClassTypes[0]) {
      console.log('SCENARIO 2: Multiple brands, same class - Constructing Class + ABV range + Company');
      
      const classType = uniqueClassTypes[0];
      
      const allAbvValues = [];
      ttbData.forEach(d => {
        if (d.parsed.abvNumeric && d.parsed.abvNumeric.length > 0) {
          allAbvValues.push(...d.parsed.abvNumeric);
        }
      });
      
      console.log(`All ABV values collected: ${JSON.stringify(allAbvValues)}`);
      
      let abvRange = '';
      if (allAbvValues.length > 0) {
        const minABV = Math.min(...allAbvValues);
        const maxABV = Math.max(...allAbvValues);
        
        console.log(`ABV range: ${minABV} - ${maxABV}`);
        
        if (minABV === maxABV) {
          abvRange = `${minABV}% Alc. by Vol.`;
        } else {
          abvRange = `${minABV}-${maxABV}% Alc. by Vol.`;
        }
      } else {
        console.warn('No ABV values found for same-class brands');
        abvRange = '';
      }
      
      const company = ttbData[0].parsed.company;
      
      let constructedStatement;
      if (abvRange) {
        // Check first statement to see if it has comma after class type
        const originalStatement = ttbData[0].statement;
        const classTypeEscaped = classType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const hasCommaAfterClass = originalStatement && originalStatement.match(new RegExp(`${classTypeEscaped}\\s*,`));
        
        console.log(`Format check: hasCommaAfterClass=${!!hasCommaAfterClass}, original="${originalStatement?.substring(0, 80)}"`);
        
        // Most JD statements use comma, so default to comma format
        if (hasCommaAfterClass || !originalStatement) {
          constructedStatement = `${classType}, ${abvRange}, ${company}`;
        } else {
          constructedStatement = `${classType} ${abvRange} ${company}`;
        }
      } else {
        constructedStatement = `${classType}, ${company}`;
      }
      
      console.log(`Constructed TTB statement: ${constructedStatement}`);
      console.log(`=== TTB SECTION BUILD END ===\n`);
      return constructedStatement;
    }
    
    // Now check for portfolio/entity scenarios (after same-class check)
    const entities = [...new Set(brandDataList.map(b => b['Entity Names']).filter(Boolean))];
    console.log(`Unique entities: ${entities.join(', ')}`);
    
    const firstBrandTTBRow = ttbData[0].ttbRow;
    
    if (firstBrandTTBRow) {
      // SCENARIO 4: Same Entity/Portfolio (different classes within same portfolio)
      if (entities.length === 1) {
        const entity = entities[0];
        console.log(`All brands have same entity: ${entity}`);
        
        const portfolioStatement = firstBrandTTBRow['+1 whitin JD Portfolio'] || 
                                   firstBrandTTBRow['+1 within JD Portfolio'];
        
        if (portfolioStatement) {
          console.log(`SCENARIO 4: Same entity/portfolio (different classes) - Using portfolio TTB from Excel`);
          console.log(`Portfolio statement: ${portfolioStatement}`);
          console.log(`=== TTB SECTION BUILD END ===\n`);
          return portfolioStatement;
        }
      }
      
      // SCENARIO 3: Multiple Brands - Different Classes (different entities)
      const differentBrandsStatement = firstBrandTTBRow['+1 of different brands'];
      
      if (differentBrandsStatement) {
        console.log('SCENARIO 3: Multiple brands, different classes/entities - Using Excel different brands column');
        console.log(`Different brands statement: ${differentBrandsStatement}`);
        console.log(`=== TTB SECTION BUILD END ===\n`);
        return differentBrandsStatement;
      }
    }
    
    // FALLBACK: Company only
    console.log('FALLBACK: Using parsed company from first brand');
    const parsed = ttbData[0].parsed;
    const result = parsed ? parsed.company : '';
    console.log(`Fallback result: ${result}`);
    console.log(`=== TTB SECTION BUILD END ===\n`);
    return result;
  }

  detectPortfolio(brandDataList) {
    if (brandDataList.length < 2) return null;
    
    const brandNames = brandDataList.map(b => b.expressionName || b['Brand Names'] || b['Display Names']);
    
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

  getUSResponsibilityMessage(brandName) {
    if (!this.usResponsibilityMessage || this.usResponsibilityMessage.length === 0) {
      console.warn('US Responsibility Message sheet is empty or not loaded');
      return '';
    }
    
    console.log(`Looking up US RMD for: "${brandName}"`);
    
    const normalize = (name) => {
      if (!name) return '';
      return name
        .toLowerCase()
        .trim()
        .replace(/jack\s+daniel'?s?\s*/gi, '')
        .replace(/\bno\.?\s*/gi, 'no')
        .replace(/\bn\.?\s*/gi, 'n')
        .replace(/[^\w]/g, '')
        .replace(/\s+/g, '');
    };
    
    const normalizedSearch = normalize(brandName);
    console.log(`Normalized search: "${normalizedSearch}"`);
    
    let usRMDRow = this.usResponsibilityMessage.find(row => {
      const rowBrandName = row['Brand Name'];
      return rowBrandName === brandName;
    });
    
    if (usRMDRow) {
      console.log(`Found US RMD (exact match): ${usRMDRow['US RMD']}`);
      return usRMDRow['US RMD'] || '';
    }
    
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
    
    usRMDRow = this.usResponsibilityMessage.find(row => {
      const rowBrandName = row['Brand Name'];
      if (!rowBrandName) return false;
      const rowNormalized = normalize(rowBrandName);
      
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

  buildTrademarkSection(brandDataList, language, assetType, countryCode) {
    const currentYear = new Date().getFullYear();
    
    if (brandDataList.length === 0) {
      return '';
    }
    
    console.log(`Building trademark section for ${brandDataList.length} brand(s), Language: ${language}, Asset Type: ${assetType}`);
    
    const singularOrPlural = brandDataList.length === 1 ? 1 : '1+';
    
    const tmLangData = this.trademarkLanguage.find(tl => 
      tl['Language'] === language && tl['Singular vs Plural'] === singularOrPlural
    );
    
    if (!tmLangData) {
      console.warn(`No trademark language found for: ${language} (${singularOrPlural})`);
      return '';
    }
    
    console.log(`Using trademark language: ${language} (${singularOrPlural})`);
    
    let usePortfolioForSingle = false;
    if (brandDataList.length === 1) {
      const brandData = brandDataList[0];
      const brandName = brandData['Brand Names'] || brandData['Display Names'];
      const entityName = brandData['Entity Names'] || '';
      
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
    
    const effectiveSingularOrPlural = usePortfolioForSingle ? '1+' : singularOrPlural;
    
    const effectiveTmLangData = usePortfolioForSingle 
      ? this.trademarkLanguage.find(tl => tl['Language'] === language && tl['Singular vs Plural'] === '1+')
      : tmLangData;
    
    if (!effectiveTmLangData) {
      console.warn(`No trademark language found for: ${language} (${effectiveSingularOrPlural})`);
      return '';
    }
    
    const trademarkType = this.ASSET_TYPE_TO_TRADEMARK_TYPE[assetType] || 'Full';
    
    console.log(`Trademark structure type from asset type mapping: ${trademarkType}`);
    
    const tmStructure = this.trademarkStructure.find(ts => 
      ts['Type of Trademark'] === trademarkType
    );
    
    if (!tmStructure) {
      console.warn(`No trademark structure found for type: ${trademarkType}`);
      return '';
    }
    
    console.log(`Using trademark structure: ${trademarkType}`);
    console.log(`Structure template: ${tmStructure.Structure}`);
    
    let trademarkText = '';
    
    if (brandDataList.length === 1) {
      const brandData = brandDataList[0];
      let brandName = brandData['Brand Names'] || brandData['Display Names'];
      const entityName = brandData['Entity Names'] || '';
      const preBrand = this.safeGetValue(effectiveTmLangData['Pre-Brand'], 'Pre-Brand');
      
      if (usePortfolioForSingle) {
        const conjunction = this.safeGetValue(effectiveTmLangData['Conjuction'], 'Conjuction') || 'and';
        brandName = `${entityName} ${conjunction} ${brandName}`;
        console.log(`Single brand with portfolio: "${brandName}"`);
      }
      
      trademarkText = tmStructure.Structure;
      
      trademarkText = trademarkText.replace(/<<Pre-Brand>>/g, preBrand);
      trademarkText = trademarkText.replace(/<<Brand>>/g, brandName);
      trademarkText = trademarkText.replace(/<<Registered Language>>/g, 
        this.safeGetValue(effectiveTmLangData['Registered Language'], 'Registered Language'));
      trademarkText = trademarkText.replace(/<<Year>>/g, currentYear.toString());
      trademarkText = trademarkText.replace(/<<Entity>>/g, entityName);
      
      const thirdParty = brandData['Third Party'];
      const reserveLanguage = this.safeGetValue(
        effectiveTmLangData['Reserve Language '] || effectiveTmLangData['Reserve Language'], 
        'Reserve Language'
      );
      
      if (thirdParty && thirdParty.trim()) {
        const reserveWithThirdParty = thirdParty.trim() + ' ' + reserveLanguage;
        trademarkText = trademarkText.replace(/<<Reserve Language>>/g, reserveWithThirdParty);
        console.log(`Added Third Party info before Reserve Language: ${thirdParty}`);
      } else {
        trademarkText = trademarkText.replace(/<<Reserve Language>>/g, reserveLanguage);
      }
      
      trademarkText = trademarkText.replace(/\s+/g, ' ').trim();
      
      console.log(`Singular trademark: ${trademarkText}`);
      
    } else {
      const entities = [...new Set(brandDataList.map(b => b['Entity Names']).filter(Boolean))];
      const sameEntity = entities.length === 1;
      const portfolioEntity = sameEntity ? entities[0] : null;
      
      console.log(`Same entity check: ${sameEntity}, Entity: ${portfolioEntity}`);
      
      let brandNames = [];
      
      // Helper to normalize brand names for duplicate detection
      const normalizeBrandName = (name) => {
        if (!name) return '';
        return name.toLowerCase().trim().replace(/\s+/g, '').replace(/[^\w]/g, '');
      };
      
      brandDataList.forEach(b => {
        const displayName = b['Display Names'];
        const baseBrandName = b['Brand Names'];
        const entityName = b['Entity Names'];
        const isExpression = b.isExpression;
        
        console.log(`Processing for trademark: Display="${displayName}", Base="${baseBrandName}", Entity="${entityName}", IsExpression=${isExpression}`);
        
        if (isExpression && entityName) {
          // Check if entity already added (normalized comparison)
          const entityNormalized = normalizeBrandName(entityName);
          const hasEntity = brandNames.some(name => normalizeBrandName(name) === entityNormalized);
          
          if (!hasEntity) {
            brandNames.push(entityName);
            console.log(`  Added entity: ${entityName}`);
          }
          
          // Check if base brand already added (normalized comparison)
          if (baseBrandName) {
            const baseNormalized = normalizeBrandName(baseBrandName);
            const hasBase = brandNames.some(name => normalizeBrandName(name) === baseNormalized);
            
            if (!hasBase) {
              brandNames.push(baseBrandName);
              console.log(`  Added expression: ${baseBrandName}`);
            }
          }
        } else {
          // Regular brand - check normalized
          const brandToAdd = baseBrandName || displayName;
          const brandNormalized = normalizeBrandName(brandToAdd);
          const hasBrand = brandNames.some(name => normalizeBrandName(name) === brandNormalized);
          
          if (!hasBrand) {
            brandNames.push(brandToAdd);
            console.log(`  Added regular brand: ${brandToAdd}`);
          }
        }
      });
      
      console.log(`Final brand names for trademark: ${brandNames.join(', ')}`);
      
      const conjunction = this.safeGetValue(effectiveTmLangData['Conjuction'], 'Conjuction') || 'and';
      
      let brandList = '';
      if (brandNames.length === 2) {
        brandList = `${brandNames[0]} ${conjunction} ${brandNames[1]}`;
      } else {
        brandList = brandNames.slice(0, -1).join(', ') + ` ${conjunction} ${brandNames[brandNames.length - 1]}`;
      }
      
      console.log(`Brand list: ${brandList}`);
      console.log(`Entities: ${entities.join(', ')}`);
      
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
      
      const preBrand = this.safeGetValue(effectiveTmLangData['Pre-Brand'], 'Pre-Brand');
      const registeredLanguage = this.safeGetValue(effectiveTmLangData['Registered Language'], 'Registered Language');
      const reserveLanguage = this.safeGetValue(
        effectiveTmLangData['Reserve Language '] || effectiveTmLangData['Reserve Language'], 
        'Reserve Language'
      );
      
      console.log(`Reserve Language value: "${reserveLanguage}"`);
      
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
      
      trademarkText = parts.join(' ').replace(/\s+/g, ' ').trim();
      
      console.log(`Plural trademark: ${trademarkText}`);
    }
    
    return trademarkText;
  }

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

    if (copyText.includes('<<Responsibility Language>>')) {
      let respLang = '';
      
      if (this.requiresTTB(countryCode) && this.usResponsibilityMessage && this.usResponsibilityMessage.length > 0) {
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

    if (copyText.includes('<<TTB>>')) {
      console.log('Found <<TTB>> placeholder in template');
      console.log('Country check: Requires TTB?', this.requiresTTB(countryCode));
      
      if (this.requiresTTB(countryCode)) {
        console.log(`${countryCode} detected - building TTB section with multi-brand logic...`);
        
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
        console.log(`Removed <<TTB>> (non-TTB country: ${countryCode})`);
      }
    } else {
      console.log('No <<TTB>> placeholder found in template');
    }

    if (copyText.includes('<<Trademark>>')) {
      const trademarkSection = this.buildTrademarkSection(brandDataList, language, assetType, countryCode);
      copyText = copyText.replace(/<<Trademark>>/g, trademarkSection);
      console.log('Replaced: Trademark');
    }

    if (copyText.includes('<<Forward Notice>>')) {
      const forwardNotice = this.getForwardNotice(brandDataList, langVars, assetType);
      copyText = copyText.replace(/<<Forward Notice>>/g, forwardNotice);
      console.log('Replaced: Forward Notice');
    }

    if (copyText.includes('<<All Other Trademarks>>')) {
      const allOtherTM = this.safeGetValue(langVars['All Other Trademarks'], 'All Other Trademarks');
      copyText = copyText.replace(/<<All Other Trademarks>>/g, allOtherTM);
      console.log('Replaced: All Other Trademarks');
    }

    if (copyText.includes('<<Responsibility Site>>')) {
      const respSite = this.safeGetValue(langVars['Responsibility Site'], 'Responsibility Site');
      copyText = copyText.replace(/<<Responsibility Site>>/g, respSite);
      console.log('Replaced: Responsibility Site');
    }

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

    if (copyText.includes('<<Email Sent By>>')) {
      const emailSentBy = this.safeGetValue(langVars['Email Sent By Statement'], 'Email Sent By Statement');
      copyText = copyText.replace(/<<Email Sent By>>/g, emailSentBy);
      console.log('Replaced: Email Sent By');
    }

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

    if (copyText.includes('<<Email Header>>')) {
      const emailHeader = this.safeGetValue(langVars['Email Header'], 'Email Header');
      copyText = copyText.replace(/<<Email Header>>/g, emailHeader);
      console.log('Replaced: Email Header');
    }

    if (copyText.includes('<<UGC Policy>>')) {
      const ugcPolicy = this.safeGetValue(langVars['UGC Policy'], 'UGC Policy');
      copyText = copyText.replace(/<<UGC Policy>>/g, ugcPolicy);
      console.log('Replaced: UGC Policy:', ugcPolicy);
    }

    if (copyText.includes('<<Age-Gate Statement>>')) {
      const ageGate = this.safeGetValue(langVars['Age-Gate Statement'], 'Age-Gate Statement');
      copyText = copyText.replace(/<<Age-Gate Statement>>/g, ageGate);
      console.log('Replaced: Age-Gate Statement');
    }

    if (copyText.includes('<<Terms of Use>>')) {
      const termsOfUseUrl = this.safeGetValue(langVars['Terms of Use'], 'Terms of Use');
      const termsOfUseLink = termsOfUseUrl ? `<a href="${termsOfUseUrl}" target="_blank" rel="noopener noreferrer">Terms of Use</a>` : 'Terms of Use';
      copyText = copyText.replace(/<<Terms of Use>>/g, termsOfUseLink);
      console.log('Replaced: Terms of Use (with hyperlink)');
    }

    if (copyText.includes('<<Privacy Policy>>')) {
      const privacyPolicyUrl = this.safeGetValue(langVars['Privacy Policy'], 'Privacy Policy');
      const privacyPolicyLink = privacyPolicyUrl ? `<a href="${privacyPolicyUrl}" target="_blank" rel="noopener noreferrer">Privacy Policy</a>` : 'Privacy Policy';
      copyText = copyText.replace(/<<Privacy Policy>>/g, privacyPolicyLink);
      console.log('Replaced: Privacy Policy (with hyperlink)');
    }

    if (copyText.includes('<<Cookie Policy>>')) {
      const cookiePolicyUrl = this.safeGetValue(langVars['Cookie Policy'], 'Cookie Policy');
      const cookiePolicyLink = cookiePolicyUrl ? `<a href="${cookiePolicyUrl}" target="_blank" rel="noopener noreferrer">Cookie Policy</a>` : 'Cookie Policy';
      copyText = copyText.replace(/<<Cookie Policy>>/g, cookiePolicyLink);
      console.log('Replaced: Cookie Policy (with hyperlink)');
    }

    if (copyText.includes('<<Terms Agreement>>')) {
      const termsAgreement = this.safeGetValue(langVars['Terms Agreement'], 'Terms Agreement');
      copyText = copyText.replace(/<<Terms Agreement>>/g, termsAgreement);
      console.log('Replaced: Terms Agreement');
    }

    if (copyText.includes('<<Email Opt-In Statement>>')) {
      const optIn = this.safeGetValue(langVars['Email Opt-In Statement and Consent Statement'], 'Email Opt-In Statement');
      copyText = copyText.replace(/<<Email Opt-In Statement>>/g, optIn);
      console.log('Replaced: Email Opt-In Statement');
    }

    if (copyText.includes('<<Abbreviated Privacy Policy>>')) {
      const abbrevPrivacy = this.safeGetValue(langVars['Abbreviated Privacy Policy'], 'Abbreviated Privacy Policy');
      copyText = copyText.replace(/<<Abbreviated Privacy Policy>>/g, abbrevPrivacy);
      console.log('Replaced: Abbreviated Privacy Policy');
    }

    if (copyText.includes('<<Brand>>')) {
      let brandNames = '';
      
      if (brandDataList.length === 1) {
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

  getForwardNotice(brandDataList, langVars, assetType) {
    console.log(`=== Forward Notice Logic Start ===`);
    console.log(`Asset Type: ${assetType}`);
    console.log(`Number of brands: ${brandDataList.length}`);
    
    const brandsNeedingForwardNotice = brandDataList.filter(b => 
      b['Forward Notice Type'] && b['Forward Notice Type'] !== 'NA' && b['Forward Notice Type'] !== 'N/A'
    );
    
    console.log(`Brands needing Forward Notice: ${brandsNeedingForwardNotice.length}`);
    brandsNeedingForwardNotice.forEach(b => {
      console.log(`  - ${b['Display Names']}: ${b['Forward Notice Type']}`);
    });
    
    if (brandsNeedingForwardNotice.length === 0) {
      console.log('No brands require Forward Notice');
      console.log(`=== Forward Notice Logic End ===`);
      return '';
    }
    
    const forwardNoticeType = brandsNeedingForwardNotice[0]['Forward Notice Type'];
    
    console.log(`Forward Notice Type to use: ${forwardNoticeType}`);
    
    let forwardNoticeText = '';
    
    if (forwardNoticeType === 'Full' || forwardNoticeType === 'full') {
      forwardNoticeText = this.safeGetValue(
        langVars['Forward Notice Full'] || langVars['Forward Notice - Full'],
        'Forward Notice Full'
      );
      console.log(`Using Forward Notice Full`);
    } else if (forwardNoticeType === 'Tightened' || forwardNoticeType === 'tightened') {
      forwardNoticeText = this.safeGetValue(
        langVars['Forward Notice Tightened'] || langVars['Forward Notice - Tightened'],
        'Forward Notice Tightened'
      );
      console.log(`Using Forward Notice Tightened`);
    } else {
      console.warn(`Unknown Forward Notice Type: ${forwardNoticeType}`);
    }
    
    console.log(`Forward Notice Text: ${forwardNoticeText.substring(0, 100)}...`);
    console.log(`=== Forward Notice Logic End ===`);
    
    return forwardNoticeText;
  }

  safeGetValue(value, fieldName = 'field') {
    if (value === null || value === undefined) {
      return '';
    }
    
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
    
    if (typeof value === 'object') {
      console.warn(`Field "${fieldName}" returned an object, attempting to extract value...`);
      
      if (value.text) return String(value.text);
      if (value.value) return String(value.value);
      if (value.content) return String(value.content);
      
      if (Array.isArray(value)) {
        return value.join(' ');
      }
      
      console.error(`Cannot extract string from object for "${fieldName}":`, value);
      return '';
    }
    
    return String(value);
  }

  formatAsHtml(text) {
    return `<div class="generated-copy">${text}</div>`;
  }

  stripHtml(html) {
    let text = html.replace(/<a\s+href=["']?([^"'\s>]+)["']?[^>]*>([^<]+)<\/a>/gi, '$2 ($1)');
    
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

  countWords(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  getAvailableAssetTypes() {
    if (!this.templates) return [];
    return this.templates.map(t => t['Asset Type']).filter(Boolean);
  }

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

  getAvailableBrands() {
    if (!this.brandAvailability) return [];
    
    return this.brandAvailability
      .map(b => ({
        id: b['Brand Name'],
        name: b['Brand Name'],
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

const copyGenerator = new CopyGenerator();
export default copyGenerator;
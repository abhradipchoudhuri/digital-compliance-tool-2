// src/renderer/services/copyGenerator.js
// Core Copy Generation Engine
// COMPREHENSIVE FIX:
// 1. Fixed [object Object] RDM issue by using safeGetValue for all US RMD returns
// 2. Fixed multi-brand same-entity RDM (Jack Daniel's Old No.7 + Bonded Series)
// 3. Added Third Party info to trademark section (for Sinatra and others)
// 4. All asset types now correctly use US RMD for same-entity multi-brand
// 5. Fixed normalize function to not strip "Jack Daniel's" when it's the entity name

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

    const normalizeForMatch = (str) => {
      if (!str) return '';
      return str.toLowerCase().trim()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '');
    };

    const findTrademarkConfigRow = (displayName, baseBrandName) => {
      console.log(`Looking for Forward Notice Type - Display: "${displayName}", Base: "${baseBrandName}"`);
      
      let match = this.trademarkData.find(row => 
        row['Display Names'] === displayName
      );
      if (match) {
        console.log(`  ✓ Exact match on Display Names: "${match['Display Names']}"`);
        return match;
      }

      match = this.trademarkData.find(row => 
        row['Brand Names'] === baseBrandName
      );
      if (match) {
        console.log(`  ✓ Exact match on Brand Names: "${match['Brand Names']}"`);
        return match;
      }

      match = this.trademarkData.find(row => 
        row['Brand Names'] === displayName
      );
      if (match) {
        console.log(`  ✓ Exact match on Brand Names with display: "${match['Brand Names']}"`);
        return match;
      }

      const normalizedDisplay = normalizeForMatch(displayName);
      const normalizedBase = normalizeForMatch(baseBrandName);
      
      match = this.trademarkData.find(row => {
        const rowDisplay = normalizeForMatch(row['Display Names']);
        const rowBrand = normalizeForMatch(row['Brand Names']);
        
        return rowDisplay === normalizedDisplay || 
               rowBrand === normalizedBase ||
               rowBrand === normalizedDisplay;
      });
      
      if (match) {
        console.log(`  ✓ Normalized match: "${match['Display Names'] || match['Brand Names']}"`);
        return match;
      }

      match = this.trademarkData.find(row => {
        const rowDisplay = normalizeForMatch(row['Display Names']);
        const rowBrand = normalizeForMatch(row['Brand Names']);
        
        return (normalizedDisplay.includes(rowBrand) && rowBrand.length > 3) ||
               (normalizedBase.includes(rowBrand) && rowBrand.length > 3);
      });
      
      if (match) {
        console.log(`  ✓ Contains match: "${match['Display Names'] || match['Brand Names']}"`);
        return match;
      }

      if (baseBrandName && baseBrandName.includes(',')) {
        console.log(`  Trying comma-separated parts of: "${baseBrandName}"`);
        const parts = baseBrandName.split(',').map(p => p.trim());
        
        for (const part of parts) {
          console.log(`    Trying part: "${part}"`);
          
          match = this.trademarkData.find(row => 
            row['Brand Names'] === part
          );
          if (match) {
            console.log(`  ✓ Exact match on comma-separated part: "${match['Brand Names']}"`);
            return match;
          }
          
          const normalizedPart = normalizeForMatch(part);
          match = this.trademarkData.find(row => {
            const rowBrand = normalizeForMatch(row['Brand Names']);
            return rowBrand === normalizedPart;
          });
          if (match) {
            console.log(`  ✓ Normalized match on comma-separated part: "${match['Brand Names']}"`);
            return match;
          }
        }
      }

      console.log(`  ✗ No match found in Trademark Config`);
      return null;
    };

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
      
      const trademarkConfigRow = findTrademarkConfigRow(displayName, baseBrandName);
      
      if (trademarkConfigRow) {
        forwardNoticeType = trademarkConfigRow['Forward Notice Type'] || 'NA';
        console.log(`✓ Found Forward Notice Type for "${displayName}": ${forwardNoticeType}`);
        
        if (forwardNoticeType === 'NA' || !forwardNoticeType) {
          console.warn(`⚠ Forward Notice Type is "${forwardNoticeType}" for "${displayName}"`);
          console.log(`  Trademark Config row data:`, {
            'Display Names': trademarkConfigRow['Display Names'],
            'Brand Names': trademarkConfigRow['Brand Names'],
            'Forward Notice Type': trademarkConfigRow['Forward Notice Type']
          });
        }
      } else {
        console.warn(`✗ No Trademark Config entry found for "${displayName}", defaulting to NA`);
        console.log(`  Tried to match with Display="${displayName}", Base="${baseBrandName}"`);
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

      console.log(`Brand found: "${displayName}" -> Base: "${baseBrandName}", Entity: "${entityName}", Third Party: "${thirdParty}", Forward Notice: "${forwardNoticeType}"`);
      
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
    
    if (brandDataList.length === 1) {
      console.log('SCENARIO 1: Single brand - Full TTB');
      const brandData = brandDataList[0];
      const brandName = brandData.expressionName || brandData['Brand Names'] || brandData['Display Names'];
      const displayName = brandData['Display Names'];
      const result = this.getTTBStatement(brandName, ttbType, displayName);
      console.log(`=== TTB SECTION BUILD END ===\n`);
      return result;
    }
    
    const ttbData = brandDataList.map(brandData => {
      const brandName = brandData.expressionName || brandData['Brand Names'] || brandData['Display Names'];
      const displayName = brandData['Display Names'];
      const statement = this.getTTBStatement(brandName, ttbType, displayName);
      const ttbRow = this.getTTBRow(brandName, displayName);
      const parsed = this.parseTTBStatement(statement);
      
      let classFromColumnD = null;
      if (ttbRow) {
        classFromColumnD = ttbRow['Class & Type'] || 
                          ttbRow['Class&Type'] || 
                          ttbRow['Class and Type'] ||
                          ttbRow['ClassType'] || 
                          ttbRow['Class'];
        
        if (classFromColumnD) {
          console.log(`Brand "${brandName}" -> Column D: "${classFromColumnD}"`);
        } else {
          console.warn(`Brand "${brandName}" -> TTB row is NULL`);
        }
      } else {
        console.warn(`Brand "${brandName}" -> TTB row is NULL`);
      }
      
      return {
        brandName,
        statement,
        ttbRow,
        parsed,
        classFromColumnD: classFromColumnD
      };
    }).filter(data => data.statement);
    
    if (ttbData.length === 0) {
      console.log('No TTB data found');
      console.log(`=== TTB SECTION BUILD END ===\n`);
      return '';
    }
    
    console.log(`TTB data collected for ${ttbData.length} brands`);
    
    const entities = [...new Set(brandDataList.map(b => b['Entity Names']).filter(Boolean))];
    const sameEntity = entities.length === 1;
    const entityName = sameEntity ? entities[0] : null;
    console.log(`Entities detected: [${entities.join(', ')}]`);
    console.log(`Same entity: ${sameEntity}, Entity name: "${entityName}"`);
    
    const isJackDaniels = entityName && (
      entityName.includes("Jack Daniel") || 
      entityName.includes("Jack Daniels") ||
      entityName.toLowerCase().includes("jackdaniel")
    );
    console.log(`Is Jack Daniel's entity: ${isJackDaniels}`);
    
    if (sameEntity && isJackDaniels) {
      console.log('*** JACK DANIELS MULTI-BRAND DETECTED ***');
      
      const abvValues = [];
      const companyStatements = [];
      ttbData.forEach(data => {
        if (data.parsed) {
          if (data.parsed.abvNumeric && data.parsed.abvNumeric.length > 0) {
            abvValues.push(...data.parsed.abvNumeric);
          }
          if (data.parsed.company) {
            companyStatements.push(data.parsed.company);
          }
        }
      });
      console.log(`Extracted ABV values: [${abvValues.join(', ')}]`);
      console.log(`Extracted company statements: [${companyStatements.join(' | ')}]`);
      
      const brandClasses = ttbData.map(data => {
        if (data.classFromColumnD) {
          return data.classFromColumnD;
        }
        if (data.parsed && data.parsed.classType) {
          const firstClass = data.parsed.classType.split(/,|\s+and\s+/)[0].trim();
          return firstClass;
        }
        return null;
      }).filter(c => c);
      
      console.log(`Determined classes for all brands:`, brandClasses);
      console.log(`  Brand classes:`, ttbData.map(d => `"${d.brandName}": "${d.classFromColumnD || (d.parsed?.classType?.split(/,|\s+and\s+/)[0].trim()) || 'N/A'}"`));
      
      const allSameClass = brandClasses.length === ttbData.length && 
                          brandClasses.every(c => c === brandClasses[0]);
      
      if (allSameClass && abvValues.length > 0 && companyStatements.length > 0) {
        console.log(`✓ ALL SAME CLASS: "${brandClasses[0]}" - CONSTRUCTING from Column E statements`);
        
        const allClassTypes = [];
        ttbData.forEach(data => {
          if (data.parsed && data.parsed.classType) {
            const classStr = data.parsed.classType;
            console.log(`  "${data.brandName}" classType: "${classStr}"`);
            
            const types = classStr.split(/,\s*(?:and\s+)?|\s+and\s+/)
              .map(t => t.trim())
              .filter(t => t.length > 0);
            
            types.forEach(type => {
              if (!allClassTypes.includes(type)) {
                allClassTypes.push(type);
              }
            });
          }
        });
        
        console.log(`Unique class types across all brands:`, allClassTypes);
        
        let combinedClasses;
        if (allClassTypes.length === 1) {
          combinedClasses = allClassTypes[0];
        } else if (allClassTypes.length === 2) {
          combinedClasses = allClassTypes.join(' and ');
        } else {
          const last = allClassTypes[allClassTypes.length - 1];
          const rest = allClassTypes.slice(0, -1);
          combinedClasses = rest.join(', ') + ', and ' + last;
        }
        
        const abvMin = Math.min(...abvValues);
        const abvMax = Math.max(...abvValues);
        const proofMin = Math.round(abvMin * 2);
        const proofMax = Math.round(abvMax * 2);
        
        let abvPart;
        if (abvMin === abvMax) {
          abvPart = `${abvMin}% Alc. by Vol. (${proofMin} proof.)`;
        } else {
          abvPart = `${abvMin}% - ${abvMax}% Alc. by Vol. (${proofMin} - ${proofMax} proof.)`;
        }
        
        let company = companyStatements[0];
        company = company.replace(/the Jack Daniel Distillery/i, 'JACK DANIEL DISTILLERY');
        company = company.replace(/Jack Daniel Distillery/i, 'JACK DANIEL DISTILLERY');
        
        const constructedStatement = `${combinedClasses}, ${abvPart} ${company}`;
        console.log(`✓ CONSTRUCTED SAME-CLASS TTB: "${constructedStatement}"`);
        console.log(`=== TTB SECTION BUILD END ===\n`);
        return constructedStatement;
      }
      
      console.log('✗ DIFFERENT classes detected - looking for portfolio column...');
      let portfolioStatement = null;
      for (const data of ttbData) {
        if (data.ttbRow) {
          console.log(`Checking TTB row for: "${data.brandName}"`);
          
          portfolioStatement = data.ttbRow['+1 whitin JD Portfolio'] || 
                              data.ttbRow['+1 within JD Portfolio'] ||
                              data.ttbRow['+1 Within JD Portfolio'] ||
                              data.ttbRow['+ 1 within JD Portfolio'] ||
                              data.ttbRow['+1 JD Portfolio'] ||
                              data.ttbRow['JD Portfolio'] ||
                              data.ttbRow['Portfolio'];
          
          if (portfolioStatement) {
            console.log('*** FOUND PORTFOLIO COLUMN! ***');
            console.log(`Portfolio statement: ${portfolioStatement}`);
            console.log(`=== TTB SECTION BUILD END ===\n`);
            return portfolioStatement;
          }
        }
      }
      
      console.error('*** NO PORTFOLIO COLUMN FOUND ***');
    }
    
    const classTypesFromColumnD = ttbData
      .map(d => d.classFromColumnD)
      .filter(Boolean);
    
    const uniqueClassesColumnD = [...new Set(classTypesFromColumnD)];
    
    console.log(`Column D classes: [${classTypesFromColumnD.join(', ')}]`);
    console.log(`Unique classes: [${uniqueClassesColumnD.join(', ')}]`);
    
    if (classTypesFromColumnD.length !== ttbData.length) {
      console.warn(`Not all brands have Column D data (${classTypesFromColumnD.length} of ${ttbData.length})`);
      console.log('Brands with Column D:', ttbData.filter(d => d.classFromColumnD).map(d => d.brandName));
      console.log('Brands WITHOUT Column D:', ttbData.filter(d => !d.classFromColumnD).map(d => d.brandName));
      console.log(`Fallback: Using first brand statement: "${ttbData[0].statement}"`);
      console.log(`=== TTB SECTION BUILD END ===\n`);
      return ttbData[0].statement;
    }
    
    if (uniqueClassesColumnD.length === 1) {
      console.log('SCENARIO 2: All same class - Constructing Class + ABV range + Company');
      
      const classType = uniqueClassesColumnD[0];
      
      const allAbvValues = [];
      const allProofValues = [];
      
      ttbData.forEach(d => {
        if (d.parsed && d.parsed.abvNumeric && d.parsed.abvNumeric.length > 0) {
          allAbvValues.push(...d.parsed.abvNumeric);
        }
        
        if (d.statement) {
          const proofMatch = d.statement.match(/\((\d+)\s*-?\s*(\d+)?\s*proof/i);
          if (proofMatch) {
            allProofValues.push(parseInt(proofMatch[1]));
            if (proofMatch[2]) allProofValues.push(parseInt(proofMatch[2]));
          }
        }
      });
      
      let abvRange = '';
      if (allAbvValues.length > 0) {
        const minABV = Math.min(...allAbvValues);
        const maxABV = Math.max(...allAbvValues);
        
        if (minABV === maxABV) {
          abvRange = `${minABV}% Alc. by Vol.`;
        } else {
          abvRange = `${minABV}% - ${maxABV}% Alc. by Vol.`;
        }
        
        if (allProofValues.length > 0) {
          const minProof = Math.min(...allProofValues);
          const maxProof = Math.max(...allProofValues);
          if (minProof === maxProof) {
            abvRange += ` (${minProof} proof.)`;
          } else {
            abvRange += ` (${minProof} - ${maxProof} proof.)`;
          }
        }
      }
      
      const company = ttbData[0].parsed ? ttbData[0].parsed.company : '';
      
      let constructedStatement;
      if (abvRange && company) {
        constructedStatement = `${classType}, ${abvRange} ${company}`;
      } else if (company) {
        constructedStatement = `${classType}, ${company}`;
      } else {
        constructedStatement = ttbData[0].statement;
      }
      
      console.log(`Constructed: ${constructedStatement}`);
      console.log(`=== TTB SECTION BUILD END ===\n`);
      return constructedStatement;
    }
    
    if (uniqueClassesColumnD.length > 1 && sameEntity) {
      console.log('SCENARIO 3: Different classes, same entity - Using portfolio column');
      
      const firstBrandTTBRow = ttbData[0].ttbRow;
      if (firstBrandTTBRow) {
        const portfolioStatement = firstBrandTTBRow['+1 whitin JD Portfolio'] || 
                                   firstBrandTTBRow['+1 within JD Portfolio'];
        
        if (portfolioStatement) {
          console.log(`Using portfolio: ${portfolioStatement}`);
          console.log(`=== TTB SECTION BUILD END ===\n`);
          return portfolioStatement;
        }
      }
      
      console.warn('No portfolio column, using first statement');
      console.log(`=== TTB SECTION BUILD END ===\n`);
      return ttbData[0].statement;
    }
    
    if (!sameEntity) {
      console.log('SCENARIO 4: Different entities - Using different brands column');
      
      const firstBrandTTBRow = ttbData[0].ttbRow;
      if (firstBrandTTBRow) {
        const differentBrandsStatement = firstBrandTTBRow['+1 of different brands'];
        
        if (differentBrandsStatement) {
          console.log(`Using different brands: ${differentBrandsStatement}`);
          console.log(`=== TTB SECTION BUILD END ===\n`);
          return differentBrandsStatement;
        }
      }
    }
    
    console.log('FALLBACK: Using first statement');
    console.log(`=== TTB SECTION BUILD END ===\n`);
    return ttbData[0].statement;
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
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '');
    };
    
    const normalizedSearch = normalize(brandName);
    console.warn(`No pattern match for: "${brandName}" - using as-is`);
    console.log(`Normalized: "${normalizedSearch}"`);
    
    let usRMDRow = this.usResponsibilityMessage.find(row => {
      const rowBrandName = row['Brand Name'];
      return rowBrandName === brandName;
    });
    
    if (usRMDRow) {
      const rmdValue = this.safeGetValue(usRMDRow['US RMD'], 'US RMD');
      console.log(`Found US RMD (exact match): ${rmdValue}`);
      return rmdValue;
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
      const rmdValue = this.safeGetValue(usRMDRow['US RMD'], 'US RMD');
      console.log(`Found US RMD (normalized match): ${rmdValue}`);
      return rmdValue;
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
      const rmdValue = this.safeGetValue(usRMDRow['US RMD'], 'US RMD');
      console.log(`Found US RMD (fuzzy match): ${rmdValue}`);
      return rmdValue;
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
    
    const baseBrands = [...new Set(brandDataList.map(b => b['Brand Names']).filter(Boolean))];
    const isMultipleSameBrand = brandDataList.length > 1 && baseBrands.length === 1;
    
    if (isMultipleSameBrand) {
      console.log(`FIX 3: Multiple expressions of same brand detected - "${baseBrands[0]}"`);
    }
    
    let singularOrPlural;
    if (isMultipleSameBrand) {
      singularOrPlural = 1;
      console.log(`Using singular form (1) for multiple expressions of same brand`);
    } else {
      singularOrPlural = brandDataList.length === 1 ? 1 : '1+';
    }
    
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
      
      if (isKnownPortfolio && brandName && !brandName.includes(entityName)) {
        usePortfolioForSingle = true;
        console.log(`Single brand will use portfolio prefix, switching to plural form`);
      } else {
        console.log(`FIX 2: Single brand "${brandName}" with entity "${entityName}" will NOT use portfolio prefix`);
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
    
    if (brandDataList.length === 1 || isMultipleSameBrand) {
      let brandName;
      let entityName;
      let thirdParty;
      
      if (isMultipleSameBrand) {
        brandName = baseBrands[0];
        entityName = brandDataList[0]['Entity Names'] || '';
        thirdParty = brandDataList[0]['Third Party'] || '';
        console.log(`FIX 3: Using singular form with base brand only: "${brandName}"`);
      } else {
        const brandData = brandDataList[0];
        brandName = brandData['Brand Names'] || brandData['Display Names'];
        entityName = brandData['Entity Names'] || '';
        thirdParty = brandData['Third Party'];
      }
      
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
      
      const reserveLanguage = this.safeGetValue(
        effectiveTmLangData['Reserve Language '] || effectiveTmLangData['Reserve Language'], 
        'Reserve Language'
      );
      
      if (thirdParty && thirdParty.trim()) {
        const reserveWithThirdParty = thirdParty.trim() + ' ' + reserveLanguage;
        trademarkText = trademarkText.replace(/<<Reserve Language>>/g, reserveWithThirdParty);
        console.log(`FIX 8: Added Third Party info before Reserve Language: "${thirdParty}"`);
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
          const entityNormalized = normalizeBrandName(entityName);
          const hasEntity = brandNames.some(name => normalizeBrandName(name) === entityNormalized);
          
          if (!hasEntity) {
            brandNames.push(entityName);
            console.log(`  Added entity: ${entityName}`);
          }
          
          if (baseBrandName) {
            const baseNormalized = normalizeBrandName(baseBrandName);
            const hasBase = brandNames.some(name => normalizeBrandName(name) === baseNormalized);
            
            if (!hasBase) {
              brandNames.push(baseBrandName);
              console.log(`  Added expression: ${baseBrandName}`);
            }
          }
        } else {
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
      
      const brandsWithThirdParty = brandDataList.filter(b => b['Third Party'] && b['Third Party'].trim());
      let thirdPartyInfo = '';
      if (brandsWithThirdParty.length > 0) {
        thirdPartyInfo = brandsWithThirdParty[0]['Third Party'].trim();
        console.log(`FIX 8: Found Third Party info in multi-brand: "${thirdPartyInfo}"`);
      }
      
      const parts = [];
      
      if (preBrand) {
        parts.push(preBrand);
      }
      
      parts.push(brandList);
      parts.push(registeredLanguage);
      parts.push(entityCopyrights);
      
      if (thirdPartyInfo && reserveLanguage) {
        parts.push(thirdPartyInfo + ' ' + reserveLanguage);
        console.log(`FIX 8: Added Third Party info to multi-brand trademark`);
      } else if (reserveLanguage) {
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
            console.log(`Using US RMD (single brand): "${usRMD}"`);
          }
        } else {
          console.log('=== RESPONSIBILITY LANGUAGE: Multi-brand Selection ===');
          
          const entities = [...new Set(brandDataList.map(b => b['Entity Names']).filter(Boolean))];
          const sameEntity = entities.length === 1;
          
          console.log(`Entities in selection: [${entities.join(', ')}]`);
          console.log(`Same entity: ${sameEntity}`);
          
          if (sameEntity) {
            console.log('SAME ENTITY detected - using US RMD column');
            
            const entityName = entities[0];
            console.log(`Looking up US RMD for: "${entityName}"`);
            const usRMD = this.getUSResponsibilityMessage(entityName);
            
            if (usRMD) {
              respLang = usRMD;
              console.log(`Using US RMD for same entity`);
              console.log(`RDM: "${usRMD}"`);
            } else {
              console.warn(`No US RMD found for ${entityName}, using generic`);
              respLang = 'Please Drink Responsibly.';
            }
          } else {
            console.log('CROSS-SELECTION detected (different entities)');
            console.log('Using generic RDM: "Please Drink Responsibly."');
            respLang = 'Please Drink Responsibly.';
          }
        }
      }
      
      if (!respLang) {
        respLang = this.safeGetValue(
          langVars['Responsibility Language '] || langVars['Responsibility Language'],
          'Responsibility Language'
        );
        console.log(`Using default Responsibility Language from langVars: ${respLang}`);
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
    
    console.log(`Looking up Forward Notice Type for Asset Type: "${assetType}"`);
    
    const assetTypeConfig = this.trademarkData.find(row => 
      row['Asset Type'] === assetType
    );
    
    if (!assetTypeConfig) {
      console.warn(`No Forward Notice configuration found for Asset Type: "${assetType}"`);
      console.log(`=== Forward Notice Logic End ===`);
      return '';
    }
    
    const forwardNoticeType = assetTypeConfig['Forward Notice Type'];
    
    console.log(`Found Forward Notice Type for this Asset Type: "${forwardNoticeType}"`);
    
    if (!forwardNoticeType || forwardNoticeType === 'NA' || forwardNoticeType === 'N/A' || forwardNoticeType === 'None') {
      console.log(`Forward Notice Type is "${forwardNoticeType}" - no Forward Notice needed`);
      console.log(`=== Forward Notice Logic End ===`);
      return '';
    }
    
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
      if (value.v) return String(value.v);
      if (value.w) return String(value.w);
      
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
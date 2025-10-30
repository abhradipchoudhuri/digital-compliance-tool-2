// src/renderer/services/copyGenerator.js
// Core Copy Generation Engine - WITH ENHANCED TTB FUZZY MATCHING
// ✅ FIXED: [object Object] issue with UGC Policy and other langVars

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
    this.excelService = null;
    
    // ✅ ASSET TYPE → TTB TYPE MAPPING
    // Each asset type determines which TTB statement version to use
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
  }

  // ✅ NEW HELPER: Safe value getter to prevent [object Object]
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
      console.warn(`⚠️ Field "${fieldName}" returned an object, attempting to extract value...`);
      
      // Try common object structures
      if (value.text) return String(value.text);
      if (value.value) return String(value.value);
      if (value.content) return String(value.content);
      
      // If it's an array, join it
      if (Array.isArray(value)) {
        return value.join(' ');
      }
      
      console.error(`❌ Cannot extract string from object for "${fieldName}":`, value);
      return '';
    }
    
    // Fallback: convert to string
    return String(value);
  }

  initialize(excelData, excelService) {
    if (!excelData || typeof excelData !== 'object') {
      throw new Error('Invalid Excel data provided to CopyGenerator');
    }

    console.log('🔧 CopyGenerator: Initializing with Excel data...');

    this.trademarkData = excelData['Trademark Config'] || [];
    this.templates = excelData['Overall Structure'] || [];
    this.trademarkStructure = excelData['Trademark Structure'] || [];
    this.languageData = excelData['Language Dependent Variables'] || [];
    this.trademarkLanguage = excelData['Trademark Language'] || [];
    this.countryLanguage = excelData['CountryLanguage'] || [];
    this.ttbStatements = excelData['TTB Statements'] || [];
    
    this.excelService = excelService;

    console.log('📊 Loaded sheets:', {
      trademarkData: this.trademarkData.length,
      templates: this.templates.length,
      trademarkStructure: this.trademarkStructure.length,
      languageData: this.languageData.length,
      trademarkLanguage: this.trademarkLanguage.length,
      countryLanguage: this.countryLanguage.length,
      ttbStatements: this.ttbStatements.length
    });

    if (this.ttbStatements.length > 0) {
      console.log('📋 Sample TTB Statement columns:', Object.keys(this.ttbStatements[0]));
      console.log('📋 First TTB brand:', this.ttbStatements[0]['Brand Name'] || this.ttbStatements[0]);
    }

    if (this.trademarkData.length > 0) {
      console.log('📋 Trademark Config columns:', Object.keys(this.trademarkData[0]));
      const sampleBrand = this.trademarkData[0];
      console.log('📋 Sample brand TTB Type:', sampleBrand['TTB Type']);
    }

    this.validateData();
    
    console.log('✅ CopyGenerator: Initialization complete');
  }

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

  generateCopy(params) {
    const startTime = Date.now();

    try {
      console.log('🎯 CopyGenerator: Starting generation...', params);

      this.validateParams(params);

      const { assetType, countryCode, brandIds } = params;

      const template = this.getAssetTemplate(assetType);
      if (!template) {
        throw new Error(`No template found for asset type: ${assetType}`);
      }

      console.log('📋 Template found:', template['Asset Type']);
      console.log('📝 Template structure:', template.Structure);

      const language = this.getLanguageForCountry(countryCode);
      console.log('🌍 Language for country:', { countryCode, language });

      const langVars = this.getLanguageVariables(language);
      if (!langVars) {
        throw new Error(`No language variables found for: ${language}`);
      }

      const brandDataList = this.getBrandData(brandIds);
      if (brandDataList.length === 0) {
        throw new Error(`No brand data found for brands: ${brandIds.join(', ')}`);
      }

      console.log('🏷️ Brands found:', brandDataList.map(b => ({
        name: b['Brand Names'] || b['Display Names'],
        ttbType: b['TTB Type']
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

      console.log('✅ Copy generation complete!');

      return {
        success: true,
        copy: generatedCopy,
        metadata: {
          assetType,
          countryCode,
          language,
          brandCount: brandIds.length,
          brands: brandDataList.map(b => b['Brand Names'] || b['Display Names']),
          templateUsed: template['Asset Type'],
          generationTime: `${generationTime}ms`,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Copy generation error:', error);
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

    console.warn(`⚠️ No language found for country ${countryCode}, defaulting to English (Default)`);
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
      const brandData = this.trademarkData.find(b => 
        b['Brand Names'] === brandId || 
        b['Display Names'] === brandId
      );

      if (brandData) {
        brandDataList.push(brandData);
      } else {
        console.warn(`⚠️ Brand not found: ${brandId}`);
      }
    }

    return brandDataList;
  }

  getTTBStatement(brandName, ttbType = 'Full', displayName = null) {
    console.log(`🔍 Looking up TTB statement for: "${brandName}" (Type: ${ttbType})`);
    if (displayName && displayName !== brandName) {
      console.log(`   Also have Display Names: "${displayName}"`);
    }
    
    if (!this.ttbStatements || this.ttbStatements.length === 0) {
      console.warn('⚠️ TTB Statements sheet is empty or not loaded');
      return '';
    }

    const availableTTBBrands = this.ttbStatements.map(row => 
      row['Brand Name'] || row['Brand'] || row['BrandName']
    ).filter(Boolean);
    console.log('📋 Available TTB brands (first 10):', availableTTBBrands.slice(0, 10));

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

    console.log(`   Trying Brand Names: "${brandName}"`);
    let result = tryMatch(brandName);
    
    if (!result && displayName && displayName !== brandName) {
      console.log(`   ⚠️ No match with Brand Names, trying Display Names: "${displayName}"`);
      result = tryMatch(displayName);
      if (result) {
        console.log(`   ✅ Found match using Display Names!`);
      }
    }

    if (!result) {
      console.warn(`❌ No TTB statement found for brand: "${brandName}"`);
      if (displayName && displayName !== brandName) {
        console.warn(`   Also tried Display Names: "${displayName}"`);
      }
      console.warn(`   Available brands: ${availableTTBBrands.slice(0, 5).join(', ')}...`);
      return '';
    }

    const ttbRow = result.row;
    const matchStrategy = result.strategy;
    
    console.log(`✅ Found TTB row for: "${ttbRow['Brand Name'] || ttbRow['Brand']}" [${matchStrategy}]`);

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
      console.warn(`⚠️ No statement found for type "${ttbType}", trying default...`);
      statement = ttbRow['TTB Statement'] || ttbRow['Statement'] || '';
    }

    if (statement) {
      console.log(`✅ TTB Statement found for ${brandName} (${ttbType}): ${statement.substring(0, 100)}...`);
    } else {
      console.warn(`❌ No TTB statement text found for ${brandName} (${ttbType})`);
    }

    return statement;
  }

  buildCopyFromTemplate(template, langVars, brandDataList, countryCode, language, assetType) {
    let copyText = template.Structure || '';

    console.log('🔨 Building copy from template...');
    console.log('📝 Original template:', copyText);
    console.log('🌍 Country code:', countryCode);
    console.log('🏷️ Number of brands:', brandDataList.length);
    console.log('🎨 Asset Type:', assetType);

    const ttbTypeForAsset = this.ASSET_TYPE_TO_TTB_TYPE[assetType];
    if (ttbTypeForAsset) {
      console.log(`✅ TTB Type for "${assetType}": ${ttbTypeForAsset}`);
    } else {
      console.warn(`⚠️ No TTB Type mapping found for "${assetType}", defaulting to "Full"`);
    }
    const ttbType = ttbTypeForAsset || 'Full';

    // ✅ FIXED: Use safeGetValue for ALL langVars replacements
    if (copyText.includes('<<Responsibility Language>>')) {
      const respLang = this.safeGetValue(
        langVars['Responsibility Language '] || langVars['Responsibility Language'],
        'Responsibility Language'
      );
      copyText = copyText.replace(/<<Responsibility Language>>/g, respLang);
      console.log('✅ Replaced: Responsibility Language');
    }

    if (copyText.includes('<<TTB>>')) {
      console.log('🔍 Found <<TTB>> placeholder in template');
      console.log('🌍 Country check: Is US?', countryCode === 'US');
      
      if (countryCode === 'US') {
        console.log('✅ US detected - building TTB statements...');
        
        const ttbStatements = [];
        
        for (const brandData of brandDataList) {
          const brandName = brandData['Brand Names'] || brandData['Display Names'];
          const displayName = brandData['Display Names'];
          
          console.log(`🔍 Processing brand: "${brandName}" with TTB Type: "${ttbType}" (from Asset Type: ${assetType})`);
          
          const ttbStatement = this.getTTBStatement(brandName, ttbType, displayName);
          
          if (ttbStatement) {
            ttbStatements.push(ttbStatement);
            console.log(`✅ Added TTB statement for ${brandName}`);
          } else {
            console.warn(`⚠️ No TTB statement found for ${brandName}`);
          }
        }

        if (ttbStatements.length > 0) {
          const ttbSection = '<br><br>' + ttbStatements.join('<br><br>') + '<br><br>';
          copyText = copyText.replace(/<<TTB>>/g, ttbSection);
          console.log(`✅ Replaced <<TTB>> with ${ttbStatements.length} statement(s)`);
          console.log('📋 TTB Section preview:', ttbSection.substring(0, 200) + '...');
        } else {
          copyText = copyText.replace(/<<TTB>>/g, '');
          console.warn('⚠️ No TTB statements found for any selected brands - placeholder removed');
        }
      } else {
        copyText = copyText.replace(/<<TTB>>/g, '');
        console.log(`✅ Removed <<TTB>> (non-US country: ${countryCode})`);
      }
    } else {
      console.log('ℹ️ No <<TTB>> placeholder found in template');
    }

    if (copyText.includes('<<Trademark>>')) {
      const trademarkSection = this.buildTrademarkSection(brandDataList, language);
      copyText = copyText.replace(/<<Trademark>>/g, trademarkSection);
      console.log('✅ Replaced: Trademark');
    }

    if (copyText.includes('<<Forward Notice>>')) {
      const forwardNotice = this.getForwardNotice(brandDataList, langVars);
      copyText = copyText.replace(/<<Forward Notice>>/g, forwardNotice);
      console.log('✅ Replaced: Forward Notice');
    }

    // ✅ FIXED: All other replacements use safeGetValue
    if (copyText.includes('<<All Other Trademarks>>')) {
      const allOtherTM = this.safeGetValue(langVars['All Other Trademarks'], 'All Other Trademarks');
      copyText = copyText.replace(/<<All Other Trademarks>>/g, allOtherTM);
      console.log('✅ Replaced: All Other Trademarks');
    }

    if (copyText.includes('<<Responsibility Site>>')) {
      const respSite = this.safeGetValue(langVars['Responsibility Site'], 'Responsibility Site');
      copyText = copyText.replace(/<<Responsibility Site>>/g, respSite);
      console.log('✅ Replaced: Responsibility Site');
    }

    if (copyText.includes('<<Legal Documents>>')) {
      // Get URLs from language variables
      const termsUrl = this.safeGetValue(langVars['Terms of Use'], 'Terms of Use');
      const privacyUrl = this.safeGetValue(langVars['Privacy Policy'], 'Privacy Policy');
      const cookieUrl = this.safeGetValue(langVars['Cookie Policy'], 'Cookie Policy');
      
      // Get the localized legal documents text
      const legalDocs = this.safeGetValue(langVars['Website Legal Documents'], 'Website Legal Documents');
      
      // LANGUAGE-AGNOSTIC APPROACH: Split by " | " and hyperlink by position
      // Typically: [Terms of Use] | [Privacy Policy] | [Cookie Policy] | [Other items...]
      const segments = legalDocs.split('|').map(s => s.trim());
      
      const hyperlinkSegments = segments.map((segment, index) => {
        // Position 0: Terms of Use
        if (index === 0 && termsUrl) {
          return `<a href="${termsUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
        }
        // Position 1: Privacy Policy
        else if (index === 1 && privacyUrl) {
          return `<a href="${privacyUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
        }
        // Position 2: Cookie Policy
        else if (index === 2 && cookieUrl) {
          return `<a href="${cookieUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
        }
        // Everything else stays as plain text
        else {
          return segment;
        }
      });
      
      const hyperlinkDocs = hyperlinkSegments.join(' | ');
      
      copyText = copyText.replace(/<<Legal Documents>>/g, hyperlinkDocs);
      console.log('✅ Replaced: Legal Documents (with position-based hyperlinks for all languages)');
    }

    if (copyText.includes('<<Email Sent By>>')) {
      const emailSentBy = this.safeGetValue(langVars['Email Sent By Statement'], 'Email Sent By Statement');
      copyText = copyText.replace(/<<Email Sent By>>/g, emailSentBy);
      console.log('✅ Replaced: Email Sent By');
    }

    if (copyText.includes('<<Email Legal Documents>>')) {
      // Get URLs from language variables
      const termsUrl = this.safeGetValue(langVars['Terms of Use'], 'Terms of Use');
      const privacyUrl = this.safeGetValue(langVars['Privacy Policy'], 'Privacy Policy');
      const cookieUrl = this.safeGetValue(langVars['Cookie Policy'], 'Cookie Policy');
      
      // Get the localized email legal documents text
      const emailLegalDocs = this.safeGetValue(langVars['Email Legal Documents'], 'Email Legal Documents');
      
      // LANGUAGE-AGNOSTIC APPROACH: Split by " | " and hyperlink by position
      const segments = emailLegalDocs.split('|').map(s => s.trim());
      
      const hyperlinkSegments = segments.map((segment, index) => {
        // Position 0: Terms of Use
        if (index === 0 && termsUrl) {
          return `<a href="${termsUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
        }
        // Position 1: Privacy Policy
        else if (index === 1 && privacyUrl) {
          return `<a href="${privacyUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
        }
        // Position 2: Cookie Policy
        else if (index === 2 && cookieUrl) {
          return `<a href="${cookieUrl}" target="_blank" rel="noopener noreferrer">${segment}</a>`;
        }
        // Everything else stays as plain text
        else {
          return segment;
        }
      });
      
      const hyperlinkDocs = hyperlinkSegments.join(' | ');
      
      copyText = copyText.replace(/<<Email Legal Documents>>/g, hyperlinkDocs);
      console.log('✅ Replaced: Email Legal Documents (with position-based hyperlinks for all languages)');
    }

    if (copyText.includes('<<Email Header>>')) {
      const emailHeader = this.safeGetValue(langVars['Email Header'], 'Email Header');
      copyText = copyText.replace(/<<Email Header>>/g, emailHeader);
      console.log('✅ Replaced: Email Header');
    }

    // ✅ CRITICAL FIX: UGC Policy with safeGetValue
    if (copyText.includes('<<UGC Policy>>')) {
      const ugcPolicy = this.safeGetValue(langVars['UGC Policy'], 'UGC Policy');
      copyText = copyText.replace(/<<UGC Policy>>/g, ugcPolicy);
      console.log('✅ Replaced: UGC Policy:', ugcPolicy);
    }

    if (copyText.includes('<<Age-Gate Statement>>')) {
      const ageGate = this.safeGetValue(langVars['Age-Gate Statement'], 'Age-Gate Statement');
      copyText = copyText.replace(/<<Age-Gate Statement>>/g, ageGate);
      console.log('✅ Replaced: Age-Gate Statement');
    }

    if (copyText.includes('<<Terms of Use>>')) {
      const termsOfUseUrl = this.safeGetValue(langVars['Terms of Use'], 'Terms of Use');
      const termsOfUseLink = termsOfUseUrl ? `<a href="${termsOfUseUrl}" target="_blank" rel="noopener noreferrer">Terms of Use</a>` : 'Terms of Use';
      copyText = copyText.replace(/<<Terms of Use>>/g, termsOfUseLink);
      console.log('✅ Replaced: Terms of Use (with hyperlink)');
    }

    if (copyText.includes('<<Privacy Policy>>')) {
      const privacyPolicyUrl = this.safeGetValue(langVars['Privacy Policy'], 'Privacy Policy');
      const privacyPolicyLink = privacyPolicyUrl ? `<a href="${privacyPolicyUrl}" target="_blank" rel="noopener noreferrer">Privacy Policy</a>` : 'Privacy Policy';
      copyText = copyText.replace(/<<Privacy Policy>>/g, privacyPolicyLink);
      console.log('✅ Replaced: Privacy Policy (with hyperlink)');
    }

    if (copyText.includes('<<Cookie Policy>>')) {
      const cookiePolicyUrl = this.safeGetValue(langVars['Cookie Policy'], 'Cookie Policy');
      const cookiePolicyLink = cookiePolicyUrl ? `<a href="${cookiePolicyUrl}" target="_blank" rel="noopener noreferrer">Cookie Policy</a>` : 'Cookie Policy';
      copyText = copyText.replace(/<<Cookie Policy>>/g, cookiePolicyLink);
      console.log('✅ Replaced: Cookie Policy (with hyperlink)');
    }

    if (copyText.includes('<<Terms Agreement>>')) {
      const termsAgreement = this.safeGetValue(langVars['Terms Agreement'], 'Terms Agreement');
      copyText = copyText.replace(/<<Terms Agreement>>/g, termsAgreement);
      console.log('✅ Replaced: Terms Agreement');
    }

    if (copyText.includes('<<Email Opt-In Statement>>')) {
      const optIn = this.safeGetValue(langVars['Email Opt-In Statement and Consent Statement'], 'Email Opt-In Statement');
      copyText = copyText.replace(/<<Email Opt-In Statement>>/g, optIn);
      console.log('✅ Replaced: Email Opt-In Statement');
    }

    if (copyText.includes('<<Abbreviated Privacy Policy>>')) {
      const abbrevPrivacy = this.safeGetValue(langVars['Abbreviated Privacy Policy'], 'Abbreviated Privacy Policy');
      copyText = copyText.replace(/<<Abbreviated Privacy Policy>>/g, abbrevPrivacy);
      console.log('✅ Replaced: Abbreviated Privacy Policy');
    }

    console.log('📝 Final copy length:', copyText.length);

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

  buildTrademarkSection(brandDataList, language) {
    const currentYear = new Date().getFullYear();
    const trademarkParts = [];

    const tmLangData = this.trademarkLanguage.find(tl => 
      tl['Language'] === language
    );

    for (const brandData of brandDataList) {
      const trademarkType = brandData['Trademark Type'] || 'Full';
      
      const tmStructure = this.trademarkStructure.find(ts => 
        ts['Type of Trademark'] === trademarkType
      );

      if (!tmStructure) {
        console.warn(`⚠️ No trademark structure found for type: ${trademarkType}`);
        continue;
      }

      let tmText = tmStructure.Structure || '';

      tmText = tmText.replace(/<<Brand>>/g, brandData['Brand Names'] || brandData['Display Names']);
      tmText = tmText.replace(/<<Entity>>/g, brandData['Entity Names'] || '');
      tmText = tmText.replace(/<<Year>>/g, currentYear.toString());
      tmText = tmText.replace(/<<Pre-Brand>>/g, '');

      if (tmLangData && tmLangData['Registered Language']) {
        const registeredLang = tmLangData['Registered Language'];
        tmText = tmText.replace(/<<Registered Language>>/g, registeredLang);
      } else {
        tmText = tmText.replace(/<<Registered Language>>/g, '');
      }

      if (tmLangData && tmLangData['Reserve Language ']) {
        tmText = tmText.replace(/<<Reserve Language>>/g, tmLangData['Reserve Language '] || '');
      } else {
        tmText = tmText.replace(/<<Reserve Language>>/g, '');
      }

      trademarkParts.push(tmText.trim());
    }

    return trademarkParts.join(' ');
  }

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

  formatAsHtml(text) {
    return `<div class="generated-copy">${text}</div>`;
  }

  stripHtml(html) {
    // First, convert hyperlinks to readable format: "Text (URL)"
    let text = html.replace(/<a\s+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi, '$2 ($1)');
    
    // Then remove all other HTML tags
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
    if (!this.trademarkData) return [];
    
    return this.trademarkData
      .map(b => ({
        id: b['Brand Names'],
        name: b['Display Names'],
        entity: b['Entity Names']
      }))
      .filter(b => b.id && b.name);
  }

  isReady() {
    return !!(this.trademarkData && this.templates && this.trademarkStructure);
  }
}

const copyGenerator = new CopyGenerator();
export default copyGenerator;

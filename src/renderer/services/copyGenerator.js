// src/renderer/services/copyGenerator.js
// Core Copy Generation Engine - WITH ENHANCED TTB LOGIC

class CopyGenerator {
  constructor() {
    this.trademarkData = null;
    this.templates = null;
    this.brandConfig = null;
    this.languageData = null;
    this.trademarkLanguage = null;
    this.trademarkStructure = null;
    this.countryLanguage = null;
    this.ttbStatements = null; // NEW: Store TTB statements
    this.excelService = null;
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
    this.ttbStatements = excelData['TTB Statements'] || []; // NEW: Store TTB data
    
    this.excelService = excelService;

    console.log('📊 Loaded sheets:', {
      trademarkData: this.trademarkData.length,
      templates: this.templates.length,
      trademarkStructure: this.trademarkStructure.length,
      languageData: this.languageData.length,
      trademarkLanguage: this.trademarkLanguage.length,
      countryLanguage: this.countryLanguage.length,
      ttbStatements: this.ttbStatements.length // NEW: Log TTB count
    });

    // NEW: Log sample TTB data for debugging
    if (this.ttbStatements.length > 0) {
      console.log('📋 Sample TTB Statement columns:', Object.keys(this.ttbStatements[0]));
      console.log('📋 First TTB brand:', this.ttbStatements[0]['Brand Name'] || this.ttbStatements[0]);
    }

    // NEW: Log sample Trademark Config columns for TTB Type debugging
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
        language
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

  // ✅ ENHANCED: Better TTB statement lookup with fuzzy matching
  getTTBStatement(brandName, ttbType = 'Full') {
    console.log(`🔍 Looking up TTB statement for: "${brandName}" (Type: ${ttbType})`);
    
    if (!this.ttbStatements || this.ttbStatements.length === 0) {
      console.warn('⚠️ TTB Statements sheet is empty or not loaded');
      return '';
    }

    // Log available brand names in TTB sheet for debugging
    const availableTTBBrands = this.ttbStatements.map(row => 
      row['Brand Name'] || row['Brand'] || row['BrandName']
    ).filter(Boolean);
    console.log('📋 Available TTB brands:', availableTTBBrands.slice(0, 10));

    // Helper function to normalize brand names for matching
    const normalize = (name) => {
      if (!name) return '';
      return name.toLowerCase().trim().replace(/[^\w\s]/g, '');
    };

    const normalizedSearch = normalize(brandName);

    // Try exact match first
    let ttbRow = this.ttbStatements.find(row => {
      const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
      return rowBrandName === brandName;
    });

    // If no exact match, try normalized match
    if (!ttbRow) {
      console.log('⚠️ No exact match, trying fuzzy match...');
      ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        return normalize(rowBrandName) === normalizedSearch;
      });
    }

    // If still no match, try contains match
    if (!ttbRow) {
      console.log('⚠️ No fuzzy match, trying contains match...');
      ttbRow = this.ttbStatements.find(row => {
        const rowBrandName = row['Brand Name'] || row['Brand'] || row['BrandName'];
        const normalizedRow = normalize(rowBrandName);
        return normalizedRow.includes(normalizedSearch) || normalizedSearch.includes(normalizedRow);
      });
    }

    if (!ttbRow) {
      console.warn(`❌ No TTB statement found for brand: "${brandName}"`);
      console.warn(`   Available brands: ${availableTTBBrands.slice(0, 5).join(', ')}...`);
      return '';
    }

    console.log(`✅ Found TTB row for: "${ttbRow['Brand Name'] || ttbRow['Brand']}"`);
    console.log('📋 Available columns in TTB row:', Object.keys(ttbRow));

    // Get the appropriate TTB statement based on type
    // Handle different possible column names
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

    // If no statement found for specific type, try default column
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

  buildCopyFromTemplate(template, langVars, brandDataList, countryCode, language) {
    let copyText = template.Structure || '';

    console.log('🔨 Building copy from template...');
    console.log('📝 Original template:', copyText);
    console.log('🌍 Country code:', countryCode);
    console.log('🏷️ Number of brands:', brandDataList.length);

    // Replace <<Responsibility Language>>
    if (copyText.includes('<<Responsibility Language>>')) {
      const respLang = langVars['Responsibility Language '] || langVars['Responsibility Language'] || '';
      copyText = copyText.replace(/<<Responsibility Language>>/g, respLang);
      console.log('✅ Replaced: Responsibility Language');
    }

    // ✅ ENHANCED: TTB replacement with detailed logging
    if (copyText.includes('<<TTB>>')) {
      console.log('🔍 Found <<TTB>> placeholder in template');
      console.log('🌍 Country check: Is US?', countryCode === 'US');
      
      if (countryCode === 'US') {
        console.log('✅ US detected - building TTB statements...');
        
        const ttbStatements = [];
        
        for (const brandData of brandDataList) {
          const brandName = brandData['Brand Names'] || brandData['Display Names'];
          // ✅ FIXED: Handle different TTB Type column name variations
          const ttbType = brandData['TTB Type'] || 
                         brandData['TTBType'] || 
                         brandData['TTB_Type'] ||
                         'Full'; // Default to Full if not specified
          
          console.log(`🔍 Processing brand: "${brandName}" with TTB Type: "${ttbType}"`);
          
          const ttbStatement = this.getTTBStatement(brandName, ttbType);
          
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
        // Non-US countries: remove TTB placeholder
        copyText = copyText.replace(/<<TTB>>/g, '');
        console.log(`✅ Removed <<TTB>> (non-US country: ${countryCode})`);
      }
    } else {
      console.log('ℹ️ No <<TTB>> placeholder found in template');
    }

    // Replace <<Trademark>>
    if (copyText.includes('<<Trademark>>')) {
      const trademarkSection = this.buildTrademarkSection(brandDataList, language);
      copyText = copyText.replace(/<<Trademark>>/g, trademarkSection);
      console.log('✅ Replaced: Trademark');
    }

    // Replace <<Forward Notice>>
    if (copyText.includes('<<Forward Notice>>')) {
      const forwardNotice = this.getForwardNotice(brandDataList, langVars);
      copyText = copyText.replace(/<<Forward Notice>>/g, forwardNotice);
      console.log('✅ Replaced: Forward Notice');
    }

    // Replace other placeholders...
    if (copyText.includes('<<All Other Trademarks>>')) {
      const allOtherTM = langVars['All Other Trademarks'] || '';
      copyText = copyText.replace(/<<All Other Trademarks>>/g, allOtherTM);
      console.log('✅ Replaced: All Other Trademarks');
    }

    if (copyText.includes('<<Responsibility Site>>')) {
      const respSite = langVars['Responsibility Site'] || '';
      copyText = copyText.replace(/<<Responsibility Site>>/g, respSite);
      console.log('✅ Replaced: Responsibility Site');
    }

    if (copyText.includes('<<Legal Documents>>')) {
      const legalDocs = langVars['Website Legal Documents'] || '';
      copyText = copyText.replace(/<<Legal Documents>>/g, legalDocs);
      console.log('✅ Replaced: Legal Documents');
    }

    if (copyText.includes('<<Email Sent By>>')) {
      const emailSentBy = langVars['Email Sent By Statement'] || '';
      copyText = copyText.replace(/<<Email Sent By>>/g, emailSentBy);
      console.log('✅ Replaced: Email Sent By');
    }

    if (copyText.includes('<<Email Legal Documents>>')) {
      const emailLegalDocs = langVars['Email Legal Documents'] || '';
      copyText = copyText.replace(/<<Email Legal Documents>>/g, emailLegalDocs);
      console.log('✅ Replaced: Email Legal Documents');
    }

    if (copyText.includes('<<Email Header>>')) {
      const emailHeader = langVars['Email Header'] || '';
      copyText = copyText.replace(/<<Email Header>>/g, emailHeader);
      console.log('✅ Replaced: Email Header');
    }

    if (copyText.includes('<<UGC Policy>>')) {
      const ugcPolicy = langVars['UGC Policy'] || '';
      copyText = copyText.replace(/<<UGC Policy>>/g, ugcPolicy);
      console.log('✅ Replaced: UGC Policy');
    }

    if (copyText.includes('<<Age-Gate Statement>>')) {
      const ageGate = langVars['Age-Gate Statement'] || '';
      copyText = copyText.replace(/<<Age-Gate Statement>>/g, ageGate);
      console.log('✅ Replaced: Age-Gate Statement');
    }

    if (copyText.includes('<<Terms of Use>>')) {
      const termsOfUse = langVars['Terms of Use'] || '';
      copyText = copyText.replace(/<<Terms of Use>>/g, termsOfUse);
      console.log('✅ Replaced: Terms of Use');
    }

    if (copyText.includes('<<Privacy Policy>>')) {
      const privacyPolicy = langVars['Privacy Policy'] || '';
      copyText = copyText.replace(/<<Privacy Policy>>/g, privacyPolicy);
      console.log('✅ Replaced: Privacy Policy');
    }

    if (copyText.includes('<<Cookie Policy>>')) {
      const cookiePolicy = langVars['Cookie Policy'] || '';
      copyText = copyText.replace(/<<Cookie Policy>>/g, cookiePolicy);
      console.log('✅ Replaced: Cookie Policy');
    }

    if (copyText.includes('<<Terms Agreement>>')) {
      const termsAgreement = langVars['Terms Agreement'] || '';
      copyText = copyText.replace(/<<Terms Agreement>>/g, termsAgreement);
      console.log('✅ Replaced: Terms Agreement');
    }

    if (copyText.includes('<<Email Opt-In Statement>>')) {
      const optIn = langVars['Email Opt-In Statement and Consent Statement'] || '';
      copyText = copyText.replace(/<<Email Opt-In Statement>>/g, optIn);
      console.log('✅ Replaced: Email Opt-In Statement');
    }

    if (copyText.includes('<<Abbreviated Privacy Policy>>')) {
      const abbrevPrivacy = langVars['Abbreviated Privacy Policy'] || '';
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
      return langVars['Forward Notice Full'] || '';
    } else if (forwardNoticeType === 'Tightened') {
      return langVars['Forward Notice Tightened'] || '';
    }

    return '';
  }

  formatAsHtml(text) {
    return `<div class="generated-copy">${text}</div>`;
  }

  stripHtml(html) {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
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
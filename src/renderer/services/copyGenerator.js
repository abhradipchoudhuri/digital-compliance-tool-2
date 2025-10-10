// src/renderer/services/copyGenerator.js
// Advanced Copy Generation Engine - Handles placeholder-based template system

/**
 * CopyGenerator - Processes Excel-based template system with placeholder replacement
 * Handles complex multi-sheet data structure with language-dependent variables
 */
class CopyGenerator {
    constructor() {
      // Main data sheets
      this.trademarkConfig = null;      // Brand/trademark data
      this.overallStructure = null;     // Asset type templates
      this.trademarkStructure = null;   // Trademark format rules
      this.languageVariables = null;    // Language-specific content
      this.trademarkLanguage = null;    // Trademark language text
      this.countryLanguage = null;      // Country-language mappings
      
      this.isInitialized = false;
    }
  
    /**
     * Initialize generator with Excel data
     */
    initialize(excelData) {
      if (!excelData || typeof excelData !== 'object') {
        throw new Error('Invalid Excel data provided to CopyGenerator');
      }
  
      console.log('🔧 CopyGenerator: Initializing with Excel data...');
  
      // Map Excel sheets to internal data structures
      this.trademarkConfig = excelData['Trademark Config'] || [];
      this.overallStructure = excelData['Overall Structure'] || [];
      this.trademarkStructure = excelData['Trademark Structure'] || [];
      this.languageVariables = excelData['Language Dependent Variables'] || [];
      this.trademarkLanguage = excelData['Trademark Language'] || [];
      this.countryLanguage = excelData['CountryLanguage'] || [];
  
      console.log('📊 Loaded sheets:', {
        trademarkConfig: this.trademarkConfig.length,
        overallStructure: this.overallStructure.length,
        trademarkStructure: this.trademarkStructure.length,
        languageVariables: this.languageVariables.length,
        trademarkLanguage: this.trademarkLanguage.length,
        countryLanguage: this.countryLanguage.length
      });
  
      this.validateData();
      this.isInitialized = true;
      
      console.log('✅ CopyGenerator: Initialization complete');
    }
  
    /**
     * Validate that required data is present
     */
    validateData() {
      if (!this.trademarkConfig || this.trademarkConfig.length === 0) {
        throw new Error('Trademark Config sheet is empty or missing');
      }
      if (!this.overallStructure || this.overallStructure.length === 0) {
        throw new Error('Overall Structure sheet is empty or missing');
      }
      if (!this.trademarkStructure || this.trademarkStructure.length === 0) {
        throw new Error('Trademark Structure sheet is empty or missing');
      }
      if (!this.languageVariables || this.languageVariables.length === 0) {
        throw new Error('Language Dependent Variables sheet is empty or missing');
      }
    }
  
    /**
     * Main copy generation function
     * @param {Object} params - { assetType, countryCode, brandIds }
     * @returns {Object} Generated copy with metadata
     */
    generateCopy(params) {
      const startTime = Date.now();
  
      try {
        console.log('🎯 CopyGenerator: Starting generation...', params);
  
        // Validate parameters
        this.validateParams(params);
  
        const { assetType, countryCode, brandIds } = params;
  
        // Step 1: Get the template structure for this asset type
        const template = this.getAssetTemplate(assetType);
        if (!template) {
          throw new Error(`No template found for asset type: ${assetType}`);
        }
  
        console.log('📋 Template found:', template['Asset Type']);
        console.log('📝 Template structure:', template.Structure);
  
        // Step 2: Get language for this country
        const language = this.getLanguageForCountry(countryCode);
        console.log('🌍 Language for country:', { countryCode, language });
  
        // Step 3: Get language-dependent variables
        const langVars = this.getLanguageVariables(language);
        if (!langVars) {
          throw new Error(`No language variables found for: ${language}`);
        }
  
        // Step 4: Get brand data for each selected brand
        const brandDataList = this.getBrandData(brandIds);
        if (brandDataList.length === 0) {
          throw new Error(`No brand data found for brands: ${brandIds.join(', ')}`);
        }
  
        console.log('🏷️ Brands found:', brandDataList.map(b => b['Brand Names']));
  
        // Step 5: Build the complete copy by replacing all placeholders
        const generatedCopy = this.buildCopyFromTemplate(
          template,
          langVars,
          brandDataList,
          countryCode,
          language
        );
  
        // Calculate generation time
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
            brands: brandDataList.map(b => b['Brand Names']),
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
  
    /**
     * Validate generation parameters
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
  
    /**
     * Get template for specific asset type
     */
    getAssetTemplate(assetType) {
      return this.overallStructure.find(t => 
        t['Asset Type'] === assetType
      );
    }
  
    /**
     * Get language for a specific country code
     */
    getLanguageForCountry(countryCode) {
      const countryData = this.countryLanguage.find(c => 
        c['Abbv'] === countryCode
      );
  
      if (countryData) {
        return countryData['Language'];
      }
  
      // Default to English if not found
      console.warn(`⚠️ No language found for country ${countryCode}, defaulting to English (Default)`);
      return 'English (Default)';
    }
  
    /**
     * Get language-dependent variables for a language
     */
    getLanguageVariables(language) {
      return this.languageVariables.find(lv => 
        lv['Language'] === language
      );
    }
  
    /**
     * Get brand data for multiple brands
     */
    getBrandData(brandIds) {
      const brandDataList = [];
  
      for (const brandId of brandIds) {
        const brandData = this.trademarkConfig.find(b => 
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
  
    /**
     * Build complete copy by replacing all placeholders in template
     */
    buildCopyFromTemplate(template, langVars, brandDataList, countryCode, language) {
      let copyText = template.Structure || '';
  
      console.log('🔨 Building copy from template...');
      console.log('📝 Original template:', copyText);
  
      // Replace <<Responsibility Language>>
      if (copyText.includes('<<Responsibility Language>>')) {
        const respLang = langVars['Responsibility Language '] || langVars['Responsibility Language'] || '';
        copyText = copyText.replace(/<<Responsibility Language>>/g, respLang);
        console.log('✅ Replaced: Responsibility Language');
      }
  
      // Replace <<TTB>> - TTB mandatory statement (leave placeholder for US teams)
      if (copyText.includes('<<TTB>>')) {
        if (countryCode === 'US') {
          copyText = copyText.replace(/<<TTB>>/g, '<br><span style="color: red; font-weight: bold;">[INSERT TTB MANDATORY STATEMENT HERE]</span><br>');
          console.log('✅ Replaced: TTB (US placeholder)');
        } else {
          copyText = copyText.replace(/<<TTB>>/g, '');
          console.log('✅ Removed: TTB (non-US)');
        }
      }
  
      // Replace <<Trademark>> - Build trademark section for all brands
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
  
      // Replace <<All Other Trademarks>>
      if (copyText.includes('<<All Other Trademarks>>')) {
        const allOtherTM = langVars['All Other Trademarks'] || '';
        copyText = copyText.replace(/<<All Other Trademarks>>/g, allOtherTM);
        console.log('✅ Replaced: All Other Trademarks');
      }
  
      // Replace <<Responsibility Site>>
      if (copyText.includes('<<Responsibility Site>>')) {
        const respSite = langVars['Responsibility Site'] || '';
        copyText = copyText.replace(/<<Responsibility Site>>/g, respSite);
        console.log('✅ Replaced: Responsibility Site');
      }
  
      // Replace <<Legal Documents>> (Website)
      if (copyText.includes('<<Legal Documents>>')) {
        const legalDocs = langVars['Website Legal Documents'] || '';
        copyText = copyText.replace(/<<Legal Documents>>/g, legalDocs);
        console.log('✅ Replaced: Legal Documents');
      }
  
      // Replace <<Email Sent By>>
      if (copyText.includes('<<Email Sent By>>')) {
        const emailSentBy = langVars['Email Sent By Statement'] || '';
        copyText = copyText.replace(/<<Email Sent By>>/g, emailSentBy);
        console.log('✅ Replaced: Email Sent By');
      }
  
      // Replace <<Email Legal Documents>>
      if (copyText.includes('<<Email Legal Documents>>')) {
        const emailLegalDocs = langVars['Email Legal Documents'] || '';
        copyText = copyText.replace(/<<Email Legal Documents>>/g, emailLegalDocs);
        console.log('✅ Replaced: Email Legal Documents');
      }
  
      // Replace <<Email Header>>
      if (copyText.includes('<<Email Header>>')) {
        const emailHeader = langVars['Email Header'] || '';
        copyText = copyText.replace(/<<Email Header>>/g, emailHeader);
        console.log('✅ Replaced: Email Header');
      }
  
      // Replace <<UGC Policy>>
      if (copyText.includes('<<UGC Policy>>')) {
        const ugcPolicy = langVars['UGC Policy'] || '';
        copyText = copyText.replace(/<<UGC Policy>>/g, ugcPolicy);
        console.log('✅ Replaced: UGC Policy');
      }
  
      // Replace <<Age-Gate Statement>>
      if (copyText.includes('<<Age-Gate Statement>>')) {
        const ageGate = langVars['Age-Gate Statement'] || '';
        copyText = copyText.replace(/<<Age-Gate Statement>>/g, ageGate);
        console.log('✅ Replaced: Age-Gate Statement');
      }
  
      // Replace <<Terms of Use>>
      if (copyText.includes('<<Terms of Use>>')) {
        const termsOfUse = langVars['Terms of Use'] || '';
        copyText = copyText.replace(/<<Terms of Use>>/g, termsOfUse);
        console.log('✅ Replaced: Terms of Use');
      }
  
      // Replace <<Privacy Policy>>
      if (copyText.includes('<<Privacy Policy>>')) {
        const privacyPolicy = langVars['Privacy Policy'] || '';
        copyText = copyText.replace(/<<Privacy Policy>>/g, privacyPolicy);
        console.log('✅ Replaced: Privacy Policy');
      }
  
      // Replace <<Cookie Policy>>
      if (copyText.includes('<<Cookie Policy>>')) {
        const cookiePolicy = langVars['Cookie Policy'] || '';
        copyText = copyText.replace(/<<Cookie Policy>>/g, cookiePolicy);
        console.log('✅ Replaced: Cookie Policy');
      }
  
      // Replace <<Terms Agreement>>
      if (copyText.includes('<<Terms Agreement>>')) {
        const termsAgreement = langVars['Terms Agreement'] || '';
        copyText = copyText.replace(/<<Terms Agreement>>/g, termsAgreement);
        console.log('✅ Replaced: Terms Agreement');
      }
  
      // Replace <<Email Opt-In Statement>>
      if (copyText.includes('<<Email Opt-In Statement>>')) {
        const optIn = langVars['Email Opt-In Statement and Consent Statement'] || '';
        copyText = copyText.replace(/<<Email Opt-In Statement>>/g, optIn);
        console.log('✅ Replaced: Email Opt-In Statement');
      }
  
      // Replace <<Abbreviated Privacy Policy>>
      if (copyText.includes('<<Abbreviated Privacy Policy>>')) {
        const abbrevPrivacy = langVars['Abbreviated Privacy Policy'] || '';
        copyText = copyText.replace(/<<Abbreviated Privacy Policy>>/g, abbrevPrivacy);
        console.log('✅ Replaced: Abbreviated Privacy Policy');
      }
  
      console.log('📝 Final copy (first 200 chars):', copyText.substring(0, 200));
  
      // Generate both HTML and plain text versions
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
     * Build trademark section for all brands
     */
    buildTrademarkSection(brandDataList, language) {
      const currentYear = new Date().getFullYear();
      const trademarkParts = [];
  
      // Get trademark language data for this language
      const tmLangData = this.trademarkLanguage.find(tl => 
        tl['Language'] === language
      );
  
      for (const brandData of brandDataList) {
        const trademarkType = brandData['Trademark Type'] || 'Full';
        
        // Get the trademark structure template
        const tmStructure = this.trademarkStructure.find(ts => 
          ts['Type of Trademark'] === trademarkType
        );
  
        if (!tmStructure) {
          console.warn(`⚠️ No trademark structure found for type: ${trademarkType}`);
          continue;
        }
  
        let tmText = tmStructure.Structure || '';
  
        // Replace brand-specific placeholders
        tmText = tmText.replace(/<<Brand>>/g, brandData['Brand Names'] || brandData['Display Names']);
        tmText = tmText.replace(/<<Entity>>/g, brandData['Entity Names'] || '');
        tmText = tmText.replace(/<<Year>>/g, currentYear.toString());
  
        // Replace <<Pre-Brand>> if exists (empty by default)
        tmText = tmText.replace(/<<Pre-Brand>>/g, '');
  
        // Replace <<Registered Language>>
        if (tmLangData && tmLangData['Registered Language']) {
          const registeredLang = tmLangData['Registered Language'];
          // Add trademark symbol before registered language
          const brandName = brandData['Brand Names'] || brandData['Display Names'];
          tmText = tmText.replace(/<<Registered Language>>/g, `® ${registeredLang}`);
          // Also mark the brand with ®
          tmText = tmText.replace(brandName, `${brandName}®`);
        } else {
          tmText = tmText.replace(/<<Registered Language>>/g, '');
        }
  
        // Replace <<Reserve Language>>
        if (tmLangData && tmLangData['Reserve Language ']) {
          tmText = tmText.replace(/<<Reserve Language>>/g, tmLangData['Reserve Language '] || '');
        } else {
          tmText = tmText.replace(/<<Reserve Language>>/g, '');
        }
  
        trademarkParts.push(tmText.trim());
      }
  
      return trademarkParts.join(' ');
    }
  
    /**
     * Get forward notice based on brand configuration
     */
    getForwardNotice(brandDataList, langVars) {
      // Check if any brand needs forward notice
      const needsForwardNotice = brandDataList.some(b => 
        b['Forward Notice Type'] && b['Forward Notice Type'] !== 'NA'
      );
  
      if (!needsForwardNotice) {
        return '';
      }
  
      // Get the first brand's forward notice type
      const forwardNoticeType = brandDataList[0]['Forward Notice Type'];
  
      if (forwardNoticeType === 'Full') {
        return langVars['Forward Notice Full'] || '';
      } else if (forwardNoticeType === 'Tightened') {
        return langVars['Forward Notice Tightened'] || '';
      }
  
      return '';
    }
  
    /**
     * Format copy as HTML
     */
    formatAsHtml(text) {
      // The text already contains <br> tags from the template
      // Wrap in a div for proper rendering
      return `<div class="generated-copy">${text}</div>`;
    }
  
    /**
     * Strip HTML tags for plain text version
     */
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
  
    /**
     * Count words in text
     */
    countWords(text) {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }
  
    /**
     * Get available asset types from templates
     */
    getAvailableAssetTypes() {
      if (!this.overallStructure) return [];
      return this.overallStructure.map(t => t['Asset Type']).filter(Boolean);
    }
  
    /**
     * Get available countries
     */
    getAvailableCountries() {
      if (!this.countryLanguage) return [];
      
      return this.countryLanguage
        .map(c => ({
          code: c['Abbv'],
          name: c['Country'],
          language: c['Language']
        }))
        .filter(c => c.code && c.name);
    }
  
    /**
     * Get available brands
     */
    getAvailableBrands() {
      if (!this.trademarkConfig) return [];
      
      return this.trademarkConfig
        .map(b => ({
          id: b['Brand Names'],
          name: b['Display Names'],
          entity: b['Entity Names']
        }))
        .filter(b => b.id && b.name);
    }
  
    /**
     * Check if copy generation is ready
     */
    isReady() {
      return this.isInitialized;
    }
  }
  
  // Export singleton instance
  const copyGenerator = new CopyGenerator();
  export default copyGenerator;
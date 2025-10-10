// src/renderer/services/copyGenerator.js
// Core Copy Generation Engine - Builds legal compliance copy from templates

/**
 * CopyGenerator - Handles all copy generation logic
 * Processes templates and trademark data to generate compliance copy
 */
class CopyGenerator {
    constructor() {
      this.trademarkData = null;
      this.templates = null;
      this.brandConfig = null;
    }
  
    /**
     * Initialize generator with Excel data
     */
    initialize(excelData) {
      if (!excelData || typeof excelData !== 'object') {
        throw new Error('Invalid Excel data provided to CopyGenerator');
      }
  
      this.trademarkData = excelData['Trademark Config'] || [];
      this.templates = excelData['Copy Templates'] || [];
      this.brandConfig = excelData['Brand Master'] || [];
  
      console.log('CopyGenerator initialized with:', {
        trademarks: this.trademarkData.length,
        templates: this.templates.length,
        brands: this.brandConfig.length
      });
  
      this.validateData();
    }
  
    /**
     * Validate that required data is present
     */
    validateData() {
      if (!this.trademarkData || this.trademarkData.length === 0) {
        throw new Error('Trademark Config sheet is empty or missing');
      }
      if (!this.templates || this.templates.length === 0) {
        throw new Error('Copy Templates sheet is empty or missing');
      }
      if (!this.brandConfig || this.brandConfig.length === 0) {
        throw new Error('Brand Master sheet is empty or missing');
      }
    }
  
    /**
     * Main copy generation function
     * @param {Object} params - Generation parameters
     * @returns {Object} Generated copy with metadata
     */
    generateCopy(params) {
      const startTime = Date.now();
  
      try {
        // Validate parameters
        this.validateParams(params);
  
        const { assetType, countryCode, brandIds } = params;
  
        console.log('Generating copy for:', { assetType, countryCode, brandIds });
  
        // Get template for asset type
        const template = this.getTemplate(assetType, countryCode);
        if (!template) {
          throw new Error(`No template found for asset type: ${assetType}`);
        }
  
        // Get trademark data for each brand
        const brandTrademarks = this.getBrandTrademarks(brandIds, countryCode);
        if (brandTrademarks.length === 0) {
          throw new Error(`No trademark data found for brands: ${brandIds.join(', ')} in ${countryCode}`);
        }
  
        // Build the copy
        const generatedCopy = this.buildCopy(template, brandTrademarks);
  
        // Calculate generation time
        const generationTime = Date.now() - startTime;
  
        return {
          success: true,
          copy: generatedCopy,
          metadata: {
            assetType,
            countryCode,
            brandCount: brandIds.length,
            brands: brandTrademarks.map(bt => bt.brandName),
            templateUsed: template['Template Name'] || assetType,
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
     * Get template for specific asset type and country
     */
    getTemplate(assetType, countryCode) {
      // First try to find country-specific template
      let template = this.templates.find(t => 
        t['Asset Type'] === assetType && 
        t['Country Code'] === countryCode
      );
  
      // If no country-specific template, try global template
      if (!template) {
        template = this.templates.find(t => 
          t['Asset Type'] === assetType && 
          (!t['Country Code'] || t['Country Code'] === 'GLOBAL' || t['Country Code'] === 'ALL')
        );
      }
  
      if (template) {
        console.log('Found template:', template['Template Name'] || assetType);
      } else {
        console.warn(`No template found for ${assetType} in ${countryCode}`);
      }
  
      return template;
    }
  
    /**
     * Get trademark data for brands in specific country
     */
    getBrandTrademarks(brandIds, countryCode) {
      const brandTrademarks = [];
  
      for (const brandId of brandIds) {
        // Find brand info
        const brandInfo = this.brandConfig.find(b => 
          b['Brand ID'] === brandId || b['Brand Name'] === brandId
        );
  
        if (!brandInfo) {
          console.warn(`Brand not found: ${brandId}`);
          continue;
        }
  
        // Find trademark data for this brand and country
        const trademark = this.trademarkData.find(t => 
          (t['Brand ID'] === brandId || t['Brand Name'] === brandInfo['Brand Name']) &&
          t['Country Code'] === countryCode
        );
  
        if (trademark) {
          brandTrademarks.push({
            brandId: brandId,
            brandName: brandInfo['Brand Name'],
            trademarkSymbol: this.getTrademarkSymbol(trademark),
            registrationNumber: trademark['Registration Number'] || '',
            registrationDate: trademark['Registration Date'] || '',
            status: trademark['Status'] || 'Active'
          });
        } else {
          // If no trademark found, still include brand with default symbol
          console.warn(`No trademark data for ${brandInfo['Brand Name']} in ${countryCode}, using default`);
          brandTrademarks.push({
            brandId: brandId,
            brandName: brandInfo['Brand Name'],
            trademarkSymbol: '™', // Default to TM
            registrationNumber: '',
            registrationDate: '',
            status: 'Pending'
          });
        }
      }
  
      return brandTrademarks;
    }
  
    /**
     * Determine correct trademark symbol based on status
     */
    getTrademarkSymbol(trademark) {
      const status = (trademark['Status'] || '').toLowerCase();
      const symbol = trademark['Symbol'] || '';
  
      // If symbol is explicitly provided, use it
      if (symbol) {
        return symbol;
      }
  
      // Determine symbol based on status
      if (status.includes('registered') || status === 'active') {
        return '®';
      } else if (status.includes('pending') || status.includes('applied')) {
        return '™';
      } else {
        return '™'; // Default to TM
      }
    }
  
    /**
     * Build final copy from template and trademark data
     */
    buildCopy(template, brandTrademarks) {
      let copyText = template['Copy Template'] || template['Template Text'] || '';
  
      if (!copyText) {
        throw new Error('Template has no copy text');
      }
  
      console.log('Building copy with template:', copyText.substring(0, 100) + '...');
  
      // Handle single brand
      if (brandTrademarks.length === 1) {
        const brand = brandTrademarks[0];
        copyText = this.replacePlaceholders(copyText, {
          brandName: brand.brandName,
          symbol: brand.trademarkSymbol
        });
      } 
      // Handle multiple brands
      else {
        copyText = this.replaceMultiBrandPlaceholders(copyText, brandTrademarks);
      }
  
      // Generate both HTML and plain text versions
      const htmlCopy = this.generateHtmlCopy(copyText, brandTrademarks);
      const plainText = this.stripHtml(htmlCopy);
  
      return {
        html: htmlCopy,
        plainText: plainText,
        characterCount: plainText.length,
        wordCount: this.countWords(plainText),
        brands: brandTrademarks.map(bt => ({
          name: bt.brandName,
          symbol: bt.trademarkSymbol
        }))
      };
    }
  
    /**
     * Replace placeholders in template
     */
    replacePlaceholders(text, data) {
      let result = text;
  
      // Replace {BRAND_NAME} with brand name
      result = result.replace(/\{BRAND_NAME\}/g, data.brandName);
  
      // Replace {BRAND} with brand name
      result = result.replace(/\{BRAND\}/g, data.brandName);
  
      // Replace {SYMBOL} or {TM} with trademark symbol
      result = result.replace(/\{SYMBOL\}/g, data.symbol);
      result = result.replace(/\{TM\}/g, data.symbol);
  
      return result;
    }
  
    /**
     * Replace placeholders for multiple brands
     */
    replaceMultiBrandPlaceholders(text, brandTrademarks) {
      let result = text;
  
      // Build brand list string
      const brandList = brandTrademarks
        .map(bt => `${bt.brandName}${bt.trademarkSymbol}`)
        .join(', ');
  
      // Replace {BRAND_LIST}
      result = result.replace(/\{BRAND_LIST\}/g, brandList);
  
      // If template has {BRAND_NAME}, use first brand
      if (result.includes('{BRAND_NAME}') && brandTrademarks.length > 0) {
        result = result.replace(/\{BRAND_NAME\}/g, brandTrademarks[0].brandName);
        result = result.replace(/\{SYMBOL\}/g, brandTrademarks[0].trademarkSymbol);
      }
  
      return result;
    }
  
    /**
     * Generate HTML formatted copy
     */
    generateHtmlCopy(text, brandTrademarks) {
      let html = text;
  
      // Wrap brand names with trademark symbols in spans
      brandTrademarks.forEach(bt => {
        const brandWithSymbol = `${bt.brandName}${bt.trademarkSymbol}`;
        const regex = new RegExp(brandWithSymbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        html = html.replace(
          regex,
          `<span class="brand-trademark">${bt.brandName}<sup>${bt.trademarkSymbol}</sup></span>`
        );
      });
  
      // Wrap in paragraph tags if not already
      if (!html.startsWith('<p>')) {
        html = `<p>${html}</p>`;
      }
  
      return html;
    }
  
    /**
     * Strip HTML tags for plain text version
     */
    stripHtml(html) {
      return html
        .replace(/<sup>/g, '')
        .replace(/<\/sup>/g, '')
        .replace(/<[^>]*>/g, '')
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
      if (!this.templates) return [];
  
      const assetTypes = new Set();
      this.templates.forEach(t => {
        if (t['Asset Type']) {
          assetTypes.add(t['Asset Type']);
        }
      });
  
      return Array.from(assetTypes).sort();
    }
  
    /**
     * Get available countries from trademark data
     */
    getAvailableCountries() {
      if (!this.trademarkData) return [];
  
      const countries = new Set();
      this.trademarkData.forEach(t => {
        if (t['Country Code']) {
          countries.add(t['Country Code']);
        }
      });
  
      return Array.from(countries).sort();
    }
  
    /**
     * Check if copy generation is ready
     */
    isReady() {
      return !!(this.trademarkData && this.templates && this.brandConfig);
    }
  }
  
  // Export singleton instance
  const copyGenerator = new CopyGenerator();
  export default copyGenerator;
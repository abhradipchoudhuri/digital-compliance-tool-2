// src/renderer/services/templateService.js
// Template Engine for Copy Generation (Artifact 6)

import excelService from './excelService.js';
import validationService from './validationService.js';

export class TemplateService {
  constructor() {
    this.excelService = excelService;
    this.validationService = validationService;
    this.generationHistory = [];
  }

  async generateCopy(params) {
    try {
      console.log('TemplateService: Starting copy generation...', params);

      // 1. Validate input parameters
      const validation = this.validationService.validateGenerationParams(params);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // 2. Ensure Excel data is loaded
      if (!this.excelService.isDataLoaded()) {
        await this.excelService.loadData();
      }

      // 3. Get template structure for asset type
      const templateStructure = this.excelService.getTemplateStructureByAssetType(params.assetType);
      if (!templateStructure) {
        throw new Error(`No template structure found for asset type: ${params.assetType}`);
      }

      // 4. Get language variables for country
      const languageVars = this.excelService.getLanguageVariablesByCountry(params.countryCode);
      if (!languageVars) {
        throw new Error(`No language variables found for country: ${params.countryCode}`);
      }

      // 5. Get trademark language
      const trademarkLang = this.excelService.getTrademarkLanguageByCountry(
        params.countryCode, 
        templateStructure.Type
      );

      // 6. Process each selected brand
      const generatedCopies = [];
      
      for (const brandId of params.brandIds) {
        const brand = this.excelService.getBrandById(brandId);
        if (!brand) {
          console.warn(`Brand not found: ${brandId}`);
          continue;
        }

        const copy = await this.generateSingleBrandCopy({
          brand,
          templateStructure,
          languageVars,
          trademarkLang,
          params
        });

        generatedCopies.push(copy);
      }

      // 7. Create result object
      const result = {
        success: true,
        copies: generatedCopies,
        metadata: {
          assetType: params.assetType,
          country: params.countryCode,
          brandsCount: params.brandIds.length,
          generatedAt: new Date().toISOString(),
          templateType: templateStructure.Type
        }
      };

      // 8. Add to history
      this.addToHistory(result);

      console.log('TemplateService: Copy generation completed successfully');
      return result;

    } catch (error) {
      console.error('TemplateService: Copy generation failed:', error);
      return {
        success: false,
        error: error.message,
        copies: []
      };
    }
  }

  async generateSingleBrandCopy({ brand, templateStructure, languageVars, trademarkLang, params }) {
    try {
      // Create variable substitution map
      const variables = this.buildVariableMap({
        brand,
        languageVars,
        trademarkLang,
        params
      });

      // Process template with variables
      const htmlCopy = this.processTemplate(templateStructure.Template, variables, 'html');
      const plainTextCopy = this.processTemplate(templateStructure.Template, variables, 'text');

      // Apply character limit if specified
      const finalHtmlCopy = this.applyCharacterLimit(htmlCopy, templateStructure.CharacterLimit);
      const finalTextCopy = this.applyCharacterLimit(plainTextCopy, templateStructure.CharacterLimit);

      return {
        brandId: brand.id,
        brandName: brand.name,
        html: this.validationService.sanitizeHtml(finalHtmlCopy),
        text: finalTextCopy,
        characterCount: finalTextCopy.length,
        characterLimit: templateStructure.CharacterLimit,
        variables: variables
      };

    } catch (error) {
      console.error(`Error generating copy for brand ${brand.id}:`, error);
      return {
        brandId: brand.id,
        brandName: brand.name,
        html: '',
        text: '',
        error: error.message
      };
    }
  }

  buildVariableMap({ brand, languageVars, trademarkLang, params }) {
    const country = this.excelService.getCountryById(params.countryCode);
    
    return {
      // Brand variables
      BRAND_NAME: brand.name,
      BRAND_ENTITY: brand.entity,
      
      // Trademark variables
      TRADEMARK: trademarkLang?.RegisteredLanguage || '®',
      RESERVE_TRADEMARK: trademarkLang?.ReserveLanguage || '™',
      
      // Compliance variables
      COMPLIANCE_TEXT: languageVars?.ResponsibilityLanguage || 'Please drink responsibly.',
      FORWARD_NOTICE: languageVars?.ForwardNotice || '',
      
      // Country variables
      COUNTRY: country?.name || params.countryCode,
      COUNTRY_CODE: params.countryCode,
      LANGUAGE: country?.language || 'English',
      
      // Asset type
      ASSET_TYPE: params.assetType,
      
      // Date variables
      CURRENT_YEAR: new Date().getFullYear(),
      CURRENT_DATE: new Date().toLocaleDateString(),
      
      // Custom variables (if provided)
      ...(params.customVariables || {})
    };
  }

  processTemplate(template, variables, format = 'html') {
    if (!template || typeof template !== 'string') {
      return '';
    }

    let processedTemplate = template;

    // Replace all variables in the format {VARIABLE_NAME}
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      const regex = new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g');
      processedTemplate = processedTemplate.replace(regex, value || '');
    });

    // Format-specific processing
    if (format === 'html') {
      // Convert line breaks to HTML
      processedTemplate = processedTemplate.replace(/\n/g, '<br>');
      
      // Add HTML structure if needed
      if (!processedTemplate.includes('<')) {
        processedTemplate = `<p>${processedTemplate}</p>`;
      }
    } else if (format === 'text') {
      // Strip any HTML tags for plain text
      processedTemplate = processedTemplate.replace(/<[^>]*>/g, '');
      processedTemplate = processedTemplate.replace(/<br\s*\/?>/gi, '\n');
    }

    return processedTemplate.trim();
  }

  applyCharacterLimit(text, limit) {
    if (!limit || typeof limit !== 'number' || text.length <= limit) {
      return text;
    }

    // Truncate but try to preserve word boundaries
    const truncated = text.substring(0, limit);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > limit * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  }

  addToHistory(result) {
    this.generationHistory.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...result
    });

    // Keep only last 100 generations
    if (this.generationHistory.length > 100) {
      this.generationHistory = this.generationHistory.slice(0, 100);
    }
  }

  getHistory() {
    return this.generationHistory;
  }

  clearHistory() {
    this.generationHistory = [];
  }

  getHistoryById(id) {
    return this.generationHistory.find(item => item.id === id) || null;
  }

  exportHistory() {
    return {
      exported: new Date().toISOString(),
      count: this.generationHistory.length,
      history: this.generationHistory
    };
  }

  // Utility methods
  getAvailableVariables() {
    return [
      'BRAND_NAME', 'BRAND_ENTITY', 'TRADEMARK', 'RESERVE_TRADEMARK',
      'COMPLIANCE_TEXT', 'FORWARD_NOTICE', 'COUNTRY', 'COUNTRY_CODE',
      'LANGUAGE', 'ASSET_TYPE', 'CURRENT_YEAR', 'CURRENT_DATE'
    ];
  }

  validateTemplate(template) {
    const errors = [];
    const availableVars = this.getAvailableVariables();
    
    // Find all placeholders in template
    const placeholders = template.match(/{[^}]+}/g) || [];
    
    placeholders.forEach(placeholder => {
      const varName = placeholder.replace(/[{}]/g, '');
      if (!availableVars.includes(varName)) {
        errors.push(`Unknown variable: ${varName}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      placeholders: placeholders.length
    };
  }
}

// Create and export default instance
const templateService = new TemplateService();
export default templateService;
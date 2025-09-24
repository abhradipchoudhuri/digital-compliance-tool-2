// src/renderer/services/templateService.js
// Template Service for generating Brown-Forman legal copy

import excelService from './excelService';
import validationService from './validationService';

class TemplateService {
  constructor() {
    this.templates = this.initializeTemplates();
    this.complianceRules = this.initializeComplianceRules();
  }

  initializeTemplates() {
    return {
      'Facebook Post': {
        structure: 'social-media-post',
        maxLength: 2000,
        requirements: ['brand-mention', 'trademark-notice', 'responsibility-message'],
        template: `{{CONTENT_INTRO}}

{{BRAND_MENTIONS}}

{{TRADEMARK_NOTICES}}

{{RESPONSIBILITY_MESSAGE}}

{{ADDITIONAL_DISCLAIMERS}}`
      },
      
      'Instagram Story': {
        structure: 'social-media-story',
        maxLength: 1000,
        requirements: ['brand-mention', 'trademark-notice', 'responsibility-message'],
        template: `{{CONTENT_INTRO}}

{{BRAND_MENTIONS}}

{{TRADEMARK_NOTICES}}
{{RESPONSIBILITY_MESSAGE}}`
      },
      
      'Instagram Post': {
        structure: 'social-media-post',
        maxLength: 2200,
        requirements: ['brand-mention', 'trademark-notice', 'responsibility-message'],
        template: `{{CONTENT_INTRO}}

{{BRAND_MENTIONS}}

{{HASHTAGS}}

{{TRADEMARK_NOTICES}}

{{RESPONSIBILITY_MESSAGE}}`
      },
      
      'Twitter Post': {
        structure: 'social-media-micro',
        maxLength: 280,
        requirements: ['brand-mention', 'trademark-notice', 'responsibility-message-short'],
        template: `{{CONTENT_INTRO}}

{{BRAND_MENTIONS}}

{{TRADEMARK_NOTICES}}
{{RESPONSIBILITY_MESSAGE_SHORT}}`
      },
      
      'LinkedIn Post': {
        structure: 'professional-social',
        maxLength: 3000,
        requirements: ['brand-mention', 'trademark-notice', 'responsibility-message', 'corporate-disclaimer'],
        template: `{{CONTENT_INTRO}}

{{BRAND_MENTIONS}}

{{CORPORATE_MESSAGE}}

{{TRADEMARK_NOTICES}}

{{RESPONSIBILITY_MESSAGE}}

{{CORPORATE_DISCLAIMER}}`
      },
      
      'Email Template': {
        structure: 'email-marketing',
        maxLength: 5000,
        requirements: ['brand-mention', 'trademark-notice', 'responsibility-message', 'unsubscribe-notice'],
        template: `{{EMAIL_HEADER}}

{{CONTENT_INTRO}}

{{BRAND_MENTIONS}}

{{PRODUCT_INFORMATION}}

{{TRADEMARK_NOTICES}}

{{RESPONSIBILITY_MESSAGE}}

{{LEGAL_DISCLAIMERS}}

{{UNSUBSCRIBE_NOTICE}}`
      },
      
      'Banner Ad': {
        structure: 'display-advertising',
        maxLength: 500,
        requirements: ['brand-mention', 'trademark-notice', 'responsibility-message-micro'],
        template: `{{HEADLINE}}

{{BRAND_MENTIONS}}

{{TRADEMARK_NOTICES}}
{{RESPONSIBILITY_MESSAGE_MICRO}}`
      },
      
      'Video Description': {
        structure: 'video-content',
        maxLength: 4000,
        requirements: ['brand-mention', 'trademark-notice', 'responsibility-message', 'content-warning'],
        template: `{{VIDEO_DESCRIPTION}}

{{BRAND_MENTIONS}}

{{CONTENT_WARNING}}

{{TRADEMARK_NOTICES}}

{{RESPONSIBILITY_MESSAGE}}

{{ADDITIONAL_DISCLAIMERS}}`
      },
      
      'Website Copy': {
        structure: 'web-content',
        maxLength: 8000,
        requirements: ['brand-mention', 'trademark-notice', 'responsibility-message', 'privacy-policy', 'terms-conditions'],
        template: `{{PAGE_CONTENT}}

{{BRAND_MENTIONS}}

{{TRADEMARK_NOTICES}}

{{RESPONSIBILITY_MESSAGE}}

{{PRIVACY_POLICY_LINK}}

{{TERMS_CONDITIONS_LINK}}

{{ADDITIONAL_LEGAL_TEXT}}`
      }
    };
  }

  initializeComplianceRules() {
    return {
      // US Compliance Rules
      'US': {
        responsibilityMessage: 'Please drink responsibly.',
        ageGating: 'Must be 21+ to view this content.',
        trademarkFormat: '{{BRAND}}® {{CATEGORY}}',
        additionalDisclaimers: {
          'Tennessee Whiskey': 'Tennessee Whiskey. 40% Alc/Vol. Distilled and Bottled by Jack Daniel Distillery.',
          'Bourbon': 'Kentucky Straight Bourbon Whiskey. Distilled and Bottled by Brown-Forman.',
          'Tequila': '100% Agave. Product of Mexico.',
          'Rum': 'Caribbean Rum. Please enjoy responsibly.',
          'Gin': 'Distilled Gin. Crafted with botanicals.',
          'Ready to Drink': 'Ready-to-drink alcoholic beverage. Chill and serve.'
        },
        copyrightNotice: '© {{YEAR}} Brown-Forman Corporation, Louisville, KY'
      },
      
      // UK Compliance Rules
      'GB': {
        responsibilityMessage: 'Please drink responsibly. For more information visit drinkaware.co.uk',
        ageGating: 'Must be 18+ to view this content.',
        trademarkFormat: '{{BRAND}}® {{CATEGORY}}',
        additionalDisclaimers: {
          'Tennessee Whiskey': 'American Whiskey. 40% Vol.',
          'Bourbon': 'American Whiskey. 40% Vol.',
          'Tequila': 'Tequila. 40% Vol. Product of Mexico.',
          'Rum': 'Caribbean Rum. 40% Vol.',
          'Gin': 'London Dry Gin. 40% Vol.',
          'Ready to Drink': 'Ready-to-drink alcoholic beverage. Serve chilled.'
        },
        copyrightNotice: '© {{YEAR}} Brown-Forman Corporation'
      },
      
      // Canadian Compliance Rules
      'CA': {
        responsibilityMessage: 'Please drink responsibly. / Veuillez boire de façon responsable.',
        ageGating: 'Must be of legal drinking age to view this content.',
        trademarkFormat: '{{BRAND}}® {{CATEGORY}}',
        additionalDisclaimers: {
          'Tennessee Whiskey': 'American Whiskey. 40% Alc./Vol.',
          'Bourbon': 'American Whiskey. 40% Alc./Vol.',
          'Tequila': 'Tequila. 40% Alc./Vol. Product of Mexico.',
          'Rum': 'Caribbean Rum. 40% Alc./Vol.',
          'Gin': 'Gin. 40% Alc./Vol.',
          'Ready to Drink': 'Alcoholic beverage. Serve responsibly.'
        },
        copyrightNotice: '© {{YEAR}} Brown-Forman Corporation'
      },
      
      // German Compliance Rules
      'DE': {
        responsibilityMessage: 'Bitte trinken Sie verantwortungsvoll.',
        ageGating: 'Nur für Personen ab 18 Jahren.',
        trademarkFormat: '{{BRAND}}® {{CATEGORY}}',
        additionalDisclaimers: {
          'Tennessee Whiskey': 'Amerikanischer Whiskey. 40% Vol.',
          'Bourbon': 'Amerikanischer Whiskey. 40% Vol.',
          'Tequila': 'Tequila. 40% Vol. Produkt aus Mexiko.',
          'Rum': 'Karibischer Rum. 40% Vol.',
          'Gin': 'Gin. 40% Vol.',
          'Ready to Drink': 'Alkoholisches Getränk. Gekühlt servieren.'
        },
        copyrightNotice: '© {{YEAR}} Brown-Forman Corporation'
      },
      
      // French Compliance Rules
      'FR': {
        responsibilityMessage: 'À consommer avec modération.',
        ageGating: 'Réservé aux plus de 18 ans.',
        trademarkFormat: '{{BRAND}}® {{CATEGORY}}',
        additionalDisclaimers: {
          'Tennessee Whiskey': 'Whiskey américain. 40% Vol.',
          'Bourbon': 'Whiskey américain. 40% Vol.',
          'Tequila': 'Tequila. 40% Vol. Produit du Mexique.',
          'Rum': 'Rhum des Caraïbes. 40% Vol.',
          'Gin': 'Gin. 40% Vol.',
          'Ready to Drink': 'Boisson alcoolisée prête à boire.'
        },
        copyrightNotice: '© {{YEAR}} Brown-Forman Corporation'
      },

      // Default/International Rules
      'DEFAULT': {
        responsibilityMessage: 'Please drink responsibly.',
        ageGating: 'Must be of legal drinking age to view this content.',
        trademarkFormat: '{{BRAND}}® {{CATEGORY}}',
        additionalDisclaimers: {
          'Tennessee Whiskey': 'American Whiskey. 40% Alc/Vol.',
          'Bourbon': 'American Whiskey. 40% Alc/Vol.',
          'Tequila': 'Tequila. 40% Alc/Vol. Product of Mexico.',
          'Rum': 'Caribbean Rum. 40% Alc/Vol.',
          'Gin': 'Gin. 40% Alc/Vol.',
          'Ready to Drink': 'Ready-to-drink alcoholic beverage.'
        },
        copyrightNotice: '© {{YEAR}} Brown-Forman Corporation'
      }
    };
  }

  /**
   * Generate legal copy based on parameters
   */
  async generateCopy(params) {
    try {
      console.log('TemplateService: Generating copy with params:', params);

      // Validate parameters
      const validation = validationService.validateGenerationParams(params);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const { assetType, countryCode, brandIds } = params;

      // Get template for asset type
      const template = this.templates[assetType];
      if (!template) {
        throw new Error(`No template found for asset type: ${assetType}`);
      }

      // Get compliance rules for country
      const complianceRules = this.complianceRules[countryCode] || this.complianceRules['DEFAULT'];

      // Get brand information
      const brands = brandIds.map(id => excelService.getBrandById(id)).filter(Boolean);
      if (brands.length === 0) {
        throw new Error('No valid brands found');
      }

      // Get country information
      const country = excelService.getCountryById(countryCode);
      if (!country) {
        throw new Error(`Country not found: ${countryCode}`);
      }

      // Generate content sections
      const contentSections = this.generateContentSections({
        template,
        complianceRules,
        brands,
        country,
        assetType
      });

      // Replace placeholders in template
      let generatedHtml = template.template;
      let generatedPlainText = template.template;

      Object.entries(contentSections).forEach(([placeholder, content]) => {
        const placeholderPattern = new RegExp(`{{${placeholder}}}`, 'g');
        generatedHtml = generatedHtml.replace(placeholderPattern, content.html || content);
        generatedPlainText = generatedPlainText.replace(placeholderPattern, content.text || content);
      });

      // Clean up any remaining empty placeholders
      generatedHtml = generatedHtml.replace(/{{\w+}}/g, '').replace(/\n\n\n+/g, '\n\n').trim();
      generatedPlainText = generatedPlainText.replace(/{{\w+}}/g, '').replace(/\n\n\n+/g, '\n\n').trim();

      const result = {
        html: generatedHtml,
        plainText: generatedPlainText,
        metadata: {
          assetType,
          country: country.name,
          brands: brands.map(b => b.displayName),
          generatedAt: new Date().toISOString(),
          template: template.structure,
          length: generatedPlainText.length,
          maxLength: template.maxLength
        }
      };

      console.log('TemplateService: Copy generated successfully');
      return { success: true, result };

    } catch (error) {
      console.error('TemplateService: Error generating copy:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate individual content sections
   */
  generateContentSections({ template, complianceRules, brands, country, assetType }) {
    const currentYear = new Date().getFullYear();
    const sections = {};

    // Content intro
    sections.CONTENT_INTRO = this.generateContentIntro(brands, assetType);

    // Brand mentions with proper formatting
    sections.BRAND_MENTIONS = this.generateBrandMentions(brands, complianceRules);

    // Trademark notices
    sections.TRADEMARK_NOTICES = this.generateTrademarkNotices(brands, complianceRules);

    // Responsibility messages
    sections.RESPONSIBILITY_MESSAGE = complianceRules.responsibilityMessage;
    sections.RESPONSIBILITY_MESSAGE_SHORT = this.shortenMessage(complianceRules.responsibilityMessage);
    sections.RESPONSIBILITY_MESSAGE_MICRO = 'Drink responsibly.';

    // Additional disclaimers based on brand categories
    sections.ADDITIONAL_DISCLAIMERS = this.generateAdditionalDisclaimers(brands, complianceRules);

    // Copyright notice
    sections.COPYRIGHT_NOTICE = complianceRules.copyrightNotice.replace('{{YEAR}}', currentYear);

    // Asset-specific sections
    if (assetType === 'Instagram Post') {
      sections.HASHTAGS = this.generateHashtags(brands);
    }

    if (assetType === 'LinkedIn Post') {
      sections.CORPORATE_MESSAGE = this.generateCorporateMessage(brands);
      sections.CORPORATE_DISCLAIMER = 'Brown-Forman Corporation is committed to responsible marketing and consumption of our premium spirits brands.';
    }

    if (assetType === 'Email Template') {
      sections.EMAIL_HEADER = 'Brown-Forman Premium Spirits';
      sections.UNSUBSCRIBE_NOTICE = 'To unsubscribe from future communications, please click here.';
    }

    if (assetType === 'Video Description') {
      sections.CONTENT_WARNING = 'This content is intended for adults of legal drinking age only.';
    }

    if (assetType === 'Website Copy') {
      sections.PRIVACY_POLICY_LINK = '<a href="/privacy-policy">Privacy Policy</a>';
      sections.TERMS_CONDITIONS_LINK = '<a href="/terms-conditions">Terms & Conditions</a>';
    }

    return sections;
  }

  generateContentIntro(brands, assetType) {
    const brandNames = brands.map(b => b.displayName);
    const brandCount = brandNames.length;

    if (brandCount === 1) {
      return `Discover the exceptional quality of ${brandNames[0]}.`;
    } else {
      return `Experience the premium portfolio of ${brandNames.slice(0, -1).join(', ')} and ${brandNames.slice(-1)[0]}.`;
    }
  }

  generateBrandMentions(brands, complianceRules) {
    return brands.map(brand => {
      const trademark = complianceRules.trademarkFormat
        .replace('{{BRAND}}', brand.displayName)
        .replace('{{CATEGORY}}', brand.category);
      
      return `<strong>${trademark}</strong>`;
    }).join(' • ');
  }

  generateTrademarkNotices(brands, complianceRules) {
    const notices = brands.map(brand => {
      return `${brand.displayName}® is a registered trademark of ${brand.entityName}.`;
    });

    return notices.join(' ');
  }

  generateAdditionalDisclaimers(brands, complianceRules) {
    const disclaimers = brands.map(brand => {
      const categoryDisclaimer = complianceRules.additionalDisclaimers[brand.category];
      if (categoryDisclaimer) {
        return `${brand.displayName}: ${categoryDisclaimer}`;
      }
      return null;
    }).filter(Boolean);

    return disclaimers.length > 0 ? disclaimers.join(' ') : '';
  }

  generateHashtags(brands) {
    const hashtags = brands.flatMap(brand => {
      const brandTag = '#' + brand.displayName.replace(/[^a-zA-Z0-9]/g, '');
      const categoryTag = '#' + brand.category.replace(/[^a-zA-Z0-9]/g, '');
      return [brandTag, categoryTag];
    });

    // Add common hashtags
    hashtags.push('#BrownForman', '#PremiumSpirits', '#DrinkResponsibly');
    
    return hashtags.slice(0, 10).join(' '); // Limit to 10 hashtags
  }

  generateCorporateMessage(brands) {
    return `Brown-Forman is proud to craft and share these exceptional spirits brands that bring people together and create memorable experiences.`;
  }

  shortenMessage(message) {
    if (message.length <= 50) return message;
    
    // Common shortenings for different languages
    const shortenings = {
      'Please drink responsibly.': 'Drink responsibly.',
      'À consommer avec modération.': 'Avec modération.',
      'Bitte trinken Sie verantwortungsvoll.': 'Verantwortungsvoll trinken.',
      'Please drink responsibly. For more information visit drinkaware.co.uk': 'Drink responsibly. drinkaware.co.uk'
    };

    return shortenings[message] || message.split('.')[0] + '.';
  }

  /**
   * Get available templates
   */
  getAvailableTemplates() {
    return Object.keys(this.templates).map(assetType => ({
      assetType,
      structure: this.templates[assetType].structure,
      maxLength: this.templates[assetType].maxLength,
      requirements: this.templates[assetType].requirements
    }));
  }

  /**
   * Get compliance rules for a country
   */
  getComplianceRules(countryCode) {
    return this.complianceRules[countryCode] || this.complianceRules['DEFAULT'];
  }

  /**
   * Preview template structure
   */
  previewTemplate(assetType) {
    const template = this.templates[assetType];
    if (!template) {
      return { error: 'Template not found' };
    }

    return {
      structure: template.structure,
      template: template.template,
      requirements: template.requirements,
      maxLength: template.maxLength
    };
  }
}

// Create and export default instance
const templateService = new TemplateService();
export default templateService;
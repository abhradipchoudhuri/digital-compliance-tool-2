class ValidationService {
    /**
     * Validate copy generation parameters
     */
    validateGenerationParams(params) {
      const errors = [];
  
      // Required fields
      if (!params.assetType) {
        errors.push('Asset type is required');
      }
  
      if (!params.countryCode) {
        errors.push('Country selection is required');
      }
  
      if (!params.brandIds || !Array.isArray(params.brandIds) || params.brandIds.length === 0) {
        errors.push('At least one brand must be selected');
      }
  
      // Asset type validation
      if (params.assetType && !this.isValidAssetType(params.assetType)) {
        errors.push('Invalid asset type selected');
      }
  
      // Country code validation
      if (params.countryCode && !this.isValidCountryCode(params.countryCode)) {
        errors.push('Invalid country code');
      }
  
      // Brand ID validation
      if (params.brandIds && Array.isArray(params.brandIds)) {
        for (const brandId of params.brandIds) {
          if (!this.isValidBrandId(brandId)) {
            errors.push(`Invalid brand ID: ${brandId}`);
          }
        }
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    }
  
    /**
     * Validate asset type
     */
    isValidAssetType(assetType) {
      // Check if it's a non-empty string
      return typeof assetType === 'string' && assetType.trim().length > 0;
    }
  
    /**
     * Validate country code
     */
    isValidCountryCode(countryCode) {
      // Should be 2-letter code or full country name
      return typeof countryCode === 'string' && countryCode.trim().length >= 2;
    }
  
    /**
     * Validate brand ID
     */
    isValidBrandId(brandId) {
      // Check if it's a non-empty string
      return typeof brandId === 'string' && brandId.trim().length > 0;
    }
  
    /**
     * Sanitize HTML content
     */
    sanitizeHtml(html) {
      if (typeof html !== 'string') return '';
      
      // Basic HTML sanitization - remove script tags and dangerous attributes
      return html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+="[^"]*"/gi, '')
        .replace(/on\w+='[^']*'/gi, '');
    }
  
    /**
     * Validate search query
     */
    validateSearchQuery(query) {
      if (typeof query !== 'string') return false;
      
      // Must be between 1 and 100 characters
      return query.trim().length >= 1 && query.trim().length <= 100;
    }
  
    /**
     * Validate email format (for future use)
     */
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  }
  
  const validationService = new ValidationService();
  export default validationService;
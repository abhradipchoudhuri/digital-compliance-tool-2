// src/renderer/services/validationService.js
// Validation Service - Validates templates, copy length, and placeholder syntax

class ValidationService {
  /**
   * Validate template syntax and placeholders
   * Checks for balanced braces and empty placeholders
   * @param {string} template - Template string to validate
   * @returns {Object} Validation result with isValid flag and errors array
   */
  validateTemplateParams(template) {
    const errors = [];
    
    if (typeof template !== 'string') {
      errors.push('Template must be a string');
      return { isValid: false, errors };
    }

    // Check for balanced braces
    const openBraces = (template.match(/{/g) || []).length;
    const closeBraces = (template.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      errors.push('Template has unbalanced braces');
    }

    // Check for empty placeholders
    if (template.includes('{}')) {
      errors.push('Template contains empty placeholders');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate copy length against constraints
   * @param {string} text - Text to validate
   * @param {number|null} maxLength - Maximum allowed length (null for no limit)
   * @returns {Object} Validation result with length information
   */
  validateCopyLength(text, maxLength = null) {
    if (typeof text !== 'string') {
      return { isValid: false, error: 'Text must be a string' };
    }

    if (maxLength && text.length > maxLength) {
      return { 
        isValid: false, 
        error: `Text exceeds maximum length of ${maxLength} characters (current: ${text.length})`,
        currentLength: text.length,
        maxLength
      };
    }

    return { 
      isValid: true,
      currentLength: text.length,
      maxLength
    };
  }

  /**
   * Validate placeholder variable syntax
   * Checks for valid placeholder format with uppercase letters and underscores only
   * @param {string} template - Template string to validate
   * @returns {boolean} True if all placeholders have valid syntax
   */
  validatePlaceholderSyntax(template) {
    if (typeof template !== 'string') return false;
    
    // Check for valid placeholder format {VARIABLE_NAME}
    const invalidPlaceholders = template.match(/{[^A-Z_}]+}/g);
    return !invalidPlaceholders;
  }
}

const validationService = new ValidationService();
export default validationService;
// src/renderer/hooks/useTemplateEngine.js
// React hook for managing template engine and copy generation workflow

import { useState, useCallback, useRef } from 'react';
import templateService from '@services/templateService';
import validationService from '@services/validationService';

export const useTemplateEngine = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const abortControllerRef = useRef(null);

  /**
   * Generate legal copy with provided parameters
   */
  const generateCopy = useCallback(async (params) => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log('useTemplateEngine: Starting copy generation', params);

      abortControllerRef.current = new AbortController();

      // Validate parameters
      const validation = validationService.validateGenerationParams(params);
      if (!validation.isValid) {
        throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
      }

      // Simulate server processing delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if generation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Copy generation was cancelled');
      }

      // Generate copy using template service
      const result = await templateService.generateCopy(params);

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate copy');
      }

      // Add to history
      const historyEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        params: { ...params },
        result: result.result,
        metadata: {
          ...result.result.metadata,
          generationTime: new Date().toISOString()
        }
      };

      setHistory(prev => [historyEntry, ...prev.slice(0, 49)]);
      setGeneratedCopy(result.result);

      console.log('useTemplateEngine: Copy generated successfully');
      return result.result;

    } catch (err) {
      console.error('useTemplateEngine: Error generating copy:', err);
      setError(err.message);
      return null;
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Cancel ongoing generation
   */
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      setError('Copy generation was cancelled');
    }
  }, []);

  /**
   * Clear current results and error
   */
  const clearResults = useCallback(() => {
    setGeneratedCopy(null);
    setError(null);
  }, []);

  /**
   * Regenerate copy using parameters from history
   */
  const regenerateCopy = useCallback(async (historyId) => {
    const historyEntry = history.find(entry => entry.id === historyId);
    if (!historyEntry) {
      setError('History entry not found');
      return null;
    }

    return await generateCopy(historyEntry.params);
  }, [history, generateCopy]);

  /**
   * Get copy generation statistics
   */
  const getStats = useCallback(() => {
    return {
      totalGenerations: history.length,
      lastGenerated: history.length > 0 ? history[0].timestamp : null,
      averageGenerationTime: history.length > 0 
        ? history.reduce((acc, entry) => acc + (entry.metadata.generationTime ? 1 : 0), 0) / history.length
        : 0,
      mostUsedAssetType: getMostUsedValue('assetType'),
      mostUsedCountry: getMostUsedValue('countryCode'),
      mostUsedBrand: getMostUsedBrand()
    };
  }, [history]);

  const getMostUsedValue = (paramKey) => {
    if (history.length === 0) return null;

    const counts = {};
    history.forEach(entry => {
      const value = entry.params[paramKey];
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, null);
  };

  const getMostUsedBrand = () => {
    if (history.length === 0) return null;

    const counts = {};
    history.forEach(entry => {
      if (entry.params.brandIds && Array.isArray(entry.params.brandIds)) {
        entry.params.brandIds.forEach(brandId => {
          counts[brandId] = (counts[brandId] || 0) + 1;
        });
      }
    });

    return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, null);
  };

  /**
   * Export history as JSON file
   */
  const exportHistory = useCallback(() => {
    const exportData = {
      exported: new Date().toISOString(),
      totalEntries: history.length,
      history: history.map(entry => ({
        ...entry,
        result: {
          ...entry.result,
          html: entry.result.html?.substring(0, 500) + '...',
          plainText: entry.result.plainText?.substring(0, 500) + '...'
        }
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `copy-generation-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [history]);

  /**
   * Clear all history entries
   */
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  /**
   * Remove specific history entry by ID
   */
  const removeHistoryEntry = useCallback((historyId) => {
    setHistory(prev => prev.filter(entry => entry.id !== historyId));
  }, []);

  /**
   * Copy text to clipboard with format support
   */
  const copyToClipboard = useCallback(async (text, format = 'plain') => {
    try {
      if (format === 'html') {
        const clipboardItem = new ClipboardItem({
          'text/html': new Blob([text], { type: 'text/html' }),
          'text/plain': new Blob([text.replace(/<[^>]*>/g, '')], { type: 'text/plain' })
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        await navigator.clipboard.writeText(text);
      }
      return { success: true };
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return { success: false, error: err.message };
    }
  }, []);

  /**
   * Get template preview for asset type
   */
  const getTemplatePreview = useCallback((assetType) => {
    try {
      return templateService.previewTemplate(assetType);
    } catch (err) {
      console.error('Error getting template preview:', err);
      return { error: err.message };
    }
  }, []);

  /**
   * Get all available templates
   */
  const getAvailableTemplates = useCallback(() => {
    try {
      return templateService.getAvailableTemplates();
    } catch (err) {
      console.error('Error getting available templates:', err);
      return [];
    }
  }, []);

  /**
   * Get compliance rules for specific country
   */
  const getComplianceRules = useCallback((countryCode) => {
    try {
      return templateService.getComplianceRules(countryCode);
    } catch (err) {
      console.error('Error getting compliance rules:', err);
      return null;
    }
  }, []);

  /**
   * Download generated copy as text file
   */
  const downloadCopy = useCallback((copy, filename) => {
    if (!copy) {
      setError('No copy available to download');
      return false;
    }

    try {
      const blob = new Blob([copy.plainText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `legal-copy-${Date.now()}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      setError(`Failed to download copy: ${err.message}`);
      return false;
    }
  }, []);

  return {
    isGenerating,
    generatedCopy,
    error,
    history,
    generateCopy,
    cancelGeneration,
    clearResults,
    regenerateCopy,
    clearHistory,
    removeHistoryEntry,
    exportHistory,
    copyToClipboard,
    downloadCopy,
    getStats,
    getTemplatePreview,
    getAvailableTemplates,
    getComplianceRules
  };
};

/**
 * Simplified hook for basic copy generation
 */
export const useSimpleCopyGenerator = () => {
  const {
    isGenerating,
    generatedCopy,
    error,
    generateCopy,
    clearResults,
    copyToClipboard,
    downloadCopy
  } = useTemplateEngine();

  const generate = useCallback(async (assetType, countryCode, brandIds) => {
    const params = {
      assetType,
      countryCode,
      brandIds: Array.isArray(brandIds) ? brandIds : [brandIds]
    };

    return await generateCopy(params);
  }, [generateCopy]);

  return {
    isGenerating,
    generatedCopy,
    error,
    generate,
    clearResults,
    copyToClipboard,
    downloadCopy
  };
};

/**
 * Hook for template management operations
 */
export const useTemplateManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const availableTemplates = templateService.getAvailableTemplates();
      setTemplates(availableTemplates);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTemplate = useCallback((assetType) => {
    return templates.find(t => t.assetType === assetType);
  }, [templates]);

  const validateTemplate = useCallback((assetType, content) => {
    const template = getTemplate(assetType);
    if (!template) return { valid: false, error: 'Template not found' };

    if (content.length > template.maxLength) {
      return { 
        valid: false, 
        error: `Content exceeds maximum length of ${template.maxLength} characters` 
      };
    }

    return { valid: true };
  }, [getTemplate]);

  return {
    templates,
    loading,
    loadTemplates,
    getTemplate,
    validateTemplate
  };
};

export default useTemplateEngine;
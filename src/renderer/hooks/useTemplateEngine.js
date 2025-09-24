// src/renderer/hooks/useTemplateEngine.js
// React hook for Template Engine integration

import { useState, useCallback, useRef, useEffect } from 'react';
import templateService from '../services/templateService.js';

export const useTemplateEngine = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState(0);
  
  // Use ref to track the latest request to handle race conditions
  const latestRequestRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    setHistory(templateService.getHistory());
  }, []);

  const generateCopy = useCallback(async (params) => {
    // Create a unique request ID to handle race conditions
    const requestId = Date.now();
    latestRequestRef.current = requestId;

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setGeneratedCopy(null);

    try {
      console.log('useTemplateEngine: Starting generation with params:', params);
      
      // Simulate progress for user experience
      setProgress(25);
      
      // Call template service
      const result = await templateService.generateCopy(params);
      
      // Check if this is still the latest request
      if (latestRequestRef.current !== requestId) {
        console.log('useTemplateEngine: Request cancelled - newer request in progress');
        return;
      }
      
      setProgress(75);
      
      if (result.success) {
        setGeneratedCopy(result);
        setHistory(templateService.getHistory());
        setProgress(100);
        console.log('useTemplateEngine: Generation successful');
      } else {
        throw new Error(result.error || 'Copy generation failed');
      }
      
    } catch (err) {
      // Only set error if this is still the latest request
      if (latestRequestRef.current === requestId) {
        console.error('useTemplateEngine: Generation failed:', err);
        setError(err.message || 'An unexpected error occurred');
        setProgress(0);
      }
    } finally {
      // Only update loading state if this is still the latest request
      if (latestRequestRef.current === requestId) {
        setIsGenerating(false);
        // Reset progress after a delay
        setTimeout(() => setProgress(0), 1000);
      }
    }
  }, []);

  const regenerateCopy = useCallback(async (historyId) => {
    const historyItem = templateService.getHistoryById(historyId);
    if (!historyItem || !historyItem.metadata) {
      setError('Cannot regenerate: History item not found');
      return;
    }

    // Extract original parameters from history metadata
    const params = {
      assetType: historyItem.metadata.assetType,
      countryCode: historyItem.metadata.country,
      brandIds: historyItem.copies.map(copy => copy.brandId)
    };

    await generateCopy(params);
  }, [generateCopy]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearResults = useCallback(() => {
    setGeneratedCopy(null);
    setError(null);
    setProgress(0);
  }, []);

  const clearHistory = useCallback(() => {
    templateService.clearHistory();
    setHistory([]);
  }, []);

  const exportHistory = useCallback(() => {
    return templateService.exportHistory();
  }, []);

  const copyToClipboard = useCallback(async (text, format = 'text') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return { success: true };
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return { success: true };
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const getStats = useCallback(() => {
    const allCopies = history.flatMap(item => item.copies || []);
    const totalGenerations = history.length;
    const totalCopies = allCopies.length;
    const averageLength = totalCopies > 0 
      ? Math.round(allCopies.reduce((sum, copy) => sum + (copy.characterCount || 0), 0) / totalCopies)
      : 0;

    const assetTypes = [...new Set(history.map(item => item.metadata?.assetType).filter(Boolean))];
    const countries = [...new Set(history.map(item => item.metadata?.country).filter(Boolean))];

    return {
      totalGenerations,
      totalCopies,
      averageLength,
      assetTypes,
      countries,
      lastGeneration: history[0]?.timestamp || null
    };
  }, [history]);

  const cancelGeneration = useCallback(() => {
    latestRequestRef.current = null;
    setIsGenerating(false);
    setProgress(0);
  }, []);

  return {
    // Core functionality
    generateCopy,
    regenerateCopy,
    
    // State
    isGenerating,
    generatedCopy,
    error,
    history,
    progress,
    
    // Utility functions
    clearError,
    clearResults,
    clearHistory,
    exportHistory,
    copyToClipboard,
    getStats,
    cancelGeneration,
    
    // Template service utilities
    getAvailableVariables: templateService.getAvailableVariables.bind(templateService),
    validateTemplate: templateService.validateTemplate.bind(templateService)
  };
};

export default useTemplateEngine;
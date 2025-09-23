import { useState, useEffect, useCallback } from 'react';
import excelService from '@services/excelService';

export const useDataLoader = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('useDataLoader: Loading Excel data...');
      const loadedData = await excelService.loadData();
      
      setData(loadedData);
      console.log('useDataLoader: Data loaded successfully');
    } catch (err) {
      console.error('useDataLoader: Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const reloadData = useCallback(async () => {
    try {
      setError(null);
      await excelService.reload();
      setData(excelService.getRawData());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    loading,
    error,
    data,
    reloadData,
    excelService
  };
};

// Hook for accessing specific data types
export const useExcelData = () => {
  const { loading, error, data, reloadData } = useDataLoader();

  const brands = data ? excelService.getBrands() : [];
  const assetTypes = data ? excelService.getAssetTypes() : [];
  const countries = data ? excelService.getCountries() : [];
  const helpText = data ? excelService.getHelpText() : '';

  return {
    loading,
    error,
    brands,
    assetTypes,
    countries,
    helpText,
    reloadData,
    
    // Utility functions
    getBrandById: (id) => excelService.getBrandById(id),
    getCountryById: (id) => excelService.getCountryById(id),
    getAssetTypeByName: (name) => excelService.getAssetTypeByName(name),
    searchBrands: (query) => excelService.searchBrands(query),
    getTemplateStructure: (assetType) => excelService.getTemplateStructure(assetType),
    getLanguageVariables: (language) => excelService.getLanguageVariables(language),
    getTrademarkStructure: (type) => excelService.getTrademarkStructure(type)
  };
};
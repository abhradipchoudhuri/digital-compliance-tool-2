// src/renderer/services/excelService.js
// Basic Excel Service that works with enhanced index.js

export class ExcelService {
  constructor() {
    this.isLoaded = false;
    this.data = null;
  }

  async loadData() {
    try {
      console.log('ExcelService: Loading data via Electron API...');
      
      // Use Electron IPC to load Excel file
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const result = await window.electronAPI.loadExcelData();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // For now, create basic sheet structure
      // This will be enhanced when we reach Artifact 5 with full Excel parsing
      this.data = {
        'Trademark Config': [],
        'CountryLanguage': [], 
        'Trademark Language': [],
        'Trademark Structure': [],
        'Language Dependent Variables': [],
        'Overall Structure': [],
        'Help Text': []
      };
      
      this.isLoaded = true;

      console.log('ExcelService: Basic data structure created');

      return {
        success: true,
        data: this.data
      };
    } catch (error) {
      console.error('ExcelService: Error loading data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  isDataLoaded() {
    return this.isLoaded;
  }

  getData() {
    return this.data;
  }

  // Basic helper methods that enhanced index.js expects
  getBrands() {
    return [];
  }

  getCountries() {
    return [];
  }

  getAssetTypes() {
    return [];
  }

  // Additional methods expected by useDataLoader hook
  getBrandById(id) {
    return null;
  }

  getCountryById(id) {
    return null;
  }

  getAssetTypeByName(name) {
    return null;
  }

  searchBrands(query) {
    return [];
  }

  getTemplateStructure(assetType) {
    return null;
  }

  getLanguageVariables(language) {
    return null;
  }

  getTrademarkStructure(type) {
    return null;
  }

  getHelpText() {
    return '';
  }

  getRawData() {
    return this.data;
  }

  async reload() {
    this.isLoaded = false;
    this.data = null;
    return await this.loadData();
  }
}

// Create and export default instance - this fixes the import issue
const excelService = new ExcelService();
export default excelService;
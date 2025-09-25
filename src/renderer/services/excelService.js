// src/renderer/services/excelService.js
// Enhanced Excel Service that properly loads real Excel data from Electron

export class ExcelService {
  constructor() {
    this.isLoaded = false;
    this.data = null;
    this.usingMockData = false;
  }

  async loadData() {
    try {
      console.log('ExcelService: Attempting to load Excel data...');
      
      // Try to use Electron IPC to load real Excel file
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.loadExcelData();
          
          if (result.success && result.parsed && result.data) {
            console.log('✅ ExcelService: Real Excel data loaded successfully!');
            console.log('📊 Sheets loaded:', result.sheets);
            
            // Convert array-based data to object-based format for easier access
            this.data = this.processExcelData(result.data);
            this.isLoaded = true;
            this.usingMockData = false;
            
            return {
              success: true,
              data: this.data,
              source: 'excel-file'
            };
          } else {
            throw new Error(result.error || 'Failed to parse Excel data');
          }
        } catch (electronError) {
          console.warn('⚠️ ExcelService: Electron API failed:', electronError);
          throw electronError;
        }
      } else {
        throw new Error('Electron API not available');
      }
    } catch (error) {
      console.warn('⚠️ ExcelService: Using mock data due to:', error.message);
      
      // Fallback to mock data
      this.data = this.getMockData();
      this.isLoaded = true;
      this.usingMockData = true;
      
      return {
        success: true,
        data: this.data,
        source: 'mock-data',
        warning: error.message
      };
    }
  }

  processExcelData(rawData) {
    // Convert array-based Excel data to object format
    const processed = {};
    
    Object.keys(rawData).forEach(sheetName => {
      const rows = rawData[sheetName];
      if (rows.length === 0) {
        processed[sheetName] = [];
        return;
      }
      
      // First row is headers
      const headers = rows[0];
      const dataRows = rows.slice(1);
      
      // Convert to array of objects
      processed[sheetName] = dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    });
    
    console.log('📋 Processed Excel data structure:', Object.keys(processed));
    return processed;
  }

  getMockData() {
    // Mock data as fallback
    return {
      'Trademark Config': [
        { Type: 'Brand', ID: 'chambord', Name: 'Chambord', Entity: 'Brown-Forman France' },
        { Type: 'Brand', ID: 'jack-daniels', Name: "Jack Daniel's", Entity: 'Jack Daniel Distillery' },
        { Type: 'Asset Type', ID: 'facebook-post', Name: 'Facebook Post', Description: 'Social media' },
        { Type: 'Asset Type', ID: 'website-copy', Name: 'Website Copy', Description: 'Web content' }
      ],
      'CountryLanguage': [
        { CountryCode: 'US', CountryName: 'United States', Language: 'English' },
        { CountryCode: 'GB', CountryName: 'United Kingdom', Language: 'English' }
      ],
      'Trademark Language': [],
      'Trademark Structure': [],
      'Language Dependent Variables': [],
      'Overall Structure': [],
      'Help Text': []
    };
  }

  isDataLoaded() {
    return this.isLoaded;
  }

  getData() {
    return this.data;
  }

  getRawData() {
    return this.data;
  }

  getBrands() {
    if (!this.data || !this.data['Trademark Config']) return [];
    
    return this.data['Trademark Config']
      .filter(row => row.Type === 'Brand')
      .map(row => ({
        id: row.ID,
        name: row.Name,
        entity: row.Entity,
        category: row.Category || 'Spirits'
      }));
  }

  getCountries() {
    if (!this.data || !this.data['CountryLanguage']) return [];
    
    const unique = new Map();
    this.data['CountryLanguage'].forEach(row => {
      if (!unique.has(row.CountryCode)) {
        unique.set(row.CountryCode, {
          code: row.CountryCode,
          name: row.CountryName,
          language: row.Language
        });
      }
    });
    
    return Array.from(unique.values());
  }

  getAssetTypes() {
    if (!this.data || !this.data['Trademark Config']) return [];
    
    return this.data['Trademark Config']
      .filter(row => row.Type === 'Asset Type')
      .map(row => ({
        id: row.ID,
        name: row.Name,
        description: row.Description || ''
      }));
  }

  getStats() {
    return {
      isLoaded: this.isLoaded,
      usingMockData: this.usingMockData,
      totalSheets: this.data ? Object.keys(this.data).length : 0,
      totalBrands: this.getBrands().length,
      totalCountries: this.getCountries().length,
      totalAssetTypes: this.getAssetTypes().length
    };
  }

  async reload() {
    this.isLoaded = false;
    this.data = null;
    this.usingMockData = false;
    return await this.loadData();
  }
}

// Create and export default instance
const excelService = new ExcelService();
export default excelService;
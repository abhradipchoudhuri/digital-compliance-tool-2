import * as XLSX from 'xlsx';

class ExcelService {
  constructor() {
    this.workbook = null;
    this.data = {
      brands: [],
      assetTypes: [],
      countries: [],
      templates: {},
      languages: {},
      structures: {},
      helpText: ''
    };
    this.isLoaded = false;
  }

  /**
   * Load and parse Excel data
   */
  async loadData() {
    try {
      console.log('ExcelService: Loading data...');
      
      // Request data from main process
      const result = await window.electronAPI.loadExcelData();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Convert array back to buffer
      const buffer = new Uint8Array(result.data);
      
      // Parse workbook
      this.workbook = XLSX.read(buffer, {
        type: 'array',
        cellStyles: true,
        cellFormulas: true,
        cellDates: true,
        cellNF: true,
        sheetStubs: true
      });

      console.log('ExcelService: Workbook loaded, sheets:', this.workbook.SheetNames);

      // Parse all sheets
      await this.parseAllSheets();
      
      this.isLoaded = true;
      console.log('ExcelService: Data loaded successfully');
      
      return this.data;
    } catch (error) {
      console.error('ExcelService: Error loading data:', error);
      throw new Error(`Failed to load Excel data: ${error.message}`);
    }
  }

  /**
   * Parse all sheets into structured data
   */
  async parseAllSheets() {
    // Parse each sheet in order
    await this.parseTrademarkConfig();
    await this.parseCountryLanguage();
    await this.parseTrademarkLanguage();
    await this.parseTrademarkStructure();
    await this.parseLanguageDependentVariables();
    await this.parseOverallStructure();
    await this.parseHelpText();
    
    console.log('ExcelService: All sheets parsed');
  }

  /**
   * Parse Trademark Config sheet - Brands and Asset Types
   */
  async parseTrademarkConfig() {
    const sheet = this.workbook.Sheets['Trademark Config'];
    if (!sheet) return;

    const data = XLSX.utils.sheet_to_json(sheet, { 
      header: 1,
      defval: '',
      blankrows: false 
    });

    if (data.length < 2) return;

    const headers = data[0];
    const brandHeaders = ['Display Names', 'Brand Names', 'Entity Names', 'Entity is Brand', 'Third Party', 'Email Opt-in Display', 'Portfolio?'];
    const assetHeaders = ['Asset Type', 'Trademark Type', 'Forward Notice Type', 'Asset Type Instructions'];

    // Parse brands (columns A-G)
    this.data.brands = [];
    const brandMap = new Map();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // Skip empty display name rows

      const brandKey = row[0]; // Display Names
      
      if (!brandMap.has(brandKey)) {
        const brand = {
          id: this.generateId(brandKey),
          displayName: row[0] || '',
          brandName: row[1] || '',
          entityName: row[2] || '',
          entityIsBrand: row[3] || false,
          thirdParty: row[4] || false,
          emailOptInDisplay: row[5] || '',
          isPortfolio: row[6] || false,
          assetTypes: []
        };
        
        brandMap.set(brandKey, brand);
        this.data.brands.push(brand);
      }

      // Add asset type to brand if present
      if (row[8]) { // Asset Type column
        const assetType = {
          name: row[8],
          trademarkType: row[9] || '',
          forwardNoticeType: row[10] || '',
          instructions: row[11] || ''
        };
        
        brandMap.get(brandKey).assetTypes.push(assetType);
      }
    }

    // Parse unique asset types
    this.data.assetTypes = [];
    const assetTypeSet = new Set();
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (row[8] && !assetTypeSet.has(row[8])) {
        assetTypeSet.add(row[8]);
        this.data.assetTypes.push({
          id: this.generateId(row[8]),
          name: row[8],
          trademarkType: row[9] || '',
          forwardNoticeType: row[10] || '',
          instructions: row[11] || ''
        });
      }
    }

    console.log(`ExcelService: Parsed ${this.data.brands.length} brands, ${this.data.assetTypes.length} asset types`);
  }

  /**
   * Parse CountryLanguage sheet
   */
  async parseCountryLanguage() {
    const sheet = this.workbook.Sheets['CountryLanguage'];
    if (!sheet) return;

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (data.length < 2) return;

    this.data.countries = [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[1]) continue; // Skip rows without country name

      this.data.countries.push({
        id: this.generateId(row[1]),
        abbreviation: row[0] || '',
        name: row[1] || '',
        language: row[2] || 'English (Default)',
        countrySpecific: row[3] || '',
        notes: row[4] || '',
        source: row[5] || ''
      });
    }

    console.log(`ExcelService: Parsed ${this.data.countries.length} countries`);
  }

  /**
   * Parse Trademark Language sheet
   */
  async parseTrademarkLanguage() {
    const sheet = this.workbook.Sheets['Trademark Language'];
    if (!sheet) return;

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (data.length < 2) return;

    this.data.languages = {};
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;

      const language = row[0];
      const plurality = row[1];
      const key = `${language}_${plurality}`;

      this.data.languages[key] = {
        language: language,
        singularPlural: plurality,
        preBrand: row[2] || '',
        conjunction: row[3] || '',
        registeredLanguage: row[4] || '',
        reserveLanguage: row[5] || '',
        thirdPartyRights: row[6] || ''
      };
    }

    console.log(`ExcelService: Parsed ${Object.keys(this.data.languages).length} language variations`);
  }

  /**
   * Parse Trademark Structure sheet
   */
  async parseTrademarkStructure() {
    const sheet = this.workbook.Sheets['Trademark Structure'];
    if (!sheet) return;

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (data.length < 2) return;

    this.data.structures = {};
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;

      this.data.structures[row[0]] = {
        type: row[0],
        structure: row[1] || ''
      };
    }

    console.log(`ExcelService: Parsed ${Object.keys(this.data.structures).length} trademark structures`);
  }

  /**
   * Parse Language Dependent Variables sheet
   */
  async parseLanguageDependentVariables() {
    const sheet = this.workbook.Sheets['Language Dependent Variables'];
    if (!sheet) return;

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (data.length < 2) return;

    this.data.languageVariables = {};
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;

      this.data.languageVariables[row[0]] = {
        language: row[0],
        responsibilityLanguage: row[1] || '',
        allOtherTrademarks: row[2] || '',
        forwardNoticeFull: row[3] || '',
        forwardNoticeTightened: row[4] || '',
        responsibilitySite: row[5] || '',
        emailHeader: row[6] || '',
        emailSentByStatement: row[7] || ''
      };
    }

    console.log(`ExcelService: Parsed ${Object.keys(this.data.languageVariables).length} language variables`);
  }

  /**
   * Parse Overall Structure sheet
   */
  async parseOverallStructure() {
    const sheet = this.workbook.Sheets['Overall Structure'];
    if (!sheet) return;

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (data.length < 2) return;

    this.data.templates = {};
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;

      this.data.templates[row[0]] = {
        assetType: row[0],
        structure: row[1] || '',
        notes: row[2] || ''
      };
    }

    console.log(`ExcelService: Parsed ${Object.keys(this.data.templates).length} template structures`);
  }

  /**
   * Parse Help Text sheet
   */
  async parseHelpText() {
    const sheet = this.workbook.Sheets['Help Text'];
    if (!sheet) return;

    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (data.length >= 2 && data[1][0]) {
      this.data.helpText = data[1][0];
    }

    console.log('ExcelService: Parsed help text');
  }

  /**
   * Get brands for selection
   */
  getBrands() {
    return this.data.brands.map(brand => ({
      id: brand.id,
      displayName: brand.displayName,
      brandName: brand.brandName,
      entityName: brand.entityName,
      isPortfolio: brand.isPortfolio
    }));
  }

  /**
   * Get asset types for selection
   */
  getAssetTypes() {
    return this.data.assetTypes.map(asset => ({
      id: asset.id,
      name: asset.name,
      instructions: asset.instructions
    }));
  }

  /**
   * Get countries for selection
   */
  getCountries() {
    return this.data.countries.map(country => ({
      id: country.id,
      name: country.name,
      abbreviation: country.abbreviation,
      language: country.language,
      countrySpecific: country.countrySpecific
    }));
  }

  /**
   * Get template structure for asset type
   */
  getTemplateStructure(assetType) {
    return this.data.templates[assetType]?.structure || '';
  }

  /**
   * Get language variables for country/language
   */
  getLanguageVariables(language) {
    return this.data.languageVariables[language] || {};
  }

  /**
   * Get trademark structure for type
   */
  getTrademarkStructure(type) {
    return this.data.structures[type]?.structure || '';
  }

  /**
   * Get help text
   */
  getHelpText() {
    return this.data.helpText;
  }

  /**
   * Generate unique ID from string
   */
  generateId(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Get brand by ID
   */
  getBrandById(id) {
    return this.data.brands.find(brand => brand.id === id);
  }

  /**
   * Get country by ID
   */
  getCountryById(id) {
    return this.data.countries.find(country => country.id === id);
  }

  /**
   * Get asset type by name
   */
  getAssetTypeByName(name) {
    return this.data.assetTypes.find(asset => asset.name === name);
  }

  /**
   * Search brands by name
   */
  searchBrands(query) {
    const lowerQuery = query.toLowerCase();
    return this.data.brands.filter(brand => 
      brand.displayName.toLowerCase().includes(lowerQuery) ||
      brand.brandName.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get raw data for debugging
   */
  getRawData() {
    return this.data;
  }

  /**
   * Check if data is loaded
   */
  isDataLoaded() {
    return this.isLoaded;
  }

  /**
   * Reload data
   */
  async reload() {
    this.isLoaded = false;
    this.data = {
      brands: [],
      assetTypes: [],
      countries: [],
      templates: {},
      languages: {},
      structures: {},
      helpText: ''
    };
    
    return await this.loadData();
  }
}

// Create singleton instance
const excelService = new ExcelService();

export default excelService;
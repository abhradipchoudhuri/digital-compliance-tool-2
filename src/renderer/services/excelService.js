// src/renderer/services/excelService.js
// Enhanced Excel Service matching the actual Brown-Forman Digital Compliance Tool

export class ExcelService {
  constructor() {
    this.isLoaded = false;
    this.data = null;
    this.cache = new Map();
  }

  async loadData() {
    try {
      console.log('ExcelService: Loading data via Electron API...');
      
      if (!window.electronAPI) {
        throw new Error('Electron API not available');
      }

      const result = await window.electronAPI.loadExcelData();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      // Structure matching the actual Brown-Forman tool data
      this.data = result.data || {
        'Trademark Config': [
          // Brand definitions matching screenshot
          { Brand: 'Antiguo de Herradura', Entity: 'Brown-Forman', Category: 'Tequila', Active: true },
          { Brand: 'Botucal', Entity: 'Brown-Forman', Category: 'Rum', Active: true },
          { Brand: 'Diplomatico', Entity: 'Brown-Forman', Category: 'Rum', Active: true },
          { Brand: 'Gentleman Jack', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Herradura Tequila', Entity: 'Brown-Forman', Category: 'Tequila', Active: true },
          { Brand: 'Jack Apple Fizz (RTD)', Entity: 'Brown-Forman', Category: 'RTD', Active: true },
          { Brand: 'Jack Daniels FOB (multi-brand)', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Daniels Sinatra Select', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Daniels Tennessee Fire', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Daniels Winter Jack', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Slane Irish Whiskey', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'B-F Portfolio (multi-brand)', Entity: 'Brown-Forman', Category: 'Multi-Brand', Active: true },
          { Brand: 'Chambord', Entity: 'Brown-Forman', Category: 'Liqueur', Active: true },
          { Brand: 'el Jimador New Mix', Entity: 'Brown-Forman', Category: 'RTD', Active: true },
          { Brand: 'Gentleman Jack Whiskey Sour (RTD)', Entity: 'Brown-Forman', Category: 'RTD', Active: true },
          { Brand: 'Jack & Cola / Ginger / Berry (RTD)', Entity: 'Brown-Forman', Category: 'RTD', Active: true },
          { Brand: 'Jack Daniels Bonded Series', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Daniels Lynchburg Lemonade (RTD)', Entity: 'Brown-Forman', Category: 'RTD', Active: true },
          { Brand: 'Jack Daniels Single Barrel Series', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Daniels Tennessee Honey', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Honey & Lemonade (RTD)', Entity: 'Brown-Forman', Category: 'RTD', Active: true },
          { Brand: 'The Glendronach', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Cheers to the Host (multi-brand)', Entity: 'Brown-Forman', Category: 'Multi-Brand', Active: true },
          { Brand: 'el Jimador Tequila', Entity: 'Brown-Forman', Category: 'Tequila', Active: true },
          { Brand: 'Gin Mare', Entity: 'Brown-Forman', Category: 'Gin', Active: true },
          { Brand: 'Jack & Seltzer (RTD)', Entity: 'Brown-Forman', Category: 'RTD', Active: true },
          { Brand: 'Jack Daniels Bottled in Bond', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Daniels No. 27 Gold', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Daniels Tennessee Apple', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Daniels Tennessee Rye', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Master Craft Academy (multi-brand)', Entity: 'Brown-Forman', Category: 'Multi-Brand', Active: true },
          { Brand: 'Woodford Reserve', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Benriach', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Coopers Craft', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Fords Gin', Entity: 'Brown-Forman', Category: 'Gin', Active: true },
          { Brand: 'Glenglassaugh', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Apple & Tonic (RTD)', Entity: 'Brown-Forman', Category: 'RTD', Active: true },
          { Brand: 'Jack Daniels Country Cocktails', Entity: 'Brown-Forman', Category: 'RTD', Active: true },
          { Brand: 'Jack Daniels Old No. 7', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Daniels Tennessee Blackberry', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Jack Daniels Triple Mash', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true },
          { Brand: 'Old Forester', Entity: 'Brown-Forman', Category: 'Whiskey', Active: true }
        ],
        
        'CountryLanguage': [
          { Country: 'United States', CountryCode: 'US', Language: 'English', MarketSpecific: 'TTB Mandatory Required', RegionCode: 'NA' },
          { Country: 'Canada', CountryCode: 'CA', Language: 'English', MarketSpecific: 'Health Canada Requirements', RegionCode: 'NA' },
          { Country: 'United Kingdom', CountryCode: 'UK', Language: 'English', MarketSpecific: 'UK Advertising Standards', RegionCode: 'EU' },
          { Country: 'Germany', CountryCode: 'DE', Language: 'German', MarketSpecific: 'German Advertising Law', RegionCode: 'EU' },
          { Country: 'France', CountryCode: 'FR', Language: 'French', MarketSpecific: 'Loi Evin Compliance', RegionCode: 'EU' },
          { Country: 'Australia', CountryCode: 'AU', Language: 'English', MarketSpecific: 'ACCC Guidelines', RegionCode: 'APAC' },
          { Country: 'Japan', CountryCode: 'JP', Language: 'Japanese', MarketSpecific: 'Japanese Liquor Tax Law', RegionCode: 'APAC' },
          { Country: 'Mexico', CountryCode: 'MX', Language: 'Spanish', MarketSpecific: 'COFEPRIS Requirements', RegionCode: 'LATAM' },
          { Country: 'Brazil', CountryCode: 'BR', Language: 'Portuguese', MarketSpecific: 'ANVISA Compliance', RegionCode: 'LATAM' },
          { Country: 'South Africa', CountryCode: 'ZA', Language: 'English', MarketSpecific: 'LCDA Regulations', RegionCode: 'AFRICA' }
        ],

        'Trademark Language': [
          { Country: 'US', RegisteredSymbol: '®', ReserveSymbol: '™', Usage: 'Post-brand name' },
          { Country: 'CA', RegisteredSymbol: '®', ReserveSymbol: '™', Usage: 'Post-brand name' },
          { Country: 'UK', RegisteredSymbol: '®', ReserveSymbol: '™', Usage: 'Post-brand name' },
          { Country: 'DE', RegisteredSymbol: '®', ReserveSymbol: '™', Usage: 'Post-brand name' },
          { Country: 'FR', RegisteredSymbol: '®', ReserveSymbol: '™', Usage: 'Post-brand name' },
          { Country: 'AU', RegisteredSymbol: '®', ReserveSymbol: '™', Usage: 'Post-brand name' },
          { Country: 'JP', RegisteredSymbol: '®', ReserveSymbol: '™', Usage: 'Post-brand name' },
          { Country: 'MX', RegisteredSymbol: '®', ReserveSymbol: '™', Usage: 'Post-brand name' },
          { Country: 'BR', RegisteredSymbol: '®', ReserveSymbol: '™', Usage: 'Post-brand name' },
          { Country: 'ZA', RegisteredSymbol: '®', ReserveSymbol: '™', Usage: 'Post-brand name' }
        ],

        'Asset Types': [
          { AssetType: 'Website', Description: 'Website content and landing pages', RequiresAge: true, CharacterLimit: null },
          { AssetType: 'Social Media', Description: 'Social media posts and content', RequiresAge: true, CharacterLimit: 280 },
          { AssetType: 'Digital Advertisement', Description: 'Digital advertising banners and content', RequiresAge: true, CharacterLimit: 150 },
          { AssetType: 'Email Marketing', Description: 'Email campaigns and newsletters', RequiresAge: true, CharacterLimit: null },
          { AssetType: 'Mobile App', Description: 'Mobile application content', RequiresAge: true, CharacterLimit: 100 },
          { AssetType: 'Video/Audio', Description: 'Video and audio content', RequiresAge: true, CharacterLimit: null },
          { AssetType: 'E-commerce', Description: 'Online retail and product pages', RequiresAge: true, CharacterLimit: null },
          { AssetType: 'Digital Brochure', Description: 'Digital brochures and catalogs', RequiresAge: true, CharacterLimit: null }
        ],

        'Language Dependent Variables': [
          { Country: 'US', ResponsibilityText: 'Please drink responsibly.', AgeVerification: 'You must be 21 or older to enter.', ForwardNotice: 'Please share responsibly.' },
          { Country: 'CA', ResponsibilityText: 'Please drink responsibly.', AgeVerification: 'You must be 19 or older to enter.', ForwardNotice: 'Please share responsibly.' },
          { Country: 'UK', ResponsibilityText: 'Please drink responsibly.', AgeVerification: 'You must be 18 or older to enter.', ForwardNotice: 'Please share responsibly.' },
          { Country: 'DE', ResponsibilityText: 'Bitte trinken Sie verantwortungsvoll.', AgeVerification: 'Sie müssen 18 oder älter sein.', ForwardNotice: 'Bitte verantwortungsvoll teilen.' },
          { Country: 'FR', ResponsibilityText: 'À consommer avec modération.', AgeVerification: 'Vous devez avoir 18 ans ou plus.', ForwardNotice: 'Partagez de manière responsable.' },
          { Country: 'AU', ResponsibilityText: 'Please drink responsibly.', AgeVerification: 'You must be 18 or older to enter.', ForwardNotice: 'Please share responsibly.' },
          { Country: 'JP', ResponsibilityText: '適量飲酒を心がけましょう。', AgeVerification: '20歳以上の方のみご利用いただけます。', ForwardNotice: '責任を持って共有してください。' },
          { Country: 'MX', ResponsibilityText: 'Bebe con moderación.', AgeVerification: 'Debes tener 18 años o más.', ForwardNotice: 'Comparte responsablemente.' },
          { Country: 'BR', ResponsibilityText: 'Beba com moderação.', AgeVerification: 'Você deve ter 18 anos ou mais.', ForwardNotice: 'Compartilhe com responsabilidade.' },
          { Country: 'ZA', ResponsibilityText: 'Please drink responsibly.', AgeVerification: 'You must be 18 or older to enter.', ForwardNotice: 'Please share responsibly.' }
        ],

        'Template Structures': [
          {
            AssetType: 'Website',
            Template: '{BRAND_NAME}{TRADEMARK_SYMBOL}\n\n{AGE_VERIFICATION}\n\n{RESPONSIBILITY_TEXT}\n\n{FORWARD_NOTICE}',
            RequiredElements: ['BRAND_NAME', 'TRADEMARK_SYMBOL', 'AGE_VERIFICATION', 'RESPONSIBILITY_TEXT']
          },
          {
            AssetType: 'Social Media',
            Template: '{BRAND_NAME}{TRADEMARK_SYMBOL} {RESPONSIBILITY_TEXT} {FORWARD_NOTICE}',
            RequiredElements: ['BRAND_NAME', 'TRADEMARK_SYMBOL', 'RESPONSIBILITY_TEXT']
          },
          {
            AssetType: 'Digital Advertisement',
            Template: '{BRAND_NAME}{TRADEMARK_SYMBOL} {RESPONSIBILITY_TEXT}',
            RequiredElements: ['BRAND_NAME', 'TRADEMARK_SYMBOL', 'RESPONSIBILITY_TEXT']
          },
          {
            AssetType: 'Email Marketing',
            Template: '{BRAND_NAME}{TRADEMARK_SYMBOL}\n\n{AGE_VERIFICATION}\n\n{RESPONSIBILITY_TEXT}\n\n{FORWARD_NOTICE}',
            RequiredElements: ['BRAND_NAME', 'TRADEMARK_SYMBOL', 'RESPONSIBILITY_TEXT']
          },
          {
            AssetType: 'Mobile App',
            Template: '{BRAND_NAME}{TRADEMARK_SYMBOL} {RESPONSIBILITY_TEXT}',
            RequiredElements: ['BRAND_NAME', 'TRADEMARK_SYMBOL', 'RESPONSIBILITY_TEXT']
          },
          {
            AssetType: 'Video/Audio',
            Template: '{BRAND_NAME}{TRADEMARK_SYMBOL}\n\n{RESPONSIBILITY_TEXT}',
            RequiredElements: ['BRAND_NAME', 'TRADEMARK_SYMBOL', 'RESPONSIBILITY_TEXT']
          },
          {
            AssetType: 'E-commerce',
            Template: '{BRAND_NAME}{TRADEMARK_SYMBOL}\n\n{AGE_VERIFICATION}\n\n{RESPONSIBILITY_TEXT}',
            RequiredElements: ['BRAND_NAME', 'TRADEMARK_SYMBOL', 'AGE_VERIFICATION', 'RESPONSIBILITY_TEXT']
          },
          {
            AssetType: 'Digital Brochure',
            Template: '{BRAND_NAME}{TRADEMARK_SYMBOL}\n\n{RESPONSIBILITY_TEXT}\n\n{FORWARD_NOTICE}',
            RequiredElements: ['BRAND_NAME', 'TRADEMARK_SYMBOL', 'RESPONSIBILITY_TEXT']
          }
        ],

        'Help Text': [
          {
            Section: 'Instructions',
            Content: 'Please follow the instructions below to generate the appropriate legal copy.'
          },
          {
            Section: 'Steps',
            Content: '1. Select your Asset Type\n2. Select your Country\n3. Select the brand(s) associated with your asset\n4. Click Generate\n5. Once your copy is generated, click the "Copy & Close" button to copy the generated text to your clipboard'
          },
          {
            Section: 'AdditionalNotes',
            Content: 'Country/Market Specifics: There will be additional detailed instructions included with your copy if your market has local requirements.\n\nUS teams: Please be sure to add the TTB Mandatory statement when prompted.\n\nMulti-Brands: If you need copy for a multi-brand item, such as Bar-Fabric, please DO NOT select any other single brands, ie. Benriach, because the copy will not generate.'
          }
        ]
      };
      
      this.isLoaded = true;
      this.cache.clear();

      console.log('ExcelService: Brown-Forman compliance data loaded successfully');

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

  // Enhanced helper methods matching the actual workflow
  getBrands() {
    if (!this.isLoaded) return [];
    
    const cacheKey = 'brands';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const brands = this.data['Trademark Config']
      ?.filter(item => item.Active)
      ?.map(item => ({
        id: item.Brand.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        name: item.Brand,
        entity: item.Entity,
        category: item.Category,
        isMultiBrand: item.Category === 'Multi-Brand'
      }))
      ?.sort((a, b) => a.name.localeCompare(b.name)) || [];
    
    this.cache.set(cacheKey, brands);
    return brands;
  }

  getCountries() {
    if (!this.isLoaded) return [];
    
    const cacheKey = 'countries';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const countries = this.data['CountryLanguage']?.map(item => ({
      code: item.CountryCode,
      name: item.Country,
      language: item.Language,
      marketSpecific: item.MarketSpecific,
      region: item.RegionCode
    })) || [];
    
    this.cache.set(cacheKey, countries);
    return countries;
  }

  getAssetTypes() {
    if (!this.isLoaded) return [];
    
    const cacheKey = 'assetTypes';
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const assetTypes = this.data['Asset Types']?.map(item => ({
      type: item.AssetType,
      description: item.Description,
      requiresAge: item.RequiresAge,
      characterLimit: item.CharacterLimit
    })) || [];
    
    this.cache.set(cacheKey, assetTypes);
    return assetTypes;
  }

  // Template engine methods
  getTemplateByAssetType(assetType) {
    if (!this.isLoaded) return null;
    
    return this.data['Template Structures']?.find(
      template => template.AssetType === assetType
    ) || null;
  }

  getLanguageVariablesByCountry(countryCode) {
    if (!this.isLoaded) return null;
    
    return this.data['Language Dependent Variables']?.find(
      vars => vars.Country === countryCode
    ) || null;
  }

  getTrademarkSymbolByCountry(countryCode) {
    if (!this.isLoaded) return { registered: '®', reserve: '™' };
    
    const trademark = this.data['Trademark Language']?.find(
      tm => tm.Country === countryCode
    );
    
    return {
      registered: trademark?.RegisteredSymbol || '®',
      reserve: trademark?.ReserveSymbol || '™',
      usage: trademark?.Usage || 'Post-brand name'
    };
  }

  getHelpText(section = 'Instructions') {
    if (!this.isLoaded) return '';
    
    const helpItem = this.data['Help Text']?.find(
      item => item.Section === section
    );
    
    return helpItem?.Content || '';
  }

  // Utility methods
  getBrandsByCategory(category) {
    return this.getBrands().filter(brand => brand.category === category);
  }

  getMultiBrands() {
    return this.getBrandsByCategory('Multi-Brand');
  }

  getSingleBrands() {
    return this.getBrands().filter(brand => brand.category !== 'Multi-Brand');
  }

  validateBrandSelection(selectedBrands) {
    const brands = selectedBrands.map(id => this.getBrandById(id)).filter(Boolean);
    const hasMultiBrand = brands.some(brand => brand.isMultiBrand);
    const hasSingleBrand = brands.some(brand => !brand.isMultiBrand);
    
    if (hasMultiBrand && hasSingleBrand) {
      return {
        isValid: false,
        error: 'Cannot select multi-brand items with single brands. Please select either multi-brand OR single brands, not both.'
      };
    }
    
    return { isValid: true };
  }

  // Existing methods for compatibility
  getBrandById(id) {
    return this.getBrands().find(brand => brand.id === id) || null;
  }

  getCountryById(code) {
    return this.getCountries().find(country => country.code === code) || null;
  }

  getAssetTypeByName(name) {
    return this.getAssetTypes().find(type => type.type === name) || null;
  }

  searchBrands(query) {
    if (!query) return this.getBrands();
    
    const lowercaseQuery = query.toLowerCase();
    return this.getBrands().filter(brand => 
      brand.name.toLowerCase().includes(lowercaseQuery) ||
      brand.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Legacy method names for compatibility
  getTemplateStructure(assetType) {
    return this.getTemplateByAssetType(assetType);
  }

  getLanguageVariables(countryCode) {
    return this.getLanguageVariablesByCountry(countryCode);
  }

  getTrademarkStructure(countryCode) {
    return this.getTrademarkSymbolByCountry(countryCode);
  }

  getData() {
    return this.data;
  }

  getRawData() {
    return this.data;
  }

  isDataLoaded() {
    return this.isLoaded;
  }

  async reload() {
    this.isLoaded = false;
    this.data = null;
    this.cache.clear();
    return await this.loadData();
  }

  clearCache() {
    this.cache.clear();
  }
}

// Create and export default instance
const excelService = new ExcelService();
export default excelService;
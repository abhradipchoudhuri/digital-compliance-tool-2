// src/renderer/services/excelService.js
// Enhanced Excel Service with real Brown-Forman brand data

export class ExcelService {
  constructor() {
    this.isLoaded = false;
    this.data = null;
    this.brandData = this.initializeBrandData();
    this.countryData = this.initializeCountryData();
    this.assetTypeData = this.initializeAssetTypeData();
  }

  initializeBrandData() {
    // Real Brown-Forman brands from the screenshot and company portfolio
    return [
      // Tequila Brands
      { 
        id: 'amigos-herradura', 
        name: 'Amigos de Herradura', 
        displayName: 'Amigos de Herradura',
        category: 'Tequila', 
        entityName: 'Brown-Forman Tequila Mexico',
        type: 'Brand',
        active: true,
        keywords: ['amigos', 'herradura', 'tequila']
      },
      { 
        id: 'herradura-tequila', 
        name: 'Herradura Tequila', 
        displayName: 'Herradura Tequila',
        category: 'Tequila', 
        entityName: 'Brown-Forman Tequila Mexico',
        type: 'Brand',
        active: true,
        keywords: ['herradura', 'tequila']
      },
      { 
        id: 'el-jimador-new', 
        name: 'el Jimador New Mix', 
        displayName: 'el Jimador New Mix',
        category: 'Tequila', 
        entityName: 'Brown-Forman Tequila Mexico',
        type: 'Brand',
        active: true,
        keywords: ['jimador', 'tequila', 'new', 'mix']
      },

      // Rum Brands
      { 
        id: 'botucal', 
        name: 'Botucal', 
        displayName: 'Botucal',
        category: 'Rum', 
        entityName: 'Brown-Forman Rum',
        type: 'Brand',
        active: true,
        keywords: ['botucal', 'rum']
      },
      { 
        id: 'diplomatico', 
        name: 'Diplomático', 
        displayName: 'Diplomático',
        category: 'Rum', 
        entityName: 'Brown-Forman Rum',
        type: 'Brand',
        active: true,
        keywords: ['diplomatico', 'rum']
      },

      // Jack Daniel's Family
      { 
        id: 'jack-daniels-old-7', 
        name: "Jack Daniel's Old No 7", 
        displayName: "Jack Daniel's Old No 7",
        category: 'Tennessee Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'old', 'no', '7', 'whiskey']
      },
      { 
        id: 'jack-daniels-sinatra', 
        name: "Jack Daniel's Sinatra Select", 
        displayName: "Jack Daniel's Sinatra Select",
        category: 'Tennessee Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'sinatra', 'select', 'whiskey']
      },
      { 
        id: 'jack-daniels-single-barrel', 
        name: "Jack Daniel's Single Barrel Series", 
        displayName: "Jack Daniel's Single Barrel Series",
        category: 'Tennessee Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'single', 'barrel', 'whiskey']
      },
      { 
        id: 'jack-daniels-bonded', 
        name: "Jack Daniel's Bonded Series", 
        displayName: "Jack Daniel's Bonded Series",
        category: 'Tennessee Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'bonded', 'whiskey']
      },
      { 
        id: 'jack-daniels-bottled', 
        name: "Jack Daniel's Bottled in Bond", 
        displayName: "Jack Daniel's Bottled in Bond",
        category: 'Tennessee Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'bottled', 'bond', 'whiskey']
      },
      { 
        id: 'jack-daniels-27', 
        name: "Jack Daniel's No. 27 Gold", 
        displayName: "Jack Daniel's No. 27 Gold",
        category: 'Tennessee Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', '27', 'gold', 'whiskey']
      },
      { 
        id: 'jack-daniels-tennessee-rye', 
        name: "Jack Daniel's Tennessee Rye", 
        displayName: "Jack Daniel's Tennessee Rye",
        category: 'Rye Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'tennessee', 'rye', 'whiskey']
      },
      { 
        id: 'jack-daniels-triple-mash', 
        name: "Jack Daniel's Triple Mash", 
        displayName: "Jack Daniel's Triple Mash",
        category: 'Tennessee Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'triple', 'mash', 'whiskey']
      },

      // Jack Daniel's Flavored
      { 
        id: 'jack-daniels-tennessee-apple', 
        name: "Jack Daniel's Tennessee Apple", 
        displayName: "Jack Daniel's Tennessee Apple",
        category: 'Flavored Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'tennessee', 'apple', 'flavored']
      },
      { 
        id: 'jack-daniels-tennessee-honey', 
        name: "Jack Daniel's Tennessee Honey", 
        displayName: "Jack Daniel's Tennessee Honey",
        category: 'Flavored Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'tennessee', 'honey', 'flavored']
      },
      { 
        id: 'jack-daniels-tennessee-fire', 
        name: "Jack Daniel's Tennessee Fire", 
        displayName: "Jack Daniel's Tennessee Fire",
        category: 'Flavored Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'tennessee', 'fire', 'flavored']
      },
      { 
        id: 'jack-daniels-winter-jack', 
        name: "Jack Daniel's Winter Jack", 
        displayName: "Jack Daniel's Winter Jack",
        category: 'Seasonal Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'winter', 'seasonal']
      },

      // Gentleman Jack
      { 
        id: 'gentleman-jack', 
        name: 'Gentleman Jack', 
        displayName: 'Gentleman Jack',
        category: 'Tennessee Whiskey', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['gentleman', 'jack', 'whiskey']
      },

      // RTD Products
      { 
        id: 'jack-cola-ginger', 
        name: 'Jack & Cola / Ginger / Berry (RTD)', 
        displayName: 'Jack & Cola / Ginger / Berry (RTD)',
        category: 'Ready to Drink', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'cola', 'ginger', 'berry', 'rtd', 'ready', 'drink']
      },
      { 
        id: 'jack-apple-tonic', 
        name: 'Jack Apple & Tonic (RTD)', 
        displayName: 'Jack Apple & Tonic (RTD)',
        category: 'Ready to Drink', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'apple', 'tonic', 'rtd', 'ready', 'drink']
      },
      { 
        id: 'jack-apple-fizz', 
        name: 'Jack Apple Fizz (RTD)', 
        displayName: 'Jack Apple Fizz (RTD)',
        category: 'Ready to Drink', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'apple', 'fizz', 'rtd', 'ready', 'drink']
      },
      { 
        id: 'jack-honey-lemonade', 
        name: 'Jack Honey & Lemonade (RTD)', 
        displayName: 'Jack Honey & Lemonade (RTD)',
        category: 'Ready to Drink', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'honey', 'lemonade', 'rtd', 'ready', 'drink']
      },
      { 
        id: 'jack-daniels-lynchburg', 
        name: "Jack Daniel's Lynchburg Lemonade (RTD)", 
        displayName: "Jack Daniel's Lynchburg Lemonade (RTD)",
        category: 'Ready to Drink', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'lynchburg', 'lemonade', 'rtd']
      },
      { 
        id: 'jack-daniels-country', 
        name: "Jack Daniel's Country Cocktails", 
        displayName: "Jack Daniel's Country Cocktails",
        category: 'Ready to Drink', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['jack', 'daniels', 'country', 'cocktails', 'rtd']
      },
      { 
        id: 'gentleman-whiskey', 
        name: 'Gentleman Jack Whiskey Sour (RTD)', 
        displayName: 'Gentleman Jack Whiskey Sour (RTD)',
        category: 'Ready to Drink', 
        entityName: 'Jack Daniel Distillery',
        type: 'Brand',
        active: true,
        keywords: ['gentleman', 'jack', 'whiskey', 'sour', 'rtd']
      },

      // Bourbon Brands
      { 
        id: 'old-forester', 
        name: 'Old Forester', 
        displayName: 'Old Forester',
        category: 'Bourbon', 
        entityName: 'Brown-Forman Distillery',
        type: 'Brand',
        active: true,
        keywords: ['old', 'forester', 'bourbon']
      },
      { 
        id: 'woodford-reserve', 
        name: 'Woodford Reserve', 
        displayName: 'Woodford Reserve',
        category: 'Bourbon', 
        entityName: 'Brown-Forman Distillery',
        type: 'Brand',
        active: true,
        keywords: ['woodford', 'reserve', 'bourbon']
      },
      { 
        id: 'coopers-craft', 
        name: "Cooper's Craft", 
        displayName: "Cooper's Craft",
        category: 'Bourbon', 
        entityName: 'Brown-Forman Distillery',
        type: 'Brand',
        active: true,
        keywords: ['coopers', 'craft', 'bourbon']
      },

      // Scotch Whisky
      { 
        id: 'the-glendronnach', 
        name: 'The GlenDronach', 
        displayName: 'The GlenDronach',
        category: 'Single Malt Scotch', 
        entityName: 'The GlenDronach Distillery',
        type: 'Brand',
        active: true,
        keywords: ['glendronnach', 'scotch', 'single', 'malt']
      },
      { 
        id: 'glenglassaugh', 
        name: 'Glenglassaugh', 
        displayName: 'Glenglassaugh',
        category: 'Single Malt Scotch', 
        entityName: 'Glenglassaugh Distillery',
        type: 'Brand',
        active: true,
        keywords: ['glenglassaugh', 'scotch', 'single', 'malt']
      },

      // Irish Whiskey
      { 
        id: 'slane-irish-whiskey', 
        name: 'Slane Irish Whiskey', 
        displayName: 'Slane Irish Whiskey',
        category: 'Irish Whiskey', 
        entityName: 'Slane Distillery',
        type: 'Brand',
        active: true,
        keywords: ['slane', 'irish', 'whiskey']
      },

      // Gin
      { 
        id: 'gin-mare', 
        name: 'Gin Mare', 
        displayName: 'Gin Mare',
        category: 'Premium Gin', 
        entityName: 'Brown-Forman Spain',
        type: 'Brand',
        active: true,
        keywords: ['gin', 'mare', 'mediterranean']
      },
      { 
        id: 'fords-gin', 
        name: "Ford's Gin", 
        displayName: "Ford's Gin",
        category: 'London Dry Gin', 
        entityName: 'Brown-Forman Gin',
        type: 'Brand',
        active: true,
        keywords: ['fords', 'gin', 'london', 'dry']
      },

      // Liqueur
      { 
        id: 'chambord', 
        name: 'Chambord', 
        displayName: 'Chambord',
        category: 'Black Raspberry Liqueur', 
        entityName: 'Brown-Forman France',
        type: 'Brand',
        active: true,
        keywords: ['chambord', 'liqueur', 'raspberry']
      },

      // Multi-Brand Portfolios
      { 
        id: 'bf-portfolio', 
        name: 'B-F Portfolio (multi-brand)', 
        displayName: 'B-F Portfolio (multi-brand)',
        category: 'Multi-Brand Portfolio', 
        entityName: 'Brown-Forman Corporation',
        type: 'Portfolio',
        active: true,
        keywords: ['portfolio', 'multi', 'brand', 'bf']
      },
      { 
        id: 'cheers-host', 
        name: 'Cheers to the Host (multi-brand)', 
        displayName: 'Cheers to the Host (multi-brand)',
        category: 'Multi-Brand Campaign', 
        entityName: 'Brown-Forman Corporation',
        type: 'Portfolio',
        active: true,
        keywords: ['cheers', 'host', 'multi', 'brand', 'campaign']
      },
      { 
        id: 'jack-daniels-fob', 
        name: "Jack Daniel's FOB (multi-brand)", 
        displayName: "Jack Daniel's FOB (multi-brand)",
        category: 'Multi-Brand Portfolio', 
        entityName: 'Jack Daniel Distillery',
        type: 'Portfolio',
        active: true,
        keywords: ['jack', 'daniels', 'fob', 'multi', 'brand']
      },
      { 
        id: 'master-craft-academy', 
        name: 'Master Craft Academy (multi-brand)', 
        displayName: 'Master Craft Academy (multi-brand)',
        category: 'Educational Portfolio', 
        entityName: 'Brown-Forman Corporation',
        type: 'Portfolio',
        active: true,
        keywords: ['master', 'craft', 'academy', 'multi', 'brand', 'education']
      }
    ];
  }

  initializeCountryData() {
    return [
      { code: 'US', name: 'United States', language: 'English', region: 'North America', active: true },
      { code: 'GB', name: 'United Kingdom', language: 'English', region: 'Europe', active: true },
      { code: 'CA', name: 'Canada', language: 'English/French', region: 'North America', active: true },
      { code: 'AU', name: 'Australia', language: 'English', region: 'Asia Pacific', active: true },
      { code: 'DE', name: 'Germany', language: 'German', region: 'Europe', active: true },
      { code: 'FR', name: 'France', language: 'French', region: 'Europe', active: true },
      { code: 'ES', name: 'Spain', language: 'Spanish', region: 'Europe', active: true },
      { code: 'IT', name: 'Italy', language: 'Italian', region: 'Europe', active: true },
      { code: 'JP', name: 'Japan', language: 'Japanese', region: 'Asia Pacific', active: true },
      { code: 'MX', name: 'Mexico', language: 'Spanish', region: 'Latin America', active: true },
      { code: 'BR', name: 'Brazil', language: 'Portuguese', region: 'Latin America', active: true },
      { code: 'AR', name: 'Argentina', language: 'Spanish', region: 'Latin America', active: true },
      { code: 'ZA', name: 'South Africa', language: 'English', region: 'Africa', active: true },
      { code: 'SG', name: 'Singapore', language: 'English', region: 'Asia Pacific', active: true },
      { code: 'HK', name: 'Hong Kong', language: 'English/Chinese', region: 'Asia Pacific', active: true },
      { code: 'NL', name: 'Netherlands', language: 'Dutch', region: 'Europe', active: true },
      { code: 'BE', name: 'Belgium', language: 'Dutch/French', region: 'Europe', active: true },
      { code: 'CH', name: 'Switzerland', language: 'German/French', region: 'Europe', active: true },
      { code: 'AT', name: 'Austria', language: 'German', region: 'Europe', active: true },
      { code: 'SE', name: 'Sweden', language: 'Swedish', region: 'Europe', active: true },
      { code: 'NO', name: 'Norway', language: 'Norwegian', region: 'Europe', active: true },
      { code: 'DK', name: 'Denmark', language: 'Danish', region: 'Europe', active: true },
      { code: 'FI', name: 'Finland', language: 'Finnish', region: 'Europe', active: true }
    ];
  }

  initializeAssetTypeData() {
    return [
      { id: 'facebook-post', name: 'Facebook Post', category: 'Social Media', active: true },
      { id: 'instagram-story', name: 'Instagram Story', category: 'Social Media', active: true },
      { id: 'instagram-post', name: 'Instagram Post', category: 'Social Media', active: true },
      { id: 'twitter-post', name: 'Twitter Post', category: 'Social Media', active: true },
      { id: 'linkedin-post', name: 'LinkedIn Post', category: 'Social Media', active: true },
      { id: 'tiktok-video', name: 'TikTok Video', category: 'Social Media', active: true },
      { id: 'youtube-video', name: 'YouTube Video', category: 'Video Content', active: true },
      { id: 'email-template', name: 'Email Template', category: 'Email Marketing', active: true },
      { id: 'newsletter', name: 'Newsletter', category: 'Email Marketing', active: true },
      { id: 'banner-ad', name: 'Banner Ad', category: 'Display Advertising', active: true },
      { id: 'video-ad', name: 'Video Advertisement', category: 'Display Advertising', active: true },
      { id: 'website-copy', name: 'Website Copy', category: 'Web Content', active: true },
      { id: 'product-page', name: 'Product Page', category: 'Web Content', active: true },
      { id: 'press-release', name: 'Press Release', category: 'PR Content', active: true },
      { id: 'blog-post', name: 'Blog Post', category: 'Content Marketing', active: true },
      { id: 'brochure', name: 'Brochure', category: 'Print Materials', active: true },
      { id: 'flyer', name: 'Flyer', category: 'Print Materials', active: true },
      { id: 'packaging', name: 'Packaging Copy', category: 'Product Packaging', active: true },
      { id: 'pos-material', name: 'Point of Sale Material', category: 'Retail', active: true },
      { id: 'event-signage', name: 'Event Signage', category: 'Events', active: true }
    ];
  }

  async loadData() {
    try {
      console.log('ExcelService: Loading enhanced data with real Brown-Forman brands...');
      
      // Use Electron IPC to load Excel file (if available)
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.loadExcelData();
          if (result.success) {
            console.log('ExcelService: Excel file loaded via Electron API');
          }
        } catch (error) {
          console.warn('ExcelService: Electron API not available, using mock data');
        }
      }

      // Create enhanced data structure with real Brown-Forman data
      this.data = {
        'Trademark Config': this.brandData.map(brand => ({
          ID: brand.id,
          Name: brand.displayName,
          Type: brand.type,
          Entity: brand.entityName,
          Category: brand.category,
          Active: brand.active,
          Keywords: brand.keywords.join(', ')
        })),
        'CountryLanguage': this.countryData.map(country => ({
          CountryCode: country.code,
          CountryName: country.name,
          Language: country.language,
          Region: country.region,
          Active: country.active
        })),
        'Trademark Language': [],
        'Trademark Structure': [],
        'Language Dependent Variables': [],
        'Overall Structure': this.assetTypeData.map(asset => ({
          AssetType: asset.name,
          Category: asset.category,
          ID: asset.id,
          Active: asset.active
        })),
        'Help Text': [
          {
            Section: 'Instructions',
            Content: `<div class="help-content">
              <h3>How to Use the Digital Compliance Tool</h3>
              <ol>
                <li><strong>Select Asset Type:</strong> Choose the type of marketing asset you're creating</li>
                <li><strong>Select Country:</strong> Choose your target market</li>
                <li><strong>Select Brands:</strong> Choose the brands to include in your copy</li>
                <li><strong>Generate:</strong> Click generate to create compliant legal copy</li>
              </ol>
              <p><em>For multi-brand campaigns, select only multi-brand items like Bar-Fabric.</em></p>
            </div>`
          }
        ]
      };
      
      this.isLoaded = true;

      console.log('ExcelService: Enhanced data loaded successfully');
      console.log(`- Brands: ${this.brandData.length}`);
      console.log(`- Countries: ${this.countryData.length}`);
      console.log(`- Asset Types: ${this.assetTypeData.length}`);

      return {
        success: true,
        data: this.data
      };
    } catch (error) {
      console.error('ExcelService: Error loading enhanced data:', error);
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

  getRawData() {
    return this.data;
  }

  // Enhanced brand methods with real data
  getBrands() {
    return this.brandData.filter(brand => brand.active).map(brand => ({
      id: brand.id,
      name: brand.name,
      displayName: brand.displayName,
      category: brand.category,
      entityName: brand.entityName,
      type: brand.type,
      keywords: brand.keywords
    }));
  }

  getBrandById(id) {
    return this.brandData.find(brand => brand.id === id) || null;
  }

  searchBrands(query) {
    if (!query || query.trim().length === 0) {
      return this.getBrands();
    }
    
    const searchTerm = query.toLowerCase().trim();
    return this.brandData
      .filter(brand => 
        brand.active && (
          brand.name.toLowerCase().includes(searchTerm) ||
          brand.displayName.toLowerCase().includes(searchTerm) ||
          brand.category.toLowerCase().includes(searchTerm) ||
          brand.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm))
        )
      )
      .map(brand => ({
        id: brand.id,
        name: brand.name,
        displayName: brand.displayName,
        category: brand.category,
        entityName: brand.entityName,
        type: brand.type,
        keywords: brand.keywords
      }));
  }

  // Enhanced country methods
  getCountries() {
    return this.countryData.filter(country => country.active).map(country => ({
      code: country.code,
      name: country.name,
      language: country.language,
      region: country.region
    }));
  }

  getCountryById(code) {
    return this.countryData.find(country => country.code === code) || null;
  }

  // Enhanced asset type methods
  getAssetTypes() {
    return this.assetTypeData.filter(asset => asset.active).map(asset => ({
      id: asset.id,
      name: asset.name,
      category: asset.category
    }));
  }

  getAssetTypeByName(name) {
    return this.assetTypeData.find(asset => 
      asset.name.toLowerCase() === name.toLowerCase()
    ) || null;
  }

  getAssetTypeById(id) {
    return this.assetTypeData.find(asset => asset.id === id) || null;
  }

  // Template and structure methods (placeholders for future enhancement)
  getTemplateStructure(assetType) {
    // This will be enhanced when templateService is fully implemented
    return {
      assetType: assetType,
      structure: 'template-placeholder',
      placeholders: ['{{BRAND_NAME}}', '{{TRADEMARK_NOTICE}}', '{{COMPLIANCE_TEXT}}']
    };
  }

  getLanguageVariables(language) {
    // Placeholder for language-specific variables
    const variables = {
      'English': {
        drinkResponsibly: 'Please drink responsibly.',
        trademark: '® Registered trademark',
        copyright: '© Brown-Forman Corporation'
      },
      'Spanish': {
        drinkResponsibly: 'Bebe con responsabilidad.',
        trademark: '® Marca registrada',
        copyright: '© Brown-Forman Corporation'
      },
      'French': {
        drinkResponsibly: 'À consommer avec modération.',
        trademark: '® Marque déposée',
        copyright: '© Brown-Forman Corporation'
      }
    };
    
    return variables[language] || variables['English'];
  }

  getTrademarkStructure(type) {
    // Placeholder for trademark structure
    return {
      type: type,
      format: 'standard',
      requirements: ['trademark-notice', 'responsibility-message', 'legal-disclaimer']
    };
  }

  getHelpText() {
    const helpData = this.data?.['Help Text'];
    if (helpData && helpData.length > 0) {
      return helpData[0].Content || '';
    }
    return `
      <div class="help-content">
        <h3>Digital Compliance Legal Copy Generator</h3>
        <p>This tool helps you generate legally compliant copy for Brown-Forman brands across different markets and asset types.</p>
        <p>Select your asset type, country, and brands to get started.</p>
      </div>
    `;
  }

  // Data statistics
  getStats() {
    return {
      totalBrands: this.brandData.length,
      activeBrands: this.brandData.filter(b => b.active).length,
      totalCountries: this.countryData.length,
      activeCountries: this.countryData.filter(c => c.active).length,
      totalAssetTypes: this.assetTypeData.length,
      activeAssetTypes: this.assetTypeData.filter(a => a.active).length,
      lastUpdated: new Date().toISOString()
    };
  }

  async reload() {
    this.isLoaded = false;
    this.data = null;
    return await this.loadData();
  }
}

// Create and export default instance
const excelService = new ExcelService();
export default excelService;
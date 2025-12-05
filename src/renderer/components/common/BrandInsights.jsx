// src/renderer/components/common/BrandInsights.jsx
// Component for displaying brand analytics and usage insights

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Globe, 
  Package,
  Star,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import excelService from '@services/excelService';

const BrandInsights = ({ history = [], selectedBrands = [], className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedCategory, setExpandedCategory] = useState(null);

  /**
   * Calculate insights from historical data and current Excel data
   */
  const insights = useMemo(() => {
    const brands = excelService.getBrands();
    const countries = excelService.getCountries();
    const assetTypes = excelService.getAssetTypes();

    // Brand category distribution
    const categoryStats = brands.reduce((acc, brand) => {
      acc[brand.category] = (acc[brand.category] || 0) + 1;
      return acc;
    }, {});

    // Usage statistics from generation history
    const usageStats = history.reduce((acc, entry) => {
      entry.params.brandIds.forEach(brandId => {
        acc.brandUsage[brandId] = (acc.brandUsage[brandId] || 0) + 1;
      });
      acc.assetTypeUsage[entry.params.assetType] = (acc.assetTypeUsage[entry.params.assetType] || 0) + 1;
      acc.countryUsage[entry.params.countryCode] = (acc.countryUsage[entry.params.countryCode] || 0) + 1;
      return acc;
    }, { brandUsage: {}, assetTypeUsage: {}, countryUsage: {} });

    // Top performing combinations
    const combinations = history.map(entry => ({
      brands: entry.params.brandIds.length,
      assetType: entry.params.assetType,
      country: entry.params.countryCode,
      length: entry.result.metadata.length
    }));

    return {
      totalBrands: brands.length,
      totalCountries: countries.length,
      totalAssetTypes: assetTypes.length,
      categoryStats,
      usageStats,
      combinations,
      brands,
      countries,
      assetTypes
    };
  }, [history]);

  /**
   * Category breakdown component with expandable brand lists
   */
  const CategoryBreakdown = ({ categoryStats, brands }) => {
    return (
      <div className="space-y-3">
        {Object.entries(categoryStats)
          .sort(([,a], [,b]) => b - a)
          .map(([category, count]) => {
            const percentage = Math.round((count / brands.length) * 100);
            const categoryBrands = brands.filter(b => b.category === category);
            const isExpanded = expandedCategory === category;

            return (
              <div key={category} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : category)}
                  className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500" style={{
                      backgroundColor: `hsl(${Object.keys(categoryStats).indexOf(category) * 45}, 70%, 50%)`
                    }}></div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{category}</div>
                      <div className="text-sm text-gray-500">{count} brands - {percentage}%</div>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {categoryBrands.map(brand => (
                        <div
                          key={brand.id}
                          className={`p-2 bg-white rounded text-sm border ${
                            selectedBrands.includes(brand.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="font-medium">{brand.displayName}</div>
                          <div className="text-gray-500 text-xs">{brand.entityName}</div>
                          {insights.usageStats.brandUsage[brand.id] && (
                            <div className="text-green-600 text-xs mt-1">
                              Used {insights.usageStats.brandUsage[brand.id]} times
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    );
  };

  /**
   * Usage statistics component showing top brands, countries, and asset types
   */
  const UsageStats = ({ usageStats, brands, countries, assetTypes }) => {
    const getTopItems = (stats, itemsArray, getDisplayName) => {
      return Object.entries(stats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([key, count]) => {
          const item = itemsArray.find(i => i.id === key || i.code === key || i.name === key);
          return {
            key,
            count,
            displayName: item ? getDisplayName(item) : key,
            percentage: Math.round((count / Object.values(stats).reduce((a, b) => a + b, 0)) * 100)
          };
        });
    };

    const topBrands = getTopItems(usageStats.brandUsage, brands, b => b.displayName);
    const topCountries = getTopItems(usageStats.countryUsage, countries, c => c.name);
    const topAssetTypes = getTopItems(usageStats.assetTypeUsage, assetTypes, a => a.name);

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            Most Used Brands
          </h4>
          <div className="space-y-2">
            {topBrands.length > 0 ? topBrands.map(item => (
              <div key={item.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium truncate">{item.displayName}</span>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{item.count}x</div>
                  <div className="text-xs text-gray-400">{item.percentage}%</div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500 text-center py-4">No usage data yet</div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            Top Markets
          </h4>
          <div className="space-y-2">
            {topCountries.length > 0 ? topCountries.map(item => (
              <div key={item.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{item.displayName}</span>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{item.count}x</div>
                  <div className="text-xs text-gray-400">{item.percentage}%</div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500 text-center py-4">No usage data yet</div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-green-500" />
            Popular Asset Types
          </h4>
          <div className="space-y-2">
            {topAssetTypes.length > 0 ? topAssetTypes.map(item => (
              <div key={item.key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium truncate">{item.displayName}</span>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{item.count}x</div>
                  <div className="text-xs text-gray-400">{item.percentage}%</div>
                </div>
              </div>
            )) : (
              <div className="text-sm text-gray-500 text-center py-4">No usage data yet</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  /**
   * Overview statistics component with key metrics
   */
  const OverviewStats = ({ insights }) => {
    const stats = [
      { 
        label: 'Total Brands', 
        value: insights.totalBrands, 
        icon: Package, 
        color: 'blue',
        description: 'Available for copy generation'
      },
      { 
        label: 'Global Markets', 
        value: insights.totalCountries, 
        icon: Globe, 
        color: 'green',
        description: 'Countries with compliance rules'
      },
      { 
        label: 'Asset Types', 
        value: insights.totalAssetTypes, 
        icon: BarChart3, 
        color: 'purple',
        description: 'Marketing asset templates'
      },
      { 
        label: 'Generated Copies', 
        value: history.length, 
        icon: TrendingUp, 
        color: 'orange',
        description: 'Total copy generations'
      }
    ];

    const colorClasses = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100'
    };

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <stat.icon className={`w-6 h-6 ${colorClasses[stat.color]}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm font-medium text-gray-700">{stat.label}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Brand Insights</h3>
          </div>
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Real-time analytics</span>
          </div>
        </div>

        <div className="flex mt-4 border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'categories', label: 'Categories', icon: PieChart },
            { id: 'usage', label: 'Usage', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'overview' && <OverviewStats insights={insights} />}
        
        {activeTab === 'categories' && (
          <div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Brand Categories</h4>
              <p className="text-sm text-gray-600">Explore the Brown-Forman portfolio by product category</p>
            </div>
            <CategoryBreakdown categoryStats={insights.categoryStats} brands={insights.brands} />
          </div>
        )}
        
        {activeTab === 'usage' && (
          <div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Usage Analytics</h4>
              <p className="text-sm text-gray-600">
                {history.length > 0 
                  ? `Analytics based on ${history.length} copy generations`
                  : 'Start generating copy to see usage analytics'
                }
              </p>
            </div>
            <UsageStats 
              usageStats={insights.usageStats} 
              brands={insights.brands}
              countries={insights.countries}
              assetTypes={insights.assetTypes}
            />
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        <div className="flex items-center justify-between">
          <span>Data updated in real-time</span>
          <span>Brown-Forman Legal Copy Generator</span>
        </div>
      </div>
    </div>
  );
};

BrandInsights.propTypes = {
  history: PropTypes.array,
  selectedBrands: PropTypes.array,
  className: PropTypes.string
};

export default BrandInsights;
// src/renderer/components/common/LoadingSpinner.jsx
// Modern loading spinner component with different variants

import React from 'react';
import PropTypes from 'prop-types';
import { Loader2, RefreshCw } from 'lucide-react';

const LoadingSpinner = ({ 
  size = 'medium', 
  variant = 'default',
  message = '',
  fullPage = false,
  className = '',
  showIcon = true,
  color = 'blue'
}) => {
  // Size mappings
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12'
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  // Color mappings
  const colorClasses = {
    blue: 'text-blue-600 border-blue-600',
    gray: 'text-gray-600 border-gray-600',
    green: 'text-green-600 border-green-600',
    orange: 'text-orange-600 border-orange-600',
    red: 'text-red-600 border-red-600',
    white: 'text-white border-white'
  };

  // Spinner variants
  const SpinnerIcon = ({ variant, size, color }) => {
    const iconClass = `${sizeClasses[size]} ${colorClasses[color]} animate-spin`;
    
    switch (variant) {
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-pulse`}>
            <div className="w-full h-full bg-current rounded-full opacity-75"></div>
          </div>
        );
      
      case 'dots':
        return (
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className={`w-2 h-2 ${colorClasses[color]} rounded-full animate-bounce`}
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        );
      
      case 'bars':
        return (
          <div className="flex gap-1 items-center">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`w-1 ${colorClasses[color]} rounded animate-pulse`}
                style={{ 
                  height: size === 'small' ? '12px' : size === 'large' ? '24px' : '16px',
                  animationDelay: `${i * 0.15}s`
                }}
              />
            ))}
          </div>
        );
      
      case 'refresh':
        return <RefreshCw className={iconClass} />;
      
      case 'circle':
        return (
          <div className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`} />
        );
      
      default:
        return <Loader2 className={iconClass} />;
    }
  };

  const LoadingContent = () => (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {showIcon && <SpinnerIcon variant={variant} size={size} color={color} />}
      {message && (
        <span className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium`}>
          {message}
        </span>
      )}
    </div>
  );

  // Full page overlay
  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <LoadingContent />
          {message && size !== 'small' && (
            <div className="mt-4 max-w-sm mx-auto">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{
                  animation: 'loading-progress 2s ease-in-out infinite'
                }} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <LoadingContent />;
};

// Specific loading components for different use cases
export const InlineLoader = ({ message, size = 'small' }) => (
  <LoadingSpinner 
    size={size} 
    message={message} 
    className="py-2" 
    variant="default"
    color="blue"
  />
);

export const ButtonLoader = ({ size = 'small' }) => (
  <LoadingSpinner 
    size={size} 
    showIcon={true} 
    variant="circle"
    color="white"
    className="mr-2"
  />
);

export const PageLoader = ({ message = 'Loading...' }) => (
  <LoadingSpinner 
    size="large" 
    message={message} 
    fullPage={true}
    variant="default"
    color="blue"
  />
);

export const CardLoader = ({ message = 'Loading data...' }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-8">
    <LoadingSpinner 
      size="medium" 
      message={message} 
      variant="default"
      color="blue"
      className="text-center"
    />
  </div>
);

export const TableLoader = ({ rows = 3, cols = 4 }) => (
  <div className="space-y-3">
    {Array(rows).fill(0).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array(cols).fill(0).map((_, colIndex) => (
          <div 
            key={colIndex} 
            className="h-4 bg-gray-200 rounded animate-pulse flex-1"
            style={{ animationDelay: `${(rowIndex * cols + colIndex) * 0.1}s` }}
          />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonLoader = ({ className = '', lines = 3 }) => (
  <div className={`space-y-3 ${className}`}>
    {Array(lines).fill(0).map((_, index) => (
      <div key={index} className="space-y-2">
        <div 
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ 
            width: index === lines - 1 ? '75%' : '100%',
            animationDelay: `${index * 0.1}s`
          }}
        />
      </div>
    ))}
  </div>
);

// Brand-specific loader for Brown-Forman
export const BrandLoader = ({ message = 'Loading Brown-Forman brands...' }) => (
  <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white p-6 rounded-lg">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center font-bold text-blue-900 relative">
        BF
        <div className="absolute inset-0 bg-amber-500 rounded-full animate-ping opacity-75" />
      </div>
      <div className="flex-1">
        <LoadingSpinner 
          size="medium" 
          message={message} 
          variant="default"
          color="white"
          showIcon={false}
        />
        <div className="flex mt-3">
          <LoadingSpinner 
            variant="dots" 
            color="white" 
            size="small"
            showIcon={true}
          />
        </div>
      </div>
    </div>
  </div>
);

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  variant: PropTypes.oneOf(['default', 'circle', 'pulse', 'dots', 'bars', 'refresh']),
  message: PropTypes.string,
  fullPage: PropTypes.bool,
  className: PropTypes.string,
  showIcon: PropTypes.bool,
  color: PropTypes.oneOf(['blue', 'gray', 'green', 'orange', 'red', 'white'])
};

// CSS animations (add to globals.css)
const styles = `
@keyframes loading-progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}
`;

export default LoadingSpinner;
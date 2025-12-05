// src/renderer/components/output/CopyHistory.jsx
// UI component for displaying copy generation history

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Clock, Download, Copy, Trash2, RefreshCw, Calendar } from 'lucide-react';

/**
 * CopyHistory Component
 * Displays history of generated copies with actions
 */
const CopyHistory = ({ history, onRegenerate, onRemove, onClear, onCopyToClipboard, onDownload }) => {
  const [expandedEntry, setExpandedEntry] = useState(null);

  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center">
        <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No History Yet</h3>
        <p className="text-gray-500">Your copy generation history will appear here</p>
      </div>
    );
  }

  /**
   * Toggle entry expansion
   */
  const toggleEntry = (entryId) => {
    setExpandedEntry(expandedEntry === entryId ? null : entryId);
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg border-2 border-bf-blue overflow-hidden">
      {/* Header */}
      <div className="bg-bf-blue text-bf-gold p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Copy History</h3>
          <span className="bg-bf-gold text-bf-blue px-2 py-1 rounded-full text-xs font-bold">
            {history.length}
          </span>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-bf-gold hover:text-white transition-colors text-sm flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* History List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {history.map((entry) => (
          <div key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
            {/* Entry Header */}
            <div 
              className="flex items-start justify-between cursor-pointer"
              onClick={() => toggleEntry(entry.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {entry.params.assetType}
                  </span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">
                    {entry.params.countryCode}
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(entry.timestamp)}
                </div>
                {entry.params.brandIds && entry.params.brandIds.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {entry.params.brandIds.length} brand{entry.params.brandIds.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyToClipboard(entry.result.plainText);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownload(entry.result, `copy-${entry.id}.txt`);
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRegenerate(entry.id);
                  }}
                  className="p-2 text-purple-600 hover:bg-purple-50 rounded transition-colors"
                  title="Regenerate"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(entry.id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedEntry === entry.id && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Generated Copy:</h4>
                  <div className="text-sm text-gray-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {entry.result.plainText}
                  </div>
                </div>
                
                {entry.result.metadata && (
                  <div className="mt-3 text-xs text-gray-500 space-y-1">
                    {entry.result.metadata.brandCount && (
                      <div>Brands: {entry.result.metadata.brandCount}</div>
                    )}
                    {entry.result.metadata.language && (
                      <div>Language: {entry.result.metadata.language}</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

CopyHistory.propTypes = {
  history: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    timestamp: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    result: PropTypes.object.isRequired
  })),
  onRegenerate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onCopyToClipboard: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired
};

export default CopyHistory;
import React from 'react';
import type { ExtractedData } from '../types';
import { MagicWandIcon, DownloadIcon, AlertTriangleIcon } from './icons';

interface DataExtractorProps {
  isLoading: boolean;
  error: string | null;
  extractedData: ExtractedData | null;
  onExtract: () => void;
  onDataUpdate: (index: number, value: string) => void;
  onKeyUpdate: (index: number, key: string) => void;
  isViewingHistory: boolean;
  onHighlight: (index: number | null) => void;
  highlightedFieldIndex: number | null;
}

const SkeletonLoader: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/3"></div>
        <div className="h-4 bg-slate-700 rounded w-full"></div>
        <div className="h-10 bg-slate-700 rounded mt-6"></div>
        <div className="space-y-3 pt-4">
            <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                <div className="h-4 bg-slate-700 rounded col-span-2"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                <div className="h-4 bg-slate-700 rounded col-span-2"></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="h-4 bg-slate-700 rounded col-span-1"></div>
                <div className="h-4 bg-slate-700 rounded col-span-2"></div>
            </div>
        </div>
    </div>
);


export default function DataExtractor({ isLoading, error, extractedData, onExtract, onDataUpdate, onKeyUpdate, isViewingHistory, onHighlight, highlightedFieldIndex }: DataExtractorProps): React.ReactElement {
  
  const handleExport = () => {
    if (!extractedData) return;
    const dataStr = JSON.stringify(extractedData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'extracted_data.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
    
  return (
    <div className="bg-slate-800/50 rounded-lg shadow-lg h-full border border-slate-700 p-6 flex flex-col">
      <h2 className="text-xl font-bold text-white mb-4">Extracted Data</h2>
      
      <div className="flex-grow overflow-y-auto pr-2 -mr-2 min-h-0">
        {isLoading ? (
          <SkeletonLoader />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-red-400">
            <AlertTriangleIcon />
            <p className="mt-4 font-semibold">Extraction Failed</p>
            <p className="text-sm text-slate-400">{error}</p>
          </div>
        ) : !extractedData ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-slate-400 mb-4">Click the button to start AI-powered data extraction.</p>
            <button
              onClick={onExtract}
              disabled={isLoading || isViewingHistory}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:bg-indigo-800 disabled:cursor-not-allowed"
            >
              <MagicWandIcon />
              {isViewingHistory ? 'Data Loaded From History' : 'Extract Data'}
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="text-sm font-medium text-slate-400">Document Type</label>
              <p className="text-lg font-semibold text-indigo-400 bg-slate-700/50 px-3 py-2 rounded-md mt-1">{extractedData.documentType}</p>
            </div>
            <div className="mb-6">
              <label className="text-sm font-medium text-slate-400">Summary</label>
              <p className="text-slate-300 bg-slate-700/50 px-3 py-2 rounded-md mt-1 text-sm">{extractedData.summary}</p>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-3">Fields</h3>
            <div className="space-y-3">
              {extractedData.extractedFields.map((field, index) => (
                <div
                  key={index}
                  onMouseEnter={() => onHighlight(index)}
                  onMouseLeave={() => onHighlight(null)}
                  className={`grid grid-cols-1 md:grid-cols-3 gap-2 items-center p-1 -m-1 rounded-md transition-colors duration-200 ${highlightedFieldIndex === index ? 'bg-indigo-600/30' : ''}`}
                >
                  <input
                    type="text"
                    value={field.key}
                    onChange={(e) => onKeyUpdate(index, e.target.value)}
                    className="col-span-1 bg-slate-900 border border-slate-600 text-slate-300 text-sm rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Field Name"
                  />
                   <input
                    type="text"
                    value={field.value}
                    onChange={(e) => onDataUpdate(index, e.target.value)}
                    className="col-span-2 bg-slate-700 border border-slate-600 text-white text-sm rounded-md p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    placeholder="Field Value"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {extractedData && !isLoading && !error && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            <DownloadIcon />
            Export as JSON
          </button>
        </div>
      )}
    </div>
  );
}
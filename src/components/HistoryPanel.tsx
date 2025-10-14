import React from 'react';
import type { HistoryItem } from '../types';
import { HistoryIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';

interface HistoryPanelProps {
  history: HistoryItem[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onSelectItem: (id: number) => void;
  onClearHistory: () => void;
}

function formatHistoryDate(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.round(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.round(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
}

export default function HistoryPanel({ history, isOpen, setIsOpen, onSelectItem, onClearHistory }: HistoryPanelProps): React.ReactElement {
  return (
    <aside className={`relative bg-slate-900/80 backdrop-blur-sm border-r border-slate-700 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-80' : 'w-0'}`}>
      <div className={`flex-grow flex flex-col overflow-hidden ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <HistoryIcon />
            <h2 className="text-lg font-semibold text-white">History</h2>
          </div>
          <button 
            onClick={onClearHistory}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors"
            aria-label="Clear all history"
            title="Clear all history"
          >
            <TrashIcon />
            Clear All
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {history.length === 0 ? (
            <div className="text-center text-slate-500 p-8">
              <p>Your processed documents will appear here.</p>
            </div>
          ) : (
            <ul>
              {history.map(item => (
                <li key={item.id}>
                  <button 
                    onClick={() => onSelectItem(item.id)}
                    className="w-full text-left p-4 hover:bg-slate-800/50 transition-colors duration-200 border-b border-slate-800"
                  >
                    <p className="font-semibold text-indigo-400 text-sm truncate">{item.extractedData.documentType}</p>
                    <p className="text-slate-300 truncate text-sm">{item.fileName}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatHistoryDate(item.processedAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
       <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white p-2 rounded-r-md transition-all duration-300"
        aria-label={isOpen ? 'Collapse history panel' : 'Expand history panel'}
        title={isOpen ? 'Collapse history panel' : 'Expand history panel'}
      >
        {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </button>
    </aside>
  );
}
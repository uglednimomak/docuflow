import React, { useState, useCallback, useEffect } from 'react';
import type { ExtractedData, HistoryItem } from './types';
import { extractDataFromDocument } from './services/geminiService';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import DocumentViewer from './components/DocumentViewer';
import DataExtractor from './components/DataExtractor';
import HistoryPanel from './components/HistoryPanel';
import { NewDocumentIcon } from './components/icons';

const HISTORY_STORAGE_KEY = 'docuflow_ai_history';

export default function App(): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState<boolean>(true);
  const [isViewingHistory, setIsViewingHistory] = useState<boolean>(false);
  const [highlightedFieldIndex, setHighlightedFieldIndex] = useState<number | null>(null);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
      setHistory([]);
    }
  }, []);

  const handleFileChange = (selectedFile: File) => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFilePreview(URL.createObjectURL(selectedFile));
    setExtractedData(null);
    setError(null);
    setIsViewingHistory(false);
    setHighlightedFieldIndex(null);
  };

  const handleExtract = useCallback(async () => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    setHighlightedFieldIndex(null);

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      try {
        const base64StringWithMime = reader.result as string;
        const base64String = base64StringWithMime.split(',')[1];
        if (!base64String) {
          throw new Error("Failed to read file.");
        }
        const data = await extractDataFromDocument(base64String, file.type);
        setExtractedData(data);

        // Add to history
        const newHistoryItem: HistoryItem = {
          id: Date.now(),
          fileName: file.name,
          filePreviewUrl: base64StringWithMime,
          extractedData: data,
          processedAt: new Date().toISOString(),
        };
        
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
        setError(`Failed to extract data: ${errorMessage}. Please try another document.`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Error reading the file. Please try again.");
      setIsLoading(false);
    };
  }, [file, history]);

  const handleDataUpdate = (index: number, value: string) => {
    if (!extractedData) return;
    const updatedFields = [...extractedData.extractedFields];
    updatedFields[index] = { ...updatedFields[index], value };
    setExtractedData({ ...extractedData, extractedFields: updatedFields });
  };
  
  const handleKeyUpdate = (index: number, key: string) => {
    if (!extractedData) return;
    const updatedFields = [...extractedData.extractedFields];
    updatedFields[index] = { ...updatedFields[index], key };
    setExtractedData({ ...extractedData, extractedFields: updatedFields });
  };


  const handleReset = () => {
    if (filePreview?.startsWith('blob:')) {
      URL.revokeObjectURL(filePreview);
    }
    setFile(null);
    setFilePreview(null);
    setFileName('');
    setExtractedData(null);
    setError(null);
    setIsLoading(false);
    setIsViewingHistory(false);
    setHighlightedFieldIndex(null);
  };

  const handleSelectHistoryItem = (id: number) => {
    const item = history.find(h => h.id === id);
    if (item) {
      if (filePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(filePreview);
      }
      setFile(null);
      setFilePreview(item.filePreviewUrl);
      setFileName(item.fileName);
      setExtractedData(item.extractedData);
      setError(null);
      setIsLoading(false);
      setIsViewingHistory(true);
      setHighlightedFieldIndex(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_STORAGE_KEY);
    handleReset();
  };


  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col">
      <Header />
      <div className="flex flex-grow overflow-hidden">
        <HistoryPanel 
          history={history}
          isOpen={isHistoryPanelOpen}
          setIsOpen={setIsHistoryPanelOpen}
          onSelectItem={handleSelectHistoryItem}
          onClearHistory={handleClearHistory}
        />
        <main className={`flex-grow p-4 md:p-8 flex flex-col transition-all duration-300 ${!filePreview ? 'items-center justify-center' : ''}`}>
          {!filePreview ? (
            <FileUpload onFileSelect={handleFileChange} />
          ) : (
            <div className="w-full max-w-7xl mx-auto h-full flex flex-col">
              <div className="flex justify-end mb-4 flex-shrink-0">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  <NewDocumentIcon />
                  Process New Document
                </button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow min-h-0">
                <div className="lg:col-span-2 min-h-0">
                  <DocumentViewer
                    filePreviewUrl={filePreview}
                    fileName={fileName}
                    extractedData={extractedData}
                    highlightedFieldIndex={highlightedFieldIndex}
                    setHighlightedFieldIndex={setHighlightedFieldIndex}
                  />
                </div>
                <div className="lg:col-span-1 min-h-0">
                  <DataExtractor
                    isLoading={isLoading}
                    error={error}
                    extractedData={extractedData}
                    onExtract={handleExtract}
                    onDataUpdate={handleDataUpdate}
                    onKeyUpdate={handleKeyUpdate}
                    isViewingHistory={isViewingHistory}
                    onHighlight={setHighlightedFieldIndex}
                    highlightedFieldIndex={highlightedFieldIndex}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
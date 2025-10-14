export interface Vertex {
  x: number; // Normalized coordinate (0 to 1)
  y: number; // Normalized coordinate (0 to 1)
}

export interface ExtractedField {
  key: string;
  value: string;
  keyBoundingBox: Vertex[];   // Bounding box for the extracted key
  valueBoundingBox: Vertex[]; // Bounding box for the extracted value
}

export interface ExtractedData {
  documentType: string;
  summary: string;
  extractedFields: ExtractedField[];
}

export interface HistoryItem {
  id: number; // Using timestamp for simplicity
  fileName: string;
  filePreviewUrl: string; // This will be a base64 data URL for persistence
  extractedData: ExtractedData;
  processedAt: string; // ISO string for display
}

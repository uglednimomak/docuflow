import React, { useState, useRef, useEffect } from 'react';
import type { ExtractedData, Vertex } from '../types';

interface DocumentViewerProps {
  filePreviewUrl: string;
  fileName: string;
  extractedData: ExtractedData | null;
  highlightedFieldIndex: number | null;
  setHighlightedFieldIndex: (index: number | null) => void;
}

export default function DocumentViewer({ filePreviewUrl, fileName, extractedData, highlightedFieldIndex, setHighlightedFieldIndex }: DocumentViewerProps): React.ReactElement {
    const imgRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });

    const updateDimensions = () => {
        if (imgRef.current) {
            setImgDimensions({
                width: imgRef.current.offsetWidth,
                height: imgRef.current.offsetHeight
            });
        }
    };

    useEffect(() => {
        const imgElement = imgRef.current;
        if (!imgElement) return;

        // Use ResizeObserver for more reliable dimension tracking
        const observer = new ResizeObserver(() => {
            updateDimensions();
        });
        observer.observe(imgElement);

        return () => {
            observer.unobserve(imgElement);
        };
    }, []);
    
    const handleImageLoad = () => {
        updateDimensions();
    };


    const convertPointsToString = (points: Vertex[]) => {
        if (!imgDimensions.width || !imgDimensions.height || !points) return '';
        return points.map(p => `${p.x * imgDimensions.width},${p.y * imgDimensions.height}`).join(' ');
    }

    const highlightClasses = 'fill-indigo-500/50 stroke-indigo-400 stroke-2';
    const defaultClasses = 'fill-transparent stroke-transparent hover:fill-indigo-500/30';
    const polygonBaseClasses = 'transition-all duration-200 pointer-events-auto cursor-pointer';

    return (
        <div className="bg-slate-800/50 rounded-lg shadow-lg h-full flex flex-col border border-slate-700">
            <div className="p-4 border-b border-slate-700 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white truncate">{fileName}</h2>
            </div>
            <div ref={containerRef} className="p-4 flex-grow flex items-center justify-center min-h-0 overflow-auto">
                <div className="relative inline-block">
                    <img
                        ref={imgRef}
                        key={filePreviewUrl} // Force re-render and onLoad for history items
                        src={filePreviewUrl}
                        alt="Document preview"
                        className="max-w-full max-h-full object-contain rounded-md"
                        onLoad={handleImageLoad}
                    />
                    {extractedData && imgDimensions.width > 0 && (
                        <svg
                            className="absolute top-0 left-0"
                            style={{ width: imgDimensions.width, height: imgDimensions.height }}
                        >
                            {extractedData.extractedFields.map((field, index) => (
                                <g key={index}>
                                    {field.keyBoundingBox && field.keyBoundingBox.length > 0 && (
                                        <polygon
                                            points={convertPointsToString(field.keyBoundingBox)}
                                            onMouseEnter={() => setHighlightedFieldIndex(index)}
                                            onMouseLeave={() => setHighlightedFieldIndex(null)}
                                            className={`${polygonBaseClasses} ${
                                                highlightedFieldIndex === index ? highlightClasses : defaultClasses
                                            }`}
                                        />
                                    )}
                                    {field.valueBoundingBox && field.valueBoundingBox.length > 0 && (
                                        <polygon
                                            points={convertPointsToString(field.valueBoundingBox)}
                                            onMouseEnter={() => setHighlightedFieldIndex(index)}
                                            onMouseLeave={() => setHighlightedFieldIndex(null)}
                                            className={`${polygonBaseClasses} ${
                                                highlightedFieldIndex === index ? highlightClasses : defaultClasses
                                            }`}
                                        />
                                    )}
                                </g>
                            ))}
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
}
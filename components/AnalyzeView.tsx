import React, { useState, useRef } from 'react';
import { analyzePlantImage } from '../services/gemini';
import { savePlant } from '../services/garden';
import { MarkdownContent } from './MarkdownContent';
import { LoadingSpinner } from './LoadingSpinner';
import { GardenPlant } from '../types';

export const AnalyzeView: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalysisResult(null);
    setSaved(false);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setSelectedImage(base64String);
      setMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !mimeType) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setSaved(false);

    try {
        const base64Data = selectedImage.split(',')[1];
        const text = await analyzePlantImage(base64Data, mimeType);
        if (text) {
          setAnalysisResult(text);
        } else {
            setAnalysisResult("Could not identify the plant. Please try a clearer photo.");
        }
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisResult("Error analyzing image. Please check your connection and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveToGarden = () => {
    if (!selectedImage || !analysisResult) return;

    // Attempt to extract name from markdown
    const nameMatch = analysisResult.match(/\*\*Plant Name\*\*.*?:?\s*(.*?)(\n|$)/i);
    const plantName = nameMatch ? nameMatch[1].trim() : "New Plant";

    const newPlant: GardenPlant = {
      id: Date.now().toString(),
      name: plantName,
      image: selectedImage,
      addedDate: new Date().toISOString(),
      careInfo: analysisResult,
      logs: [],
      reminder: {
        enabled: false,
        frequencyDays: 7,
        reminderTime: "09:00"
      }
    };

    savePlant(newPlant);
    setSaved(true);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setMimeType('');
    setSaved(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full bg-white rounded-xl shadow-sm border border-slate-100 overflow-y-auto">
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-emerald-900">Plant Identifier</h2>
          <p className="text-slate-500">Upload a photo to get instant ID and care tips</p>
        </div>

        {/* Upload Area */}
        {!selectedImage && (
          <div 
            className="border-2 border-dashed border-emerald-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-emerald-50/50 hover:bg-emerald-50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileSelect}
            />
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-emerald-800 font-medium">Click to upload photo</p>
            <p className="text-emerald-600/70 text-sm mt-1">JPG, PNG supported</p>
          </div>
        )}

        {/* Image Preview & Actions */}
        {selectedImage && (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200">
               <img 
                 src={selectedImage} 
                 alt="Plant preview" 
                 className="w-full max-h-96 object-cover"
               />
               {!isAnalyzing && !analysisResult && (
                 <button 
                    onClick={handleClear}
                    className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                    title="Remove image"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
                   </svg>
                 </button>
               )}
            </div>

            {!analysisResult && !isAnalyzing && (
              <button
                onClick={handleAnalyze}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                   <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                   <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clipRule="evenodd" />
                </svg>
                Identify Plant
              </button>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center py-8">
                <LoadingSpinner />
                <p className="text-emerald-700 font-medium mt-3 animate-pulse">Analyzing leaf patterns...</p>
              </div>
            )}
          </div>
        )}

        {/* Results Area */}
        {analysisResult && (
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 shadow-sm animate-fade-in">
             <div className="flex justify-between items-start mb-4">
                 <div className="flex items-center gap-2 text-emerald-700">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                       <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm4.45 4.815a.75.75 0 00-1.12-1.04l-3.5 3.774a.75.75 0 00-.02.998l2.06 2.316a.75.75 0 101.124-1.002l-1.464-1.646 2.92-3.15z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Identification Complete</span>
                 </div>
                 <div className="flex gap-2">
                    {!saved ? (
                      <button
                        onClick={handleSaveToGarden}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                        </svg>
                        Add to Garden
                      </button>
                    ) : (
                      <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-lg flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                        </svg>
                        Saved
                      </span>
                    )}
                 </div>
             </div>
             <div className="bg-white rounded-xl p-4 border border-emerald-100/50">
               <MarkdownContent content={analysisResult} />
             </div>
             
             <div className="mt-4 flex justify-center">
                <button 
                   onClick={handleClear}
                   className="text-sm text-slate-500 hover:text-emerald-600 underline"
                 >
                   Analyze New Photo
                 </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

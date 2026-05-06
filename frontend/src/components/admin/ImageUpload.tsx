import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../../services/imgbb';
import imageCompression from 'browser-image-compression';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
  compact?: boolean;
  multiple?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, label = 'Upload Image', compact = false, multiple = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [shouldCompress, setShouldCompress] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    
    try {
      // If single upload, show local preview
      if (!multiple && files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(files[0]);
      }

      for (const originalFile of files) {
        let fileToUpload = originalFile;
        if (shouldCompress && originalFile.type.startsWith('image/')) {
          const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
          };
          try {
            fileToUpload = await imageCompression(originalFile, options);
          } catch (error) {
            console.warn('Compression failed, using original file', error);
          }
        }

        const url = await uploadImage(fileToUpload);
        onUploadSuccess(url);
      }
      
      if (compact) setPreview(null);
    } catch {
      alert('Upload failed. Please check your API key or connection.');
      setPreview(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  if (compact) {
    return (
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full h-full rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all group overflow-hidden ${isUploading ? 'pointer-events-none' : ''}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-1">
            <Loader2 size={16} className="text-accent animate-spin" />
            <span className="text-[8px] font-black text-accent uppercase">Uploading...</span>
          </div>
        ) : (
          <>
            <Upload size={16} className="text-gray-400 group-hover:text-accent" />
            <span className="text-[8px] font-black text-gray-400 uppercase mt-1 group-hover:text-accent">Add Multiple</span>
          </>
        )}
        <div className="absolute bottom-1 left-0 right-0 flex justify-center z-10" onClick={e => e.stopPropagation()}>
          <label className="flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full text-[8px] font-bold text-primary shadow-sm cursor-pointer border border-gray-100 hover:bg-gray-50 transition-colors">
            <input 
              type="checkbox" 
              checked={shouldCompress} 
              onChange={e => setShouldCompress(e.target.checked)} 
              className="w-2.5 h-2.5 accent-accent"
            />
            Compress
          </label>
        </div>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
          multiple={multiple}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-black text-primary uppercase tracking-widest">{label}</label>
        <label className="flex items-center gap-2 cursor-pointer group">
          <span className="text-[10px] font-bold text-muted group-hover:text-primary transition-colors uppercase tracking-widest">Compress Image</span>
          <div className="relative">
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={shouldCompress} 
              onChange={e => setShouldCompress(e.target.checked)}
            />
            <div className={`block w-8 h-5 rounded-full transition-colors ${shouldCompress ? 'bg-accent' : 'bg-gray-300'}`}></div>
            <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${shouldCompress ? 'translate-x-3' : ''}`}></div>
          </div>
        </label>
      </div>
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative aspect-video rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-accent hover:bg-accent/5 transition-all group overflow-hidden ${isUploading ? 'pointer-events-none' : ''}`}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-accent group-hover:bg-white transition-all shadow-sm">
              <Upload size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-primary">Click to upload</p>
              <p className="text-[10px] text-muted font-medium">PNG, JPG up to 10MB</p>
            </div>
          </>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
            <Loader2 size={32} className="text-accent animate-spin" />
            <p className="text-xs font-black text-accent uppercase tracking-widest">Uploading Assets...</p>
          </div>
        )}

        {preview && !isUploading && (
          <button 
            onClick={(e) => { e.stopPropagation(); setPreview(null); }}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
        multiple={multiple}
      />
    </div>
  );
};

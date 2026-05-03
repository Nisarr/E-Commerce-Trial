import React, { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage } from '../../services/imgbb';

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
  compact?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadSuccess, label = 'Upload Image', compact = false }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const url = await uploadImage(file);
      onUploadSuccess(url);
      if (compact) setPreview(null); // Clear preview for multiple uploads
    } catch (error) {
      alert('Upload failed. Please check your API key or connection.');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  if (compact) {
    return (
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full h-full rounded-xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-accent hover:bg-accent/5 transition-all group overflow-hidden ${isUploading ? 'pointer-events-none' : ''}`}
      >
        {isUploading ? (
          <Loader2 size={16} className="text-accent animate-spin" />
        ) : (
          <Upload size={16} className="text-gray-400 group-hover:text-accent" />
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="image/*"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-primary uppercase tracking-widest">{label}</label>
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
            <p className="text-xs font-black text-accent uppercase tracking-widest">Uploading...</p>
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
      />
    </div>
  );
};

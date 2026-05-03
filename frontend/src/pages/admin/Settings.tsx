import React, { useState } from 'react';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { CheckCircle, Copy, ExternalLink } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const copyToClipboard = () => {
    if (uploadedUrl) {
      navigator.clipboard.writeText(uploadedUrl);
      alert('URL copied to clipboard!');
    }
  };

  return (
    <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-gray-100">
        <h2 className="text-2xl font-black text-primary mb-2">Image Storage (ImgBB)</h2>
        <p className="text-muted font-medium mb-8">Test your ImgBB integration here. Upload an image to get a permanent URL.</p>

        <div className="space-y-6">
          <ImageUpload 
            label="Test Upload" 
            onUploadSuccess={(url) => setUploadedUrl(url)} 
          />

          {uploadedUrl && (
            <div className="p-6 bg-green-50 rounded-2xl border border-green-100 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-3 text-green-600 mb-4">
                <CheckCircle size={20} />
                <span className="font-black text-xs uppercase tracking-widest">Upload Successful!</span>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={uploadedUrl} 
                  className="flex-grow bg-white border border-green-200 rounded-xl px-4 py-3 text-sm font-medium text-primary focus:outline-none"
                />
                <button 
                  onClick={copyToClipboard}
                  className="p-3 bg-white border border-green-200 text-green-600 rounded-xl hover:bg-green-100 transition-colors shadow-sm"
                >
                  <Copy size={20} />
                </button>
                <a 
                  href={uploadedUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors shadow-lg"
                >
                  <ExternalLink size={20} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100">
        <h3 className="text-lg font-black text-amber-800 mb-2">Technical Information</h3>
        <p className="text-sm font-medium text-amber-700/80 leading-relaxed">
          Your images are currently being uploaded to ImgBB using the API key provided in your environment variables. 
          The URLs returned are high-quality, permanent links that can be used directly in your products and banners.
        </p>
      </div>
    </div>
  );
};

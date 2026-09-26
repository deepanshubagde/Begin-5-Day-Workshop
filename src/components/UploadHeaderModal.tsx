import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  AlertCircle,
  RotateCcw,
  Link as LinkIcon,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';

interface UploadHeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHeaderUrl: string;
  onSaveHeaderImage: (imageUrl: string, fitMode?: 'cover' | 'contain') => Promise<boolean>;
  onResetHeaderImage: () => Promise<boolean>;
  currentFitMode?: 'cover' | 'contain';
}

export const UploadHeaderModal: React.FC<UploadHeaderModalProps> = ({
  isOpen,
  onClose,
  currentHeaderUrl,
  onSaveHeaderImage,
  onResetHeaderImage,
  currentFitMode = 'cover',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentHeaderUrl || '/api/header-image');
  const [urlInput, setUrlInput] = useState<string>('');
  const [fitMode, setFitMode] = useState<'cover' | 'contain'>(currentFitMode);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentHeaderUrl || '/api/header-image');
      setFitMode(currentFitMode);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [isOpen, currentHeaderUrl, currentFitMode]);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }

    // Validate size (max 15MB)
    if (file.size > 15 * 1024 * 1024) {
      setErrorMessage('Image size is too large (max 15MB). Please choose a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setPreviewUrl(result);
        setSuccessMessage(`Loaded "${file.name}" (${(file.size / 1024).toFixed(1)} KB)`);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMessage('Please enter an image URL.');
      return;
    }
    setErrorMessage(null);
    setPreviewUrl(urlInput.trim());
    setSuccessMessage('Image URL applied to preview!');
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const ok = await onSaveHeaderImage(previewUrl, fitMode);
      if (ok) {
        setSuccessMessage('Header image saved successfully!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMessage('Failed to save header image. Please try again.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error saving image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset the header to the default Google Form banner?')) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const ok = await onResetHeaderImage();
      if (ok) {
        setPreviewUrl('/form-header.png');
        setFitMode('cover');
        setSuccessMessage('Reverted to default header image!');
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        setErrorMessage('Failed to reset image.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error resetting image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Upload Header Image
              </h3>
              <p className="text-xs text-stone-500">
                Customize the top banner for your assessment form
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Live Preview Container */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-stone-400" />
                <span>Live Banner Preview</span>
              </span>
              <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg border border-stone-200 text-[11px] font-medium">
                <button
                  type="button"
                  onClick={() => setFitMode('cover')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    fitMode === 'cover'
                      ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Cover
                </button>
                <button
                  type="button"
                  onClick={() => setFitMode('contain')}
                  className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                    fitMode === 'contain'
                      ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Contain
                </button>
              </div>
            </div>

            <div className="w-full aspect-[1884/469] max-h-[160px] rounded-2xl overflow-hidden bg-stone-900/90 border border-stone-300 shadow-inner flex items-center justify-center relative">
              <img
                src={previewUrl}
                alt="Header Preview"
                className={`w-full h-full transition-all duration-200 ${
                  fitMode === 'cover' ? 'object-cover object-center' : 'object-contain object-center'
                }`}
                onError={() => {
                  setErrorMessage('Could not load image from the provided source.');
                }}
              />
            </div>
            <p className="text-[11px] text-stone-400 text-center">
              Recommended banner aspect ratio: ~4:1 (e.g. 1884 x 469 px or 1200 x 300 px)
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-stone-200">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload from Device</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold border-b-2 flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                activeTab === 'url'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Image URL</span>
            </button>
          </div>

          {/* Tab 1: File Upload */}
          {activeTab === 'upload' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                  : 'border-stone-300 hover:border-emerald-400 bg-stone-50/50 hover:bg-stone-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-stone-800">
                Click to browse or drag & drop header image
              </p>
              <p className="text-xs text-stone-500 mt-1">
                PNG, JPG, WEBP, or SVG (up to 15MB)
              </p>
            </div>
          )}

          {/* Tab 2: URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-stone-700">
                Direct Image Link
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/banner.png"
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Preview
                </button>
              </div>
            </div>
          )}

          {/* Status feedback */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-stone-100 bg-stone-50/80 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-800 hover:bg-stone-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply Header Image</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

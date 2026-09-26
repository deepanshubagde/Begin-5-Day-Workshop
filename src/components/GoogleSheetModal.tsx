import React, { useState } from 'react';
import { APPS_SCRIPT_TEMPLATE } from '../data/questions';
import { X, Copy, Check, ExternalLink, Sheet, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface GoogleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookUrl: string;
  onSaveUrl: (url: string) => Promise<boolean>;
}

export const GoogleSheetModal: React.FC<GoogleSheetModalProps> = ({
  isOpen,
  onClose,
  webhookUrl,
  onSaveUrl,
}) => {
  const [urlInput, setUrlInput] = useState(webhookUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_TEMPLATE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const ok = await onSaveUrl(urlInput.trim());
      if (ok) {
        setSaveStatus('success');
        setStatusMessage('Google Sheet Webhook URL updated successfully!');
      } else {
        setSaveStatus('error');
        setStatusMessage('Could not save configuration. Check server status.');
      }
    } catch (err: any) {
      setSaveStatus('error');
      setStatusMessage(err.message || 'Error saving URL');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Google Sheets Integration
              </h3>
              <p className="text-xs text-stone-500">
                Direct synchronization for form submissions
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

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto">
          {/* Status banner */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-emerald-950 space-y-1">
              <p className="font-semibold">Backend Ready for Your Google Sheet</p>
              <p className="text-emerald-800 leading-relaxed">
                All submissions are stored securely. When you provide the Google Sheet Webhook URL,
                submissions will automatically populate into your sheet columns in real-time.
              </p>
            </div>
          </div>

          {/* Webhook URL Input */}
          <form onSubmit={handleSave} className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Google Apps Script Web App URL
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-xs sm:text-sm text-stone-900 font-mono outline-none"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save URL'}
              </button>
            </div>
            {saveStatus === 'success' && (
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>{statusMessage}</span>
              </p>
            )}
            {saveStatus === 'error' && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{statusMessage}</span>
              </p>
            )}
          </form>

          {/* 3-Step Setup Guide */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <h4 className="text-sm font-semibold text-stone-900 flex items-center justify-between">
              <span>Quick 3-Minute Setup Instructions</span>
              <a
                href="https://sheets.new"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                Create new Google Sheet <ExternalLink className="w-3 h-3" />
              </a>
            </h4>

            <ol className="space-y-2.5 text-xs text-stone-600 list-decimal pl-4 leading-relaxed">
              <li>
                Open your Google Sheet and click{' '}
                <strong className="text-stone-800">Extensions &gt; Apps Script</strong>.
              </li>
              <li>
                Delete any code in the editor, and click the copy button below to paste our script:
              </li>
            </ol>

            {/* Script Code Block */}
            <div className="relative rounded-2xl bg-stone-900 text-stone-100 p-4 font-mono text-[11px] overflow-hidden">
              <button
                type="button"
                onClick={handleCopy}
                className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs transition-colors cursor-pointer border border-stone-700"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-sans">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="font-sans">Copy Script</span>
                  </>
                )}
              </button>
              <pre className="overflow-x-auto max-h-48 pr-20 whitespace-pre">
                {APPS_SCRIPT_TEMPLATE}
              </pre>
            </div>

            <ol start={3} className="space-y-2 text-xs text-stone-600 list-decimal pl-4 leading-relaxed">
              <li>
                Click <strong className="text-stone-800">Deploy &gt; New deployment</strong>. Select{' '}
                <strong className="text-stone-800">Web app</strong>.
              </li>
              <li>
                Set <em>Execute as</em>: <strong className="text-stone-800">Me</strong> and{' '}
                <em>Who has access</em>: <strong className="text-stone-800">Anyone</strong>.
              </li>
              <li>
                Click <strong className="text-stone-800">Deploy</strong>, copy the Web App URL, and paste it into the field above!
              </li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

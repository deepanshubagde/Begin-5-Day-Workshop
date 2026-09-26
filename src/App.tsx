/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FormData, SubmissionRecord } from './types/form';
import { INITIAL_FORM_DATA } from './data/questions';
import { BannerHeader } from './components/BannerHeader';
import { QuestionCard } from './components/QuestionCard';
import { AchieveCheckboxes } from './components/AchieveCheckboxes';
import { SuccessView } from './components/SuccessView';
import { GoogleSheetModal } from './components/GoogleSheetModal';
import { SubmissionsDrawer } from './components/SubmissionsDrawer';
import { UploadHeaderModal } from './components/UploadHeaderModal';
import {
  Send,
  Sparkles,
  AlertCircle,
  Phone,
  User,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'advance_manifestation_draft_v1';
const SUBMISSIONS_STORAGE_KEY = 'advance_manifestation_submissions_v1';
const HEADER_IMG_STORAGE_KEY = 'advance_manifestation_header_img_v1';
const HEADER_FIT_STORAGE_KEY = 'advance_manifestation_header_fit_v1';

export default function App() {
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading draft:', e);
    }
    return INITIAL_FORM_DATA;
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData | 'general', string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<SubmissionRecord | null>(null);

  // Modals & Drawers
  const [isSheetModalOpen, setIsSheetModalOpen] = useState(false);
  const [isSubmissionsDrawerOpen, setIsSubmissionsDrawerOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Header Image State - strictly default to the clean custom-header banner
  const [headerImageUrl, setHeaderImageUrl] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(HEADER_IMG_STORAGE_KEY);
      if (
        saved &&
        !saved.includes('googleusercontent.com') &&
        !saved.includes('form-header')
      ) {
        return saved;
      }
    } catch {}
    return '/custom-header.png';
  });

  const [headerFitMode, setHeaderFitMode] = useState<'cover' | 'contain'>(() => {
    try {
      const saved = localStorage.getItem(HEADER_FIT_STORAGE_KEY);
      if (saved === 'contain' || saved === 'cover') return saved;
    } catch {}
    return 'cover';
  });

  const [submissionsList, setSubmissionsList] = useState<SubmissionRecord[]>(() => {
    try {
      const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Google Sheet Webhook URL
  const [sheetWebhookUrl, setSheetWebhookUrl] = useState<string>(
    'https://script.google.com/macros/s/AKfycbxpi8z5usCBwIThD8SAg1KmUkqWr1t6mQZyrZlf-EQBoBDdfnCOFJiHfLqirNhyj3et/exec'
  );

  // Fetch initial config and submissions from server
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.googleSheetWebhookUrl) {
          setSheetWebhookUrl(data.googleSheetWebhookUrl);
        }
        if (data && data.headerImageUrl) {
          const cleanUrl =
            data.headerImageUrl.includes('googleusercontent.com') ||
            data.headerImageUrl.includes('form-header')
              ? '/custom-header.png'
              : data.headerImageUrl;
          setHeaderImageUrl(cleanUrl);
          try {
            localStorage.setItem(HEADER_IMG_STORAGE_KEY, cleanUrl);
          } catch {}
        }
      })
      .catch((err) => console.log('Notice: running standalone mode or server loading:', err));

    fetch('/api/submissions')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.submissions) && data.submissions.length > 0) {
          setSubmissionsList(data.submissions);
        }
      })
      .catch(() => {});
  }, []);

  // Auto-save draft on changes (when not submitted)
  useEffect(() => {
    if (!isSubmitted) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData));
      } catch (e) {
        console.error('Error saving draft:', e);
      }
    }
  }, [formData, isSubmitted]);

  // Compute completed required questions
  const totalRequired = 6;
  const completedCount = [
    formData.fullName.trim().length > 0,
    formData.contactNumber.trim().length > 0,
    formData.city.trim().length > 0,
    formData.achieveSoonest.length > 0,
    formData.challenges.trim().length > 0,
    formData.expectations.trim().length > 0,
  ].filter(Boolean).length;

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | 'general', string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your Full Name';
    }

    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Please enter your Contact Number';
    } else if (formData.contactNumber.trim().replace(/\D/g, '').length < 7) {
      newErrors.contactNumber = 'Please enter a valid phone number';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Please enter your current City';
    }

    if (formData.achieveSoonest.length === 0) {
      newErrors.achieveSoonest = 'Please select at least one goal you want to achieve';
    } else if (formData.achieveSoonest.includes('Other') && !formData.otherAchieve.trim()) {
      newErrors.achieveSoonest = 'Please specify what you would like to achieve in the Other field';
    }

    if (!formData.challenges.trim()) {
      newErrors.challenges = 'Please mention any challenges you are facing';
    }

    if (!formData.expectations.trim()) {
      newErrors.expectations = 'Please share your expectations from this program';
    }

    setErrors(newErrors);

    // Scroll to the first field that has an error
    const errorKeys = Object.keys(newErrors) as (keyof FormData)[];
    if (errorKeys.length > 0) {
      const firstErrorId = `q-card-${errorKeys[0]}`;
      const elem = document.getElementById(firstErrorId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const submissionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toLocaleString();

    let syncedToSheet = false;

    // 1. Try server backend submit
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.sheetSynced) {
          syncedToSheet = true;
        }
      }
    } catch (err) {
      console.warn('Backend proxy submission note:', err);
    }

    // 2. Client-side direct fallback to Google Apps Script (mode: 'no-cors' like reflect.monkhood.in)
    if (sheetWebhookUrl && sheetWebhookUrl.startsWith('https://script.google.com')) {
      try {
        const clientPayload = {
          timestamp,
          submissionId,
          fullName: formData.fullName,
          contactNumber: formData.contactNumber,
          city: formData.city,
          achieveSoonest:
            formData.achieveSoonest.join(', ') +
            (formData.otherAchieve ? ` (Other: ${formData.otherAchieve})` : ''),
          challenges: formData.challenges,
          expectations: formData.expectations,
          additionalInfo: formData.additionalInfo,
        };

        const postPromise = fetch(sheetWebhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          cache: 'no-cache',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(clientPayload),
        });

        await Promise.race([postPromise, new Promise((resolve) => setTimeout(resolve, 1500))]);
        syncedToSheet = true;
      } catch (e) {
        console.warn('Direct Google Sheet Webhook ping notice:', e);
      }
    }

    // 3. Store record in local state and localStorage
    const newRecord: SubmissionRecord = {
      ...formData,
      id: submissionId,
      submittedAt: timestamp,
      syncedToSheet,
    };

    setSubmittedRecord(newRecord);
    setSubmissionsList((prev) => {
      const updated = [newRecord, ...prev];
      try {
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Clear saved draft
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}

    setIsSubmitting(false);
    setIsSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    setIsSubmitted(false);
    setSubmittedRecord(null);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveWebhookUrl = async (newUrl: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleSheetWebhookUrl: newUrl }),
      });
      if (res.ok) {
        setSheetWebhookUrl(newUrl);
        return true;
      }
    } catch {
      // Local fallback
      setSheetWebhookUrl(newUrl);
      return true;
    }
    return false;
  };

  const handleSaveHeaderImage = async (
    imageUrl: string,
    fitMode: 'cover' | 'contain' = 'cover'
  ): Promise<boolean> => {
    setHeaderImageUrl(imageUrl);
    setHeaderFitMode(fitMode);
    try {
      localStorage.setItem(HEADER_IMG_STORAGE_KEY, imageUrl);
      localStorage.setItem(HEADER_FIT_STORAGE_KEY, fitMode);
    } catch {}

    // Save to server backend
    try {
      const res = await fetch('/api/upload-header', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: imageUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.headerImageUrl) {
          setHeaderImageUrl(data.headerImageUrl);
          try {
            localStorage.setItem(HEADER_IMG_STORAGE_KEY, data.headerImageUrl);
          } catch {}
        }
      }
    } catch (e) {
      console.warn('Backend sync note for header image:', e);
    }
    return true;
  };

  const handleResetHeaderImage = async (): Promise<boolean> => {
    setHeaderImageUrl('');
    setHeaderFitMode('cover');
    try {
      localStorage.removeItem(HEADER_IMG_STORAGE_KEY);
      localStorage.removeItem(HEADER_FIT_STORAGE_KEY);
    } catch {}

    try {
      await fetch('/api/reset-header', { method: 'POST' });
    } catch (e) {
      console.warn('Server reset header error:', e);
    }
    return true;
  };

  const handleFileDropOnBanner = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        handleSaveHeaderImage(result, headerFitMode);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-amber-50/20 to-stone-100/60 font-sans flex flex-col justify-start py-3 sm:py-8 px-2 sm:px-6 relative overflow-x-hidden selection:bg-orange-200 selection:text-orange-950">
      {/* Serene Ambient Atmosphere - Warm Saffron & Sunset Orbs */}
      <div className="fixed top-8 left-1/4 w-[420px] h-[420px] bg-gradient-to-tr from-orange-300/30 to-amber-200/30 rounded-full filter blur-3xl pointer-events-none -z-10 animate-pulse-slow" />
      <div className="fixed bottom-12 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-amber-300/25 to-orange-400/20 rounded-full filter blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-100/40 rounded-full filter blur-3xl pointer-events-none -z-10" />

      {/* Main Single-Page Glass Container */}
      <main className="w-full max-w-2xl mx-auto my-auto">
        <div className="glass-panel rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border border-orange-200/50">
          {/* Header Banner */}
          <BannerHeader
            completedCount={completedCount}
            totalRequired={totalRequired}
            headerImageUrl={headerImageUrl}
            fitMode={headerFitMode}
          />

          {/* Conditional Rendering: Success Screen OR Form Screen */}
          {isSubmitted && submittedRecord ? (
            <SuccessView
              formData={submittedRecord}
              submissionId={submittedRecord.id}
              syncedToSheet={submittedRecord.syncedToSheet}
              onReset={handleReset}
            />
          ) : (
            <form onSubmit={handleSubmit} noValidate className="p-3.5 sm:p-8 space-y-4 sm:space-y-5">
              {/* General Form Error Alert */}
              {Object.keys(errors).length > 0 && (
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 text-xs sm:text-sm flex items-start gap-2.5 sm:gap-3 shadow-2xs animate-fadeIn">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">
                    <span className="font-semibold">Incomplete Fields: </span>
                    <span>Please fill in all required questions marked with an asterisk (*).</span>
                  </div>
                </div>
              )}

              {/* [Q1] Full Name */}
              <QuestionCard
                id="q-card-fullName"
                number={1}
                title="Full Name"
                required
                error={errors.fullName}
              >
                <div className="relative">
                  <User className="w-4 h-4 text-orange-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Your answer"
                    autoComplete="name"
                    className="w-full pl-9 pr-4 py-2.5 sm:py-2.5 rounded-xl border border-orange-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-orange-50/20 hover:bg-orange-50/40 focus:bg-white text-stone-900 placeholder:text-stone-400 outline-none transition-all text-base sm:text-base font-normal shadow-2xs touch-manipulation"
                  />
                </div>
              </QuestionCard>

              {/* [Q2] Contact Number */}
              <QuestionCard
                id="q-card-contactNumber"
                number={2}
                title="Contact Number"
                required
                error={errors.contactNumber}
              >
                <div className="relative">
                  <Phone className="w-4 h-4 text-orange-400 absolute left-3 top-3.5" />
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    placeholder="Your contact / WhatsApp number"
                    autoComplete="tel"
                    className="w-full pl-9 pr-4 py-2.5 sm:py-2.5 rounded-xl border border-orange-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-orange-50/20 hover:bg-orange-50/40 focus:bg-white text-stone-900 placeholder:text-stone-400 outline-none transition-all text-base sm:text-base font-normal font-mono shadow-2xs touch-manipulation"
                  />
                </div>
              </QuestionCard>

              {/* [Q3] City */}
              <QuestionCard
                id="q-card-city"
                number={3}
                title="City"
                required
                error={errors.city}
              >
                <div className="relative">
                  <MapPin className="w-4 h-4 text-orange-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Your answer"
                    autoComplete="address-level2"
                    className="w-full pl-9 pr-4 py-2.5 sm:py-2.5 rounded-xl border border-orange-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-orange-50/20 hover:bg-orange-50/40 focus:bg-white text-stone-900 placeholder:text-stone-400 outline-none transition-all text-base sm:text-base font-normal shadow-2xs touch-manipulation"
                  />
                </div>
              </QuestionCard>

              {/* [Q4] What do you want to Achieve Soonest (Checkboxes) */}
              <QuestionCard
                id="q-card-achieveSoonest"
                number={4}
                title="What do you want to Achieve Soonest"
                hindiTitle="आप सबसे जल्द क्या सच करना चाहते हैं ?"
                subtitle="Select all options that apply to you"
                required
                error={errors.achieveSoonest}
              >
                <AchieveCheckboxes
                  selected={formData.achieveSoonest}
                  otherText={formData.otherAchieve}
                  onChange={(selected) => handleInputChange('achieveSoonest', selected)}
                  onOtherTextChange={(text) => handleInputChange('otherAchieve', text)}
                  hasError={Boolean(errors.achieveSoonest)}
                />
              </QuestionCard>

              {/* [Q5] Are there any challenges you’re currently facing? */}
              <QuestionCard
                id="q-card-challenges"
                number={5}
                title="Are there any challenges you’re currently facing?"
                subtitle="(Like Stress, Anxiety, Overthinking, Fear etc.. )  Please Mention Below"
                hindiTitle="क्या आप वर्तमान में किसी चुनौती का सामना कर रहे हैं? (जैसे तनाव, चिंता, अधिक सोच-विचार, भय आदि..) कृपया नीचे उल्लेख करें।"
                required
                error={errors.challenges}
              >
                <input
                  type="text"
                  name="challenges"
                  value={formData.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  placeholder="Your answer"
                  className="w-full px-4 py-2.5 sm:py-2.5 rounded-xl border border-orange-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-orange-50/20 hover:bg-orange-50/40 focus:bg-white text-stone-900 placeholder:text-stone-400 outline-none transition-all text-base sm:text-base font-normal shadow-2xs touch-manipulation"
                />
              </QuestionCard>

              {/* [Q6] Expectations from this program */}
              <QuestionCard
                id="q-card-expectations"
                number={6}
                title="What are your expectations from this program, and what specific changes, results, or transformation would you like to experience by the end of this journey?"
                required
                error={errors.expectations}
              >
                <textarea
                  name="expectations"
                  rows={3}
                  value={formData.expectations}
                  onChange={(e) => handleInputChange('expectations', e.target.value)}
                  placeholder="Your answer"
                  className="w-full p-3.5 rounded-xl border border-orange-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-orange-50/20 hover:bg-orange-50/40 focus:bg-white text-stone-900 placeholder:text-stone-400 outline-none transition-all text-base sm:text-base font-normal resize-y min-h-[96px] shadow-2xs touch-manipulation"
                />
              </QuestionCard>

              {/* [Q7] Anything else to know (Optional) */}
              <QuestionCard
                id="q-card-additionalInfo"
                number={7}
                title="Is there anything you would like us to know about you, your current situation or challenges ? (Your information is safe with us)"
                subtitle="Optional • Confidential"
              >
                <textarea
                  name="additionalInfo"
                  rows={3}
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  placeholder="Your answer (optional)"
                  className="w-full p-3.5 rounded-xl border border-orange-200/80 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 bg-orange-50/20 hover:bg-orange-50/40 focus:bg-white text-stone-900 placeholder:text-stone-400 outline-none transition-all text-base sm:text-base font-normal resize-y min-h-[96px] shadow-2xs touch-manipulation"
                />
              </QuestionCard>

              {/* Form Action Buttons */}
              <div className="pt-3 sm:pt-4 flex items-center justify-center border-t border-orange-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:via-amber-600 hover:to-orange-700 active:scale-[0.98] text-white font-semibold text-base transition-all duration-200 shadow-md hover:shadow-xl shadow-orange-500/25 hover:shadow-orange-500/35 border border-orange-400/40 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer min-h-[50px] touch-manipulation"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Recording Reflection...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 shrink-0" />
                      <span>Submit Reflection</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 mb-4 text-center text-xs text-stone-400 space-y-1">
        <p>Advanced Mindful Manifestation Workshop • &copy; Monkhood</p>
      </footer>

      {/* Google Sheets Setup Modal */}
      <GoogleSheetModal
        isOpen={isSheetModalOpen}
        onClose={() => setIsSheetModalOpen(false)}
        webhookUrl={sheetWebhookUrl}
        onSaveUrl={handleSaveWebhookUrl}
      />

      {/* Submissions History Drawer */}
      <SubmissionsDrawer
        isOpen={isSubmissionsDrawerOpen}
        onClose={() => setIsSubmissionsDrawerOpen(false)}
        submissions={submissionsList}
      />

      {/* Header Image Upload & Customization Modal */}
      <UploadHeaderModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentHeaderUrl={headerImageUrl}
        currentFitMode={headerFitMode}
        onSaveHeaderImage={handleSaveHeaderImage}
        onResetHeaderImage={handleResetHeaderImage}
      />
    </div>
  );
}

import React from 'react';
import { FormData } from '../types/form';
import { CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface SuccessViewProps {
  formData: FormData;
  submissionId: string;
  syncedToSheet?: boolean;
  onReset: () => void;
}

export const SuccessView: React.FC<SuccessViewProps> = ({
  onReset,
}) => {
  return (
    <div className="p-4 sm:p-10 space-y-6 sm:space-y-8 bg-white/95">
      {/* Mindful Success Header */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 sm:space-y-3.5">
        {/* Large Centered Checkmark Icon */}
        <div className="flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-orange-100 text-orange-600 ring-6 sm:ring-8 ring-orange-50 shadow-xs shrink-0">
          <CheckCircle2 className="w-8 h-8 sm:w-11 sm:h-11" />
        </div>

        {/* Category Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-orange-50 text-orange-900 border border-orange-200/80 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          <span>Advanced Manifestation</span>
        </div>

        {/* Heading */}
        <h2 className="text-xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight leading-snug">
          Your Response has been Recorded!
        </h2>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200/80 shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
          <span>Successfully Recorded</span>
        </div>
      </div>

      {/* Special Message Section in Serene Mindful Green */}
      <div className="rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/95 via-teal-50/40 to-emerald-50/80 p-5 sm:p-7 space-y-3 sm:space-y-3.5 shadow-sm shadow-emerald-900/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-200/35 rounded-full filter blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2 text-emerald-950 font-semibold text-xs sm:text-sm uppercase tracking-wider">
          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-2xs shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span>Special Message</span>
        </div>

        <blockquote className="relative">
          <p className="text-sm sm:text-lg text-emerald-950 leading-relaxed font-serif italic">
            “Thank you for sharing. How you show up for these 5 days is how the universe will show up for you. Commit to attending all 5 days LIVE without a single gap—your breakthrough is waiting.”
          </p>
        </blockquote>

        <div className="pt-2 flex items-center gap-2 text-[11px] sm:text-xs font-medium text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          <span>Commitment to Growth • 5-Day LIVE Experience</span>
        </div>
      </div>

      {/* Action Buttons - Unhighlighted subtle reset link */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onReset}
          type="button"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100/70 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Submit another response</span>
        </button>
      </div>
    </div>
  );
};

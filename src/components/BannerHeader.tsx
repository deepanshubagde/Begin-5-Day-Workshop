import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface BannerHeaderProps {
  completedCount: number;
  totalRequired: number;
  headerImageUrl?: string;
  fitMode?: 'cover' | 'contain';
}

export const BannerHeader: React.FC<BannerHeaderProps> = ({
  completedCount,
  totalRequired,
  headerImageUrl,
}) => {
  const percentage = Math.min(100, Math.round((completedCount / totalRequired) * 100));

  // Never load any Google Form screenshot or googleusercontent image
  const isValidCustomUrl =
    headerImageUrl &&
    !headerImageUrl.includes('googleusercontent.com') &&
    !headerImageUrl.includes('form-header');

  const bannerSrc = isValidCustomUrl ? headerImageUrl : '/custom-header.png';

  return (
    <div className="relative w-full">
      {/* Top Banner Image - Responsive Natural Scaling (Only the header graphic) */}
      <div className="relative w-full overflow-hidden rounded-t-2xl sm:rounded-t-3xl bg-stone-900">
        <img
          key={bannerSrc}
          src={bannerSrc}
          alt="Advanced Manifestation - Monkhood Life"
          className="w-full h-auto block object-cover object-center transition-opacity duration-300"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('/custom-header.png')) {
              target.src = '/custom-header.png';
            }
          }}
          loading="eager"
        />
      </div>

      {/* Title & Introduction Card */}
      <div className="p-4 sm:p-7 bg-white border-b border-orange-100/80 space-y-3.5 sm:space-y-4">
        {/* Category Pill & Confidentiality Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold tracking-wider uppercase bg-orange-50 text-orange-900 border border-orange-200/80 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Advanced Manifestation</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-medium text-stone-600 bg-amber-50/70 border border-amber-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600 shrink-0" />
            <span>Private & Confidential</span>
          </div>
        </div>

        {/* Main Title */}
        <div className="space-y-1 sm:space-y-1.5">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-serif font-semibold text-stone-900 tracking-tight leading-tight">
            Fill the form to know yourself Better
          </h1>
          <p className="text-xs sm:text-base text-stone-600 leading-relaxed font-sans">
            Take a centering breath. Share your desires and challenges to personalize your manifestation journey.
          </p>
        </div>

        {/* Progress Tracker & Required Notice */}
        <div className="pt-2 border-t border-orange-100/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
            <div className="w-20 sm:w-32 h-2 bg-orange-100/60 rounded-full overflow-hidden border border-orange-200/60 shrink-0">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-orange-600 rounded-full transition-all duration-500 ease-out shadow-xs"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-stone-700 text-[11px] sm:text-xs">
              {completedCount} of {totalRequired} completed ({percentage}%)
            </span>
            {percentage === 100 && (
              <CheckCircle2 className="w-4 h-4 text-orange-600 animate-bounce shrink-0" />
            )}
          </div>

          <div className="text-[11px] sm:text-xs text-orange-700 font-medium flex items-center gap-1">
            <span className="text-orange-600 text-sm font-bold leading-none">*</span>
            <span>Indicates required question</span>
          </div>
        </div>
      </div>
    </div>
  );
};

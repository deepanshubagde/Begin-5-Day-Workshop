import React from 'react';

interface QuestionCardProps {
  number: number;
  title: string;
  hindiTitle?: string;
  subtitle?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  id?: string;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  number,
  title,
  hindiTitle,
  subtitle,
  required = false,
  error,
  children,
  id,
}) => {
  return (
    <div
      id={id}
      className={`p-4 sm:p-7 rounded-2xl bg-white border transition-all duration-200 shadow-xs ${
        error
          ? 'border-rose-300 ring-2 ring-rose-500/10'
          : 'border-orange-100/90 hover:border-orange-300 hover:shadow-md hover:shadow-orange-500/5'
      }`}
    >
      <div className="space-y-1.5 mb-3 sm:mb-3.5">
        <div className="flex items-start justify-between gap-2.5">
          <label className="block text-base sm:text-lg font-medium text-stone-900 leading-snug">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100/90 text-orange-900 border border-orange-200/80 text-xs font-bold mr-2 -translate-y-0.5 shadow-2xs shrink-0">
              {number}
            </span>
            <span>{title}</span>
            {required && <span className="text-orange-600 font-bold ml-1">*</span>}
          </label>
        </div>

        {hindiTitle && (
          <p className="font-hindi text-sm sm:text-base text-stone-600 font-medium pl-0 sm:pl-8 leading-relaxed">
            {hindiTitle}
          </p>
        )}

        {subtitle && (
          <p className="text-xs sm:text-sm text-stone-500 pl-0 sm:pl-8 leading-relaxed italic">
            {subtitle}
          </p>
        )}
      </div>

      <div className="pl-0 sm:pl-8">{children}</div>

      {error && (
        <div className="mt-2.5 pl-0 sm:pl-8 text-xs text-rose-600 font-medium flex items-center gap-1.5 animate-fadeIn">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

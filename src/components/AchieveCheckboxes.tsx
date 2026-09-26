import React, { useRef } from 'react';
import { ACHIEVE_OPTIONS } from '../data/questions';
import { Check } from 'lucide-react';

interface AchieveCheckboxesProps {
  selected: string[];
  otherText: string;
  onChange: (selected: string[]) => void;
  onOtherTextChange: (text: string) => void;
  hasError?: boolean;
}

export const AchieveCheckboxes: React.FC<AchieveCheckboxesProps> = ({
  selected,
  otherText,
  onChange,
  onOtherTextChange,
  hasError,
}) => {
  const otherInputRef = useRef<HTMLInputElement>(null);
  const isOtherSelected = selected.includes('Other');

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleOtherCheckToggle = () => {
    if (isOtherSelected) {
      onChange(selected.filter((item) => item !== 'Other'));
    } else {
      onChange([...selected, 'Other']);
      setTimeout(() => {
        otherInputRef.current?.focus();
      }, 50);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {ACHIEVE_OPTIONS.map((option) => {
          const isChecked = selected.includes(option);
          return (
            <label
              key={option}
              onClick={() => toggleOption(option)}
              className={`flex items-center gap-3 p-3.5 sm:p-3 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer select-none min-h-[48px] touch-manipulation active:scale-[0.99] ${
                isChecked
                  ? 'bg-orange-50/90 border-orange-500 text-orange-950 shadow-xs ring-1 ring-orange-500/20'
                  : 'bg-stone-50/70 border-stone-200 text-stone-700 hover:bg-orange-50/30 hover:border-orange-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all duration-150 ${
                  isChecked
                    ? 'bg-orange-500 border-orange-500 text-white shadow-2xs'
                    : 'bg-white border-stone-300 hover:border-orange-400'
                }`}
              >
                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className="flex-1 leading-snug">{option}</span>
            </label>
          );
        })}
      </div>

      {/* "Other" Option */}
      <div
        className={`p-3.5 sm:p-3 rounded-xl border transition-all duration-200 touch-manipulation ${
          isOtherSelected
            ? 'bg-orange-50/90 border-orange-500 shadow-xs ring-1 ring-orange-500/20'
            : 'bg-stone-50/70 border-stone-200 hover:bg-orange-50/30 hover:border-orange-200'
        }`}
      >
        <div
          onClick={handleOtherCheckToggle}
          className="flex items-center gap-3 cursor-pointer select-none min-h-[32px]"
        >
          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all duration-150 ${
              isOtherSelected
                ? 'bg-orange-500 border-orange-500 text-white shadow-2xs'
                : 'bg-white border-stone-300 hover:border-orange-400'
            }`}
          >
            {isOtherSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
          <span className="text-sm font-medium text-stone-800">Other (अन्य):</span>
        </div>

        {isOtherSelected && (
          <div className="mt-2.5 pl-0 sm:pl-8">
            <input
              ref={otherInputRef}
              type="text"
              value={otherText}
              onChange={(e) => onOtherTextChange(e.target.value)}
              placeholder="Please specify your specific goal or aspiration..."
              className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-white rounded-lg border border-orange-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none text-stone-900 placeholder:text-stone-400 transition-all shadow-2xs"
            />
          </div>
        )}
      </div>

      {hasError && (
        <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
          <span>* Please select at least one goal you wish to achieve</span>
        </p>
      )}

      {selected.length > 0 && (
        <div className="text-xs text-emerald-800 font-medium pl-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>{selected.length} {selected.length === 1 ? 'goal' : 'goals'} selected</span>
        </div>
      )}
    </div>
  );
};

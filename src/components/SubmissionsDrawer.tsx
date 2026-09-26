import React from 'react';
import { SubmissionRecord } from '../types/form';
import { X, Download, Inbox, CheckCircle2, Clock } from 'lucide-react';

interface SubmissionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: SubmissionRecord[];
}

export const SubmissionsDrawer: React.FC<SubmissionsDrawerProps> = ({
  isOpen,
  onClose,
  submissions,
}) => {
  if (!isOpen) return null;

  const exportCSV = () => {
    if (submissions.length === 0) return;

    const headers = [
      'Timestamp',
      'ID',
      'Full Name',
      'Contact Number',
      'City',
      'Goals to Achieve',
      'Current Challenges',
      'Expectations',
      'Additional Info',
    ];

    const rows = submissions.map((s) => [
      `"${s.submittedAt || ''}"`,
      `"${s.id || ''}"`,
      `"${(s.fullName || '').replace(/"/g, '""')}"`,
      `"${(s.contactNumber || '').replace(/"/g, '""')}"`,
      `"${(s.city || '').replace(/"/g, '""')}"`,
      `"${(s.achieveSoonest || []).join(', ') + (s.otherAchieve ? ` (Other: ${s.otherAchieve})` : '')}"`,
      `"${(s.challenges || '').replace(/"/g, '""')}"`,
      `"${(s.expectations || '').replace(/"/g, '""')}"`,
      `"${(s.additionalInfo || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `advance_manifestation_responses_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white h-full max-w-xl w-full flex flex-col shadow-2xl border-l border-stone-200">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <h3 className="text-base font-serif font-bold text-stone-900">
              Form Responses ({submissions.length})
            </h3>
            <p className="text-xs text-stone-500">Stored responses collected from the form</p>
          </div>
          <div className="flex items-center gap-2">
            {submissions.length > 0 && (
              <button
                onClick={exportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {submissions.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-stone-400 space-y-2">
              <Inbox className="w-10 h-10 stroke-[1.5]" />
              <p className="text-sm font-medium text-stone-600">No responses submitted yet</p>
              <p className="text-xs text-stone-400 max-w-xs">
                When people fill out the form, their answers will be logged here and synced to Google Sheets.
              </p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 space-y-2.5 text-xs transition-colors"
              >
                <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                  <div className="flex items-center gap-1.5 font-medium text-stone-800">
                    <span className="font-semibold text-sm">{sub.fullName || 'Anonymous'}</span>
                    <span className="text-stone-400">•</span>
                    <span className="text-stone-500">{sub.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-stone-400">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="text-stone-600 space-y-1">
                  <div>
                    <span className="font-semibold text-stone-700">City: </span>
                    <span>{sub.city}</span>
                  </div>
                  {sub.achieveSoonest && sub.achieveSoonest.length > 0 && (
                    <div>
                      <span className="font-semibold text-stone-700">Goals: </span>
                      <span className="text-emerald-700">
                        {sub.achieveSoonest.join(', ')}
                        {sub.otherAchieve && ` (Other: ${sub.otherAchieve})`}
                      </span>
                    </div>
                  )}
                  {sub.challenges && (
                    <div>
                      <span className="font-semibold text-stone-700">Challenges: </span>
                      <span className="italic">{sub.challenges}</span>
                    </div>
                  )}
                  {sub.expectations && (
                    <div>
                      <span className="font-semibold text-stone-700">Expectations: </span>
                      <span>{sub.expectations}</span>
                    </div>
                  )}
                </div>

                <div className="pt-1 flex items-center justify-between text-[11px] text-stone-400">
                  <span className="font-mono text-stone-400">{sub.id}</span>
                  {sub.syncedToSheet ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Synced to Sheet
                    </span>
                  ) : (
                    <span className="text-stone-400">Local Record</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

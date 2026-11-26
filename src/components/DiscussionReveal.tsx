import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface DiscussionRevealProps {
  question: string;
  answer: string;
  detail?: string;
  defaultOpen?: boolean;
}

export const DiscussionReveal: React.FC<DiscussionRevealProps> = ({
  question,
  answer,
  detail,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">Discussion Prompt</p>
          <p className="text-lg font-semibold text-slate-900 leading-snug">{question}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start"
        >
          <span>{open ? 'Hide Answer' : 'Reveal Answer'}</span>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      {open && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
          <p className="text-lg font-semibold text-emerald-700 leading-snug">{answer}</p>
          {detail && <p className="text-base text-slate-600 leading-relaxed">{detail}</p>}
        </div>
      )}
    </div>
  );
};

'use client';

import { useState } from 'react';

// Long who_may_avail values would otherwise stretch the At A Glance panel;
// this clamps to ~3 lines with a disclosure, isolated as a client component
// so the shared service-detail page can stay a server component.
const CLAMP_THRESHOLD = 160;

export default function EligibilityText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > CLAMP_THRESHOLD;

  return (
    <>
      <p
        className={`text-sm leading-6 text-gray-900 ${
          isLong && !expanded ? 'line-clamp-3' : ''
        }`}
      >
        {text}
      </p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="mt-1 text-xs font-semibold text-[#0066EB] hover:text-[#0052BC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066EB]"
        >
          {expanded ? 'Show less' : 'Show full eligibility'}
        </button>
      )}
    </>
  );
}

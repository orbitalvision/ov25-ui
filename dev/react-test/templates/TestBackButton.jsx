import React from 'react';

export function TestBackButton() {
  return (
    <a
      href="../index.html"
      className="ov:fixed ov:top-4 ov:left-4 ov:z-[999999] ov:flex ov:items-center ov:justify-center ov:gap-0 ov:p-2 ov:bg-white ov:border-0 ov:rounded-full ov:shadow-md ov:text-sm ov:font-medium ov:text-gray-700 hover:ov:bg-gray-50 ov:no-underline ov:md:gap-2 ov:md:px-3 ov:md:py-2 ov:md:border ov:md:border-gray-200 ov:md:rounded-md hover:ov:md:border-gray-300"
      style={{ zIndex: 999999 }}
      aria-label="Back to list"
    >
      <svg className="ov:w-4 ov:h-4 ov:flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span className="ov:hidden ov:md:inline">Back to list</span>
    </a>
  );
}

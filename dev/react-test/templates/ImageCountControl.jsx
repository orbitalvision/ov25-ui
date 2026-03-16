import React from 'react';

export function ImageCountControl({ count, onChange, min = 0 }) {
  return (
    <div className="ov:flex ov:items-center ov:gap-2 ov:mb-4">
      <span className="ov:text-sm ov:font-medium ov:text-[#525252]">Thumbnails:</span>
      <button type="button" onClick={() => onChange(Math.max(min, count - 1))} className="ov:px-2 ov:py-1 ov:rounded ov:bg-gray-200 ov:hover:bg-gray-300 ov:text-sm ov:font-medium" aria-label="Decrease">−</button>
      <span className="ov:w-8 ov:text-center ov:text-sm ov:font-medium">{count}</span>
      <button type="button" onClick={() => onChange(count + 1)} className="ov:px-2 ov:py-1 ov:rounded ov:bg-gray-200 ov:hover:bg-gray-300 ov:text-sm ov:font-medium" aria-label="Increase">+</button>
    </div>
  );
}

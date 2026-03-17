import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface TreeTriggerProps {
  label: string;
  onClick: () => void;
}

export const TreeTrigger: React.FC<TreeTriggerProps> = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="ov25-option-header ov:shrink-0 ov:w-full ov:flex ov:items-center ov:justify-between ov:px-4 ov:py-3 ov:text-left ov:bg-[var(--ov25-background-color)] ov:text-[var(--ov25-secondary-text-color)] hover:ov:bg-[var(--ov25-hover-bg-color,transparent)] ov:border-b ov:border-[var(--ov25-border-color)] ov:cursor-pointer"
  >
    <span className="ov:text-lg ov:font-medium">{label}</span>
    <ChevronRight className="ov:size-5" />
  </button>
);

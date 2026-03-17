import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface AccordionTriggerProps {
  label: string;
  isExpanded: boolean;
  onClick: () => void;
}

export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ label, isExpanded, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="ov25-option-header ov:shrink-0 ov:w-full ov:flex ov:items-center ov:justify-between ov:px-4 ov:py-3 ov:text-left ov:bg-[var(--ov25-background-color)] ov:text-[var(--ov25-secondary-text-color)] hover:ov:bg-[var(--ov25-hover-bg-color,transparent)] ov:border-b ov:border-[var(--ov25-border-color)] ov:cursor-pointer"
  >
    <span className="ov:text-lg ov:font-medium">{label}</span>
    {isExpanded ? <ChevronUp className="ov:size-5" /> : <ChevronDown className="ov:size-5" />}
  </button>
);

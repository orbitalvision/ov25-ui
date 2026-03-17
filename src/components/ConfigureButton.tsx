import React from 'react';

const baseButtonClasses = 'ov:flex ov:items-center ov:justify-center ov:gap-2 ov:py-2 ov:px-6 ov:text-sm ov:rounded-[var(--ov25-cta-border-radius)] ov:bg-[var(--ov25-cta-color)] ov:text-[var(--ov25-cta-text-color)] ov:font-medium ov:cursor-pointer ov:hover:bg-[var(--ov25-cta-color-hover)] ov:transition-colors ov:border-0 ov:text-center ov:w-full ov:uppercase';

export interface ConfigureButtonProps {
  onClick: () => void;
  children?: React.ReactNode;
}

export const ConfigureButton: React.FC<ConfigureButtonProps> = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className={baseButtonClasses}>
    {children ?? 'Configure'}
  </button>
);

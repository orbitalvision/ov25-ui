import * as React from 'react'
import { useOV25UI } from '../../contexts/ov25-ui-context.js'

interface NoResultsProps {
  message?: string;
}

export const NoResults = ({ message }: NoResultsProps) => {
  const { allOptions, activeOptionId } = useOV25UI();
  
  // Calculate message based on current option if not provided
  const displayMessage = message || (() => {
    const currentOption = allOptions.find(opt => opt.id === activeOptionId);
    return currentOption?.name.toLowerCase() === 'modules' 
      ? "Select an object to replace or attach to." 
      : "No results found";
  })();

  return (
    <div id="ov25-no-results" className="ov:w-full ov:h-full ov:p-4 ov:pt-16 ov:flex ov:justify-center">
      <h3 className="ov:text-lg ov:text-[var(--ov25-secondary-text-color)]">{displayMessage}</h3>
    </div>
  );
};

export default NoResults; 
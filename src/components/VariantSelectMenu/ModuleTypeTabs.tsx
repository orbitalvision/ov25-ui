import React from 'react';
import { ChevronsRight, CornerDownRight, Layers, Sofa } from 'lucide-react';
import { CompatibleModule } from '../../utils/configurator-utils.js';

interface ModuleTypeTabsProps {
  selectedType: 'all' | 'middle' | 'corner' | 'end';
  onTypeChange: (type: 'all' | 'middle' | 'corner' | 'end') => void;
  compatibleModules: CompatibleModule[] | null;
}

const moduleTypes = [
  { id: 'all', label: 'All', icon: <Layers className="w-3.5 h-3.5" /> },
  { id: 'middle', label: 'Middle', icon: <Sofa className="w-3.5 h-3.5" /> },
  { id: 'corner', label: 'Corner', icon: <CornerDownRight className="w-3.5 h-3.5" /> },
  { id: 'end', label: 'End', icon: <ChevronsRight className="w-3.5 h-3.5" /> },
] as const;

export const ModuleTypeTabs: React.FC<ModuleTypeTabsProps> = ({ selectedType, onTypeChange, compatibleModules }) => {
  // Filter module types based on what's available in compatibleModules
  const availableModuleTypes = moduleTypes.filter(type => {
    if (!compatibleModules || compatibleModules.length === 0) return false;
    if (type.id === 'all') return true;

    return compatibleModules.some(module => {
      const position = module.position.toLowerCase();
      return position.includes(type.id);
    });
  });

  // If the currently selected type is not available, reset to 'all'
  React.useEffect(() => {
    const isSelectedTypeAvailable = availableModuleTypes.some(type => type.id === selectedType);
    if (!isSelectedTypeAvailable && selectedType !== 'all') {
      onTypeChange('all');
    }
  }, [availableModuleTypes, selectedType, onTypeChange]);

  return (
    <div id="ov25-module-type-tabs" className="ov:flex ov:flex-wrap">
      {availableModuleTypes.map((type, index) => {
        // Set width based on number of available tabs
        let widthClass = '';
        if (availableModuleTypes.length === 1) widthClass = 'ov:basis-full';
        else if (availableModuleTypes.length === 2) widthClass = 'ov:basis-1/2';
        else if (availableModuleTypes.length === 3) widthClass = 'ov:basis-1/3';
        else widthClass = 'ov:basis-1/4';
        
        let borderClass = '';
        if (index < availableModuleTypes.length - 1) borderClass = 'ov:border-r ov:border-[var(--ov25-border-color)]';
        
        return (
          <div
            key={`${type.id}-module-type-tab`}
            className={`ov:cursor-pointer ov:flex ov:justify-center ov:items-center ov:my-0 ov:border-b ov:border-[var(--ov25-border-color)] ov:data-[selected=true]:bg-[var(--ov25-text-color)] ${widthClass} ${borderClass}`}
            onClick={() => onTypeChange(type.id)}
            style={{ maxWidth: availableModuleTypes.length === 1 ? '100%' : availableModuleTypes.length === 2 ? '50%' : availableModuleTypes.length === 3 ? '33.333%' : '25%' }}
            data-selected={selectedType === type.id ? "true" : "false"}
          >
            <div
              className={`ov:flex ov:items-center ov:justify-center ov:w-full ov:text-center ov:cursor-pointer ov:py-2 ov:data-[selected=true]:text-[var(--ov25-background-color)] ov:data-[selected=false]:text-[var(--ov25-secondary-text-color)]`}
              data-selected={selectedType === type.id ? "true" : "false"}
            >   
              {type.icon}
              {type.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

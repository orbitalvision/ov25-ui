import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronsRight, ChevronDown, CornerDownRight, Layers, Sofa } from 'lucide-react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import { cn } from '../../lib/utils.js';
import {
  getAvailableModulePositionTabs,
  type ModulePositionTabType,
} from './module-position-utils.js';

function tabConfig(type: ModulePositionTabType) {
  switch (type) {
    case 'all':
      return { icon: Layers, label: 'All' };
    case 'middle':
      return { icon: Sofa, label: 'Middle' };
    case 'corner':
      return { icon: CornerDownRight, label: 'Corner' };
    case 'end':
      return { icon: ChevronsRight, label: 'End' };
    default:
      return { icon: Layers, label: 'All' };
  }
}

export type ModulePositionTypeTabsProps = {
  className?: string;
  embed?: 'bottomPanel' | 'variantSheet';
};

const tabPillBase =
  'ov25-filter-pill ov25-tabs-button ov:flex ov:flex-row ov:items-center ov:gap-1.5 ov:px-3 ov:py-2 ov:rounded-full ov:border ov:border-(--ov25-border-color) ov:whitespace-nowrap ov:cursor-pointer ov:transition-all ov:text-xs ov:font-normal ov:shrink-0';
const tabPillActive = '';
const tabPillInactive =
  ' ov:text-(--ov25-secondary-text-color) hover:ov:text-[var(--ov25-text-color)]';

/**
 * All / Middle / Corner / End tabs for Snap2 compatible modules. Syncs with {@link useOV25UI}
 * `selectedModuleType` (shared with {@link ModuleBottomPanel}).
 * On narrow width (not bottom dock), switches to a dropdown like variant tabs.
 */
export const ModulePositionTypeTabs: React.FC<ModulePositionTypeTabsProps> = ({
  className,
  embed = 'bottomPanel',
}) => {
  const { compatibleModules, selectedModuleType, setSelectedModuleType, snap2ModuleSheetPosition } =
    useOV25UI();
  const [useTabsDropdown, setUseTabsDropdown] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const tabsMeasureRef = useRef<HTMLDivElement>(null);

  const availableTabTypes = useMemo(
    () => getAvailableModulePositionTabs(compatibleModules ?? []),
    [compatibleModules]
  );

  const tabKey = availableTabTypes.join(',');
  const isBottomDock = embed === 'bottomPanel' && snap2ModuleSheetPosition === 'bottom';

  useEffect(() => {
    if (!availableTabTypes.includes(selectedModuleType)) {
      setSelectedModuleType('all');
    }
  }, [tabKey, selectedModuleType, setSelectedModuleType]);

  useEffect(() => {
    if (isBottomDock) {
      setUseTabsDropdown(false);
      return;
    }
    const header = headerRef.current;
    const el = tabsMeasureRef.current;
    if (!header || !el) return;
    const checkOverflow = () => {
      const { paddingLeft, paddingRight } = getComputedStyle(header);
      const contentWidth =
        header.clientWidth - (parseFloat(paddingLeft) || 0) - (parseFloat(paddingRight) || 0);
      setUseTabsDropdown(el.scrollWidth > contentWidth - 2);
    };
    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(header);
    return () => ro.disconnect();
  }, [tabKey, isBottomDock, embed]);

  if (!compatibleModules?.length) return null;

  const headerBarClass =
    embed === 'variantSheet'
      ? 'ov25-tabs-header ov:relative ov:shrink-0 ov:flex ov:flex-col ov:gap-0 ov:px-0 ov:pt-0 ov:pb-0 ov:bg-transparent'
      : 'ov25-tabs-header ov:relative ov:shrink-0 ov:flex ov:flex-col ov:gap-0 ov:px-4 ov:pt-2 ov:pb-0 ov:bg-transparent';

  const tabRow = (
    <div
      className={
        isBottomDock
          ? 'ov:flex ov:flex-wrap ov:justify-center ov:gap-2 ov:pt-1 ov:pb-3'
          : 'ov:flex ov:gap-2 ov:flex-1 ov:min-w-0 ov:pb-0 ov:md:pb-3 ov:justify-start ov:overflow-hidden'
      }
      data-ov25-tabs
    >
      {availableTabTypes.map((tabType) => {
        const { icon: Icon, label } = tabConfig(tabType);
        const isActive = selectedModuleType === tabType;
        return (
          <button
            key={tabType}
            type="button"
            onClick={() => setSelectedModuleType(tabType)}
            data-ov25-tab
            data-ov25-tab-id={tabType}
            data-ov25-tab-active={isActive ? 'true' : undefined}
            className={cn(tabPillBase, isActive ? tabPillActive : tabPillInactive)}
          >
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );

  const measureRow = (
    <div
      ref={tabsMeasureRef}
      className="ov:inline-flex ov:gap-2 ov:whitespace-nowrap"
      aria-hidden
    >
      {availableTabTypes.map((tabType) => {
        const { icon: Icon, label } = tabConfig(tabType);
        return (
          <span
            key={tabType}
            className="ov25-filter-pill ov:shrink-0 ov:inline-flex ov:flex-row ov:items-center ov:gap-1.5 ov:px-2 ov:py-1 ov:text-xs ov:rounded-full ov:border ov:border-transparent ov:box-border"
            style={{ boxSizing: 'border-box' }}
          >
            <Icon className="ov:w-3.5 ov:h-3.5 ov:shrink-0" />
            <span>{label}</span>
          </span>
        );
      })}
    </div>
  );

  const dropdown = (
    <div className="ov:relative ov:w-full ov:md:pb-3" data-ov25-tabs data-ov25-tabs-dropdown>
      <div className="ov25-gradient ov:rounded-full ov:p-[3px]">
        <div className="ov:relative ov:rounded-full ov:bg-(--ov25-background-color) ov:flex ov:items-center">
          <select
            id="ov25-module-position-tabs-select"
            value={selectedModuleType}
            onChange={(e) => setSelectedModuleType(e.target.value as ModulePositionTabType)}
            data-ov25-tab-select
            className="ov:w-full ov:appearance-none ov:bg-transparent ov:rounded-full ov:px-4 ov:py-2.5 ov:text-sm ov:pr-10 ov:cursor-pointer ov:focus:outline-none ov:focus:ring-0 ov:text-[var(--ov25-text-color)]"
          >
            {availableTabTypes.map((tabType) => {
              const { label } = tabConfig(tabType);
              return (
                <option key={tabType} value={tabType}>
                  {label}
                </option>
              );
            })}
          </select>
          <ChevronDown
            size={16}
            className="ov:absolute ov:right-3 ov:top-1/2 ov:-translate-y-1/2 ov:pointer-events-none ov:text-(--ov25-secondary-text-color) ov:shrink-0"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div ref={headerRef} className={cn('ov25-tabs-header ov:relative ov:shrink-0 ov:flex ov:flex-col ov:gap-0 ov:px-0 ov:pt-0 ov:pb-0 ov:bg-transparent', className)}>
      {!isBottomDock && (
        <div
          className="ov:absolute ov:left-0 ov:right-0 ov:top-0 ov:overflow-hidden ov:opacity-0 ov:pointer-events-none ov:invisible"
          aria-hidden
        >
          {measureRow}
        </div>
      )}
      {isBottomDock ? tabRow : useTabsDropdown ? dropdown : tabRow}
    </div>
  );
};

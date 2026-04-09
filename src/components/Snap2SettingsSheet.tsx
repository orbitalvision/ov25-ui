import React from 'react';
import { cn } from '../lib/utils.js';
import { VariantsCloseButton } from './VariantSelectMenu/VariantsCloseButton.js';

/** Drawer backdrop/panel z-index when portaled to document (above host page UI). */
const DRAWER_BACKDROP_Z = 2147483645;
const DRAWER_PANEL_Z = 2147483646;
const CONFIGURATOR_DRAWER_BACKDROP_Z = 103;
const CONFIGURATOR_DRAWER_PANEL_Z = 104;

export type Snap2SettingsSheetMode = 'modal' | 'drawer';

export type Snap2SettingsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Snap2SettingsSheetMode;
  children: React.ReactNode;
  /** When set, main area scrolls and footer stays pinned at the bottom of the column. */
  footer?: React.ReactNode;
  /** Modal column z-index; checkout should stack above variants (e.g. z-[110] vs z-102). */
  sheetZClass?: string;
  stackWithinConfigurator?: boolean;
  withBackdrop?: boolean;
  showCloseButton?: boolean;
  closeButtonAriaLabel?: string;
  id?: string;
  'aria-labelledby'?: string;
  'aria-modal'?: boolean;
  role?: React.AriaRole;
  className?: string;
};

/**
 * Shared Snap2 right rail: same slide animation as variants via globals.css
 * (`data-ov25-snap2-settings-sheet` + `data-open`), and the same corner close control.
 */
export const Snap2SettingsSheet: React.FC<Snap2SettingsSheetProps> = ({
  open,
  onOpenChange,
  mode,
  children,
  footer,
  sheetZClass = 'ov:z-102',
  stackWithinConfigurator = false,
  withBackdrop = false,
  showCloseButton = true,
  closeButtonAriaLabel = 'Close',
  id,
  'aria-labelledby': ariaLabelledby,
  'aria-modal': ariaModal,
  role,
  className,
}) => {
  const dataOpen = open ? 'true' : 'false';
  const drawerBackdropZ = stackWithinConfigurator ? CONFIGURATOR_DRAWER_BACKDROP_Z : DRAWER_BACKDROP_Z;
  const drawerPanelZ = stackWithinConfigurator ? CONFIGURATOR_DRAWER_PANEL_Z : DRAWER_PANEL_Z;

  const shellClassModal = cn(
    'ov:absolute ov:top-0 ov:right-0 ov:h-full ov:w-[384px] ov:border-l ov:border-gray-200 ov:bg-white ov:box-border',
    sheetZClass
  );

  const shellClassDrawer = cn(
    'ov:fixed ov:top-0 ov:right-0 ov:left-auto ov:w-full ov:min-w-0 ov:max-w-[min(100%,24rem)] ov:border-l ov:border-gray-200 ov:bg-neutral-100 ov:shadow-xl ov:box-border'
  );

  const innerWithFooter = footer != null;
  const bodyScrollClass = innerWithFooter
    ? 'ov:flex-1 ov:min-h-0 ov:min-w-0 ov:overflow-y-auto ov:overflow-x-hidden'
    : 'ov:h-full ov:min-h-0 ov:overflow-y-auto ov:overflow-x-hidden';

  const panel = (
    <div
      data-ov25-snap2-settings-sheet
      data-open={dataOpen}
      id={id}
      role={role}
      aria-modal={ariaModal}
      aria-labelledby={ariaLabelledby}
      className={cn(
        'ov:font-[family-name:var(--ov25-360-font-family)]',
        mode === 'modal' ? shellClassModal : shellClassDrawer,
        innerWithFooter && 'ov:flex ov:flex-col ov:overflow-hidden ov:min-h-0',
        className
      )}
      style={
        mode === 'drawer'
          ? {
              zIndex: drawerPanelZ,
              height: 'min(100svh, 100dvh)',
              maxHeight: 'min(100svh, 100dvh)',
            }
          : undefined
      }
    >
      {showCloseButton ? (
        <VariantsCloseButton
          onClick={() => onOpenChange(false)}
          ariaLabel={closeButtonAriaLabel}
          className="ov:z-10"
        />
      ) : null}
      <div className={cn('ov:min-w-0', bodyScrollClass)}>{children}</div>
      {footer != null ? (
        <div className="ov:shrink-0 ov:min-w-0 ov:max-w-full ov:overflow-x-hidden ov:box-border">{footer}</div>
      ) : null}
    </div>
  );

  if (mode === 'drawer' && withBackdrop) {
    return (
      <>
        <button
          type="button"
          aria-label="Close panel"
          className={cn(
            'ov:fixed ov:inset-0 ov:z-[1] ov:border-0 ov:cursor-default',
            open ? 'ov:bg-black/30 ov:pointer-events-auto' : 'ov:pointer-events-none ov:opacity-0'
          )}
          style={{ zIndex: drawerBackdropZ }}
          onClick={() => onOpenChange(false)}
        />
        {panel}
      </>
    );
  }

  return panel;
};

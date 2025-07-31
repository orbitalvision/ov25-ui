"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "../../lib/utils.js"
import { useOV25UI } from "../../contexts/ov25-ui-context.js"

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  triggerRef?: React.RefObject<HTMLElement>;
}

function Popover({ open, onOpenChange, children }: PopoverProps) {
  return <div className="ov:relative ov:inline-block">{children}</div>
}

function PopoverTrigger({ asChild, children, onClick }: PopoverTriggerProps) {
  const child = React.Children.only(children) as React.ReactElement;
  return React.cloneElement(child, {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      child.props.onClick?.(e);
      onClick?.();
    }
  });
}

function PopoverContent({ children, className, triggerRef }: PopoverContentProps) {
  const { shadowDOMs } = useOV25UI();
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    if (triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 8, // Position just above the trigger
        left: rect.left + rect.width / 2
      });
      // Small delay to ensure positioning is set before showing
      setTimeout(() => setIsVisible(true), 10);
    }
  }, [triggerRef]);

  if (!shadowDOMs?.popoverPortal) return null;

  return createPortal(
    <div
      className={cn(
        "ov:fixed ov:bg-white ov:border ov:border-gray-200 ov:rounded-lg ov:shadow-lg ov:p-2 ov:z-[1000] ov:min-w-[120px] ov:pointer-events-auto",
        "ov:transition-opacity ov:duration-200 ov:ease-out",
        "ov:transform ov:origin-bottom",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%) translateY(-100%)',
        opacity: isVisible ? 1 : 0
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    shadowDOMs.popoverPortal
  );
}

function PopoverAnchor({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }

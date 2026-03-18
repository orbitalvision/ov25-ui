import { useState, useEffect, useRef } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Input } from './input';
import { cn } from '../../lib/utils';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  debounceMs?: number;
}

export function ColorInput({ value, onChange, className, debounceMs = 200 }: ColorInputProps) {
  const [localColor, setLocalColor] = useState(value);
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalColor(value);
  }, [value]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (localColor !== value) {
      timeoutRef.current = setTimeout(() => onChange(localColor), debounceMs);
    }
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, [localColor, value, onChange, debounceMs]);

  const handleHexChange = (hex: string) => {
    if (/^#[0-9A-Fa-f]{0,6}$/.test(hex) || hex === '') {
      setLocalColor(hex || '#000000');
    }
  };

  const isLightColor = (hex: string): boolean => {
    if (!hex || hex.length < 7) return false;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return r > 240 && g > 240 && b > 240;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-20 h-20 rounded-lg shadow-lg transition-colors hover:opacity-80 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
            isLightColor(localColor) ? 'border border-border/50' : 'border-none',
            className,
          )}
          style={{ backgroundColor: localColor }}
          aria-label="Select color"
        />
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 border-none rounded-lg" align="start">
        <div className="flex flex-col gap-4">
          <HexColorPicker color={localColor} onChange={setLocalColor} style={{ width: '200px', height: '200px' }} />
          <div className="flex items-center gap-2 max-w-[200px]">
            <span className="text-sm text-muted-foreground">#</span>
            <Input
              className="flex-1 font-mono text-sm"
              value={localColor.replace('#', '')}
              onChange={(e) => handleHexChange(`#${e.target.value}`)}
              maxLength={6}
              placeholder="000000"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

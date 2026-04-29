import React, { useCallback, useState } from 'react';
import { Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog.js';
import { cn } from '../lib/utils.js';
import type { Snap2ScreenshotItem } from '../utils/configurator-utils.js';

function safeFilename(label: string): string {
  return `snap2-${label.replace(/\s+/g, '-').toLowerCase()}.png`;
}

type Snap2ScreenshotDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screenshots: Snap2ScreenshotItem[];
};

export function Snap2ScreenshotDialog({ open, onOpenChange, screenshots }: Snap2ScreenshotDialogProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadOne = useCallback((item: Snap2ScreenshotItem) => {
    const a = document.createElement('a');
    a.href = item.dataUrl;
    a.download = safeFilename(item.label);
    a.click();
  }, []);

  const handleDownloadAll = useCallback(async () => {
    if (screenshots.length === 0) return;
    setDownloading(true);
    try {
      for (const s of screenshots) {
        handleDownloadOne(s);
        await new Promise((r) => setTimeout(r, 150));
      }
    } finally {
      setDownloading(false);
    }
  }, [screenshots, handleDownloadOne]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        id="ov25-snap2-screenshot-dialog"
        className={cn(
          'snap2-screenshot-dialog',
          'ov:bg-(--ov25-background-color) ov:max-w-5xl ov:max-h-[90vh] ov:overflow-y-auto ov:p-0',
        )}
      >
        <DialogHeader className="ov:sr-only">
          <DialogTitle>Snap2 screenshots</DialogTitle>
        </DialogHeader>
        <div className="ov:flex ov:items-center ov:justify-between ov:px-5 ov:pt-5 ov:pb-2">
          <p className="ov:text-sm ov:text-(--ov25-secondary-text-color)">
            {screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''}
          </p>
          <button
            type="button"
            className={cn(
              'ov:inline-flex ov:h-8 ov:items-center ov:rounded-lg ov:border-0 ov:bg-(--ov25-cta-color) ov:mr-8 ov:px-3 ov:text-xs ov:font-medium ov:text-(--ov25-cta-text-color) ov:cursor-pointer',
              'ov:hover:opacity-90 ov:disabled:opacity-50 ov:disabled:cursor-not-allowed',
            )}
            onClick={() => void handleDownloadAll()}
            disabled={downloading || screenshots.length === 0}
          >
            <Download className="ov:mr-1.5 ov:h-3.5 ov:w-3.5" aria-hidden />
            {downloading ? 'Downloading…' : 'Download all'}
          </button>
        </div>
        <div
          className="ov:grid ov:gap-2 ov:px-4 ov:pb-4"
          style={{
            gridTemplateColumns: `repeat(${Math.max(1, Math.min(screenshots.length, 4))}, minmax(0, 1fr))`,
          }}
        >
          {screenshots.map((screenshot, index) => (
            <div key={`${screenshot.label}-${index}`} className="ov:flex ov:flex-col ov:gap-1">
              <img
                src={screenshot.dataUrl}
                alt={screenshot.label}
                className="ov:w-full ov:aspect-video ov:object-cover ov:rounded-md"
              />
              <button
                type="button"
                className="ov:self-start ov:border-0 ov:bg-transparent ov:p-0 ov:text-xs ov:font-medium ov:text-(--ov25-text-color) ov:underline ov:cursor-pointer"
                onClick={() => handleDownloadOne(screenshot)}
              >
                Download
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

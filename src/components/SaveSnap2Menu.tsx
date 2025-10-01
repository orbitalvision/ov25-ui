import React, { useState } from 'react';
import { Share, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog.js';
import { cn } from '../utils/cn.js';
import { requestSnap2Save } from '../utils/configurator-utils.js';

export const SaveSnap2Menu: React.FC = () => {
  const { 
    snap2SaveResponse,
    setSnap2SaveResponse
  } = useOV25UI();
  
  const [isSaving, setIsSaving] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  // Handle save response from context
  React.useEffect(() => {
    if (snap2SaveResponse) {
      if (snap2SaveResponse.success && snap2SaveResponse.shareUrl) {
        setShareUrl(snap2SaveResponse.shareUrl);
        setIsSaving(false);
      } else if (!snap2SaveResponse.success && snap2SaveResponse.error) {
        toast.error(snap2SaveResponse.error);
        setShowShareDialog(false);
        setIsSaving(false);
      }
      // Clear the response after handling
      setSnap2SaveResponse(null);
    }
  }, [snap2SaveResponse, setSnap2SaveResponse]);


  const handleSave = async () => {
    setIsSaving(true);
    setShowShareDialog(true);
    
    try {
      // Request iframe to save configuration and return URL info
      requestSnap2Save();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save configuration');
      setShowShareDialog(false);
      setIsSaving(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <>
      {/* Save Button - styled to match ov25-ui patterns */}
      <button 
        onClick={handleSave}
        className={cn(
          'ov:cursor-pointer ov:w-8 ov:h-8 ov:flex ov:items-center ov:justify-center',
          'ov:border ov:border-[var(--ov25-configurator-view-controls-border-color)] ov:rounded-full',
          'ov:bg-[var(--ov25-overlay-button-color)]',
          'ov:transition-all ov:duration-200 ov:hover:opacity-80'
        )}
      >
        <Share className="ov:w-[16px] ov:h-[16px]" color="var(--ov25-text-color)"/>
      </button>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent aria-describedby={undefined} className="snap2-dialog ov:bg-[var(--ov25-background-color)] ov:border-[var(--ov25-border-color)] ov:z-[9999]">
          <DialogHeader>
            <DialogTitle className="ov:text-[var(--ov25-text-color)]">
              Share Configuration
            </DialogTitle>
          </DialogHeader>
          <div className="ov:space-y-4">
            {isSaving ? (
              <div className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:space-y-4">
                <Loader2 className="ov:w-8 ov:h-8 ov:animate-spin ov:text-[var(--ov25-text-color)]" />
                <p className="ov:text-sm ov:text-[var(--ov25-secondary-text-color)]">
                  Saving configuration...
                </p>
              </div>
            ) : (
              <>
                <p className="ov:text-sm ov:text-[var(--ov25-secondary-text-color)]">
                  Copy this link to show others orsave your custom configuration for later:
                </p>
                <div className="ov:space-y-2">
                  <textarea
                    value={shareUrl}
                    rows={2}
                    readOnly
                    className="ov:min-h-[80px] ov:w-full ov:resize-none ov:bg-[var(--ov25-background-color)] ov:border-[var(--ov25-border-color)] ov:text-[var(--ov25-text-color)]"
                    placeholder="Shareable link will appear here..."
                  />
                  <button 
                    onClick={copyToClipboard} 
                    className="ov:w-full ov:px-4 ov:py-2 ov:border ov:border-[var(--ov25-border-color)] ov:bg-[var(--ov25-background-color)] ov:text-[var(--ov25-text-color)] ov:rounded-md ov:cursor-pointer"
                  >
                    Copy Link
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SaveSnap2Menu;
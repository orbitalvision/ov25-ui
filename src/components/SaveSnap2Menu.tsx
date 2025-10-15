import React, { useState } from 'react';
import { Share, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog.js';
import { cn } from '../utils/cn.js';
import { requestSnap2Save } from '../utils/configurator-utils.js';

// Component for saving snap2 configuration (generating a shareable link). Opens automatically when main dialog is closed.
export const SaveSnap2Menu: React.FC = () => {
  const { 
    snap2SaveResponse,
    setSnap2SaveResponse,
    shareDialogTrigger,
    setShareDialogTrigger,
    setIsModalOpen,
    setIsVariantsOpen,
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

  // Handle auto-open share dialog from context
  React.useEffect(() => {
    if (shareDialogTrigger !== 'none' && !showShareDialog && !isSaving) {
      setIsSaving(true);
      setShowShareDialog(true);
      requestSnap2Save();
    }
  }, [shareDialogTrigger, showShareDialog, isSaving]);

  const handleSave = async () => {
    setIsSaving(true);
    setShowShareDialog(true);
    setShareDialogTrigger('save-button');
    
    try {
      // Request iframe to save configuration and return URL info
      requestSnap2Save();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save configuration');
      setShowShareDialog(false);
      setIsSaving(false);
      setShareDialogTrigger('none');
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

  const handleShareDialogClose = (open: boolean) => {
    setShowShareDialog(open);
    if (!open) {
      // Clean up all dialog state
      setIsSaving(false);
      setShareUrl('');
      
      if (shareDialogTrigger === 'modal-close') {
        setIsModalOpen(false);
        setIsVariantsOpen(false);
      }
      setShareDialogTrigger('none');
    }
  };

  return (
    <>
      {/* Save Button */}
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
      {(showShareDialog || shareDialogTrigger !== 'none') && (
        <Dialog open={showShareDialog} onOpenChange={handleShareDialogClose}>
          <DialogContent aria-describedby={undefined} className="snap2-dialog ov:bg-[var(--ov25-background-color)] ov:border-[var(--ov25-border-color)]">
            <DialogHeader>
              <DialogTitle className="ov:text-[var(--ov25-text-color)]">
                {shareDialogTrigger === 'modal-close' ? 'Save Your Configuration' : 'Share Configuration'}
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
                    {shareDialogTrigger === 'modal-close' 
                      ? 'Save this link to return to your configuration later. Without it, your progress will be lost:'
                      : 'Copy this link to share with others or save your custom configuration for later:'}
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
      )}
    </>
  );
};

export default SaveSnap2Menu;
import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog.js';
import { requestSnap2Save } from '../utils/configurator-utils.js';

/**
 * Single-instance dialog for Snap2 save/share. Rendered once in the provider
 * to avoid multiple dialogs when ConfiguratorViewControls is mounted in multiple places.
 */
export const SaveSnap2Dialog: React.FC = () => {
  const {
    snap2SaveResponse,
    setSnap2SaveResponse,
    shareDialogTrigger,
    setShareDialogTrigger,
    setIsModalOpen,
    setIsVariantsOpen,
    skipNextDrawerCloseRef,
    skipNextShareClickRef,
    setCompatibleModules,
    setConfiguratorState,
    resetIframe,
  } = useOV25UI();

  const [isSaving, setIsSaving] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      setSnap2SaveResponse(null);
    }
  }, [snap2SaveResponse, setSnap2SaveResponse]);

  React.useEffect(() => {
    if (shareDialogTrigger !== 'none' && !showShareDialog && !isSaving && !showConfirmation) {
      if (shareDialogTrigger === 'modal-close') {
        setShowConfirmation(true);
      } else {
        setIsSaving(true);
      }
      setShowShareDialog(true);
    }
  }, [shareDialogTrigger, showShareDialog, isSaving, showConfirmation]);

  const handleConfirmSave = async () => {
    setIsSaving(true);
    setShowConfirmation(false);
    try {
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
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
        return;
      }
      const textarea = document.querySelector('textarea[readonly]') as HTMLTextAreaElement;
      if (textarea?.value === shareUrl) {
        textarea.focus();
        textarea.select();
        if (textarea.setSelectionRange) textarea.setSelectionRange(0, shareUrl.length);
        if (document.execCommand('copy')) {
          toast.success('Link copied to clipboard!');
          return;
        }
      }
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.cssText = 'position:fixed;opacity:0;left:-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (ok) toast.success('Link copied to clipboard!');
      else throw new Error('execCommand failed');
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy link. Please select and copy manually.');
    }
  };

  const handleShareDialogClose = (open: boolean) => {
    setShowShareDialog(open);
    if (!open) {
      const wasModalClose = shareDialogTrigger === 'modal-close';
      const hasShareUrl = !!shareUrl;
      if (showConfirmation) skipNextShareClickRef.current = true;

      setShareDialogTrigger('none');
      setIsSaving(false);
      setShareUrl('');
      setShowConfirmation(false);

      if (hasShareUrl && wasModalClose) {
        setIsModalOpen(false);
        skipNextDrawerCloseRef.current = true;
        setIsVariantsOpen(false);
        setCompatibleModules(null);
        setConfiguratorState(undefined);
        resetIframe();
      }
    }
  };

  const handleNoSave = () => {
    skipNextShareClickRef.current = true;
    setShowShareDialog(false);
    setShareDialogTrigger('none');
    setIsSaving(false);
    setShareUrl('');
    setShowConfirmation(false);
    setIsModalOpen(false);
    skipNextDrawerCloseRef.current = true;
    setIsVariantsOpen(false);
    setCompatibleModules(null);
    setConfiguratorState(undefined);
    resetIframe();
  };

  return (
    <Dialog open={showShareDialog || shareDialogTrigger !== 'none'} onOpenChange={handleShareDialogClose}>
      <DialogContent
        aria-describedby={undefined}
        className="snap2-dialog ov:rounded-2xl ov:p-8 ov:bg-[var(--ov25-background-color)] ov:border-[var(--ov25-border-color)]"
        closeClassName="ov:right-6 ov:top-6 ov:rounded-full ov:text-[var(--ov25-text-color)] ov:opacity-70 hover:ov:opacity-100 ov:transition-opacity"
      >
        <DialogHeader>
          <DialogTitle className="ov:text-lg ov:font-normal ov:text-[var(--ov25-text-color)] ov:tracking-tight">
            {shareDialogTrigger === 'modal-close' ? 'Save Your Configuration' : 'Share Configuration'}
          </DialogTitle>
        </DialogHeader>
        <div className="ov:space-y-4 mt-4">
          {showConfirmation ? (
            <>  
              <p className="ov:text-base ov:font-light ov:text-[var(--ov25-secondary-text-color)] ov:leading-relaxed">
                {shareDialogTrigger === 'modal-close'
                  ? 'Do you want to save your progress? Without saving, your configuration will be lost.'
                  : 'Do you want to save your configuration?'}
              </p>
              <div className="w-full h-4"></div>
              <div className="ov:flex ov:gap-2 pt-8">
                <button
                  onClick={handleConfirmSave}
                  className="ov:flex-1 ov:flex ov:items-center ov:justify-center ov:py-2 ov:px-6 ov:text-sm ov:rounded-[var(--ov25-cta-border-radius)] ov:bg-[var(--ov25-cta-color)] ov:text-[var(--ov25-cta-text-color)] ov:font-medium ov:cursor-pointer ov:hover:bg-[var(--ov25-cta-color-hover)] ov:hover:text-[var(--ov25-cta-text-color-hover)] ov:transition-colors ov:border-0 ov:text-center ov:uppercase"
                >
                  Yes
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleNoSave();
                  }}
                  className="ov:flex-1 ov:flex ov:items-center ov:justify-center ov:py-2 ov:px-6 ov:text-sm ov:rounded-[var(--ov25-cta-border-radius)] ov:border ov:border-[var(--ov25-border-color)] ov:bg-transparent ov:text-[var(--ov25-text-color)] ov:cursor-pointer ov:hover:opacity-90 ov:transition-colors ov:text-center ov:uppercase"
                >
                  No
                </button>
              </div>
            </>
          ) : isSaving ? (
            <div className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:py-8 ov:space-y-4">
              <Loader2 className="ov:w-8 ov:h-8 ov:animate-spin ov:text-[var(--ov25-text-color)]" />
              <p className="ov:text-base ov:font-normal ov:text-[var(--ov25-secondary-text-color)]">Saving configuration...</p>
            </div>
          ) : (
            <>
              <p className="ov:text-base ov:font-normal ov:text-[var(--ov25-secondary-text-color)] ov:leading-relaxed">
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
                  className="ov:w-full ov:flex ov:items-center ov:justify-center ov:py-2 ov:px-6 ov:text-sm ov:rounded-[var(--ov25-cta-border-radius)] ov:bg-[var(--ov25-cta-color)] ov:text-[var(--ov25-cta-text-color)] ov:font-medium ov:cursor-pointer ov:hover:bg-[var(--ov25-cta-color-hover)] ov:hover:text-[var(--ov25-cta-text-color-hover)] ov:transition-colors ov:border-0 ov:text-center ov:uppercase"
                >
                  Copy Link
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

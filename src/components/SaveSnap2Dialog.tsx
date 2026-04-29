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
        id="ov25-snap2-save-dialog"
        aria-describedby={undefined}
        className="snap2-dialog ov:rounded-2xl ov:p-8 ov:bg-(--ov25-background-color) ov:border-(--ov25-border-color)"
        closeClassName="ov:right-6 ov:top-6 ov:rounded-full ov:text-[var(--ov25-text-color)] ov:opacity-70 hover:ov:opacity-100 ov:transition-opacity"
      >
        <DialogHeader className="ov:space-y-1 ov:text-left">
          <DialogTitle className="ov:text-xl ov:font-semibold ov:text-(--ov25-text-color) ov:tracking-tight">
            {shareDialogTrigger === 'modal-close' ? 'Save Your Configuration' : 'Share Configuration'}
          </DialogTitle>
        </DialogHeader>
        <div className="ov:mt-6 ov:flex ov:flex-col ov:gap-6">
          {showConfirmation ? (
            <>
              <p className="ov:text-base ov:font-normal ov:text-(--ov25-secondary-text-color) ov:leading-relaxed">
                {shareDialogTrigger === 'modal-close'
                  ? 'Do you want to save your progress? Without saving, your configuration will be lost.'
                  : 'Do you want to save your configuration?'}
              </p>
              <div className="ov:flex ov:flex-col ov:gap-3 ov:sm:flex-row ov:sm:justify-end">
                <button
                  type="button"
                  id="ov25-snap2-save-dialog-no"
                  onClick={handleNoSave}
                  className="ov:order-2 ov:sm:order-1 ov:flex-1 ov:sm:flex-none ov:inline-flex ov:min-h-11 ov:items-center ov:justify-center ov:rounded-(--ov25-cta-border-radius) ov:border ov:border-(--ov25-border-color) ov:bg-(--ov25-secondary-background-color) ov:px-6 ov:text-sm ov:font-medium ov:text-(--ov25-text-color) ov:transition-colors hover:ov:bg-(--ov25-hover-color) ov:sm:min-w-30"
                >
                  No
                </button>
                <button
                  type="button"
                  id="ov25-snap2-save-dialog-yes"
                  onClick={handleConfirmSave}
                  className="ov:order-1 ov:sm:order-2 ov:flex-1 ov:inline-flex ov:min-h-11 ov:items-center ov:justify-center ov:rounded-(--ov25-cta-border-radius) ov:bg-(--ov25-cta-color) ov:px-6 ov:text-sm ov:font-medium ov:text-(--ov25-cta-text-color) ov:transition-colors hover:ov:bg-(--ov25-cta-color-hover) hover:ov:text-(--ov25-cta-text-color-hover) ov:sm:min-w-30"
                >
                  Yes
                </button>
              </div>
            </>
          ) : isSaving ? (
            <div className="ov:flex ov:flex-col ov:items-center ov:justify-center ov:gap-4 ov:py-10">
              <Loader2 className="ov:h-10 ov:w-10 ov:animate-spin ov:text-(--ov25-cta-color)" aria-hidden />
              <p className="ov:text-center ov:text-base ov:font-medium ov:text-(--ov25-secondary-text-color)">
                Saving configuration…
              </p>
            </div>
          ) : (
            <>
              <p className="ov:text-base ov:font-normal ov:text-(--ov25-secondary-text-color) ov:leading-relaxed">
                {shareDialogTrigger === 'modal-close'
                  ? 'Save this link to return to your configuration later. Without it, your progress will be lost:'
                  : 'Copy this link to share with others or save your custom configuration for later:'}
              </p>
              <div className="ov:flex ov:flex-col ov:gap-3">
                <textarea
                  value={shareUrl}
                  rows={3}
                  readOnly
                  className="ov:min-h-22 ov:w-full ov:resize-none ov:rounded-lg ov:border ov:border-(--ov25-border-color) ov:bg-(--ov25-secondary-background-color) ov:p-3 ov:font-mono ov:text-sm ov:leading-snug ov:text-(--ov25-text-color) ov:outline-none focus-visible:ov:ring-2 focus-visible:ov:ring-(--ov25-cta-color) focus-visible:ov:ring-offset-2 focus-visible:ov:ring-offset-(--ov25-background-color)"
                  placeholder="Shareable link will appear here…"
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="ov:inline-flex ov:min-h-11 ov:w-full ov:items-center ov:justify-center ov:rounded-(--ov25-cta-border-radius) ov:bg-(--ov25-cta-color) ov:px-6 ov:text-sm ov:font-medium ov:text-(--ov25-cta-text-color) ov:transition-colors hover:ov:bg-(--ov25-cta-color-hover) hover:ov:text-(--ov25-cta-text-color-hover)"
                >
                  Copy link
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

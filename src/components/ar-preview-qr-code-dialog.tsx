import * as React from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog.js"
import QRCode from "react-qr-code";
export const ArPreviewQRCodeDialog = ({arPreviewLink, setArPreviewLink}: {arPreviewLink: string | null, setArPreviewLink: (link: string | null) => void}) => {
    return (
        <Dialog open={arPreviewLink !== null} onOpenChange={() => setArPreviewLink(null)}>
       
            <DialogContent className='ov:bg-[var(--ov25-configurator-qr-code-popup-background-color)] ov:border-[var(--ov25-configurator-qr-code-popup-border-color)]'>
            <DialogHeader>
                <DialogTitle className='ov:text-[var(--ov25-configurator-qr-code-popup-title-text-color)]'>View in room</DialogTitle>
                <DialogDescription className='ov:text-[var(--ov25-configurator-qr-code-popup-description-text-color)]'>Scan the QR code on your phones camera to view this item in your room</DialogDescription>
            </DialogHeader>
                {arPreviewLink !== null && <QRCode className="ov:w-full ov:h-full" value={arPreviewLink} />}
                <DialogFooter>
                    <p className="ov:text-xs ov:text-[var(--ov25-configurator-qr-code-popup-link-text-color)]">{arPreviewLink}</p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ArPreviewQRCodeDialog;
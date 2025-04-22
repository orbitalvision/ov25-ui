
import * as React from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog"
import QRCode from "react-qr-code";
export const ArPreviewQRCodeDialog = ({arPreviewLink, setArPreviewLink}: {arPreviewLink: string | null, setArPreviewLink: (link: string | null) => void}) => {
    return (
        <Dialog open={arPreviewLink !== null} onOpenChange={() => setArPreviewLink(null)}>
       
            <DialogContent>
            <DialogHeader>
                <DialogTitle>View in room</DialogTitle>
                <DialogDescription>Scan the QR code on your phones camera to view this item in your room</DialogDescription>
            </DialogHeader>
                {arPreviewLink !== null && <QRCode className="w-full h-full" value={arPreviewLink} />}
                <DialogFooter>
                    <p className="text-xs text-gray-500">{arPreviewLink}</p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ArPreviewQRCodeDialog;
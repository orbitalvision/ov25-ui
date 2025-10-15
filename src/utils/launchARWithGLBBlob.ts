
interface ModelViewerElement extends HTMLElement {
    activateAR: () => void;
  }



  const loadModelViewerScript = (targetDocument: Document): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (targetDocument.querySelector('script[src*="model-viewer"]')) {
        resolve();
        return;
      }
      
      const script = targetDocument.createElement('script');
      script.type = 'module';
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load model-viewer script'));
      targetDocument.head.appendChild(script);
    });
  };
  

const launchARWithGLBBlobInner = async (
    glbBlob: Blob,
    onClose?: () => void,
    overlayId: string = 'ar-model-viewer-overlay'
  ) => {
    try {
      await loadModelViewerScript(document);
  
      const glbUrl = URL.createObjectURL(glbBlob);
  
      const existingOverlay = document.getElementById(overlayId);
      if (existingOverlay) {
        existingOverlay.remove();
      }
  
      const handleFullscreenExit = () => {
        if (!document.fullscreenElement) {
          const overlay = document.getElementById(overlayId);
          if (overlay) {
            overlay.remove();
          }
          if (onClose) onClose();
        }
      };
  
      document.addEventListener('fullscreenchange', handleFullscreenExit);
  
      const overlay = document.createElement('div');
      overlay.id = overlayId;
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #000000;
        z-index: 100000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `;
  
      
      const modelViewer = document.createElement('model-viewer') as ModelViewerElement;
      modelViewer.setAttribute('src', glbUrl);
      modelViewer.setAttribute('alt', '3D Model');
      modelViewer.setAttribute('camera-controls', '');
      modelViewer.setAttribute('ar', '');
      modelViewer.setAttribute('ar-modes', 'webxr scene-viewer ');
      modelViewer.setAttribute('ar-scale', 'auto');
      modelViewer.setAttribute('ar-placement', 'floor');
      modelViewer.setAttribute('environment-image', 'neutral');
      modelViewer.setAttribute('exposure', '0.9');
      modelViewer.setAttribute('shadow-intensity', '0.3');
      modelViewer.style.cssText = `
        width: 100%;
        height: 100%;
      `;
  
      const cleanup = () => {
        overlay.remove();
        URL.revokeObjectURL(glbUrl);
        document.removeEventListener('fullscreenchange', handleFullscreenExit);
        if (onClose) onClose();
      };
  
      modelViewer.addEventListener('load', async () => {
        const canAR = (modelViewer as any).canActivateAR;
        
        if (canAR) {
          try {
            
            if (typeof modelViewer.activateAR === 'function') {
              await modelViewer.activateAR();
            } else {
              console.error('activateAR is not available on model-viewer');
              cleanup();
            }
          } catch (error) {
            console.error('Error activating AR:', error);
            cleanup();
          }
        } else {
          cleanup();
        }
      });
  
      modelViewer.addEventListener('error', (event) => {
        console.error('Model-viewer error:', event);
        cleanup();
      });
  
      modelViewer.addEventListener('ar-status', (event: any) => {
        if (event.detail.status === 'not-presenting') {
          cleanup();
        }
      });
  
      overlay.appendChild(modelViewer);
  
      document.body.appendChild(overlay);
  
    } catch (error) {
      console.error('Error launching AR with GLB blob:', error);
      if (onClose) onClose();
    }
  };

export const launchARWithGLBBlob = async (
  glbBlob: Blob,
  onClose?: () => void,
  overlayId: string = 'ar-model-viewer-overlay'
) => {
  const promptOverlay = document.createElement('div');
  promptOverlay.id = 'ar-prompt-overlay';
  promptOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.95);
    z-index: 100001;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  const message = document.createElement('div');
  message.textContent = 'Click anywhere to continue';
  message.style.cssText = `
    color: white;
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    padding: 40px;
  `;

  promptOverlay.appendChild(message);
  document.body.appendChild(promptOverlay);

  promptOverlay.addEventListener('click', async () => {
    promptOverlay.remove();
    await launchARWithGLBBlobInner(glbBlob, onClose, overlayId);
  });
};
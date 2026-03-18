import { useCallback, useEffect, useRef, useState } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { SerializableInjectConfig } from '../preview-config-serializable';

const OV25_CONFIG_MESSAGE = 'OV25_CONFIG';
const PREVIEW_BASE_URL = 'https://app.ov25.ai/configurator-preview';

function getPreviewBase(useLocalhost?: boolean) {
  if (useLocalhost && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `http://localhost:${window.location.port}/configurator-preview`;
  }
  return PREVIEW_BASE_URL;
}

type DeviceMode = 'desktop' | 'mobile';

const DEVICE_SIZES: Record<DeviceMode, { width: string; label: string }> = {
  desktop: { width: '100%', label: 'Desktop' },
  mobile: { width: '375px', label: 'Mobile' },
};

interface PreviewAreaProps {
  serializableConfig: SerializableInjectConfig;
  previewBaseUrl?: string;
  useLocalPreview?: boolean;
}

function postConfig(iframe: HTMLIFrameElement | null, config: SerializableInjectConfig) {
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage({ type: OV25_CONFIG_MESSAGE, config }, '*');
}

export function PreviewArea({ serializableConfig, previewBaseUrl, useLocalPreview }: PreviewAreaProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const configRef = useRef(serializableConfig);
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  configRef.current = serializableConfig;

  const src = previewBaseUrl || getPreviewBase(useLocalPreview);

  const sendConfig = useCallback(() => {
    postConfig(iframeRef.current, configRef.current);
  }, []);

  useEffect(() => {
    setIframeKey((k) => k + 1);
  }, [serializableConfig]);

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full">
      <div className="flex items-center justify-between px-1 pb-3">
        <span className="text-sm font-medium text-muted-foreground">
          Preview &mdash; {DEVICE_SIZES[device].label}
        </span>
        <div className="inline-flex items-center rounded-full bg-muted p-1 gap-0.5">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
              device === 'desktop' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all',
              device === 'mobile' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>
      </div>
      <div
        className="flex-1 min-h-0 flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden p-4 pb-20"
        onWheel={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out p-[3px] shadow-xl',
            device === 'mobile' ? 'rounded-[2rem]' : 'rounded-xl',
          )}
          style={{
            width: DEVICE_SIZES[device].width,
            maxWidth: '100%',
            maxHeight: device === 'mobile' ? '812px' : '900px',
            background: '#333333',
          }}
        >
          <iframe
            key={iframeKey}
            ref={iframeRef}
            src={src}
            title="Configurator preview"
            className={cn(
              'w-full h-full border-0 bg-white',
              device === 'mobile' ? 'rounded-[1.6rem]' : 'rounded-[0.65rem]',
            )}
            sandbox="allow-scripts allow-same-origin"
            onLoad={sendConfig}
          />
        </div>
      </div>
    </div>
  );
}

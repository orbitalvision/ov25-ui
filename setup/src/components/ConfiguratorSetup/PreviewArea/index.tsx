import { useCallback, useEffect, useRef, useState } from 'react';
import { Monitor, Smartphone, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '../../../lib/utils';
import {
  CONFIGURATOR_PREVIEW_LOCAL_BASE_URL,
  CONFIGURATOR_PREVIEW_PRODUCTION_BASE_URL,
} from '../../../lib/config/preview-config';
import type { SerializableInjectConfig } from '../preview-config-serializable';

const OV25_CONFIG_MESSAGE = 'OV25_CONFIG';
const OV25_PREVIEW_READY = 'OV25_PREVIEW_READY';

export function resolvePreviewIframeSrc(
  previewBaseUrl: string | undefined,
  useLocalPreview: boolean | undefined,
  hostname: string | undefined,
) {
  if (previewBaseUrl) return previewBaseUrl;
  if (
    useLocalPreview === true &&
    (hostname === 'localhost' || hostname === '127.0.0.1')
  ) {
    return CONFIGURATOR_PREVIEW_LOCAL_BASE_URL;
  }
  return CONFIGURATOR_PREVIEW_PRODUCTION_BASE_URL;
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

function postConfig(iframe: HTMLIFrameElement | null, config: SerializableInjectConfig, origin: string) {
  if (!iframe?.contentWindow) return;
  iframe.contentWindow.postMessage({ type: OV25_CONFIG_MESSAGE, config }, origin);
}

export function PreviewArea({ serializableConfig, previewBaseUrl, useLocalPreview }: PreviewAreaProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const configRef = useRef(serializableConfig);
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [retry, setRetry] = useState(0);
  const [status, setStatus] = useState<'loading' | 'initialising' | 'loaded' | 'ready' | 'error'>('loading');
  const [error, setError] = useState('The demo could not be loaded.');
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!viewportRef.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setViewport({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(viewportRef.current);
    return () => observer.disconnect();
  }, []);

  configRef.current = serializableConfig;

  const src = resolvePreviewIframeSrc(
    previewBaseUrl,
    useLocalPreview,
    typeof window === 'undefined' ? undefined : window.location.hostname,
  );

  const origin = new URL(src, typeof window === 'undefined' ? CONFIGURATOR_PREVIEW_PRODUCTION_BASE_URL : window.location.href).origin;
  // Equal payloads keep the same DOM node even when the host recreates its props.
  const iframeKey = JSON.stringify([src, serializableConfig, device, retry]);
  const desktopWidth = Math.max(1024, viewport.width - 6) + 6;
  const scale = device === 'desktop' && viewport.width > 0 ? Math.min(1, viewport.width / desktopWidth) : 1;
  const previewHeight = viewport.height ? Math.min(viewport.height, device === 'mobile' ? 812 : 900) : undefined;
  const sendConfig = useCallback(() => {
    postConfig(iframeRef.current, configRef.current, origin);
  }, [origin]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== origin) return;
      if (event.data?.type === OV25_PREVIEW_READY) {
        postConfig(iframeRef.current, configRef.current, origin);
        setStatus((previous) => previous === 'loading' || previous === 'loaded'
          ? event.data.statusProtocolVersion === 1 ? 'initialising' : 'loaded'
          : previous);
      } else if (event.data?.type === 'OV25_PREVIEW_STATUS') {
        if (event.data.status === 'ready') setStatus('ready');
        if (event.data.status === 'error') {
          setError(typeof event.data.message === 'string' ? event.data.message : 'The demo could not be loaded.');
          setStatus('error');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [origin]);

  useEffect(() => {
    setStatus('loading');
    setError('The demo could not be loaded.');
    const timeout = window.setTimeout(() => {
      // Old supported pages still send the config-request handshake. A generic
      // iframe load (including a 404/login page) does not count as a working demo.
      setStatus((previous) => previous === 'loading' ? 'error' : previous);
    }, 30000);
    const dataTimeout = window.setTimeout(() => {
      setStatus((previous) => previous === 'initialising' ? 'error' : previous);
    }, 95000);
    return () => { window.clearTimeout(timeout); window.clearTimeout(dataTimeout); };
  }, [iframeKey]);

  return (
    <div className="flex-1 min-h-0 flex flex-col h-full">
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-3">
        <span className="text-sm font-medium text-muted-foreground">
          Interactive demo &mdash; {DEVICE_SIZES[device].label}
        </span>
        <div className="inline-flex items-center rounded-full bg-muted p-1 gap-0.5">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            aria-pressed={device === 'desktop'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
              device === 'desktop' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            aria-pressed={device === 'mobile'}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
              device === 'mobile' ? 'bg-background text-foreground shadow' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>
      </div>
      <div
        ref={viewportRef}
        className="relative flex-1 min-h-0 flex items-center justify-center rounded-xl overflow-hidden p-2"
        onWheel={(e) => e.stopPropagation()}
      >
          {(status === 'loading' || status === 'initialising') && <div role="status" className="absolute left-1/2 top-5 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-white px-4 py-2 text-xs shadow-sm"><Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" />{status === 'initialising' ? 'Loading product…' : 'Loading demo…'}</div>}
          {status === 'error' && <div role="alert" className="absolute inset-x-5 top-5 z-10 rounded-xl border bg-white p-4 text-sm shadow-lg"><p>{error}</p><button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-3 inline-flex items-center gap-2 font-medium"><RotateCcw className="h-4 w-4" />Retry demo</button><p className="mt-2 text-xs text-muted-foreground">You can continue editing and save your settings.</p></div>}
        <div
          className="relative"
          style={{ width: DEVICE_SIZES[device].width, maxWidth: '100%', height: previewHeight ?? '100%' }}
        >
        <div
          className={cn(
            'h-full p-[3px] shadow-lg',
            device === 'mobile' ? 'rounded-[2rem]' : 'rounded-xl',
          )}
          style={{
            width: device === 'desktop' ? desktopWidth : '100%',
            height: previewHeight ? previewHeight / scale : '100%',
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
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
            onError={() => setStatus('error')}
          />
        </div>
        </div>
      </div>
    </div>
  );
}

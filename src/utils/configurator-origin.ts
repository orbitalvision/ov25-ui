const TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

const CONFIGURATOR_PRODUCTION_BASE_URL = 'https://configurator.orbital.vision';
const LOCAL_OV25_PORT = '3000';

const isTruthyEnv = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  return TRUE_VALUES.has(value.trim().toLowerCase());
};

export const isOv25ConfiguratorDevEnabled = (): boolean => {
  const env = import.meta.env as Record<string, string | undefined>;

  return (
    isTruthyEnv(import.meta.env.OV25_CONFIGURATOR_DEV) ||
    isTruthyEnv(import.meta.env.VITE_OV25_CONFIGURATOR_DEV) ||
    isTruthyEnv(env['ov25-configurator-dev']) ||
    isTruthyEnv(import.meta.env.USE_LOCAL_DEV)
  );
};

const formatHostnameForUrl = (hostname: string): string => {
  if (hostname.includes(':') && !hostname.startsWith('[')) {
    return `[${hostname}]`;
  }

  return hostname;
};

const getLocalOv25ConfiguratorBaseUrl = (): string => {
  if (typeof window === 'undefined') {
    return `http://localhost:${LOCAL_OV25_PORT}/configurator`;
  }

  const hostname = window.location.hostname || 'localhost';
  return `http://${formatHostnameForUrl(hostname)}:${LOCAL_OV25_PORT}/configurator`;
};

export const getConfiguratorBaseUrl = (): string => {
  if (isOv25ConfiguratorDevEnabled()) {
    return getLocalOv25ConfiguratorBaseUrl();
  }

  return CONFIGURATOR_PRODUCTION_BASE_URL;
};

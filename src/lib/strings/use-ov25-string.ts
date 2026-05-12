import { useCallback } from 'react';
import { useOV25UI } from '../../contexts/ov25-ui-context.js';
import type { StringInterpolationVars } from './resolve-string-replacement.js';

export function useOv25String() {
  const { getString } = useOV25UI();

  return useCallback(
    (key: string, vars?: StringInterpolationVars, fallback = '') =>
      getString(key, vars, fallback),
    [getString]
  );
}


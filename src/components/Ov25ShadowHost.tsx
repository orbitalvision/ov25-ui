import React, {
  forwardRef,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useOV25UI } from '../contexts/ov25-ui-context.js';
import {
  getSharedStylesheet,
  createuserCustomCssStylesheet,
} from '../utils/shadow-styles.js';

/**
 * Host div + inner open shadow root with OV25 adopted stylesheets.
 * Use when children use `ov:*` / shadow-scoped tokens but ancestors are light DOM (e.g. document.body).
 */
export const Ov25ShadowHost = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }
>(function Ov25ShadowHost({ children, ...hostProps }, ref) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);
  const { cssString } = useOV25UI();

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref)
        (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref]
  );

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    let sr = el.shadowRoot;
    if (!sr) {
      sr = el.attachShadow({ mode: 'open' });
    }
    const stylesheets: CSSStyleSheet[] = [getSharedStylesheet()];
    if (cssString) {
      stylesheets.push(createuserCustomCssStylesheet(cssString));
    }
    sr.adoptedStyleSheets = stylesheets;
    setShadowRoot(sr);
  }, [cssString]);

  return (
    <>
      <div ref={setRefs} {...hostProps}>
        <span className="ov:w-full ov:h-full ov:pointer-events-none" />
      </div>
      {shadowRoot && createPortal(children, shadowRoot)}
    </>
  );
});

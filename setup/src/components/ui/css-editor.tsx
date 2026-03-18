import { useRef, useEffect, useCallback } from 'react';
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { css } from '@codemirror/lang-css';
import { defaultKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

interface CSSEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Lightweight CodeMirror 6 editor for CSS, styled to match the setup UI.
 */
export function CSSEditor({ value, onChange, placeholder, className }: CSSEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const createView = useCallback(() => {
    if (!containerRef.current) return;
    if (viewRef.current) viewRef.current.destroy();

    const state = EditorState.create({
      doc: value,
      extensions: [
        keymap.of(defaultKeymap),
        css(),
        syntaxHighlighting(defaultHighlightStyle),
        oneDark,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        }),
        EditorView.theme({
          '&': { fontSize: '11px', borderRadius: '6px', border: '1px solid hsl(var(--border))' },
          '.cm-content': { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', minHeight: '100px', padding: '8px 0' },
          '.cm-gutters': { display: 'none' },
          '.cm-scroller': { borderRadius: '6px' },
          '&.cm-focused': { outline: '2px solid hsl(var(--ring))', outlineOffset: '-1px' },
        }),
        EditorView.lineWrapping,
        ...(placeholder ? [cmPlaceholder(placeholder)] : []),
      ],
    });

    viewRef.current = new EditorView({ state, parent: containerRef.current });
  }, []);

  useEffect(() => {
    createView();
    return () => { viewRef.current?.destroy(); };
  }, [createView]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return <div ref={containerRef} className={className} />;
}

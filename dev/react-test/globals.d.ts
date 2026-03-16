declare global {
  interface Window {
    ov25OpenConfigurator?: (optionName?: string) => void;
    ov25CloseConfigurator?: () => void;
    ov25OpenSwatchBook?: () => void;
    ov25CloseSwatchBook?: () => void;
  }
}

export {};

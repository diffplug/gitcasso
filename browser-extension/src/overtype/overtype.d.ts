interface OverTypeOptions {
  fontSize?: number;
  lineHeight?: number;
  fontFamily?: string;
  theme?: string | ThemeObject;
  autofocus?: boolean;
  placeholder?: string;
  value?: string;
  autoResize?: boolean;
  minHeight?: number;
  maxHeight?: number;
  toolbar?: boolean;
  onChange?: (value: string) => void;
  onKeydown?: (event: KeyboardEvent) => void;
}

interface ThemeObject {
  [key: string]: string;
}

class OverType {
  constructor(
    target: string | Element | NodeList | Element[],
    options?: OverTypeOptions
  );

  getValue(): string;
  setValue(value: string): void;
  getRenderedHTML(processContent?: boolean): string;
  getPreviewHTML(): string;
  setTheme(theme: string | ThemeObject): void;
  showStats(show: boolean): void;
  showPlainTextarea(show: boolean): void;
  showPreviewMode(show: boolean): void;

  static init(selector: string, options?: OverTypeOptions): OverType[];
}

export = OverType;

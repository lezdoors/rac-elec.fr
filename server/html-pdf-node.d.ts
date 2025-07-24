declare module 'html-pdf-node' {
  export interface PdfOptions {
    format?: string;
    path?: string;
    width?: string | number;
    height?: string | number;
    margin?: {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    };
    printBackground?: boolean;
    landscape?: boolean;
    scale?: number;
    displayHeaderFooter?: boolean;
    headerTemplate?: string;
    footerTemplate?: string;
    pageRanges?: string;
    printDelay?: number;
    preferCSSPageSize?: boolean;
  }

  export interface FileOptions {
    content?: string;
    url?: string;
    html?: string;
  }

  export function generatePdf(file: FileOptions, options: PdfOptions): Promise<Buffer>;
}
export type PaperSizeKey =
  | 'A5'
  | 'Demy 1/8'
  | 'Crown 1/8'
  | 'B5'
  | 'A4'
  | 'A3'
  | 'Letter'
  | 'Legal'
  | 'DL'
  | 'Custom';
export type Orientation = 'portrait' | 'landscape';
export type MarginPresetKey = 'normal' | 'narrow' | 'moderate' | 'wide' | 'custom';
export type PageBorderStyleKey = 'none' | 'thin' | 'double' | 'thick' | 'dashed' | 'ornamental';
export type PaperTintKey = 'white' | 'ivory' | 'yellow' | 'pink';
export type PageNumberPosition = 'bottom' | 'top';
export type PageNumberAlign = 'left' | 'center' | 'right' | 'outer';
export type PageNumberFormat = 'malayalam_x_of_y' | 'numeric_only' | 'english_x_of_y';
export type BookFrontMatterKey = 'title-page' | 'copyright-page' | 'toc-page';

export type MalayalamFontCategory =
  | 'Clean Sans-Serif (നോട്ടീസ് / ഓഫീസ്)'
  | 'Book & Literary Serif (പുസ്തകം / സാഹിത്യം)'
  | 'Poster & Bold Headlines (തലക്കെട്ടുകൾ)'
  | 'Calligraphy & Invitation (ക്ഷണക്കത്ത് / കവിത)'
  | 'Traditional DTP (പഴയ ലിപി / തനിമ)';

export interface MalayalamFontOption {
  id: string;
  name: string;
  cssFamily: string;
  category: MalayalamFontCategory;
  malayalamSample: string;
  badge: string;
  weightsLabel: string;
  isTraditionalDtp?: boolean;
}

export interface PaperDimensionsMm {
  name: string;
  malayalamDesc: string;
  widthMm: number;
  heightMm: number;
  isBookSize?: boolean;
}

export interface MarginsMm {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SavedProjectState {
  docTitle: string;
  htmlContent: string;
  paperSize: PaperSizeKey;
  customWidthMm: number;
  customHeightMm: number;
  orientation: Orientation;
  marginPreset: MarginPresetKey;
  margins: MarginsMm;
  defaultDocFontId: string;
  showHeaderFooter: boolean;
  headerText: string;
  footerText: string;
  showPageNumbers: boolean;
  differentFirstPage: boolean;
  pageNumberPosition: PageNumberPosition;
  pageNumberAlign: PageNumberAlign;
  pageNumberFormat: PageNumberFormat;
  lineSpacing: string;
  letterSpacing: string;
  firstLineIndent: boolean;
  spaceAfterParagraph: boolean;
  paragraphGapPt?: number;
  pageBorderStyle: PageBorderStyleKey;
  pageBorderColor: string;
  pageBorderPaddingMm: number;
  columnCount: 1 | 2 | 3;
  watermarkText: string;
  paperTint: PaperTintKey;
  printBackgroundTint: boolean;
  showRuler: boolean;
  showCropMarks: boolean;
  // Book Publishing Mode fields
  mirrorMargins?: boolean;
  innerMarginMm?: number;
  outerMarginMm?: number;
  useOddEvenHeaders?: boolean;
  evenHeaderText?: string;
  oddHeaderText?: string;
  hideHeaderOnChapterPages?: boolean;
}

export type ActiveDrawer = 'none' | 'format' | 'insert' | 'more' | 'share-export';
export type FormatTab = 'text' | 'paragraph';
export type MoreSubPanel = 'main' | 'page-setup' | 'templates';

export interface ParagraphStyleOption {
  tag: 'p' | 'title' | 'h1' | 'h2' | 'h3';
  label: string;
  malayalamLabel: string;
}

export interface DocumentMetrics {
  words: number;
  chars: number;
}

declare global {
  interface Window {
    htmlDocx?: {
      asBlob: (
        html: string,
        options?: {
          orientation?: 'portrait' | 'landscape';
          margins?: {
            top?: number;
            right?: number;
            bottom?: number;
            left?: number;
          };
        }
      ) => Blob;
    };
  }
}

import React, { useState } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  BookOpen,
  BookmarkPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Columns,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Indent,
  Italic,
  List,
  ListOrdered,
  Minus,
  Moon,
  Outdent,
  Palette,
  Printer,
  RemoveFormatting,
  Save,
  Scissors,
  Search,
  Share2,
  Sparkles,
  Strikethrough,
  Subscript,
  Sun,
  Superscript,
  Table as TableIcon,
  Trash2,
  Type,
  Underline,
  X,
} from 'lucide-react';
import {
  ActiveDrawer,
  BookFrontMatterKey,
  DocumentMetrics,
  FormatTab,
  MalayalamFontOption,
  MarginPresetKey,
  MarginsMm,
  MoreSubPanel,
  Orientation,
  PageBorderStyleKey,
  PageNumberAlign,
  PageNumberFormat,
  PageNumberPosition,
  PaperSizeKey,
  PaperTintKey,
} from '../types';
import {
  FONT_CATEGORIES,
  HIGHLIGHT_COLOR_PALETTE,
  LINE_SPACINGS,
  MALAYALAM_FONTS,
  MARGIN_PRESETS,
  PAGE_BORDER_COLORS,
  PAGE_BORDER_STYLES,
  PAPER_SIZES,
  PAPER_TINTS,
  PARAGRAPH_STYLES,
  TEXT_COLOR_PALETTE,
} from '../constants/fonts';

export interface BottomSheetsProps {
  activeDrawer: ActiveDrawer;
  setActiveDrawer: (drawer: ActiveDrawer) => void;
  formatTab: FormatTab;
  setFormatTab: (tab: FormatTab) => void;
  moreSubPanel: MoreSubPanel;
  setMoreSubPanel: (panel: MoreSubPanel) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;

  // Document & Metrics
  docTitle: string;
  setDocTitle: (title: string) => void;
  metrics: DocumentMetrics;
  pageCount: number;
  zoomMode: 'fit' | '100';
  setZoomMode: (mode: 'fit' | '100') => void;

  // Font & Text Formatting
  activeFont: MalayalamFontOption;
  onSelectFont: (font: MalayalamFontOption) => void;
  fontSizePt: number;
  onChangeFontSize: (delta: number) => void;
  activeParagraphStyle: 'p' | 'title' | 'h1' | 'h2' | 'h3';
  onApplyParagraphStyle: (tag: 'p' | 'title' | 'h1' | 'h2' | 'h3') => void;
  onExecCommand: (cmd: string, value?: string) => void;
  activeTextColor: string;
  onApplyTextColor: (hex: string) => void;
  activeHighlightColor: string;
  onApplyHighlightColor: (hex: string) => void;
  lineSpacing: string;
  setLineSpacing: (val: string) => void;
  spaceAfterParagraph: boolean;
  setSpaceAfterParagraph: (val: boolean) => void;
  paragraphGapPt: number;
  setParagraphGapPt: (val: number) => void;
  firstLineIndent: boolean;
  setFirstLineIndent: (val: boolean) => void;
  onApplyBookTypography: () => void;

  // Contextual Table & Image Controls
  activeTableCell: HTMLTableCellElement | null;
  onTableAction: (action: 'add-row' | 'del-row' | 'add-col' | 'del-col' | 'del-table') => void;
  activeImageEl: HTMLImageElement | null;
  onImageResize: (widthPercent: number) => void;
  onImageAlign: (align: 'left' | 'center' | 'right') => void;
  onDeleteActiveImage: () => void;

  // Insert Actions
  onInsertTable: (rows: number, cols: number) => void;
  onTriggerImageUpload: () => void;
  onInsertDivider: () => void;
  onInsertPageBreak: () => void;
  onInsertChapterStart: () => void;

  // Page Setup & Print Features
  paperSize: PaperSizeKey;
  setPaperSize: (size: PaperSizeKey) => void;
  customWidthMm: number;
  setCustomWidthMm: (w: number) => void;
  customHeightMm: number;
  setCustomHeightMm: (h: number) => void;
  orientation: Orientation;
  setOrientation: (o: Orientation) => void;
  marginPreset: MarginPresetKey;
  setMarginPreset: (preset: MarginPresetKey) => void;
  margins: MarginsMm;
  setMargins: (m: MarginsMm) => void;
  mirrorMargins: boolean;
  setMirrorMargins: (b: boolean) => void;
  innerMarginMm: number;
  setInnerMarginMm: (mm: number) => void;
  outerMarginMm: number;
  setOuterMarginMm: (mm: number) => void;
  pageBorderStyle: PageBorderStyleKey;
  setPageBorderStyle: (s: PageBorderStyleKey) => void;
  pageBorderColor: string;
  setPageBorderColor: (c: string) => void;
  pageBorderPaddingMm: number;
  setPageBorderPaddingMm: (p: number) => void;
  columnCount: 1 | 2 | 3;
  setColumnCount: (c: 1 | 2 | 3) => void;
  watermarkText: string;
  setWatermarkText: (t: string) => void;
  paperTint: PaperTintKey;
  setPaperTint: (t: PaperTintKey) => void;
  printBackgroundTint: boolean;
  setPrintBackgroundTint: (b: boolean) => void;
  showCropMarks: boolean;
  setShowCropMarks: (b: boolean) => void;
  showRuler: boolean;
  setShowRuler: (b: boolean) => void;

  // Header, Footer & Page Numbers
  showHeaderFooter: boolean;
  setShowHeaderFooter: (b: boolean) => void;
  headerText: string;
  setHeaderText: (t: string) => void;
  footerText: string;
  setFooterText: (t: string) => void;
  useOddEvenHeaders: boolean;
  setUseOddEvenHeaders: (b: boolean) => void;
  evenHeaderText: string;
  setEvenHeaderText: (t: string) => void;
  oddHeaderText: string;
  setOddHeaderText: (t: string) => void;
  hideHeaderOnChapterPages: boolean;
  setHideHeaderOnChapterPages: (b: boolean) => void;
  showPageNumbers: boolean;
  setShowPageNumbers: (b: boolean) => void;
  differentFirstPage: boolean;
  setDifferentFirstPage: (b: boolean) => void;
  pageNumberPosition: PageNumberPosition;
  setPageNumberPosition: (p: PageNumberPosition) => void;
  pageNumberAlign: PageNumberAlign;
  setPageNumberAlign: (a: PageNumberAlign) => void;
  pageNumberFormat: PageNumberFormat;
  setPageNumberFormat: (f: PageNumberFormat) => void;

  // Templates, Find & Replace, Export
  onApplyTemplate: (templateKey: 'a5-notice' | 'a4-letterhead' | 'a4-exam') => void;
  onInsertBookFrontMatter: (key: BookFrontMatterKey) => void;
  onOpenFindReplace: () => void;
  onPrintVectorPdf: () => void;
  onPrintBookletImposition: () => void;
  onExportBookletHtml: () => void;
  onExportWordDocx: (preferShare: boolean) => void;
  onExportStandaloneHtml: () => void;
  onSaveMpsDraft: () => void;
  onTriggerOpenMpsDraft: () => void;
}

export const BottomSheets: React.FC<BottomSheetsProps> = ({
  activeDrawer,
  setActiveDrawer,
  formatTab,
  setFormatTab,
  moreSubPanel,
  setMoreSubPanel,
  darkMode,
  setDarkMode,
  docTitle,
  setDocTitle,
  metrics,
  pageCount,
  zoomMode,
  setZoomMode,
  activeFont,
  onSelectFont,
  fontSizePt,
  onChangeFontSize,
  activeParagraphStyle,
  onApplyParagraphStyle,
  onExecCommand,
  activeTextColor,
  onApplyTextColor,
  activeHighlightColor,
  onApplyHighlightColor,
  lineSpacing,
  setLineSpacing,
  spaceAfterParagraph,
  setSpaceAfterParagraph,
  paragraphGapPt,
  setParagraphGapPt,
  firstLineIndent,
  setFirstLineIndent,
  onApplyBookTypography,
  activeTableCell,
  onTableAction,
  activeImageEl,
  onImageResize,
  onImageAlign,
  onDeleteActiveImage,
  onInsertTable,
  onTriggerImageUpload,
  onInsertDivider,
  onInsertPageBreak,
  onInsertChapterStart,
  paperSize,
  setPaperSize,
  customWidthMm,
  setCustomWidthMm,
  customHeightMm,
  setCustomHeightMm,
  orientation,
  setOrientation,
  marginPreset,
  setMarginPreset,
  margins,
  setMargins,
  mirrorMargins,
  setMirrorMargins,
  innerMarginMm,
  setInnerMarginMm,
  outerMarginMm,
  setOuterMarginMm,
  pageBorderStyle,
  setPageBorderStyle,
  pageBorderColor,
  setPageBorderColor,
  pageBorderPaddingMm,
  setPageBorderPaddingMm,
  columnCount,
  setColumnCount,
  watermarkText,
  setWatermarkText,
  paperTint,
  setPaperTint,
  printBackgroundTint,
  setPrintBackgroundTint,
  showCropMarks,
  setShowCropMarks,
  showRuler,
  setShowRuler,
  showHeaderFooter,
  setShowHeaderFooter,
  headerText,
  setHeaderText,
  footerText,
  setFooterText,
  useOddEvenHeaders,
  setUseOddEvenHeaders,
  evenHeaderText,
  setEvenHeaderText,
  oddHeaderText,
  setOddHeaderText,
  hideHeaderOnChapterPages,
  setHideHeaderOnChapterPages,
  showPageNumbers,
  setShowPageNumbers,
  differentFirstPage,
  setDifferentFirstPage,
  pageNumberPosition,
  setPageNumberPosition,
  pageNumberAlign,
  setPageNumberAlign,
  pageNumberFormat,
  setPageNumberFormat,
  onApplyTemplate,
  onInsertBookFrontMatter,
  onOpenFindReplace,
  onPrintVectorPdf,
  onPrintBookletImposition,
  onExportBookletHtml,
  onExportWordDocx,
  onExportStandaloneHtml,
  onSaveMpsDraft,
  onTriggerOpenMpsDraft,
}) => {
  const [showAlignPopover, setShowAlignPopover] = useState(false);
  const [showColorPopover, setShowColorPopover] = useState(false);
  const [showFontSubList, setShowFontSubList] = useState(false);
  const [tableRowsInput, setTableRowsInput] = useState(3);
  const [tableColsInput, setTableColsInput] = useState(3);

  const preventFocusLoss = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  };

  return (
    <>
      {(activeTableCell || activeImageEl) && activeDrawer === 'none' && (
        <div
          className={`no-print fixed right-2 bottom-14 left-2 z-30 mx-auto flex max-w-xl items-center justify-between gap-1.5 overflow-x-auto rounded-xl border px-3 py-2 shadow-lg ${
            darkMode
              ? 'border-gray-700 bg-gray-800 text-gray-100'
              : 'border-blue-200 bg-white text-gray-800'
          }`}
        >
          {activeTableCell && (
            <div className="flex w-full items-center justify-between gap-1 text-xs font-medium">
              <span className="shrink-0 font-semibold text-[#1A73E8]">Table:</span>
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => onTableAction('add-row')}
                className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-blue-700 hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-300"
              >
                + Row
              </button>
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => onTableAction('del-row')}
                className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
              >
                - Row
              </button>
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => onTableAction('add-col')}
                className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-blue-700 hover:bg-blue-100 dark:bg-gray-700 dark:text-blue-300"
              >
                + Col
              </button>
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => onTableAction('del-col')}
                className="rounded-lg bg-gray-100 px-2.5 py-1.5 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200"
              >
                - Col
              </button>
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => onTableAction('del-table')}
                className="rounded-lg bg-red-50 px-2.5 py-1.5 text-red-600 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-300"
                title="Delete Table"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {activeImageEl && (
            <div className="flex w-full items-center justify-between gap-1.5 text-xs font-medium">
              <span className="shrink-0 font-semibold text-[#1A73E8]">Image:</span>
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onImageResize(pct)}
                  className="rounded-lg bg-gray-100 px-2 py-1 text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-gray-700 dark:text-gray-200"
                >
                  {pct}%
                </button>
              ))}
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => onImageAlign('left')}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => onImageAlign('center')}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => onImageAlign('right')}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <AlignRight className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={onDeleteActiveImage}
                className="rounded bg-red-50 p-1 text-red-600 hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {showAlignPopover && (
        <div
          className={`no-print fixed bottom-14 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-xl border p-1.5 shadow-xl ${
            darkMode
              ? 'border-gray-700 bg-gray-800 text-gray-100'
              : 'border-gray-200 bg-white text-gray-800'
          }`}
        >
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => {
              onExecCommand('justifyLeft');
              setShowAlignPopover(false);
            }}
            className="rounded-lg p-2 hover:bg-blue-50 hover:text-[#1A73E8] dark:hover:bg-gray-700"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => {
              onExecCommand('justifyCenter');
              setShowAlignPopover(false);
            }}
            className="rounded-lg p-2 hover:bg-blue-50 hover:text-[#1A73E8] dark:hover:bg-gray-700"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => {
              onExecCommand('justifyRight');
              setShowAlignPopover(false);
            }}
            className="rounded-lg p-2 hover:bg-blue-50 hover:text-[#1A73E8] dark:hover:bg-gray-700"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => {
              onExecCommand('justifyFull');
              setShowAlignPopover(false);
            }}
            className="rounded-lg p-2 hover:bg-blue-50 hover:text-[#1A73E8] dark:hover:bg-gray-700"
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </button>
        </div>
      )}

      {showColorPopover && (
        <div
          className={`no-print fixed bottom-14 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-xl border p-2 shadow-xl ${
            darkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-white'
          }`}
        >
          {TEXT_COLOR_PALETTE.map((c) => (
            <button
              key={c.hex}
              type="button"
              onMouseDown={preventFocusLoss}
              onClick={() => {
                onApplyTextColor(c.hex);
                setShowColorPopover(false);
              }}
              className="h-6 w-6 rounded-full border border-gray-300 transition-transform hover:scale-110"
              style={{ backgroundColor: c.hex }}
              title={c.label}
            />
          ))}
        </div>
      )}

      {/* PRESS SIGNATURE (MULTIPLE OF 4) BOOK BINDING STATUS BAR */}
      {mirrorMargins && activeDrawer === 'none' && !activeTableCell && !activeImageEl && (
        <div
          className={`no-print fixed right-0 bottom-12 left-0 z-20 flex h-7 items-center justify-center gap-2 border-t px-3 text-[11px] font-medium ${
            darkMode
              ? 'border-gray-800 bg-[#171B22] text-gray-300'
              : 'border-gray-200 bg-[#F8FAFC] text-gray-600'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#1A73E8]" />
          <span className="truncate">
            Total: <strong className="text-gray-900 dark:text-white">{pageCount} {pageCount === 1 ? 'page' : 'pages'}</strong>
            {' • '}
            {pageCount % 4 === 0 ? (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Ready for {pageCount}-page press signature (×4)
              </span>
            ) : (
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                Add {4 - (pageCount % 4)} {4 - (pageCount % 4) === 1 ? 'page' : 'pages'} for {Math.ceil(pageCount / 4) * 4}-page press signature
              </span>
            )}
          </span>
        </div>
      )}

      {/* SLIM GOOGLE DOCS-STYLE BOTTOM FORMATTING BAR */}
      <div
        className={`no-print fixed right-0 bottom-0 left-0 z-30 flex h-12 items-center justify-between border-t px-2 sm:justify-center sm:gap-2 ${
          darkMode
            ? 'border-gray-800 bg-[#1E222B] text-gray-100'
            : 'border-gray-200 bg-white text-gray-800'
        }`}
      >
        <button
          type="button"
          onMouseDown={preventFocusLoss}
          onClick={() => {
            setFormatTab('text');
            setShowFontSubList(true);
            setActiveDrawer('format');
          }}
          className={`flex max-w-[118px] items-center gap-1 truncate rounded-lg border px-2 py-1 text-xs font-medium ${
            darkMode
              ? 'border-gray-700 bg-gray-800 text-blue-300'
              : 'border-gray-200 bg-gray-50 text-gray-800'
          }`}
          title="Change Malayalam Font"
        >
          <Type className="h-3.5 w-3.5 shrink-0 text-[#1A73E8]" />
          <span className="truncate">{activeFont.name.replace(' Malayalam', '')}</span>
        </button>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => onExecCommand('bold')}
            className="rounded-lg p-2 hover:bg-gray-100 active:bg-blue-50 dark:hover:bg-gray-800"
            title="Bold (B)"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => onExecCommand('italic')}
            className="rounded-lg p-2 hover:bg-gray-100 active:bg-blue-50 dark:hover:bg-gray-800"
            title="Italic (I)"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => onExecCommand('underline')}
            className="rounded-lg p-2 hover:bg-gray-100 active:bg-blue-50 dark:hover:bg-gray-800"
            title="Underline (U)"
          >
            <Underline className="h-4 w-4" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => onExecCommand('strikeThrough')}
            className="hidden rounded-lg p-2 hover:bg-gray-100 sm:inline-flex dark:hover:bg-gray-800"
            title="Strikethrough (S)"
          >
            <Strikethrough className="h-4 w-4" />
          </button>

          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => {
              setShowColorPopover((prev) => !prev);
              setShowAlignPopover(false);
            }}
            className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Text Color"
          >
            <span className="flex flex-col items-center text-xs font-bold leading-none">
              A
              <span
                className="mt-0.5 h-1 w-3.5 rounded-full"
                style={{ backgroundColor: activeTextColor }}
              />
            </span>
          </button>

          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => {
              setShowAlignPopover((prev) => !prev);
              setShowColorPopover(false);
            }}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Alignment"
          >
            <AlignLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => onExecCommand('insertUnorderedList')}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Bulleted List"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => setZoomMode(zoomMode === 'fit' ? '100' : 'fit')}
            className={`rounded-lg border px-2 py-1 text-[11px] font-semibold ${
              zoomMode === '100'
                ? 'border-blue-500 bg-blue-50 text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                : darkMode
                  ? 'border-gray-700 bg-gray-800 text-gray-300'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
            }`}
            title="Toggle Zoom Fit / 100%"
          >
            {zoomMode === 'fit' ? 'Fit' : '100%'}
          </button>

          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => {
              setShowFontSubList(false);
              setActiveDrawer(activeDrawer === 'format' ? 'none' : 'format');
            }}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${
              activeDrawer === 'format'
                ? 'bg-[#1A73E8] text-white'
                : 'bg-blue-50 text-[#1A73E8] dark:bg-gray-800 dark:text-blue-400'
            }`}
            title="Full Format Options"
          >
            A≡
          </button>
        </div>
      </div>

      {activeDrawer !== 'none' && (
        <div
          onClick={() => {
            setActiveDrawer('none');
            setShowFontSubList(false);
          }}
          className="no-print fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
        />
      )}

      {activeDrawer === 'format' && (
        <div
          className={`no-print fixed right-0 bottom-0 left-0 z-50 mx-auto max-h-[82vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border-t p-4 shadow-2xl transition-transform ${
            darkMode
              ? 'border-gray-700 bg-[#1E222B] text-gray-100'
              : 'border-gray-200 bg-white text-gray-900'
          }`}
        >
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />

          <div className="mb-3 flex items-center justify-between">
            {showFontSubList ? (
              <button
                type="button"
                onClick={() => setShowFontSubList(false)}
                className="flex items-center gap-1 text-sm font-semibold text-[#1A73E8]"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Format
              </button>
            ) : (
              <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
                <button
                  type="button"
                  onClick={() => setFormatTab('text')}
                  className={`rounded-lg px-4 py-1 text-xs font-semibold transition ${
                    formatTab === 'text'
                      ? 'bg-white text-[#1A73E8] shadow-xs dark:bg-gray-700 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  TEXT (അക്ഷരം)
                </button>
                <button
                  type="button"
                  onClick={() => setFormatTab('paragraph')}
                  className={`rounded-lg px-4 py-1 text-xs font-semibold transition ${
                    formatTab === 'paragraph'
                      ? 'bg-white text-[#1A73E8] shadow-xs dark:bg-gray-700 dark:text-white'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  PARAGRAPH (ഖണ്ഡിക)
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveDrawer('none');
                setShowFontSubList(false);
              }}
              className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {showFontSubList ? (
            <div className="space-y-4 pb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                തിരഞ്ഞെടുത്ത വാക്കുകൾക്കോ മുഴുവൻ പേജിനോ മലയാളം പ്രിന്റ് ഫോണ്ട് നൽകാം:
              </p>
              {FONT_CATEGORIES.map((category) => {
                const fontsInCat = MALAYALAM_FONTS.filter(
                  (f) => f.category === category
                );
                return (
                  <div key={category} className="space-y-1.5">
                    <h4 className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5">
                      {fontsInCat.map((font) => {
                        const isSelected = activeFont.id === font.id;
                        return (
                          <button
                            key={font.id}
                            type="button"
                            onMouseDown={preventFocusLoss}
                            onClick={() => {
                              onSelectFont(font);
                              setShowFontSubList(false);
                            }}
                            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition ${
                              isSelected
                                ? 'border-[#1A73E8] bg-blue-50/70 dark:bg-blue-950/40'
                                : darkMode
                                  ? 'border-gray-700 bg-gray-800/60 hover:bg-gray-800'
                                  : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100'
                            }`}
                          >
                            <div>
                              <div
                                className="text-base font-medium"
                                style={{ fontFamily: font.cssFamily }}
                              >
                                {font.malayalamSample}
                              </div>
                              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">{font.name}</span>
                                <span>•</span>
                                <span className="rounded bg-blue-100/80 px-1.5 py-0.5 text-[10px] font-medium text-blue-800 dark:bg-gray-700 dark:text-blue-300">
                                  {font.badge}
                                </span>
                              </div>
                            </div>
                            {isSelected && (
                              <Check className="h-5 w-5 shrink-0 text-[#1A73E8]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : formatTab === 'text' ? (
            <div className="space-y-4 pb-3">
              <div className="grid grid-cols-6 gap-1.5 rounded-xl bg-gray-100 p-1.5 dark:bg-gray-800">
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('bold')}
                  className="flex h-10 items-center justify-center rounded-lg bg-white font-bold shadow-2xs hover:text-[#1A73E8] dark:bg-gray-700"
                >
                  <Bold className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('italic')}
                  className="flex h-10 items-center justify-center rounded-lg bg-white shadow-2xs hover:text-[#1A73E8] dark:bg-gray-700"
                >
                  <Italic className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('underline')}
                  className="flex h-10 items-center justify-center rounded-lg bg-white shadow-2xs hover:text-[#1A73E8] dark:bg-gray-700"
                >
                  <Underline className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('strikeThrough')}
                  className="flex h-10 items-center justify-center rounded-lg bg-white shadow-2xs hover:text-[#1A73E8] dark:bg-gray-700"
                >
                  <Strikethrough className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('superscript')}
                  className="flex h-10 items-center justify-center rounded-lg bg-white shadow-2xs hover:text-[#1A73E8] dark:bg-gray-700"
                >
                  <Superscript className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('subscript')}
                  className="flex h-10 items-center justify-center rounded-lg bg-white shadow-2xs hover:text-[#1A73E8] dark:bg-gray-700"
                >
                  <Subscript className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                  Style (ശൈലി)
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {PARAGRAPH_STYLES.map((st) => (
                    <button
                      key={st.tag}
                      type="button"
                      onMouseDown={preventFocusLoss}
                      onClick={() => onApplyParagraphStyle(st.tag)}
                      className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        activeParagraphStyle === st.tag
                          ? 'border-[#1A73E8] bg-blue-50 text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                          : darkMode
                            ? 'border-gray-700 bg-gray-800 text-gray-300'
                            : 'border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div>
                  <div className="text-xs text-gray-500">Malayalam Font (ഫോണ്ട്)</div>
                  <div
                    className="text-sm font-semibold"
                    style={{ fontFamily: activeFont.cssFamily }}
                  >
                    {activeFont.name} — {activeFont.badge}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFontSubList(true)}
                  className="flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1A73E8] dark:bg-gray-800 dark:text-blue-300"
                >
                  Change <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <span className="text-xs font-semibold text-gray-500">
                  Size (അക്ഷര വലുപ്പം)
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onMouseDown={preventFocusLoss}
                    onClick={() => onChangeFontSize(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 font-bold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-sm font-bold">
                    {fontSizePt} pt
                  </span>
                  <button
                    type="button"
                    onMouseDown={preventFocusLoss}
                    onClick={() => onChangeFontSize(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 font-bold hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    Text Color (നിറം)
                  </span>
                  <div className="flex items-center gap-1.5">
                    {TEXT_COLOR_PALETTE.map((c) => (
                      <button
                        key={c.hex}
                        type="button"
                        onMouseDown={preventFocusLoss}
                        onClick={() => onApplyTextColor(c.hex)}
                        className={`h-6 w-6 rounded-full border ${
                          activeTextColor === c.hex
                            ? 'ring-2 ring-[#1A73E8] ring-offset-1'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold text-gray-500">
                    Highlight (ഹൈലൈറ്റ്)
                  </span>
                  <div className="flex items-center gap-1.5">
                    {HIGHLIGHT_COLOR_PALETTE.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onMouseDown={preventFocusLoss}
                        onClick={() => onApplyHighlightColor(c.hex)}
                        className={`h-6 w-6 rounded-full border ${
                          activeHighlightColor === c.hex
                            ? 'ring-2 ring-[#1A73E8] ring-offset-1'
                            : 'border-gray-300'
                        }`}
                        style={{
                          backgroundColor:
                            c.hex === 'transparent' ? '#FFFFFF' : c.hex,
                        }}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => onExecCommand('removeFormat')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <RemoveFormatting className="h-4 w-4" />
                Clear Formatting (ഫോർമാറ്റിംഗ് നീക്കം ചെയ്യുക)
              </button>
            </div>
          ) : (
            <div className="space-y-4 pb-3">
              <div className="grid grid-cols-4 gap-2 rounded-xl bg-gray-100 p-1.5 dark:bg-gray-800">
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('justifyLeft')}
                  className="flex h-10 items-center justify-center rounded-lg bg-white shadow-2xs hover:text-[#1A73E8] dark:bg-gray-700"
                >
                  <AlignLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('justifyCenter')}
                  className="flex h-10 items-center justify-center rounded-lg bg-white shadow-2xs hover:text-[#1A73E8] dark:bg-gray-700"
                >
                  <AlignCenter className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('justifyRight')}
                  className="flex h-10 items-center justify-center rounded-lg bg-white shadow-2xs hover:text-[#1A73E8] dark:bg-gray-700"
                >
                  <AlignRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('justifyFull')}
                  className="flex h-10 items-center justify-center rounded-lg bg-white shadow-2xs hover:text-[#1A73E8] dark:bg-gray-700"
                >
                  <AlignJustify className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('insertUnorderedList')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <List className="h-4 w-4" /> Bullets
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('insertOrderedList')}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <ListOrdered className="h-4 w-4" /> Numbered
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('outdent')}
                  className="flex items-center justify-center gap-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <Outdent className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => onExecCommand('indent')}
                  className="flex items-center justify-center gap-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <Indent className="h-4 w-4" />
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-500">
                  Line Spacing (വരികൾ തമ്മിലുള്ള അകലം — Default 1.6 for Malayalam)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {LINE_SPACINGS.map((ls) => (
                    <button
                      key={ls}
                      type="button"
                      onClick={() => setLineSpacing(ls)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                        lineSpacing === ls
                          ? 'border-[#1A73E8] bg-blue-50 text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {ls}
                    </button>
                  ))}
                </div>
              </div>

              {/* BOOK TYPOGRAPHY & PARAGRAPH CONTROLS */}
              <div className="space-y-3 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold">
                      Paragraph Gap (ഖണ്ഡികകൾക്കിടയിലെ അകലം)
                    </div>
                    <div className="text-[10px] text-gray-500">
                      0pt = Authentic book paragraphs · up to 12pt
                    </div>
                  </div>
                  <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-[#1A73E8] dark:bg-gray-800 dark:text-blue-300">
                    {paragraphGapPt} pt
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={12}
                  step={1}
                  value={paragraphGapPt}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setParagraphGapPt(val);
                    setSpaceAfterParagraph(val > 0);
                  }}
                  className="w-full accent-[#1A73E8]"
                />
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFirstLineIndent(!firstLineIndent)}
                    className={`rounded-xl border p-2.5 text-left text-xs font-semibold ${
                      firstLineIndent
                        ? 'border-[#1A73E8] bg-blue-50/70 text-[#1A73E8] dark:bg-blue-950/40 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    First-Line Indent (6mm)
                    <div className="mt-0.5 text-[10px] font-normal text-gray-500">
                      ആദ്യ വരി 6mm അകത്തേക്ക്
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !spaceAfterParagraph;
                      setSpaceAfterParagraph(next);
                      setParagraphGapPt(next ? 8 : 0);
                    }}
                    className={`rounded-xl border p-2.5 text-left text-xs font-semibold ${
                      spaceAfterParagraph
                        ? 'border-[#1A73E8] bg-blue-50/70 text-[#1A73E8] dark:bg-blue-950/40 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Extra Space After Para
                    <div className="mt-0.5 text-[10px] font-normal text-gray-500">
                      {paragraphGapPt === 0 ? 'OFF (0pt Book Style)' : `ON (${paragraphGapPt}pt)`}
                    </div>
                  </button>
                </div>

                <button
                  type="button"
                  onMouseDown={preventFocusLoss}
                  onClick={() => {
                    onApplyBookTypography();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1A73E8] to-indigo-600 px-3.5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:opacity-95 active:scale-[0.99]"
                >
                  <Sparkles className="h-4 w-4" />
                  Apply Book Typography (Tiro · 10.5pt · 1.6 · Justify · 6mm Indent)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeDrawer === 'insert' && (
        <div
          className={`no-print fixed right-0 bottom-0 left-0 z-50 mx-auto max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border-t p-4 shadow-2xl ${
            darkMode
              ? 'border-gray-700 bg-[#1E222B] text-gray-100'
              : 'border-gray-200 bg-white text-gray-900'
          }`}
        >
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Insert (ചേർക്കുക)</h3>
            <button
              type="button"
              onClick={() => setActiveDrawer('none')}
              className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3 pb-4">
            <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold">
                  <TableIcon className="h-4 w-4 text-[#1A73E8]" />
                  Table (പട്ടിക ചേർക്കുക)
                </span>
                <span className="text-xs font-semibold text-gray-500">
                  {tableRowsInput} × {tableColsInput}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 items-center gap-1.5 text-xs">
                  <span>Rows:</span>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={tableRowsInput}
                    onChange={(e) =>
                      setTableRowsInput(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-14 rounded-lg border border-gray-300 px-2 py-1 text-center dark:border-gray-600 dark:bg-gray-800"
                  />
                  <span>Cols:</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={tableColsInput}
                    onChange={(e) =>
                      setTableColsInput(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="w-14 rounded-lg border border-gray-300 px-2 py-1 text-center dark:border-gray-600 dark:bg-gray-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onInsertTable(tableRowsInput, tableColsInput);
                    setActiveDrawer('none');
                  }}
                  className="rounded-xl bg-[#1A73E8] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Insert Table
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                type="button"
                onClick={() => {
                  onInsertChapterStart();
                  setActiveDrawer('none');
                }}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs font-bold text-indigo-800 hover:bg-indigo-100/70 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300"
              >
                <BookmarkPlus className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-center">Insert Chapter Start</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onTriggerImageUpload();
                  setActiveDrawer('none');
                }}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 p-3 text-xs font-semibold hover:bg-blue-50/50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <ImageIcon className="h-5 w-5 text-[#1A73E8]" />
                <span>Image (ചിത്രം)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onInsertDivider();
                  setActiveDrawer('none');
                }}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 p-3 text-xs font-semibold hover:bg-blue-50/50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <Minus className="h-5 w-5 text-[#1A73E8]" />
                <span>Divider Line</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onInsertPageBreak();
                  setActiveDrawer('none');
                }}
                className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-gray-200 p-3 text-xs font-semibold hover:bg-blue-50/50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <Scissors className="h-5 w-5 text-[#1A73E8]" />
                <span>Page Break</span>
              </button>
            </div>

            <div className="space-y-2 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Running Headers & Footers (ഹെഡറും ഫൂട്ടറും)
                </span>
                <input
                  type="checkbox"
                  checked={showHeaderFooter || useOddEvenHeaders}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setShowHeaderFooter(checked);
                    if (!checked) setUseOddEvenHeaders(false);
                  }}
                  className="h-4 w-4 accent-[#1A73E8]"
                />
              </div>

              {(showHeaderFooter || useOddEvenHeaders) && (
                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-[#1A73E8]">
                    <input
                      type="checkbox"
                      checked={useOddEvenHeaders}
                      onChange={(e) => setUseOddEvenHeaders(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#1A73E8]"
                    />
                    Separate Odd / Even Book Running Headers
                  </label>

                  {useOddEvenHeaders ? (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <div>
                        <label className="mb-0.5 block text-[10px] font-semibold text-gray-500">
                          Left / Even Pages (Book Title)
                        </label>
                        <input
                          type="text"
                          value={evenHeaderText}
                          onChange={(e) => setEvenHeaderText(e.target.value)}
                          placeholder="ഉദാ: മഴവില്ലിന്റെ തീരത്ത്"
                          className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-semibold text-gray-500">
                          Right / Odd Pages (Chapter Title)
                        </label>
                        <input
                          type="text"
                          value={oddHeaderText}
                          onChange={(e) => setOddHeaderText(e.target.value)}
                          placeholder="ഉദാ: അധ്യായം 1 — പഴയ കടവിലെ മഴ"
                          className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        value={headerText}
                        onChange={(e) => setHeaderText(e.target.value)}
                        placeholder="Header text (ഉദാ: വാർഷിക റിപ്പോർട്ട്)"
                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800"
                      />
                      <input
                        type="text"
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        placeholder="Footer text (ഉദാ: ജനകീയ വായനശാല)"
                        className="rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800"
                      />
                    </div>
                  )}

                  <label className="flex items-center gap-2 pt-0.5 text-xs text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={hideHeaderOnChapterPages}
                      onChange={(e) =>
                        setHideHeaderOnChapterPages(e.target.checked)
                      }
                      className="h-3.5 w-3.5 accent-[#1A73E8]"
                    />
                    Hide running header on Chapter opening pages
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-2 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">
                  Page Numbers (പേജ് നമ്പർ — പേജ് 1 / {pageCount})
                </span>
                <input
                  type="checkbox"
                  checked={showPageNumbers}
                  onChange={(e) => setShowPageNumbers(e.target.checked)}
                  className="h-4 w-4 accent-[#1A73E8]"
                />
              </div>
              {showPageNumbers && (
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <select
                    value={pageNumberFormat}
                    onChange={(e) =>
                      setPageNumberFormat(e.target.value as PageNumberFormat)
                    }
                    className="rounded-lg border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800"
                  >
                    <option value="malayalam_x_of_y">പേജ് 1 / {pageCount}</option>
                    <option value="numeric_only">1, 2, 3 (Book Numeric)</option>
                    <option value="english_x_of_y">Page 1 of {pageCount}</option>
                  </select>
                  <select
                    value={pageNumberPosition}
                    onChange={(e) =>
                      setPageNumberPosition(e.target.value as PageNumberPosition)
                    }
                    className="rounded-lg border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800"
                  >
                    <option value="bottom">Bottom (Footer)</option>
                    <option value="top">Top (Header)</option>
                  </select>
                  <select
                    value={pageNumberAlign}
                    onChange={(e) =>
                      setPageNumberAlign(e.target.value as PageNumberAlign)
                    }
                    className="col-span-2 rounded-lg border border-gray-300 px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800"
                  >
                    <option value="outer">Outer Corners (Even: Left · Odd: Right — Book Style)</option>
                    <option value="center">Center (Bottom / Top Center)</option>
                    <option value="right">Right Corner</option>
                    <option value="left">Left Corner</option>
                  </select>
                  <label className="col-span-2 flex items-center gap-2 pt-1 text-xs text-gray-600 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={differentFirstPage}
                      onChange={(e) => setDifferentFirstPage(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#1A73E8]"
                    />
                    Hide on first cover page (ആദ്യ പേജിൽ ഒഴിവാക്കുക)
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeDrawer === 'share-export' && (
        <div
          className={`no-print fixed right-0 bottom-0 left-0 z-50 mx-auto max-h-[84vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border-t p-4 shadow-2xl ${
            darkMode
              ? 'border-gray-700 bg-[#1E222B] text-gray-100'
              : 'border-gray-200 bg-white text-gray-900'
          }`}
        >
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">
                Share & Export (ഷെയർ & പ്രിന്റ്)
              </h3>
              <p className="text-xs text-gray-500">
                {paperSize} ({orientation}) • {activeFont.name} • {pageCount}{' '}
                {pageCount === 1 ? 'Page' : 'Pages'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveDrawer('none')}
              className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3 pb-4">
            <div className="rounded-2xl border-2 border-[#1A73E8] bg-blue-50/50 p-3.5 dark:bg-blue-950/30">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1A73E8] text-white">
                  <Printer className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Save / Print as PDF (ഫോണ്ട് മാറാത്ത PDF)
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                    Best for print shops ({paperSize} font-locked vector PDF with
                    closed page borders)
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDrawer('none');
                        setTimeout(() => onPrintVectorPdf(), 120);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-[#1A73E8] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Save as PDF Now
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onExportStandaloneHtml();
                        setActiveDrawer('none');
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-semibold text-[#1A73E8] hover:bg-blue-50 dark:border-gray-600 dark:bg-gray-800 dark:text-blue-300"
                    >
                      <FileCode className="h-3.5 w-3.5" />
                      Download Printable Page (.html)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* OPTIONAL A5 BOOKLET IMPOSITION (2-UP ON A4 LANDSCAPE) */}
            <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-3.5 dark:border-amber-800/60 dark:bg-amber-950/25">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    A5 Booklet Imposition (2-Up on A4 Landscape)
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                    Saddle-stitch print order ({Math.ceil(pageCount / 4) * 4}-page signature across{' '}
                    {Math.ceil(pageCount / 4)} double-sided A4 sheets) for fold &amp; staple booklets
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDrawer('none');
                        setTimeout(() => onPrintBookletImposition(), 120);
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-amber-700"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print 2-Up Booklet
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onExportBookletHtml();
                        setActiveDrawer('none');
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-amber-400 bg-white px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:bg-gray-800 dark:text-amber-300"
                    >
                      <FileCode className="h-3.5 w-3.5" />
                      Download 2-Up Booklet (.html)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-3.5 dark:border-gray-700 dark:bg-gray-800/60">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    Send as Word File (.docx)
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                    Editable Microsoft Word & Google Docs document with{' '}
                    {paperSize} page size
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onExportWordDocx(true);
                        setActiveDrawer('none');
                      }}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                      Share / Send .docx
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onExportWordDocx(false);
                        setActiveDrawer('none');
                      }}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download .docx
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 pt-2.5 text-xs text-gray-500 dark:border-gray-700">
              <span>Project Draft (.mps):</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onSaveMpsDraft();
                    setActiveDrawer('none');
                  }}
                  className="font-semibold text-[#1A73E8] hover:underline"
                >
                  Save Draft (.mps)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    onTriggerOpenMpsDraft();
                    setActiveDrawer('none');
                  }}
                  className="font-semibold text-[#1A73E8] hover:underline"
                >
                  Open Draft (.mps)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeDrawer === 'more' && (
        <div
          className={`no-print fixed right-0 bottom-0 left-0 z-50 mx-auto max-h-[86vh] w-full max-w-xl overflow-y-auto rounded-t-2xl border-t p-4 shadow-2xl ${
            darkMode
              ? 'border-gray-700 bg-[#1E222B] text-gray-100'
              : 'border-gray-200 bg-white text-gray-900'
          }`}
        >
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />

          <div className="mb-3 flex items-center justify-between">
            {moreSubPanel !== 'main' ? (
              <button
                type="button"
                onClick={() => setMoreSubPanel('main')}
                className="flex items-center gap-1 text-sm font-bold text-[#1A73E8]"
              >
                <ChevronLeft className="h-4 w-4" />
                {moreSubPanel === 'page-setup'
                  ? 'Page Setup & Borders'
                  : 'Malayalam Templates'}
              </button>
            ) : (
              <h3 className="text-sm font-bold">
                Document Options & Page Setup
              </h3>
            )}
            <button
              type="button"
              onClick={() => {
                setActiveDrawer('none');
                setMoreSubPanel('main');
              }}
              className="rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {moreSubPanel === 'main' && (
            <div className="space-y-3 pb-4">
              <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <label className="mb-1 block text-[11px] font-semibold text-gray-500">
                  Document Title (ഡോക്യുമെന്റിന്റെ പേര്)
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold focus:border-[#1A73E8] focus:outline-none dark:border-gray-600 dark:bg-gray-800"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-xl bg-gray-100 p-2.5 text-center text-xs dark:bg-gray-800">
                <div>
                  <div className="font-bold text-[#1A73E8]">{pageCount}</div>
                  <div className="text-[11px] text-gray-500">Pages (പേജുകൾ)</div>
                </div>
                <div>
                  <div className="font-bold text-[#1A73E8]">{metrics.words}</div>
                  <div className="text-[11px] text-gray-500">Words (വാക്കുകൾ)</div>
                </div>
                <div>
                  <div className="font-bold text-[#1A73E8]">{metrics.chars}</div>
                  <div className="text-[11px] text-gray-500">Characters</div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setMoreSubPanel('page-setup')}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1A73E8]" />
                    <div>
                      <div className="text-xs font-bold">
                        Page Setup, Borders & Columns
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {paperSize} ({orientation}) • Border: {pageBorderStyle} •{' '}
                        {columnCount} Col
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setMoreSubPanel('templates')}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Columns className="h-5 w-5 text-[#1A73E8]" />
                    <div>
                      <div className="text-xs font-bold">
                        Malayalam Print Templates (മാതൃകകൾ)
                      </div>
                      <div className="text-[11px] text-gray-500">
                        A5 Notice, A4 Official Letterhead, 2-Column Exam Paper
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDrawer('none');
                    onOpenFindReplace();
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-left hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center gap-3">
                    <Search className="h-5 w-5 text-[#1A73E8]" />
                    <div>
                      <div className="text-xs font-bold">
                        Find & Replace (തിരയുക / മാറ്റുക)
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Search and replace Malayalam or English words
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold dark:border-gray-700"
                >
                  {darkMode ? (
                    <>
                      <Sun className="h-4 w-4 text-amber-400" /> Light Workspace
                    </>
                  ) : (
                    <>
                      <Moon className="h-4 w-4 text-gray-600" /> Dark Workspace
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRuler(!showRuler)}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-semibold ${
                    showRuler
                      ? 'border-[#1A73E8] bg-blue-50 text-[#1A73E8] dark:bg-blue-950/50 dark:text-blue-300'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  Millimeter Ruler: {showRuler ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onSaveMpsDraft();
                    setActiveDrawer('none');
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <Save className="h-4 w-4 text-[#1A73E8]" />
                  Save .mps Draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onTriggerOpenMpsDraft();
                    setActiveDrawer('none');
                  }}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <FolderOpen className="h-4 w-4 text-[#1A73E8]" />
                  Open .mps Draft
                </button>
              </div>
            </div>
          )}

          {moreSubPanel === 'page-setup' && (
            <div className="space-y-4 pb-4">
              {/* BOOK PUBLISHING MODE & MIRROR MARGINS CARD */}
              <div className="space-y-3 rounded-2xl border-2 border-indigo-200 bg-indigo-50/50 p-3.5 dark:border-indigo-900/70 dark:bg-indigo-950/25">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        Book Publishing Mode — Mirror Margins (Book Binding)
                      </div>
                      <div className="text-[10px] text-gray-600 dark:text-gray-400">
                        Inner gutter on Left of Odd pages (1,3,5) &amp; Right of Even pages (2,4,6)
                      </div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={mirrorMargins}
                    onChange={(e) => {
                      const next = e.target.checked;
                      setMirrorMargins(next);
                      if (next && pageNumberAlign !== 'center') {
                        setPageNumberAlign('outer');
                      }
                    }}
                    className="h-4 w-4 accent-indigo-600"
                  />
                </div>

                {mirrorMargins && (
                  <div className="space-y-2.5 pt-1">
                    <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div>
                        <label className="mb-0.5 block text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                          Inner / Gutter (mm)
                        </label>
                        <input
                          type="number"
                          min={8}
                          max={40}
                          value={innerMarginMm}
                          onChange={(e) =>
                            setInnerMarginMm(
                              Math.max(8, Math.min(40, Number(e.target.value) || 20))
                            )
                          }
                          className="w-full rounded-lg border border-indigo-300 bg-white px-2 py-1.5 font-semibold dark:border-indigo-700 dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                          Outer Margin (mm)
                        </label>
                        <input
                          type="number"
                          min={6}
                          max={35}
                          value={outerMarginMm}
                          onChange={(e) =>
                            setOuterMarginMm(
                              Math.max(6, Math.min(35, Number(e.target.value) || 13))
                            )
                          }
                          className="w-full rounded-lg border border-indigo-300 bg-white px-2 py-1.5 font-semibold dark:border-indigo-700 dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                          Top Margin (mm)
                        </label>
                        <input
                          type="number"
                          min={6}
                          max={35}
                          value={margins.top}
                          onChange={(e) => {
                            setMarginPreset('custom');
                            setMargins({
                              ...margins,
                              top: Math.max(6, Math.min(35, Number(e.target.value) || 15)),
                            });
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                          Bottom Margin (mm)
                        </label>
                        <input
                          type="number"
                          min={6}
                          max={35}
                          value={margins.bottom}
                          onChange={(e) => {
                            setMarginPreset('custom');
                            setMargins({
                              ...margins,
                              bottom: Math.max(6, Math.min(35, Number(e.target.value) || 15)),
                            });
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 dark:border-gray-600 dark:bg-gray-800"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <label className="flex items-center gap-1.5 text-[11px] font-medium">
                        <input
                          type="checkbox"
                          checked={useOddEvenHeaders}
                          onChange={(e) => setUseOddEvenHeaders(e.target.checked)}
                          className="h-3.5 w-3.5 accent-indigo-600"
                        />
                        Odd/Even Running Headers
                      </label>
                      <label className="flex items-center gap-1.5 text-[11px] font-medium">
                        <input
                          type="checkbox"
                          checked={hideHeaderOnChapterPages}
                          onChange={(e) =>
                            setHideHeaderOnChapterPages(e.target.checked)
                          }
                          className="h-3.5 w-3.5 accent-indigo-600"
                        />
                        Hide on Chapter Starts
                      </label>
                    </div>

                    <button
                      type="button"
                      onClick={() => onApplyBookTypography()}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Apply Book Typography Preset (Tiro · 10.5pt · 1.6 · Justify · 6mm)
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-500">
                  Paper &amp; Book Sizes (കേരള പുസ്തക അളവുകൾ &amp; പേപ്പർ)
                </label>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {(
                    [
                      'Demy 1/8',
                      'Crown 1/8',
                      'A5',
                      'B5',
                      'A4',
                      'A3',
                      'Letter',
                      'Legal',
                      'DL',
                      'Custom',
                    ] as PaperSizeKey[]
                  ).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setPaperSize(sz)}
                      className={`rounded-xl border p-2 text-left text-xs transition ${
                        paperSize === sz
                          ? 'border-[#1A73E8] bg-blue-50 font-bold text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{sz}</span>
                        {sz !== 'Custom' && PAPER_SIZES[sz].isBookSize && (
                          <span className="rounded bg-indigo-100 px-1 py-0.2 text-[9px] font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                            Book
                          </span>
                        )}
                      </div>
                      {sz !== 'Custom' && (
                        <div className="truncate text-[10px] font-normal text-gray-500">
                          {PAPER_SIZES[sz].widthMm}×{PAPER_SIZES[sz].heightMm}mm
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {paperSize === 'Custom' && (
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span>Width (mm):</span>
                    <input
                      type="number"
                      min={60}
                      max={600}
                      value={customWidthMm}
                      onChange={(e) =>
                        setCustomWidthMm(Math.max(60, Number(e.target.value) || 148))
                      }
                      className="w-20 rounded-lg border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                    />
                    <span>Height (mm):</span>
                    <input
                      type="number"
                      min={80}
                      max={800}
                      value={customHeightMm}
                      onChange={(e) =>
                        setCustomHeightMm(Math.max(80, Number(e.target.value) || 210))
                      }
                      className="w-20 rounded-lg border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-800"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-500">
                    Orientation
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['portrait', 'landscape'] as Orientation[]).map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => setOrientation(o)}
                        className={`rounded-xl border py-2 text-xs font-semibold capitalize ${
                          orientation === o
                            ? 'border-[#1A73E8] bg-blue-50 text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-500">
                    Columns (കോളങ്ങൾ)
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {([1, 2, 3] as (1 | 2 | 3)[]).map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setColumnCount(col)}
                        className={`rounded-xl border py-2 text-xs font-semibold ${
                          columnCount === col
                            ? 'border-[#1A73E8] bg-blue-50 text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {col} Col
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-gray-500">
                  Standard Margin Presets (മാർജിൻ)
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                  {(['narrow', 'normal', 'moderate', 'wide', 'custom'] as MarginPresetKey[]).map(
                    (mp) => (
                      <button
                        key={mp}
                        type="button"
                        onClick={() => {
                          setMarginPreset(mp);
                          if (mp !== 'custom') {
                            setMargins(MARGIN_PRESETS[mp].margins);
                          }
                        }}
                        className={`rounded-xl border py-2 text-xs font-semibold capitalize ${
                          marginPreset === mp
                            ? 'border-[#1A73E8] bg-blue-50 text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {mp}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2.5 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <label className="block text-xs font-bold text-gray-500">
                  Independent Page Border per Sheet (ഓരോ പേജിനും ബോർഡർ)
                </label>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {(Object.keys(PAGE_BORDER_STYLES) as PageBorderStyleKey[]).map(
                    (bKey) => (
                      <button
                        key={bKey}
                        type="button"
                        onClick={() => setPageBorderStyle(bKey)}
                        className={`rounded-xl border p-2 text-left text-xs ${
                          pageBorderStyle === bKey
                            ? 'border-[#1A73E8] bg-blue-50 font-bold text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div>{PAGE_BORDER_STYLES[bKey].label}</div>
                        <div className="text-[10px] font-normal text-gray-500">
                          {PAGE_BORDER_STYLES[bKey].malayalamLabel}
                        </div>
                      </button>
                    )
                  )}
                </div>

                {pageBorderStyle !== 'none' && (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex items-center gap-1.5">
                      <Palette className="h-4 w-4 text-gray-400" />
                      {PAGE_BORDER_COLORS.map((bc) => (
                        <button
                          key={bc.value}
                          type="button"
                          onClick={() => setPageBorderColor(bc.value)}
                          className={`h-6 w-6 rounded-full border ${
                            pageBorderColor === bc.value
                              ? 'ring-2 ring-[#1A73E8] ring-offset-1'
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: bc.value }}
                          title={bc.label}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span>Padding:</span>
                      <input
                        type="number"
                        min={2}
                        max={15}
                        value={pageBorderPaddingMm}
                        onChange={(e) =>
                          setPageBorderPaddingMm(
                            Math.max(2, Math.min(15, Number(e.target.value) || 5))
                          )
                        }
                        className="w-14 rounded-lg border border-gray-300 px-2 py-1 text-center dark:border-gray-600 dark:bg-gray-800"
                      />
                      <span>mm</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <label className="mb-1.5 block text-xs font-bold text-gray-500">
                    Notice Paper Color (പേപ്പർ നിറം)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(PAPER_TINTS) as PaperTintKey[]).map((tKey) => (
                      <button
                        key={tKey}
                        type="button"
                        onClick={() => setPaperTint(tKey)}
                        className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs ${
                          paperTint === tKey
                            ? 'border-[#1A73E8] font-bold text-[#1A73E8]'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: PAPER_TINTS[tKey].hex }}
                        />
                        {PAPER_TINTS[tKey].label}
                      </button>
                    ))}
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-[11px] text-gray-500">
                    <input
                      type="checkbox"
                      checked={printBackgroundTint}
                      onChange={(e) => setPrintBackgroundTint(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#1A73E8]"
                    />
                    Include paper tint when printing PDF
                  </label>
                </div>

                <div className="space-y-2 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                  <label className="block text-xs font-bold text-gray-500">
                    Watermark & Press Crop Marks
                  </label>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Watermark (ഉദാ: കരട് / DRAFT)"
                    className="w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800"
                  />
                  <label className="flex items-center gap-2 pt-1 text-xs">
                    <input
                      type="checkbox"
                      checked={showCropMarks}
                      onChange={(e) => setShowCropMarks(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#1A73E8]"
                    />
                    Show Press Corner Crop Marks
                  </label>
                </div>
              </div>
            </div>
          )}

          {moreSubPanel === 'templates' && (
            <div className="space-y-4 pb-4">
              {/* BOOK FRONT MATTER TEMPLATES SECTION */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-indigo-700 uppercase dark:text-indigo-400">
                  <BookOpen className="h-4 w-4" />
                  Book Front Matter (പുസ്തകത്തിന്റെ ആദ്യ പേജുകൾ — Insert Page)
                </div>
                <p className="text-[11px] text-gray-500">
                  പുതിയ പേജായി ചേർത്ത് പുസ്തകം ക്രമീകരിക്കാം (Inserts cleanly as a dedicated book page):
                </p>

                <button
                  type="button"
                  onClick={() => {
                    onInsertBookFrontMatter('title-page');
                    setActiveDrawer('none');
                    setMoreSubPanel('main');
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 text-left hover:border-indigo-500 hover:bg-indigo-50 dark:border-indigo-900/60 dark:bg-indigo-950/20"
                >
                  <div>
                    <div className="text-xs font-bold">
                      Book Title Page (പുസ്തക ശീർഷക പേജ്)
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      Main Title, Subtitle, Author Name &amp; Publisher imprint
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-indigo-600" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onInsertBookFrontMatter('copyright-page');
                    setActiveDrawer('none');
                    setMoreSubPanel('main');
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 text-left hover:border-indigo-500 hover:bg-indigo-50 dark:border-indigo-900/60 dark:bg-indigo-950/20"
                >
                  <div>
                    <div className="text-xs font-bold">
                      Copyright &amp; Edition Page (പകർപ്പവകാശ പേജ്)
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      Title, Author, Edition, Year, ISBN, Price &amp; Printed at
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-indigo-600" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onInsertBookFrontMatter('toc-page');
                    setActiveDrawer('none');
                    setMoreSubPanel('main');
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 text-left hover:border-indigo-500 hover:bg-indigo-50 dark:border-indigo-900/60 dark:bg-indigo-950/20"
                >
                  <div>
                    <div className="text-xs font-bold">
                      Table of Contents (ഉള്ളടക്കം — Leader Dots)
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      Clean Malayalam chapter list with dotted leader lines &amp; page numbers
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-indigo-600" />
                </button>
              </div>

              <div className="space-y-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-500">
                  Notice, Office &amp; Academic Templates (മാതൃകകൾ):
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onApplyTemplate('a5-notice');
                    setActiveDrawer('none');
                    setMoreSubPanel('main');
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-left hover:border-[#1A73E8] hover:bg-blue-50/40 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <div>
                    <div className="text-xs font-bold">
                      1. A5 Public Notice (നോട്ടീസ് — Manjari &amp; Baloo Chettan 2)
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      A5 Portrait • Double Line Border • Table &amp; Programme Schedule
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#1A73E8]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onApplyTemplate('a4-letterhead');
                    setActiveDrawer('none');
                    setMoreSubPanel('main');
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-left hover:border-[#1A73E8] hover:bg-blue-50/40 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <div>
                    <div className="text-xs font-bold">
                      2. A4 Official Letterhead (ഔദ്യോഗിക കത്ത് — Noto Sans)
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      A4 Portrait • Thin Frame • Formal Request &amp; Schedule Table
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#1A73E8]" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onApplyTemplate('a4-exam');
                    setActiveDrawer('none');
                    setMoreSubPanel('main');
                  }}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 p-3 text-left hover:border-[#1A73E8] hover:bg-blue-50/40 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  <div>
                    <div className="text-xs font-bold">
                      3. A4 Two-Column Exam Paper (ചോദ്യപേപ്പർ — Noto Serif)
                    </div>
                    <div className="mt-0.5 text-[11px] text-gray-500">
                      A4 Portrait • 2-Column Academic Layout • Section A, B, C
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#1A73E8]" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

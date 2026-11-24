import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  FileCode,
  MoreVertical,
  Plus,
  Printer,
  Redo2,
  Search,
  Share2,
  Type,
  Undo2,
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
  SavedProjectState,
} from './types';
import {
  MALAYALAM_FONTS,
  MARGIN_PRESETS,
  PAPER_SIZES,
  STORAGE_KEY,
  TEMPLATE_A4_EXAM_TWO_COLUMN,
  TEMPLATE_A4_OFFICIAL_LETTERHEAD,
  TEMPLATE_A5_PUBLIC_NOTICE,
  TEMPLATE_BOOK_COPYRIGHT_PAGE,
  TEMPLATE_BOOK_TITLE_PAGE,
  TEMPLATE_BOOK_TOC_PAGE,
  buildChapterStartHtml,
} from './constants/fonts';
import {
  PaginationConfig,
  runZeroCutoffPaginationPass,
} from './utils/pagination';
import {
  ExportDocumentContext,
  exportBookletImpositionHtml,
  exportEditableDraftMps,
  exportStandalonePrintableHtml,
  getCombinedLogicalPagesHtml,
  printBookletImpositionPdf,
  printVectorPdfDocument,
  shareOrDownloadWordDocx,
} from './utils/export';
import { PageCanvas } from './components/PageCanvas';
import { BottomSheets } from './components/BottomSheets';

export function App() {
  // 1. Document Metadata & Paper Setup
  const [docTitle, setDocTitle] = useState<string>('മലയാളം നോട്ടീസ് (A5 Notice)');
  const [paperSize, setPaperSize] = useState<PaperSizeKey>('A5');
  const [customWidthMm, setCustomWidthMm] = useState<number>(148);
  const [customHeightMm, setCustomHeightMm] = useState<number>(210);
  const [orientation, setOrientation] = useState<Orientation>('portrait');
  const [marginPreset, setMarginPreset] = useState<MarginPresetKey>('normal');
  const [margins, setMargins] = useState<MarginsMm>({
    top: 15,
    right: 15,
    bottom: 15,
    left: 15,
  });
  const [mirrorMargins, setMirrorMargins] = useState<boolean>(false);
  const [innerMarginMm, setInnerMarginMm] = useState<number>(20);
  const [outerMarginMm, setOuterMarginMm] = useState<number>(13);

  // 2. Malayalam Typography & Paragraph Formatting
  const [defaultDocFontId, setDefaultDocFontId] = useState<string>('manjari');
  const [fontSizePt, setFontSizePt] = useState<number>(12);
  const [activeParagraphStyle, setActiveParagraphStyle] = useState<
    'p' | 'title' | 'h1' | 'h2' | 'h3'
  >('p');
  const [activeTextColor, setActiveTextColor] = useState<string>('#111827');
  const [activeHighlightColor, setActiveHighlightColor] =
    useState<string>('transparent');
  const [lineSpacing, setLineSpacing] = useState<string>('1.6');
  const [letterSpacing, setLetterSpacing] = useState<string>('0px');
  const [firstLineIndent, setFirstLineIndent] = useState<boolean>(false);
  const [spaceAfterParagraph, setSpaceAfterParagraph] = useState<boolean>(true);
  const [paragraphGapPt, setParagraphGapPt] = useState<number>(8);

  // 3. Page Borders, Columns, Watermark, Tint, Ruler & Crop Marks
  const [pageBorderStyle, setPageBorderStyle] =
    useState<PageBorderStyleKey>('double');
  const [pageBorderColor, setPageBorderColor] = useState<string>('#111827');
  const [pageBorderPaddingMm, setPageBorderPaddingMm] = useState<number>(5);
  const [columnCount, setColumnCount] = useState<1 | 2 | 3>(1);
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [paperTint, setPaperTint] = useState<PaperTintKey>('white');
  const [printBackgroundTint, setPrintBackgroundTint] =
    useState<boolean>(false);
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [showCropMarks, setShowCropMarks] = useState<boolean>(false);

  // 4. Headers, Footers, Odd/Even Book Running Headers & Page Numbers
  const [showHeaderFooter, setShowHeaderFooter] = useState<boolean>(false);
  const [headerText, setHeaderText] = useState<string>('');
  const [footerText, setFooterText] = useState<string>('');
  const [useOddEvenHeaders, setUseOddEvenHeaders] = useState<boolean>(false);
  const [evenHeaderText, setEvenHeaderText] = useState<string>('');
  const [oddHeaderText, setOddHeaderText] = useState<string>('');
  const [hideHeaderOnChapterPages, setHideHeaderOnChapterPages] =
    useState<boolean>(true);
  const [chapterPageFlags, setChapterPageFlags] = useState<boolean[]>([]);
  const [showPageNumbers, setShowPageNumbers] = useState<boolean>(true);
  const [differentFirstPage, setDifferentFirstPage] = useState<boolean>(false);
  const [pageNumberPosition, setPageNumberPosition] =
    useState<PageNumberPosition>('bottom');
  const [pageNumberAlign, setPageNumberAlign] =
    useState<PageNumberAlign>('right');
  const [pageNumberFormat, setPageNumberFormat] =
    useState<PageNumberFormat>('malayalam_x_of_y');

  // 5. Multi-Page Layout & Mobile Auto-Fit Zoom State
  const [pageCount, setPageCount] = useState<number>(1);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [zoomMode, setZoomMode] = useState<'fit' | '100'>('fit');
  const [fitScale, setFitScale] = useState<number>(1);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // 6. Drawers, Contextual Selections & Modals
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>('none');
  const [formatTab, setFormatTab] = useState<FormatTab>('text');
  const [moreSubPanel, setMoreSubPanel] = useState<MoreSubPanel>('main');
  const [activeTableCell, setActiveTableCell] =
    useState<HTMLTableCellElement | null>(null);
  const [activeImageEl, setActiveImageEl] =
    useState<HTMLImageElement | null>(null);

  // 7. Find & Replace Bar State
  const [showFindReplace, setShowFindReplace] = useState<boolean>(false);
  const [findQuery, setFindQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [findMatchStatus, setFindMatchStatus] = useState<string>('');

  // 8. Toast Notification Banner (with Print HTML / Booklet HTML fallback buttons)
  const [toastInfo, setToastInfo] = useState<{
    message: string;
    showHtmlDownload?: boolean;
    showBookletHtmlDownload?: boolean;
  } | null>(null);

  // 9. Document Metrics
  const [metrics, setMetrics] = useState<DocumentMetrics>({
    words: 0,
    chars: 0,
  });

  // Refs for Multi-Page Editable Containers, Selection Persistence & IME Composition
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const isComposingRef = useRef<boolean>(false);
  const paginationRafRef = useRef<number | null>(null);
  const pendingHtmlByPageRef = useRef<string[] | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const mpsInputRef = useRef<HTMLInputElement | null>(null);

  const activeFont: MalayalamFontOption =
    MALAYALAM_FONTS.find((f) => f.id === defaultDocFontId) ||
    MALAYALAM_FONTS[0];

  const activeMargins: MarginsMm =
    marginPreset === 'custom' ? margins : MARGIN_PRESETS[marginPreset].margins;

  const rawWidthMm =
    paperSize === 'Custom' ? customWidthMm : PAPER_SIZES[paperSize].widthMm;
  const rawHeightMm =
    paperSize === 'Custom' ? customHeightMm : PAPER_SIZES[paperSize].heightMm;
  const finalWidthMm = orientation === 'portrait' ? rawWidthMm : rawHeightMm;
  const finalHeightMm = orientation === 'portrait' ? rawHeightMm : rawWidthMm;

  const showToast = useCallback(
    (
      message: string,
      showHtmlDownload = false,
      showBookletHtmlDownload = false
    ) => {
      setToastInfo({ message, showHtmlDownload, showBookletHtmlDownload });
    },
    []
  );

  // Keep spaceAfterParagraph boolean and numeric paragraphGapPt (0–12pt) synchronized
  const handleSetParagraphGapPt = useCallback((pt: number) => {
    const clamped = Math.max(0, Math.min(12, pt));
    setParagraphGapPt(clamped);
    setSpaceAfterParagraph(clamped > 0);
  }, []);

  const handleSetSpaceAfterParagraph = useCallback((enabled: boolean) => {
    setSpaceAfterParagraph(enabled);
    setParagraphGapPt((prev) => (enabled ? (prev > 0 ? prev : 8) : 0));
  }, []);

  useEffect(() => {
    if (!toastInfo) return;
    const timer = window.setTimeout(() => {
      setToastInfo(null);
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [toastInfo]);

  // Calculate Word & Character Metrics across all pages
  const updateDocumentMetrics = useCallback(() => {
    let fullText = '';
    for (let i = 0; i < pageCount; i++) {
      const el = pageRefs.current[i];
      if (el) {
        fullText += ' ' + (el.innerText || '');
      }
    }
    const cleaned = fullText.trim();
    const words = cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0;
    const chars = cleaned.replace(/\s/g, '').length;
    setMetrics({ words, chars });
  }, [pageCount]);

  // Save current project state to localStorage
  const persistToLocalStorage = useCallback(() => {
    try {
      const htmlContent = getCombinedLogicalPagesHtml(
        pageRefs.current,
        pageCount
      );
      if (!htmlContent.trim()) return;
      const stateToSave: SavedProjectState = {
        docTitle,
        htmlContent,
        paperSize,
        customWidthMm,
        customHeightMm,
        orientation,
        marginPreset,
        margins: activeMargins,
        mirrorMargins,
        innerMarginMm,
        outerMarginMm,
        defaultDocFontId,
        showHeaderFooter,
        headerText,
        footerText,
        useOddEvenHeaders,
        evenHeaderText,
        oddHeaderText,
        hideHeaderOnChapterPages,
        showPageNumbers,
        differentFirstPage,
        pageNumberPosition,
        pageNumberAlign,
        pageNumberFormat,
        lineSpacing,
        letterSpacing,
        firstLineIndent,
        spaceAfterParagraph,
        paragraphGapPt,
        pageBorderStyle,
        pageBorderColor,
        pageBorderPaddingMm,
        columnCount,
        watermarkText,
        paperTint,
        printBackgroundTint,
        showRuler,
        showCropMarks,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // Ignore storage quota errors
    }
  }, [
    activeMargins,
    columnCount,
    customHeightMm,
    customWidthMm,
    defaultDocFontId,
    differentFirstPage,
    docTitle,
    evenHeaderText,
    firstLineIndent,
    footerText,
    headerText,
    hideHeaderOnChapterPages,
    innerMarginMm,
    letterSpacing,
    lineSpacing,
    marginPreset,
    mirrorMargins,
    oddHeaderText,
    orientation,
    outerMarginMm,
    pageBorderColor,
    pageBorderPaddingMm,
    pageBorderStyle,
    pageCount,
    pageNumberAlign,
    pageNumberFormat,
    pageNumberPosition,
    paperSize,
    paperTint,
    paragraphGapPt,
    printBackgroundTint,
    showCropMarks,
    showHeaderFooter,
    showPageNumbers,
    showRuler,
    spaceAfterParagraph,
    useOddEvenHeaders,
    watermarkText,
  ]);

  // Scan pages for Chapter Start / Front Matter opening blocks (shallow-equality guarded)
  const refreshChapterPageFlags = useCallback((count: number) => {
    const nextFlags: boolean[] = [];
    for (let i = 0; i < count; i++) {
      const el = pageRefs.current[i];
      nextFlags.push(
        Boolean(
          el &&
            el.querySelector('.mps-chapter-start, [data-chapter-start="true"]')
        )
      );
    }
    setChapterPageFlags((prev) => {
      if (
        prev.length === nextFlags.length &&
        prev.every((val, idx) => val === nextFlags[idx])
      ) {
        return prev;
      }
      return nextFlags;
    });
  }, []);

  // Build pagination config for the zero-cutoff pagination engine
  const getPaginationConfig = useCallback((): PaginationConfig => {
    return {
      paperSize,
      customWidthMm,
      customHeightMm,
      orientation,
      marginPreset,
      customMargins: margins,
      showHeaderFooter,
      useOddEvenHeaders,
      hideHeaderOnChapterPages,
      showPageNumbers,
      pageNumberPosition,
      differentFirstPage,
      hasPageBorder: pageBorderStyle !== 'none',
      pageBorderPaddingMm,
    };
  }, [
    customHeightMm,
    customWidthMm,
    differentFirstPage,
    hideHeaderOnChapterPages,
    marginPreset,
    margins,
    orientation,
    pageBorderPaddingMm,
    pageBorderStyle,
    pageNumberPosition,
    paperSize,
    showHeaderFooter,
    showPageNumbers,
    useOddEvenHeaders,
  ]);

  // Schedule a zero-cutoff line-by-line pagination pass
  const schedulePaginationPass = useCallback(() => {
    if (isComposingRef.current) return;
    if (paginationRafRef.current !== null) {
      cancelAnimationFrame(paginationRafRef.current);
    }
    paginationRafRef.current = requestAnimationFrame(() => {
      paginationRafRef.current = null;
      const config = getPaginationConfig();
      const { neededPageCount } = runZeroCutoffPaginationPass(
        pageRefs.current,
        pageCount,
        config,
        isComposingRef.current
      );
      if (neededPageCount !== pageCount) {
        setPageCount(neededPageCount);
      }
      refreshChapterPageFlags(Math.max(pageCount, neededPageCount));
      updateDocumentMetrics();
      persistToLocalStorage();
    });
  }, [
    getPaginationConfig,
    pageCount,
    persistToLocalStorage,
    refreshChapterPageFlags,
    updateDocumentMetrics,
  ]);

  // Re-run pagination whenever pageCount increases or page layout settings change
  useEffect(() => {
    if (pendingHtmlByPageRef.current) {
      const htmlPages = pendingHtmlByPageRef.current;
      pendingHtmlByPageRef.current = null;
      for (let i = 0; i < pageCount; i++) {
        const el = pageRefs.current[i];
        if (el) {
          el.innerHTML = htmlPages[i] || '';
        }
      }
    }
    const timer = window.setTimeout(() => {
      schedulePaginationPass();
    }, 30);
    return () => window.clearTimeout(timer);
  }, [
    pageCount,
    paperSize,
    customWidthMm,
    customHeightMm,
    orientation,
    marginPreset,
    margins,
    mirrorMargins,
    innerMarginMm,
    outerMarginMm,
    lineSpacing,
    spaceAfterParagraph,
    paragraphGapPt,
    firstLineIndent,
    pageBorderStyle,
    pageBorderPaddingMm,
    showHeaderFooter,
    useOddEvenHeaders,
    hideHeaderOnChapterPages,
    showPageNumbers,
    differentFirstPage,
    columnCount,
    defaultDocFontId,
    schedulePaginationPass,
  ]);

  // Initial Load from localStorage or Default A5 Notice Template
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedProjectState>;
        if (parsed.docTitle) setDocTitle(parsed.docTitle);
        if (parsed.paperSize) setPaperSize(parsed.paperSize);
        if (parsed.customWidthMm) setCustomWidthMm(parsed.customWidthMm);
        if (parsed.customHeightMm) setCustomHeightMm(parsed.customHeightMm);
        if (parsed.orientation) setOrientation(parsed.orientation);
        if (parsed.marginPreset) setMarginPreset(parsed.marginPreset);
        if (parsed.margins) setMargins(parsed.margins);
        if (typeof parsed.mirrorMargins === 'boolean')
          setMirrorMargins(parsed.mirrorMargins);
        if (typeof parsed.innerMarginMm === 'number')
          setInnerMarginMm(parsed.innerMarginMm);
        if (typeof parsed.outerMarginMm === 'number')
          setOuterMarginMm(parsed.outerMarginMm);
        if (parsed.defaultDocFontId)
          setDefaultDocFontId(parsed.defaultDocFontId);
        if (typeof parsed.showHeaderFooter === 'boolean')
          setShowHeaderFooter(parsed.showHeaderFooter);
        if (typeof parsed.headerText === 'string')
          setHeaderText(parsed.headerText);
        if (typeof parsed.footerText === 'string')
          setFooterText(parsed.footerText);
        if (typeof parsed.useOddEvenHeaders === 'boolean')
          setUseOddEvenHeaders(parsed.useOddEvenHeaders);
        if (typeof parsed.evenHeaderText === 'string')
          setEvenHeaderText(parsed.evenHeaderText);
        if (typeof parsed.oddHeaderText === 'string')
          setOddHeaderText(parsed.oddHeaderText);
        if (typeof parsed.hideHeaderOnChapterPages === 'boolean')
          setHideHeaderOnChapterPages(parsed.hideHeaderOnChapterPages);
        if (typeof parsed.showPageNumbers === 'boolean')
          setShowPageNumbers(parsed.showPageNumbers);
        if (typeof parsed.differentFirstPage === 'boolean')
          setDifferentFirstPage(parsed.differentFirstPage);
        if (parsed.pageNumberPosition)
          setPageNumberPosition(parsed.pageNumberPosition);
        if (parsed.pageNumberAlign) setPageNumberAlign(parsed.pageNumberAlign);
        if (parsed.pageNumberFormat)
          setPageNumberFormat(parsed.pageNumberFormat);
        if (parsed.lineSpacing) setLineSpacing(parsed.lineSpacing);
        if (parsed.letterSpacing) setLetterSpacing(parsed.letterSpacing);
        if (typeof parsed.firstLineIndent === 'boolean')
          setFirstLineIndent(parsed.firstLineIndent);
        if (typeof parsed.spaceAfterParagraph === 'boolean')
          setSpaceAfterParagraph(parsed.spaceAfterParagraph);
        if (typeof parsed.paragraphGapPt === 'number') {
          setParagraphGapPt(parsed.paragraphGapPt);
        } else if (typeof parsed.spaceAfterParagraph === 'boolean') {
          setParagraphGapPt(parsed.spaceAfterParagraph ? 8 : 0);
        }
        if (parsed.pageBorderStyle) setPageBorderStyle(parsed.pageBorderStyle);
        if (parsed.pageBorderColor) setPageBorderColor(parsed.pageBorderColor);
        if (typeof parsed.pageBorderPaddingMm === 'number')
          setPageBorderPaddingMm(parsed.pageBorderPaddingMm);
        if (parsed.columnCount) setColumnCount(parsed.columnCount);
        if (typeof parsed.watermarkText === 'string')
          setWatermarkText(parsed.watermarkText);
        if (parsed.paperTint) setPaperTint(parsed.paperTint);
        if (typeof parsed.printBackgroundTint === 'boolean')
          setPrintBackgroundTint(parsed.printBackgroundTint);
        if (typeof parsed.showRuler === 'boolean')
          setShowRuler(parsed.showRuler);
        if (typeof parsed.showCropMarks === 'boolean')
          setShowCropMarks(parsed.showCropMarks);

        const initialHtml =
          parsed.htmlContent && parsed.htmlContent.trim().length > 0
            ? parsed.htmlContent
            : TEMPLATE_A5_PUBLIC_NOTICE;

        if (pageRefs.current[0]) {
          pageRefs.current[0].innerHTML = initialHtml;
        } else {
          pendingHtmlByPageRef.current = [initialHtml];
        }
        return;
      }
    } catch {
      // Fallback to default A5 Notice template
    }

    if (pageRefs.current[0]) {
      pageRefs.current[0].innerHTML = TEMPLATE_A5_PUBLIC_NOTICE;
    } else {
      pendingHtmlByPageRef.current = [TEMPLATE_A5_PUBLIC_NOTICE];
    }
  }, []);

  // Mobile Auto-Fit Paper Scaling Calculation
  useEffect(() => {
    const computeScale = () => {
      const vw = window.innerWidth;
      const horizontalPadding = vw < 640 ? 20 : 48;
      const availableWidthPx = Math.max(240, vw - horizontalPadding);
      const paperWidthPx = finalWidthMm * 3.7795275591;
      const ratio = availableWidthPx / paperWidthPx;
      setFitScale(Math.min(1.15, Math.max(0.32, Number(ratio.toFixed(3)))));
    };
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, [finalWidthMm]);

  const effectiveScale = zoomMode === 'fit' ? fitScale : 1;

  // Dynamic @page Print CSS injection so vector PDF always matches exact paper size & orientation
  useEffect(() => {
    const styleId = 'mps-dynamic-page-print-rules';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    // Named CSS page sizes only cover standard ISO keywords; Demy 1/8, Crown 1/8 & Custom use exact mm dimensions
    const isStandardCssPageKeyword =
      paperSize === 'A5' ||
      paperSize === 'A4' ||
      paperSize === 'A3' ||
      paperSize === 'B5';
    const sizeRule = isStandardCssPageKeyword
      ? `${paperSize} ${orientation}`
      : `${finalWidthMm}mm ${finalHeightMm}mm`;

    styleEl.textContent = `
      @media print {
        @page {
          size: ${sizeRule};
          margin: 0mm !important;
        }
        .page-sheet {
          width: ${finalWidthMm}mm !important;
          height: ${finalHeightMm}mm !important;
          background-color: ${
            printBackgroundTint ? 'inherit' : '#FFFFFF'
          } !important;
        }
      }
    `;
  }, [
    finalHeightMm,
    finalWidthMm,
    orientation,
    paperSize,
    printBackgroundTint,
  ]);

  // Continuous Selection Persistence (`selectionchange` -> `savedRangeRef`)
  useEffect(() => {
    const handleSelectionChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const insideEditor = pageRefs.current.some(
        (el) => el && (el === container || el.contains(container))
      );
      if (insideEditor) {
        savedRangeRef.current = range.cloneRange();

        // Detect active paragraph tag & table cell for contextual UI
        const elementNode =
          container.nodeType === Node.ELEMENT_NODE
            ? (container as HTMLElement)
            : container.parentElement;
        if (elementNode) {
          const td = elementNode.closest('td, th') as HTMLTableCellElement | null;
          setActiveTableCell(td);

          const heading = elementNode.closest('h1, h2, h3, p');
          if (heading) {
            const tag = heading.tagName.toLowerCase();
            if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'p') {
              setActiveParagraphStyle(tag);
            }
          }
        }
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () =>
      document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Restore saved range before executing formatting or insertion commands
  const restoreSavedSelection = useCallback((): HTMLElement | null => {
    const sel = window.getSelection();
    if (savedRangeRef.current && sel) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
        const container = savedRangeRef.current.commonAncestorContainer;
        const pageEl = pageRefs.current.find(
          (el) => el && (el === container || el.contains(container))
        );
        if (pageEl) return pageEl;
      } catch {
        // Fallback to active page
      }
    }
    const targetPage =
      pageRefs.current[activePageIndex] || pageRefs.current[0] || null;
    if (targetPage) {
      targetPage.focus();
    }
    return targetPage;
  }, [activePageIndex]);

  // Execute rich-text formatting commands reliably on mobile & desktop
  const handleExecCommand = useCallback(
    (cmd: string, value?: string) => {
      restoreSavedSelection();
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(cmd, false, value);
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
      schedulePaginationPass();
    },
    [restoreSavedSelection, schedulePaginationPass]
  );

  // Apply Malayalam Font to selected text OR entire document
  const handleSelectFont = useCallback(
    (font: MalayalamFontOption) => {
      setDefaultDocFontId(font.id);
      restoreSavedSelection();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('fontName', false, font.name);
      } else {
        // When no specific range is highlighted, update all existing font-family spans to the chosen Malayalam font
        for (let i = 0; i < pageCount; i++) {
          const pageEl = pageRefs.current[i];
          if (!pageEl) continue;
          const styledNodes = pageEl.querySelectorAll<HTMLElement>('[style*="font-family"]');
          styledNodes.forEach((node) => {
            node.style.fontFamily = font.cssFamily;
          });
        }
      }
      schedulePaginationPass();
      showToast(`ഫോണ്ട് മാറ്റി: ${font.name}`);
    },
    [pageCount, restoreSavedSelection, schedulePaginationPass, showToast]
  );

  // Step Font Size up/down in points (pt)
  const handleChangeFontSize = useCallback(
    (delta: number) => {
      const nextPt = Math.min(72, Math.max(8, fontSizePt + delta));
      setFontSizePt(nextPt);
      restoreSavedSelection();
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);

      if (!range.collapsed) {
        const span = document.createElement('span');
        span.style.fontSize = `${nextPt}pt`;
        try {
          span.appendChild(range.extractContents());
          range.insertNode(span);
          sel.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel.addRange(newRange);
          savedRangeRef.current = newRange.cloneRange();
        } catch {
          // Ignore cross-block boundary error and apply to closest block
          const parentBlock =
            range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
              ? (range.commonAncestorContainer as HTMLElement)
              : range.commonAncestorContainer.parentElement;
          if (parentBlock) {
            parentBlock.style.fontSize = `${nextPt}pt`;
          }
        }
      } else {
        const block =
          range.startContainer.nodeType === Node.ELEMENT_NODE
            ? (range.startContainer as HTMLElement).closest('p, h1, h2, h3, li, td, th')
            : range.startContainer.parentElement?.closest('p, h1, h2, h3, li, td, th');
        if (block && block instanceof HTMLElement) {
          block.style.fontSize = `${nextPt}pt`;
        }
      }
      schedulePaginationPass();
    },
    [fontSizePt, restoreSavedSelection, schedulePaginationPass]
  );

  // Apply Paragraph Style (Normal, Title, H1, H2, H3)
  const handleApplyParagraphStyle = useCallback(
    (tag: 'p' | 'title' | 'h1' | 'h2' | 'h3') => {
      setActiveParagraphStyle(tag);
      restoreSavedSelection();
      if (tag === 'title') {
        document.execCommand('formatBlock', false, 'H1');
        const sel = window.getSelection();
        const block =
          sel && sel.anchorNode
            ? (sel.anchorNode.nodeType === Node.ELEMENT_NODE
                ? (sel.anchorNode as HTMLElement)
                : sel.anchorNode.parentElement
              )?.closest('h1')
            : null;
        if (block) {
          block.style.fontSize = '22pt';
          block.style.textAlign = 'center';
        }
      } else {
        document.execCommand('formatBlock', false, tag.toUpperCase());
      }
      schedulePaginationPass();
    },
    [restoreSavedSelection, schedulePaginationPass]
  );

  const handleApplyTextColor = useCallback(
    (hex: string) => {
      setActiveTextColor(hex);
      handleExecCommand('foreColor', hex);
    },
    [handleExecCommand]
  );

  const handleApplyHighlightColor = useCallback(
    (hex: string) => {
      setActiveHighlightColor(hex);
      handleExecCommand('hiliteColor', hex);
    },
    [handleExecCommand]
  );

  // Insert HTML node at current cursor position
  const insertHtmlAtCursor = useCallback(
    (htmlSnippet: string) => {
      const targetPage = restoreSavedSelection();
      if (!targetPage) return;

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (targetPage.contains(range.commonAncestorContainer) || targetPage === range.commonAncestorContainer) {
          range.deleteContents();
          const temp = document.createElement('div');
          temp.innerHTML = htmlSnippet;
          const frag = document.createDocumentFragment();
          let lastInserted: Node | null = null;
          while (temp.firstChild) {
            lastInserted = frag.appendChild(temp.firstChild);
          }
          range.insertNode(frag);
          if (lastInserted) {
            const afterRange = document.createRange();
            afterRange.setStartAfter(lastInserted);
            afterRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(afterRange);
            savedRangeRef.current = afterRange.cloneRange();
          }
          schedulePaginationPass();
          return;
        }
      }

      targetPage.insertAdjacentHTML('beforeend', htmlSnippet);
      schedulePaginationPass();
    },
    [restoreSavedSelection, schedulePaginationPass]
  );

  // Insert Table (Rows x Cols)
  const handleInsertTable = useCallback(
    (rows: number, cols: number) => {
      let thead = '<thead><tr>';
      for (let c = 0; c < cols; c++) {
        thead += `<th>തലക്കെട്ട് ${c + 1}</th>`;
      }
      thead += '</tr></thead>';

      let tbody = '<tbody>';
      for (let r = 0; r < Math.max(1, rows - 1); r++) {
        tbody += '<tr>';
        for (let c = 0; c < cols; c++) {
          tbody += `<td>വിവരം</td>`;
        }
        tbody += '</tr>';
      }
      tbody += '</tbody>';

      const tableHtml = `<table class="mps-table">${thead}${tbody}</table><p><br/></p>`;
      insertHtmlAtCursor(tableHtml);
      showToast(`${rows}×${cols} പട്ടിക ചേർത്തു (Table Inserted)`);
    },
    [insertHtmlAtCursor, showToast]
  );

  // Contextual Table Actions (+Row, -Row, +Col, -Col, Delete Table)
  const handleTableAction = useCallback(
    (action: 'add-row' | 'del-row' | 'add-col' | 'del-col' | 'del-table') => {
      if (!activeTableCell) return;
      const tr = activeTableCell.closest('tr');
      const table = activeTableCell.closest('table');
      if (!tr || !table) return;

      if (action === 'del-table') {
        table.remove();
        setActiveTableCell(null);
      } else if (action === 'add-row') {
        const newRow = tr.cloneNode(true) as HTMLTableRowElement;
        Array.from(newRow.cells).forEach((cell) => {
          cell.innerHTML = 'വിവരം';
        });
        tr.parentElement?.insertBefore(newRow, tr.nextSibling);
      } else if (action === 'del-row') {
        const allRows = table.querySelectorAll('tr');
        if (allRows.length <= 1) {
          table.remove();
          setActiveTableCell(null);
        } else {
          tr.remove();
          setActiveTableCell(null);
        }
      } else if (action === 'add-col') {
        const colIdx = activeTableCell.cellIndex;
        const rows = table.querySelectorAll('tr');
        rows.forEach((row) => {
          const refCell = row.cells[colIdx] || row.cells[row.cells.length - 1];
          const isHeader = refCell?.tagName.toLowerCase() === 'th';
          const newCell = document.createElement(isHeader ? 'th' : 'td');
          newCell.innerHTML = isHeader ? 'തലക്കെട്ട്' : 'വിവരം';
          if (refCell && refCell.nextSibling) {
            row.insertBefore(newCell, refCell.nextSibling);
          } else {
            row.appendChild(newCell);
          }
        });
      } else if (action === 'del-col') {
        const colIdx = activeTableCell.cellIndex;
        const rows = table.querySelectorAll('tr');
        const totalCols = rows[0]?.cells.length || 0;
        if (totalCols <= 1) {
          table.remove();
          setActiveTableCell(null);
        } else {
          rows.forEach((row) => {
            if (row.cells[colIdx]) {
              row.deleteCell(colIdx);
            }
          });
          setActiveTableCell(null);
        }
      }
      schedulePaginationPass();
    },
    [activeTableCell, schedulePaginationPass]
  );

  // Image Upload & Contextual Image Resizing/Alignment
  const handleImageFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const imgHtml = `<p style="text-align: center;"><img src="${dataUrl}" alt="Inserted Image" style="width: 50%; max-width: 100%; height: auto; border-radius: 4px; display: inline-block;" /></p><p><br/></p>`;
        insertHtmlAtCursor(imgHtml);
        showToast('ചിത്രം ചേർത്തു (Image Inserted)');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [insertHtmlAtCursor, showToast]
  );

  const handleImageResize = useCallback(
    (widthPercent: number) => {
      if (!activeImageEl) return;
      activeImageEl.style.width = `${widthPercent}%`;
      schedulePaginationPass();
    },
    [activeImageEl, schedulePaginationPass]
  );

  const handleImageAlign = useCallback(
    (align: 'left' | 'center' | 'right') => {
      if (!activeImageEl) return;
      const parentBlock = activeImageEl.closest('p, div');
      if (parentBlock && parentBlock instanceof HTMLElement) {
        parentBlock.style.textAlign = align;
      }
      schedulePaginationPass();
    },
    [activeImageEl, schedulePaginationPass]
  );

  const handleDeleteActiveImage = useCallback(() => {
    if (!activeImageEl) return;
    activeImageEl.remove();
    setActiveImageEl(null);
    schedulePaginationPass();
  }, [activeImageEl, schedulePaginationPass]);

  // Insert Horizontal Divider Line
  const handleInsertDivider = useCallback(() => {
    insertHtmlAtCursor('<hr class="mps-divider" /><p><br/></p>');
  }, [insertHtmlAtCursor]);

  // Insert Explicit Page Break (pushes following blocks to Page N+1)
  const handleInsertPageBreak = useCallback(() => {
    const currentIdx = activePageIndex;
    const nextIdx = currentIdx + 1;
    setPageCount((prev) => Math.max(prev, nextIdx + 1));
    window.setTimeout(() => {
      const nextPageEl = pageRefs.current[nextIdx];
      if (nextPageEl) {
        if (!nextPageEl.innerHTML.trim()) {
          nextPageEl.innerHTML = '<p><br/></p>';
        }
        nextPageEl.focus();
        setActivePageIndex(nextIdx);
      }
      schedulePaginationPass();
    }, 50);
    showToast(`പേജ് ${nextIdx + 1} ചേർത്തു (New Page Break)`);
  }, [activePageIndex, schedulePaginationPass, showToast]);

  // One-click Professional Book Typography Preset (Tiro Malayalam / Book Serif, 10.5pt, 1.6 line-height, Justify, 6mm First-Line Indent, 0pt Gap)
  const handleApplyBookTypography = useCallback(() => {
    const preferredBookFontId =
      defaultDocFontId === 'noto-serif' || defaultDocFontId === 'rachana'
        ? defaultDocFontId
        : 'tiro-malayalam';
    const targetFont =
      MALAYALAM_FONTS.find((f) => f.id === preferredBookFontId) ||
      MALAYALAM_FONTS[0];

    setDefaultDocFontId(targetFont.id);
    setFontSizePt(10.5);
    setLineSpacing('1.6');
    setFirstLineIndent(true);
    setParagraphGapPt(0);
    setSpaceAfterParagraph(false);

    for (let i = 0; i < pageCount; i++) {
      const pageEl = pageRefs.current[i];
      if (!pageEl) continue;
      const bodyParas = pageEl.querySelectorAll<HTMLParagraphElement>('p');
      bodyParas.forEach((p) => {
        if (
          p.classList.contains('mps-no-indent') ||
          p.closest('.mps-chapter-start') ||
          p.style.textAlign === 'center' ||
          p.style.textAlign === 'right'
        ) {
          return;
        }
        p.style.fontFamily = targetFont.cssFamily;
        p.style.fontSize = '10.5pt';
        p.style.textAlign = 'justify';
      });
    }

    schedulePaginationPass();
    showToast(
      `ബുക്ക് ടൈപ്പോഗ്രഫി പ്രയോഗിച്ചു (${targetFont.name} · 10.5pt · 6mm Indent)`
    );
  }, [defaultDocFontId, pageCount, schedulePaginationPass, showToast]);

  // Insert Chapter Start (New Page + Styled Chapter Number & Title Block)
  const handleInsertChapterStart = useCallback(() => {
    // Count existing chapter headings to assign the next sequential chapter number
    let existingChapters = 0;
    for (let i = 0; i < pageCount; i++) {
      const el = pageRefs.current[i];
      if (!el) continue;
      const blocks = el.querySelectorAll('.mps-chapter-start, [data-chapter-start="true"]');
      blocks.forEach((blk) => {
        if ((blk.textContent || '').includes('അധ്യായം')) {
          existingChapters += 1;
        }
      });
    }
    const nextChapterNum = existingChapters + 1;
    const chapterHtml = buildChapterStartHtml(nextChapterNum);

    const activeEl = pageRefs.current[activePageIndex];
    const isActiveEmpty =
      activeEl && (activeEl.innerText || '').trim().length === 0;

    if (isActiveEmpty && activeEl) {
      activeEl.innerHTML = chapterHtml;
      activeEl.focus();
      schedulePaginationPass();
      showToast(`അധ്യായം ${nextChapterNum} ചേർത്തു (Chapter Start)`);
      return;
    }

    // Snapshot existing pages and insert the new Chapter Opening page right after activePageIndex
    const pagesHtml: string[] = [];
    for (let i = 0; i < pageCount; i++) {
      pagesHtml.push(pageRefs.current[i]?.innerHTML || '');
    }
    const insertIdx = Math.min(pagesHtml.length, activePageIndex + 1);
    pagesHtml.splice(insertIdx, 0, chapterHtml);
    pendingHtmlByPageRef.current = pagesHtml;
    setPageCount(pagesHtml.length);
    setActivePageIndex(insertIdx);
    setHideHeaderOnChapterPages(true);

    window.setTimeout(() => {
      const newPageEl = pageRefs.current[insertIdx];
      if (newPageEl) {
        newPageEl.focus();
      }
      schedulePaginationPass();
    }, 60);
    showToast(`അധ്യായം ${nextChapterNum} പുതിയ പേജിൽ ചേർത്തു (Chapter Start)`);
  }, [activePageIndex, pageCount, schedulePaginationPass, showToast]);

  // Insert Book Front Matter Templates (Title Page, Copyright Page, Table of Contents)
  const handleInsertBookFrontMatter = useCallback(
    (key: BookFrontMatterKey) => {
      const templateMap: Record<
        BookFrontMatterKey,
        { html: string; label: string }
      > = {
        'title-page': {
          html: TEMPLATE_BOOK_TITLE_PAGE,
          label: 'പുസ്തക ടൈറ്റിൽ പേജ് (Book Title Page)',
        },
        'copyright-page': {
          html: TEMPLATE_BOOK_COPYRIGHT_PAGE,
          label: 'കോപ്പിറൈറ്റ് & എഡിഷൻ പേജ് (Copyright Page)',
        },
        'toc-page': {
          html: TEMPLATE_BOOK_TOC_PAGE,
          label: 'ഉള്ളടക്കം (Table of Contents)',
        },
      };

      const selected = templateMap[key];
      const activeEl = pageRefs.current[activePageIndex];
      const isActiveEmpty =
        activeEl && (activeEl.innerText || '').trim().length === 0;

      setHideHeaderOnChapterPages(true);

      if (isActiveEmpty && activeEl) {
        activeEl.innerHTML = selected.html;
        activeEl.focus();
        schedulePaginationPass();
        showToast(`${selected.label} ചേർത്തു`);
        return;
      }

      const pagesHtml: string[] = [];
      for (let i = 0; i < pageCount; i++) {
        pagesHtml.push(pageRefs.current[i]?.innerHTML || '');
      }

      const insertIdx =
        key === 'title-page'
          ? 0
          : Math.min(pagesHtml.length, activePageIndex + 1);
      pagesHtml.splice(insertIdx, 0, selected.html);
      pendingHtmlByPageRef.current = pagesHtml;
      setPageCount(pagesHtml.length);
      setActivePageIndex(insertIdx);

      window.setTimeout(() => {
        const targetEl = pageRefs.current[insertIdx];
        if (targetEl) {
          targetEl.focus();
        }
        schedulePaginationPass();
      }, 60);
      showToast(`${selected.label} പുതിയ പേജായി ചേർത്തു`);
    },
    [activePageIndex, pageCount, schedulePaginationPass, showToast]
  );

  // Apply Ready-Made Malayalam Print Templates
  const handleApplyTemplate = useCallback(
    (templateKey: 'a5-notice' | 'a4-letterhead' | 'a4-exam') => {
      let targetHtml = TEMPLATE_A5_PUBLIC_NOTICE;
      if (templateKey === 'a5-notice') {
        setDocTitle('വാർഷിക പൊതുയോഗം — നോട്ടീസ് (A5)');
        setPaperSize('A5');
        setOrientation('portrait');
        setDefaultDocFontId('manjari');
        setPageBorderStyle('double');
        setColumnCount(1);
        setMirrorMargins(false);
        targetHtml = TEMPLATE_A5_PUBLIC_NOTICE;
      } else if (templateKey === 'a4-letterhead') {
        setDocTitle('ഔദ്യോഗിക കത്ത് — Official Letter (A4)');
        setPaperSize('A4');
        setOrientation('portrait');
        setDefaultDocFontId('noto-sans');
        setPageBorderStyle('thin');
        setColumnCount(1);
        setMirrorMargins(false);
        targetHtml = TEMPLATE_A4_OFFICIAL_LETTERHEAD;
      } else if (templateKey === 'a4-exam') {
        setDocTitle('വാർഷിക പരീക്ഷ — ചോദ്യപേപ്പർ (A4)');
        setPaperSize('A4');
        setOrientation('portrait');
        setDefaultDocFontId('noto-serif');
        setPageBorderStyle('thin');
        setColumnCount(2);
        setMirrorMargins(false);
        targetHtml = TEMPLATE_A4_EXAM_TWO_COLUMN;
      }

      // Reset to 1 page and populate content, then let pagination split if needed
      for (let i = 1; i < pageRefs.current.length; i++) {
        const el = pageRefs.current[i];
        if (el) el.innerHTML = '';
      }
      setPageCount(1);
      if (pageRefs.current[0]) {
        pageRefs.current[0].innerHTML = targetHtml;
      } else {
        pendingHtmlByPageRef.current = [targetHtml];
      }
      window.setTimeout(() => {
        schedulePaginationPass();
      }, 40);
      showToast('മലയാളം ടെംപ്ലേറ്റ് ലോഡ് ചെയ്തു');
    },
    [schedulePaginationPass, showToast]
  );

  // Build ExportDocumentContext for PDF, Booklet Imposition, Standalone HTML, and Word (.docx)
  const buildExportContext = useCallback((): ExportDocumentContext => {
    const pageHtmlList: string[] = [];
    for (let i = 0; i < pageCount; i++) {
      const el = pageRefs.current[i];
      pageHtmlList.push(el ? el.innerHTML : '');
    }
    return {
      docTitle,
      pageHtmlList,
      paperSize,
      customWidthMm,
      customHeightMm,
      orientation,
      margins: activeMargins,
      mirrorMargins,
      innerMarginMm,
      outerMarginMm,
      activeFontCssFamily: activeFont.cssFamily,
      lineSpacing,
      letterSpacing,
      firstLineIndent,
      spaceAfterParagraph,
      paragraphGapPt,
      pageBorderStyle,
      pageBorderColor,
      pageBorderPaddingMm,
      columnCount,
      watermarkText,
      paperTint,
      printBackgroundTint,
      showCropMarks,
      showHeaderFooter,
      headerText,
      footerText,
      useOddEvenHeaders,
      evenHeaderText,
      oddHeaderText,
      hideHeaderOnChapterPages,
      showPageNumbers,
      differentFirstPage,
      pageNumberPosition,
      pageNumberAlign,
      pageNumberFormat,
    };
  }, [
    activeFont.cssFamily,
    activeMargins,
    columnCount,
    customHeightMm,
    customWidthMm,
    differentFirstPage,
    docTitle,
    evenHeaderText,
    firstLineIndent,
    footerText,
    headerText,
    hideHeaderOnChapterPages,
    innerMarginMm,
    letterSpacing,
    lineSpacing,
    mirrorMargins,
    oddHeaderText,
    orientation,
    outerMarginMm,
    pageBorderColor,
    pageBorderPaddingMm,
    pageBorderStyle,
    pageCount,
    pageNumberAlign,
    pageNumberFormat,
    pageNumberPosition,
    paperSize,
    paperTint,
    paragraphGapPt,
    printBackgroundTint,
    showCropMarks,
    showHeaderFooter,
    showPageNumbers,
    spaceAfterParagraph,
    useOddEvenHeaders,
    watermarkText,
  ]);

  // 1. Standard 1-Up Vector PDF Print + Standalone HTML Fallback Toast
  const handlePrintVectorPdf = useCallback(async () => {
    setActiveDrawer('none');
    showToast(
      "Opening PDF Print Dialog... (If blocked in preview, tap 'Download Printable Page (.html)' below)",
      true,
      false
    );
    window.setTimeout(async () => {
      await printVectorPdfDocument();
    }, 150);
  }, [showToast]);

  // 1B. Optional 2-Up A5 Booklet Imposition on A4 Landscape Print + Booklet HTML Fallback
  const handlePrintBookletImposition = useCallback(async () => {
    setActiveDrawer('none');
    showToast(
      "Preparing 2-Up A5 Booklet on A4 Landscape... (If blocked in preview, tap 'Download 2-Up Booklet (.html)' below)",
      false,
      true
    );
    const ctx = buildExportContext();
    window.setTimeout(async () => {
      await printBookletImpositionPdf(ctx);
    }, 150);
  }, [buildExportContext, showToast]);

  const handleExportBookletHtml = useCallback(() => {
    const ctx = buildExportContext();
    exportBookletImpositionHtml(ctx);
    showToast(
      'Downloaded 2-Up A5 Booklet (.html)! Open in Chrome & print double-sided on A4 Landscape.'
    );
  }, [buildExportContext, showToast]);

  // 2. Download Standalone Font-Locked Printable HTML (1-Up)
  const handleExportStandaloneHtml = useCallback(() => {
    const ctx = buildExportContext();
    exportStandalonePrintableHtml(ctx);
    showToast(
      'Downloaded printable .html file! Open it in Chrome to Save as PDF.'
    );
  }, [buildExportContext, showToast]);

  // 3. Real Word (.docx) Export & Native Mobile Share
  const handleExportWordDocx = useCallback(
    async (preferShare: boolean) => {
      const ctx = buildExportContext();
      const combinedHtml = getCombinedLogicalPagesHtml(
        pageRefs.current,
        pageCount
      );
      const outcome = await shareOrDownloadWordDocx(
        ctx,
        combinedHtml,
        preferShare
      );
      setActiveDrawer('none');
      if (outcome === 'shared') {
        showToast('Shared Word (.docx) file!');
      } else {
        showToast('Downloaded Word (.docx) file!');
      }
    },
    [buildExportContext, pageCount, showToast]
  );

  // 4. Save & Open Editable Draft (.mps)
  const handleSaveMpsDraft = useCallback(() => {
    const htmlContent = getCombinedLogicalPagesHtml(
      pageRefs.current,
      pageCount
    );
    const state: SavedProjectState = {
      docTitle,
      htmlContent,
      paperSize,
      customWidthMm,
      customHeightMm,
      orientation,
      marginPreset,
      margins: activeMargins,
      mirrorMargins,
      innerMarginMm,
      outerMarginMm,
      defaultDocFontId,
      showHeaderFooter,
      headerText,
      footerText,
      useOddEvenHeaders,
      evenHeaderText,
      oddHeaderText,
      hideHeaderOnChapterPages,
      showPageNumbers,
      differentFirstPage,
      pageNumberPosition,
      pageNumberAlign,
      pageNumberFormat,
      lineSpacing,
      letterSpacing,
      firstLineIndent,
      spaceAfterParagraph,
      paragraphGapPt,
      pageBorderStyle,
      pageBorderColor,
      pageBorderPaddingMm,
      columnCount,
      watermarkText,
      paperTint,
      printBackgroundTint,
      showRuler,
      showCropMarks,
    };
    exportEditableDraftMps(state);
    showToast('Saved editable .mps project draft!');
  }, [
    activeMargins,
    columnCount,
    customHeightMm,
    customWidthMm,
    defaultDocFontId,
    differentFirstPage,
    docTitle,
    evenHeaderText,
    firstLineIndent,
    footerText,
    headerText,
    hideHeaderOnChapterPages,
    innerMarginMm,
    letterSpacing,
    lineSpacing,
    marginPreset,
    mirrorMargins,
    oddHeaderText,
    orientation,
    outerMarginMm,
    pageBorderColor,
    pageBorderPaddingMm,
    pageBorderStyle,
    pageCount,
    pageNumberAlign,
    pageNumberFormat,
    pageNumberPosition,
    paperSize,
    paperTint,
    paragraphGapPt,
    printBackgroundTint,
    showCropMarks,
    showHeaderFooter,
    showPageNumbers,
    showRuler,
    spaceAfterParagraph,
    showToast,
    useOddEvenHeaders,
    watermarkText,
  ]);

  const handleOpenMpsFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(
            reader.result as string
          ) as Partial<SavedProjectState>;
          if (parsed.docTitle) setDocTitle(parsed.docTitle);
          if (parsed.paperSize) setPaperSize(parsed.paperSize);
          if (parsed.customWidthMm) setCustomWidthMm(parsed.customWidthMm);
          if (parsed.customHeightMm) setCustomHeightMm(parsed.customHeightMm);
          if (parsed.orientation) setOrientation(parsed.orientation);
          if (parsed.marginPreset) setMarginPreset(parsed.marginPreset);
          if (parsed.margins) setMargins(parsed.margins);
          if (typeof parsed.mirrorMargins === 'boolean')
            setMirrorMargins(parsed.mirrorMargins);
          if (typeof parsed.innerMarginMm === 'number')
            setInnerMarginMm(parsed.innerMarginMm);
          if (typeof parsed.outerMarginMm === 'number')
            setOuterMarginMm(parsed.outerMarginMm);
          if (parsed.defaultDocFontId)
            setDefaultDocFontId(parsed.defaultDocFontId);
          if (typeof parsed.showHeaderFooter === 'boolean')
            setShowHeaderFooter(parsed.showHeaderFooter);
          if (typeof parsed.headerText === 'string')
            setHeaderText(parsed.headerText);
          if (typeof parsed.footerText === 'string')
            setFooterText(parsed.footerText);
          if (typeof parsed.useOddEvenHeaders === 'boolean')
            setUseOddEvenHeaders(parsed.useOddEvenHeaders);
          if (typeof parsed.evenHeaderText === 'string')
            setEvenHeaderText(parsed.evenHeaderText);
          if (typeof parsed.oddHeaderText === 'string')
            setOddHeaderText(parsed.oddHeaderText);
          if (typeof parsed.hideHeaderOnChapterPages === 'boolean')
            setHideHeaderOnChapterPages(parsed.hideHeaderOnChapterPages);
          if (typeof parsed.showPageNumbers === 'boolean')
            setShowPageNumbers(parsed.showPageNumbers);
          if (typeof parsed.differentFirstPage === 'boolean')
            setDifferentFirstPage(parsed.differentFirstPage);
          if (parsed.pageNumberPosition)
            setPageNumberPosition(parsed.pageNumberPosition);
          if (parsed.pageNumberAlign)
            setPageNumberAlign(parsed.pageNumberAlign);
          if (parsed.pageNumberFormat)
            setPageNumberFormat(parsed.pageNumberFormat);
          if (parsed.lineSpacing) setLineSpacing(parsed.lineSpacing);
          if (parsed.letterSpacing) setLetterSpacing(parsed.letterSpacing);
          if (typeof parsed.firstLineIndent === 'boolean')
            setFirstLineIndent(parsed.firstLineIndent);
          if (typeof parsed.spaceAfterParagraph === 'boolean')
            setSpaceAfterParagraph(parsed.spaceAfterParagraph);
          if (typeof parsed.paragraphGapPt === 'number') {
            setParagraphGapPt(parsed.paragraphGapPt);
          } else if (typeof parsed.spaceAfterParagraph === 'boolean') {
            setParagraphGapPt(parsed.spaceAfterParagraph ? 8 : 0);
          }
          if (parsed.pageBorderStyle)
            setPageBorderStyle(parsed.pageBorderStyle);
          if (parsed.pageBorderColor)
            setPageBorderColor(parsed.pageBorderColor);
          if (typeof parsed.pageBorderPaddingMm === 'number')
            setPageBorderPaddingMm(parsed.pageBorderPaddingMm);
          if (parsed.columnCount) setColumnCount(parsed.columnCount);
          if (typeof parsed.watermarkText === 'string')
            setWatermarkText(parsed.watermarkText);
          if (parsed.paperTint) setPaperTint(parsed.paperTint);
          if (typeof parsed.printBackgroundTint === 'boolean')
            setPrintBackgroundTint(parsed.printBackgroundTint);

          if (parsed.htmlContent) {
            for (let i = 1; i < pageRefs.current.length; i++) {
              const el = pageRefs.current[i];
              if (el) el.innerHTML = '';
            }
            setPageCount(1);
            if (pageRefs.current[0]) {
              pageRefs.current[0].innerHTML = parsed.htmlContent;
            } else {
              pendingHtmlByPageRef.current = [parsed.htmlContent];
            }
            window.setTimeout(() => {
              schedulePaginationPass();
            }, 40);
          }
          showToast('പ്രോജക്റ്റ് തുറന്നു (.mps loaded)');
        } catch {
          showToast('Invalid .mps project file');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [schedulePaginationPass, showToast]
  );

  // Find & Replace across all pages
  const handleFindNext = useCallback(() => {
    const query = findQuery.trim();
    if (!query) return;

    let totalMatches = 0;
    let firstRange: Range | null = null;

    for (let i = 0; i < pageCount; i++) {
      const pageEl = pageRefs.current[i];
      if (!pageEl) continue;
      const walker = document.createTreeWalker(
        pageEl,
        NodeFilter.SHOW_TEXT,
        null
      );
      let node = walker.nextNode() as Text | null;
      while (node) {
        const text = node.nodeValue || '';
        let idx = text.indexOf(query);
        while (idx !== -1) {
          totalMatches++;
          if (!firstRange) {
            firstRange = document.createRange();
            firstRange.setStart(node, idx);
            firstRange.setEnd(node, idx + query.length);
          }
          idx = text.indexOf(query, idx + query.length);
        }
        node = walker.nextNode() as Text | null;
      }
    }

    if (firstRange) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(firstRange);
        savedRangeRef.current = firstRange.cloneRange();
      }
      setFindMatchStatus(`${totalMatches} found`);
    } else {
      setFindMatchStatus('0 found');
    }
  }, [findQuery, pageCount]);

  const handleReplaceAll = useCallback(() => {
    const query = findQuery.trim();
    if (!query) return;
    let replacedCount = 0;

    for (let i = 0; i < pageCount; i++) {
      const pageEl = pageRefs.current[i];
      if (!pageEl) continue;
      const walker = document.createTreeWalker(
        pageEl,
        NodeFilter.SHOW_TEXT,
        null
      );
      const textNodes: Text[] = [];
      let node = walker.nextNode() as Text | null;
      while (node) {
        if ((node.nodeValue || '').includes(query)) {
          textNodes.push(node);
        }
        node = walker.nextNode() as Text | null;
      }
      textNodes.forEach((tNode) => {
        const val = tNode.nodeValue || '';
        const parts = val.split(query);
        replacedCount += parts.length - 1;
        tNode.nodeValue = parts.join(replaceQuery);
      });
    }

    setFindMatchStatus(`Replaced ${replacedCount}`);
    schedulePaginationPass();
  }, [findQuery, pageCount, replaceQuery, schedulePaginationPass]);

  // Page Keyboard Navigation (Backspace at start of Page N+1 moves cursor to end of Page N)
  const handlePageKeyDown = useCallback(
    (pageIndex: number, e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Backspace' && pageIndex > 0) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && sel.isCollapsed) {
          const range = sel.getRangeAt(0);
          const pageEl = pageRefs.current[pageIndex];
          if (pageEl) {
            const preRange = document.createRange();
            preRange.selectNodeContents(pageEl);
            preRange.setEnd(range.startContainer, range.startOffset);
            if (preRange.toString().length === 0) {
              const prevPageEl = pageRefs.current[pageIndex - 1];
              if (prevPageEl) {
                e.preventDefault();
                prevPageEl.focus();
                const endRange = document.createRange();
                endRange.selectNodeContents(prevPageEl);
                endRange.collapse(false);
                sel.removeAllRanges();
                sel.addRange(endRange);
                savedRangeRef.current = endRange.cloneRange();
                setActivePageIndex(pageIndex - 1);
                schedulePaginationPass();
              }
            }
          }
        }
      }
    },
    [schedulePaginationPass]
  );

  // Detect clicked Image or Table Cell inside a page
  const handlePageClick = useCallback(
    (pageIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
      setActivePageIndex(pageIndex);
      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'img') {
        setActiveImageEl(target as HTMLImageElement);
      } else {
        setActiveImageEl(null);
      }

      const cell = target.closest('td, th') as HTMLTableCellElement | null;
      setActiveTableCell(cell);
    },
    []
  );

  return (
    <div
      className={`flex h-dvh w-screen flex-col overflow-hidden select-none ${
        darkMode ? 'bg-[#202124] text-[#E8EAED]' : 'bg-[#E8EAED] text-[#1F1F1F]'
      }`}
    >
      {/* Hidden File Inputs for Image Upload & .mps Draft Open */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileChange}
      />
      <input
        ref={mpsInputRef}
        type="file"
        accept=".mps,.json,application/json"
        className="hidden"
        onChange={handleOpenMpsFileChange}
      />

      {/* ===================================================================== */}
      {/* ULTRA-CLEAN GOOGLE DOCS SINGLE-ROW TOP BAR                            */}
      {/* ===================================================================== */}
      <header
        className={`no-print z-30 flex h-12 shrink-0 items-center justify-between border-b px-2.5 shadow-2xs ${
          darkMode
            ? 'border-[#3C4043] bg-[#303134] text-[#E8EAED]'
            : 'border-[#DADCE0] bg-white text-[#1F1F1F]'
        }`}
      >
        {/* Left: Circular Checkmark ('✓') & Subtle Editable Document Title */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 pr-2">
          <button
            type="button"
            onClick={() => {
              setActiveDrawer('none');
              persistToLocalStorage();
              showToast('ഡ്രാഫ്റ്റ് സേവ് ചെയ്തു (Draft Saved)');
            }}
            title="Save & Done"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#1A73E8] transition-colors hover:bg-[#1A73E8]/10 active:bg-[#1A73E8]/20"
          >
            <Check className="h-5 w-5 stroke-[2.4]" />
          </button>

          <div className="flex min-w-0 flex-1 flex-col">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              aria-label="Document Title"
              className={`w-full truncate rounded-md px-1.5 py-0.5 text-xs font-semibold focus:ring-1 focus:ring-[#1A73E8] focus:outline-none ${
                darkMode
                  ? 'bg-transparent text-gray-100'
                  : 'bg-transparent text-gray-800'
              }`}
            />
            <span className="truncate px-1.5 text-[10px] text-gray-500">
              {paperSize}
              {mirrorMargins ? ' · Book' : ''} · {pageCount}{' '}
              {pageCount === 1 ? 'പേജ്' : 'പേജുകൾ'} · {activeFont.name}
            </span>
          </div>
        </div>

        {/* Right: 6 Clean Action Icons: Undo, Redo, Insert (+), Format (A), PDF/Share, More (⋮) */}
        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleExecCommand('undo')}
            title="Undo (പഴയപടിയാക്കുക)"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <Undo2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleExecCommand('redo')}
            title="Redo (വീണ്ടും ചെയ്യുക)"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <Redo2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              setActiveDrawer(activeDrawer === 'insert' ? 'none' : 'insert')
            }
            title="Insert (+)"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              activeDrawer === 'insert'
                ? 'bg-[#E8F0FE] text-[#1A73E8]'
                : darkMode
                  ? 'hover:bg-white/10'
                  : 'hover:bg-gray-100'
            }`}
          >
            <Plus className="h-5 w-5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              setActiveDrawer(activeDrawer === 'format' ? 'none' : 'format')
            }
            title="Format Fonts & Paragraphs (A)"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              activeDrawer === 'format'
                ? 'bg-[#E8F0FE] text-[#1A73E8]'
                : darkMode
                  ? 'hover:bg-white/10'
                  : 'hover:bg-gray-100'
            }`}
          >
            <Type className="h-4 w-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() =>
              setActiveDrawer(
                activeDrawer === 'share-export' ? 'none' : 'share-export'
              )
            }
            title="Save PDF or Send Word (.docx)"
            className="mx-0.5 flex h-8 items-center gap-1 rounded-full bg-[#1A73E8] px-2.5 text-[11px] font-bold text-white shadow-xs transition-transform active:scale-95"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>PDF</span>
            <Share2 className="ml-0.5 h-3 w-3 opacity-85" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setMoreSubPanel('main');
              setActiveDrawer(activeDrawer === 'more' ? 'none' : 'more');
            }}
            title="More Options (⋮)"
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
              activeDrawer === 'more'
                ? 'bg-[#E8F0FE] text-[#1A73E8]'
                : darkMode
                  ? 'hover:bg-white/10'
                  : 'hover:bg-gray-100'
            }`}
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* ===================================================================== */}
      {/* FIND & REPLACE SLIM BAR (When toggled from More menu)                 */}
      {/* ===================================================================== */}
      {showFindReplace && (
        <div
          className={`no-print z-20 flex flex-wrap items-center gap-1.5 border-b px-3 py-2 text-xs shadow-xs ${
            darkMode
              ? 'border-[#3C4043] bg-[#303134] text-gray-100'
              : 'border-[#DADCE0] bg-gray-50 text-gray-800'
          }`}
        >
          <div className="flex flex-1 items-center gap-1.5">
            <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <input
              type="text"
              value={findQuery}
              onChange={(e) => setFindQuery(e.target.value)}
              placeholder="തിരയുക (Find)..."
              className={`w-28 flex-1 rounded-lg border px-2 py-1 text-xs focus:border-[#1A73E8] focus:outline-none ${
                darkMode
                  ? 'border-[#3C4043] bg-[#202124] text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
            <input
              type="text"
              value={replaceQuery}
              onChange={(e) => setReplaceQuery(e.target.value)}
              placeholder="മാറ്റുക (Replace)..."
              className={`w-28 flex-1 rounded-lg border px-2 py-1 text-xs focus:border-[#1A73E8] focus:outline-none ${
                darkMode
                  ? 'border-[#3C4043] bg-[#202124] text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            />
          </div>
          <div className="flex items-center gap-1">
            {findMatchStatus && (
              <span className="px-1 text-[11px] font-medium text-[#1A73E8]">
                {findMatchStatus}
              </span>
            )}
            <button
              type="button"
              onClick={handleFindNext}
              className="rounded-lg bg-[#1A73E8] px-2.5 py-1 text-[11px] font-semibold text-white"
            >
              Find
            </button>
            <button
              type="button"
              onClick={handleReplaceAll}
              className="rounded-lg border border-[#1A73E8] px-2.5 py-1 text-[11px] font-semibold text-[#1A73E8]"
            >
              Replace All
            </button>
            <button
              type="button"
              onClick={() => {
                setShowFindReplace(false);
                setFindMatchStatus('');
              }}
              className="ml-1 rounded-full p-1 text-gray-500 hover:bg-gray-200/60"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* FLOATING TOAST / PRINTABLE HTML EXPORT BANNER                         */}
      {/* ===================================================================== */}
      {toastInfo && (
        <div className="no-print fixed top-14 left-1/2 z-50 flex w-[92%] max-w-md -translate-x-1/2 flex-col gap-2 rounded-2xl bg-gray-900/95 px-4 py-3 text-xs text-white shadow-xl backdrop-blur-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium">{toastInfo.message}</span>
            <button
              type="button"
              onClick={() => setToastInfo(null)}
              className="rounded-full p-1 text-gray-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          {toastInfo.showHtmlDownload && (
            <button
              type="button"
              onClick={handleExportStandaloneHtml}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1A73E8] py-2 text-xs font-bold text-white shadow-xs active:scale-98"
            >
              <FileCode className="h-4 w-4" />
              <span>Download Printable Page (.html)</span>
            </button>
          )}
          {toastInfo.showBookletHtmlDownload && (
            <button
              type="button"
              onClick={handleExportBookletHtml}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#1A73E8] py-2 text-xs font-bold text-white shadow-xs active:scale-98"
            >
              <FileCode className="h-4 w-4" />
              <span>Download 2-Up Booklet (.html)</span>
            </button>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MULTI-PAGE GOOGLE DOCS PRINT LAYOUT CANVAS                            */}
      {/* ===================================================================== */}
      <PageCanvas
        pageCount={pageCount}
        activePageIndex={activePageIndex}
        pageRefs={pageRefs}
        workspaceRef={workspaceRef}
        finalWidthMm={finalWidthMm}
        finalHeightMm={finalHeightMm}
        margins={activeMargins}
        mirrorMargins={mirrorMargins}
        innerMarginMm={innerMarginMm}
        outerMarginMm={outerMarginMm}
        effectiveScale={effectiveScale}
        activeFontCssFamily={activeFont.cssFamily}
        lineSpacing={lineSpacing}
        letterSpacing={letterSpacing}
        firstLineIndent={firstLineIndent}
        spaceAfterParagraph={spaceAfterParagraph}
        paragraphGapPt={paragraphGapPt}
        columnCount={columnCount}
        pageBorderStyle={pageBorderStyle}
        pageBorderColor={pageBorderColor}
        pageBorderPaddingMm={pageBorderPaddingMm}
        paperTint={paperTint}
        watermarkText={watermarkText}
        showCropMarks={showCropMarks}
        showRuler={showRuler}
        showHeaderFooter={showHeaderFooter}
        headerText={headerText}
        footerText={footerText}
        onHeaderTextChange={setHeaderText}
        onFooterTextChange={setFooterText}
        useOddEvenHeaders={useOddEvenHeaders}
        evenHeaderText={evenHeaderText}
        oddHeaderText={oddHeaderText}
        onEvenHeaderTextChange={setEvenHeaderText}
        onOddHeaderTextChange={setOddHeaderText}
        hideHeaderOnChapterPages={hideHeaderOnChapterPages}
        chapterPageFlags={chapterPageFlags}
        showPageNumbers={showPageNumbers}
        differentFirstPage={differentFirstPage}
        pageNumberPosition={pageNumberPosition}
        pageNumberAlign={pageNumberAlign}
        pageNumberFormat={pageNumberFormat}
        darkMode={darkMode}
        onPageFocus={(idx) => setActivePageIndex(idx)}
        onPageInput={() => {
          schedulePaginationPass();
        }}
        onPageKeyDown={handlePageKeyDown}
        onPageClick={handlePageClick}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          schedulePaginationPass();
        }}
        onBackgroundClick={(e) => {
          if (e.target === workspaceRef.current) {
            setActiveDrawer('none');
          }
        }}
      />

      {/* ===================================================================== */}
      {/* SLIM GOOGLE DOCS BOTTOM TOOLBAR & SLIDE-UP BOTTOM SHEETS              */}
      {/* ===================================================================== */}
      <BottomSheets
        activeDrawer={activeDrawer}
        setActiveDrawer={setActiveDrawer}
        formatTab={formatTab}
        setFormatTab={setFormatTab}
        moreSubPanel={moreSubPanel}
        setMoreSubPanel={setMoreSubPanel}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        docTitle={docTitle}
        setDocTitle={setDocTitle}
        metrics={metrics}
        pageCount={pageCount}
        zoomMode={zoomMode}
        setZoomMode={setZoomMode}
        activeFont={activeFont}
        onSelectFont={handleSelectFont}
        fontSizePt={fontSizePt}
        onChangeFontSize={handleChangeFontSize}
        activeParagraphStyle={activeParagraphStyle}
        onApplyParagraphStyle={handleApplyParagraphStyle}
        onExecCommand={handleExecCommand}
        activeTextColor={activeTextColor}
        onApplyTextColor={handleApplyTextColor}
        activeHighlightColor={activeHighlightColor}
        onApplyHighlightColor={handleApplyHighlightColor}
        lineSpacing={lineSpacing}
        setLineSpacing={setLineSpacing}
        spaceAfterParagraph={spaceAfterParagraph}
        setSpaceAfterParagraph={handleSetSpaceAfterParagraph}
        paragraphGapPt={paragraphGapPt}
        setParagraphGapPt={handleSetParagraphGapPt}
        firstLineIndent={firstLineIndent}
        setFirstLineIndent={setFirstLineIndent}
        onApplyBookTypography={handleApplyBookTypography}
        activeTableCell={activeTableCell}
        onTableAction={handleTableAction}
        activeImageEl={activeImageEl}
        onImageResize={handleImageResize}
        onImageAlign={handleImageAlign}
        onDeleteActiveImage={handleDeleteActiveImage}
        onInsertTable={handleInsertTable}
        onTriggerImageUpload={() => imageInputRef.current?.click()}
        onInsertDivider={handleInsertDivider}
        onInsertPageBreak={handleInsertPageBreak}
        onInsertChapterStart={handleInsertChapterStart}
        paperSize={paperSize}
        setPaperSize={setPaperSize}
        customWidthMm={customWidthMm}
        setCustomWidthMm={setCustomWidthMm}
        customHeightMm={customHeightMm}
        setCustomHeightMm={setCustomHeightMm}
        orientation={orientation}
        setOrientation={setOrientation}
        marginPreset={marginPreset}
        setMarginPreset={setMarginPreset}
        margins={margins}
        setMargins={setMargins}
        mirrorMargins={mirrorMargins}
        setMirrorMargins={setMirrorMargins}
        innerMarginMm={innerMarginMm}
        setInnerMarginMm={setInnerMarginMm}
        outerMarginMm={outerMarginMm}
        setOuterMarginMm={setOuterMarginMm}
        pageBorderStyle={pageBorderStyle}
        setPageBorderStyle={setPageBorderStyle}
        pageBorderColor={pageBorderColor}
        setPageBorderColor={setPageBorderColor}
        pageBorderPaddingMm={pageBorderPaddingMm}
        setPageBorderPaddingMm={setPageBorderPaddingMm}
        columnCount={columnCount}
        setColumnCount={setColumnCount}
        watermarkText={watermarkText}
        setWatermarkText={setWatermarkText}
        paperTint={paperTint}
        setPaperTint={setPaperTint}
        printBackgroundTint={printBackgroundTint}
        setPrintBackgroundTint={setPrintBackgroundTint}
        showCropMarks={showCropMarks}
        setShowCropMarks={setShowCropMarks}
        showRuler={showRuler}
        setShowRuler={setShowRuler}
        showHeaderFooter={showHeaderFooter}
        setShowHeaderFooter={setShowHeaderFooter}
        headerText={headerText}
        setHeaderText={setHeaderText}
        footerText={footerText}
        setFooterText={setFooterText}
        useOddEvenHeaders={useOddEvenHeaders}
        setUseOddEvenHeaders={setUseOddEvenHeaders}
        evenHeaderText={evenHeaderText}
        setEvenHeaderText={setEvenHeaderText}
        oddHeaderText={oddHeaderText}
        setOddHeaderText={setOddHeaderText}
        hideHeaderOnChapterPages={hideHeaderOnChapterPages}
        setHideHeaderOnChapterPages={setHideHeaderOnChapterPages}
        showPageNumbers={showPageNumbers}
        setShowPageNumbers={setShowPageNumbers}
        differentFirstPage={differentFirstPage}
        setDifferentFirstPage={setDifferentFirstPage}
        pageNumberPosition={pageNumberPosition}
        setPageNumberPosition={setPageNumberPosition}
        pageNumberAlign={pageNumberAlign}
        setPageNumberAlign={setPageNumberAlign}
        pageNumberFormat={pageNumberFormat}
        setPageNumberFormat={setPageNumberFormat}
        onApplyTemplate={handleApplyTemplate}
        onInsertBookFrontMatter={handleInsertBookFrontMatter}
        onOpenFindReplace={() => setShowFindReplace(true)}
        onPrintVectorPdf={handlePrintVectorPdf}
        onPrintBookletImposition={handlePrintBookletImposition}
        onExportBookletHtml={handleExportBookletHtml}
        onExportWordDocx={handleExportWordDocx}
        onExportStandaloneHtml={handleExportStandaloneHtml}
        onSaveMpsDraft={handleSaveMpsDraft}
        onTriggerOpenMpsDraft={() => mpsInputRef.current?.click()}
      />
    </div>
  );
}

export default App;

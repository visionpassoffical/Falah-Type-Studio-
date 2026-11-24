import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  FileCode,
  FileText,
  FolderKanban,
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
  CopiedTextFormat,
  DocumentMetrics,
  FormatTab,
  ImageBorderMode,
  ImageWrapMode,
  MalayalamFontOption,
  MarginPresetKey,
  MarginsMm,
  MoreSubPanel,
  Orientation,
  OutlineHeadingItem,
  PageBorderStyleKey,
  PageNumberAlign,
  PageNumberFormat,
  PageNumberPosition,
  PaperSizeKey,
  PaperTintKey,
  PdfPageRangeMode,
  ProjectRecord,
  ProjectStatus,
  QuickBlockKey,
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
  paginateHtmlOffscreen,
  restoreLogicalCaretPosition,
  runZeroCutoffPaginationPass,
  saveLogicalCaretPosition,
} from './utils/pagination';
import {
  ExportDocumentContext,
  exportBookletImpositionHtml,
  exportEditableDraftMps,
  exportStandalonePrintableHtml,
  getCombinedLogicalPagesHtml,
  printBookletImpositionPdf,
  printPaginatedHtmlDocument,
  printVectorPdfDocument,
  shareOrDownloadWordDocx,
} from './utils/export';
import {
  bootstrapProjectsWorkspace,
  countWordsFromHtml,
  createNewProjectRecord,
  deleteProjectRecord,
  generateProjectId,
  savePersistedWorkspaceTabMeta,
  saveProjectRecord,
} from './utils/projectsDb';
import {
  applyFormatPainterToSelection,
  buildCalloutBoxHtml,
  buildQuickBlockHtml,
  captureFormatFromSelection,
  cleanMalayalamSpacingAndBreaks,
  extractDocumentOutline,
  resolvePdfPageIndices,
  toggleBookDropCapOnSelection,
} from './utils/documentTools';
import { PageCanvas } from './components/PageCanvas';
import { BottomSheets } from './components/BottomSheets';
import { OpenProjectTabs, ProjectsDrawer } from './components/ProjectsDrawer';
import { OutlineDrawer } from './components/OutlineDrawer';

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

  // 5. Print Layout (Pageless vs Split Page View) & Mobile Auto-Fit Zoom State
  const [printLayout, setPrintLayout] = useState<boolean>(false);
  const [pageCount, setPageCount] = useState<number>(1);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [zoomMode, setZoomMode] = useState<'fit' | '100'>('fit');
  const [fitScale, setFitScale] = useState<number>(1);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [readingMode, setReadingMode] = useState<boolean>(false);
  const [isAllDocSelected, setIsAllDocSelected] = useState<boolean>(false);

  // 5B. Multi-Project IndexedDB Workspace & WPS-Style Open Tabs
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [openTabIds, setOpenTabIds] = useState<string[]>([]);
  const [showTabsBar, setShowTabsBar] = useState<boolean>(true);
  const [outlineHeadings, setOutlineHeadings] = useState<OutlineHeadingItem[]>([]);

  // 5C. Google Docs Format Painter state
  const [copiedFormat, setCopiedFormat] = useState<CopiedTextFormat | null>(null);

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

  // Refs for Multi-Page Editable Containers, Selection Persistence, IME Composition, IndexedDB & Oscillation Guard
  const activeProjectIdRef = useRef<string>('');
  const projectsRef = useRef<ProjectRecord[]>([]);
  const pendingCursorOffsetRef = useRef<number | null>(null);
  const lastPdfRangeRef = useRef<{ mode: PdfPageRangeMode; custom: string }>({
    mode: 'all',
    custom: '',
  });
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const isComposingRef = useRef<boolean>(false);
  const isAllDocSelectedRef = useRef<boolean>(false);
  const paginationRafRef = useRef<number | null>(null);
  const paginationDebounceRef = useRef<number | null>(null);
  const pageCountHistoryRef = useRef<Array<{ count: number; ts: number }>>([]);
  const oscillationLockRef = useRef<{ lockedCount: number | null; locked: boolean }>({
    lockedCount: null,
    locked: false,
  });
  const prevPageCountRef = useRef<number>(1);
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

  const setAllDocSelected = useCallback((val: boolean) => {
    isAllDocSelectedRef.current = val;
    setIsAllDocSelected(val);
  }, []);

  const clearOscillationLock = useCallback(() => {
    oscillationLockRef.current = { lockedCount: null, locked: false };
    pageCountHistoryRef.current = [];
  }, []);

  // Calculate Word & Character Metrics across active editable containers
  const updateDocumentMetrics = useCallback(() => {
    const activeSlots = printLayout ? pageCount : 1;
    let fullText = '';
    for (let i = 0; i < activeSlots; i++) {
      const el = pageRefs.current[i];
      if (el) {
        fullText += ' ' + (el.innerText || '');
      }
    }
    const cleaned = fullText.trim();
    const words = cleaned ? cleaned.split(/\s+/).filter(Boolean).length : 0;
    const chars = cleaned.replace(/\s/g, '').length;
    setMetrics({ words, chars });
  }, [pageCount, printLayout]);

  // Keep refs synced for synchronous reads during tab switches & IndexedDB saves
  useEffect(() => {
    activeProjectIdRef.current = activeProjectId;
  }, [activeProjectId]);

  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || null,
    [activeProjectId, projects]
  );

  const openProjects = useMemo(
    () =>
      openTabIds
        .map((id) => projects.find((p) => p.id === id))
        .filter((p): p is ProjectRecord => Boolean(p)),
    [openTabIds, projects]
  );

  // Build current SavedProjectState snapshot from live editor & settings
  const buildCurrentSavedState = useCallback((): SavedProjectState => {
    const htmlContent = getCombinedLogicalPagesHtml(
      pageRefs.current,
      printLayout ? pageCount : 1
    );
    return {
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
      printLayout,
    };
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
    printLayout,
    showCropMarks,
    showHeaderFooter,
    showPageNumbers,
    showRuler,
    spaceAfterParagraph,
    useOddEvenHeaders,
    watermarkText,
  ]);

  // Save current project state to BOTH IndexedDB (unlimited multi-project storage) and localStorage mirror
  const persistToLocalStorage = useCallback(() => {
    try {
      const stateToSave = buildCurrentSavedState();
      if (!stateToSave.htmlContent.trim()) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));

      const currentId = activeProjectIdRef.current;
      if (currentId) {
        const existing = projectsRef.current.find((p) => p.id === currentId);
        const caretBookmark = saveLogicalCaretPosition(
          pageRefs.current.slice(0, printLayout ? pageCount : 1)
        );
        const updatedRecord: ProjectRecord = {
          id: currentId,
          status: existing?.status || 'pending',
          createdAt: existing?.createdAt || Date.now(),
          updatedAt: Date.now(),
          wordCount: countWordsFromHtml(stateToSave.htmlContent),
          pageCount: printLayout ? pageCount : existing?.pageCount || 1,
          cursorOffset:
            caretBookmark?.globalCharOffset ?? existing?.cursorOffset ?? 0,
          state: stateToSave,
        };
        void saveProjectRecord(updatedRecord);
        setProjects((prev) => {
          const idx = prev.findIndex((p) => p.id === currentId);
          if (idx === -1) return [updatedRecord, ...prev];
          const next = [...prev];
          next[idx] = updatedRecord;
          return next;
        });
      }
    } catch {
      // Ignore storage quota errors
    }
  }, [buildCurrentSavedState, pageCount, printLayout]);

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

  // Core pagination executor with IME check, Pageless bypass, and 1-second Oscillation Guard
  const executePaginationPass = useCallback(() => {
    if (isComposingRef.current) return;

    // When Print Layout is OFF (Pageless Mode), skip ALL pagination calculations!
    if (!printLayout) {
      updateDocumentMetrics();
      persistToLocalStorage();
      return;
    }

    // If Oscillation Guard locked the page count, halt recalculation until user edits text
    if (oscillationLockRef.current.locked) {
      updateDocumentMetrics();
      persistToLocalStorage();
      return;
    }

    const config = getPaginationConfig();
    const { neededPageCount } = runZeroCutoffPaginationPass(
      pageRefs.current,
      pageCount,
      config,
      isComposingRef.current
    );

    if (neededPageCount !== pageCount) {
      const now = Date.now();
      const recent = pageCountHistoryRef.current.filter(
        (entry) => now - entry.ts <= 1000
      );
      if (recent.length === 0) {
        recent.push({ count: pageCount, ts: now });
      }

      const alreadyVisitedTarget = recent.some(
        (entry) => entry.count === neededPageCount
      );
      const lastEntry = recent[recent.length - 1];
      const isDirectionReversal =
        recent.length >= 2 &&
        Math.sign(neededPageCount - lastEntry.count) !== 0 &&
        Math.sign(neededPageCount - lastEntry.count) ===
          -Math.sign(lastEntry.count - recent[recent.length - 2].count);

      recent.push({ count: neededPageCount, ts: now });
      pageCountHistoryRef.current = recent;

      if (alreadyVisitedTarget || isDirectionReversal) {
        // OSCILLATION GUARD: N -> N+1 -> N detected within 1s!
        // Lock cleanly at N+1 (max) and stop all pagination recalculation until user edits text.
        const lockedMax = Math.max(pageCount, neededPageCount);
        oscillationLockRef.current = {
          lockedCount: lockedMax,
          locked: true,
        };
        if (lockedMax !== pageCount) {
          setPageCount(lockedMax);
        }
        refreshChapterPageFlags(lockedMax);
        updateDocumentMetrics();
        persistToLocalStorage();
        return;
      }

      setPageCount(neededPageCount);
    }

    refreshChapterPageFlags(Math.max(pageCount, neededPageCount));
    updateDocumentMetrics();
    persistToLocalStorage();
  }, [
    getPaginationConfig,
    pageCount,
    persistToLocalStorage,
    printLayout,
    refreshChapterPageFlags,
    updateDocumentMetrics,
  ]);

  // Debounced pagination scheduler: waits 350ms after typing stops, NEVER during IME composition
  const schedulePaginationPass = useCallback(
    (options?: { immediate?: boolean; fromUserEdit?: boolean }) => {
      if (isComposingRef.current) return;

      if (options?.fromUserEdit) {
        clearOscillationLock();
      }

      if (paginationDebounceRef.current !== null) {
        window.clearTimeout(paginationDebounceRef.current);
        paginationDebounceRef.current = null;
      }
      if (paginationRafRef.current !== null) {
        cancelAnimationFrame(paginationRafRef.current);
        paginationRafRef.current = null;
      }

      const delayMs = options?.immediate ? 45 : 350;
      paginationDebounceRef.current = window.setTimeout(() => {
        paginationDebounceRef.current = null;
        if (isComposingRef.current) return;
        paginationRafRef.current = requestAnimationFrame(() => {
          paginationRafRef.current = null;
          executePaginationPass();
        });
      }, delayMs);
    },
    [clearOscillationLock, executePaginationPass]
  );

  // Populate pending HTML when switching Pageless <-> Print Layout or adding pages.
  // Only re-run a single overflow pass if pageCount grew (to flow overflow into the new page slot).
  useEffect(() => {
    let hydratedPending = false;
    if (pendingHtmlByPageRef.current) {
      const htmlPages = pendingHtmlByPageRef.current;
      pendingHtmlByPageRef.current = null;
      const slotsToHydrate = printLayout ? pageCount : 1;
      for (let i = 0; i < slotsToHydrate; i++) {
        const el = pageRefs.current[i];
        if (el) {
          el.innerHTML = htmlPages[i] || '';
        }
      }
      hydratedPending = true;
      if (pendingCursorOffsetRef.current !== null) {
        const offset = pendingCursorOffsetRef.current;
        pendingCursorOffsetRef.current = null;
        window.setTimeout(() => {
          const targets = printLayout
            ? pageRefs.current.slice(0, pageCount)
            : [pageRefs.current[0]];
          restoreLogicalCaretPosition(targets, { globalCharOffset: offset });
        }, 55);
      }
    }

    const pageCountIncreased = pageCount > prevPageCountRef.current;
    prevPageCountRef.current = pageCount;

    if (!printLayout) {
      updateDocumentMetrics();
      return;
    }

    if (
      (hydratedPending || pageCountIncreased) &&
      !oscillationLockRef.current.locked
    ) {
      const timer = window.setTimeout(() => {
        executePaginationPass();
      }, 45);
      return () => window.clearTimeout(timer);
    }
  }, [executePaginationPass, pageCount, printLayout, updateDocumentMetrics]);

  // Re-run pagination cleanly when user changes Page Setup or Typography settings in Print Layout mode
  useEffect(() => {
    if (!printLayout) return;
    clearOscillationLock();
    const timer = window.setTimeout(() => {
      executePaginationPass();
    }, 80);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
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
  ]);

  // Hydrate a full ProjectRecord into the editor & restore its cursor offset cleanly
  const hydrateProjectIntoEditor = useCallback(
    (record: ProjectRecord, currentPrintLayout: boolean) => {
      const s = record.state;
      clearOscillationLock();
      setAllDocSelected(false);
      setActiveImageEl(null);
      setActiveTableCell(null);
      setCopiedFormat(null);

      setDocTitle(s.docTitle || 'Untitled Document');
      setPaperSize(s.paperSize || 'A5');
      setCustomWidthMm(s.customWidthMm || 148);
      setCustomHeightMm(s.customHeightMm || 210);
      setOrientation(s.orientation || 'portrait');
      setMarginPreset(s.marginPreset || 'normal');
      if (s.margins) setMargins(s.margins);
      setMirrorMargins(Boolean(s.mirrorMargins));
      setInnerMarginMm(typeof s.innerMarginMm === 'number' ? s.innerMarginMm : 20);
      setOuterMarginMm(typeof s.outerMarginMm === 'number' ? s.outerMarginMm : 13);
      setDefaultDocFontId(s.defaultDocFontId || 'manjari');
      setShowHeaderFooter(Boolean(s.showHeaderFooter));
      setHeaderText(s.headerText || '');
      setFooterText(s.footerText || '');
      setUseOddEvenHeaders(Boolean(s.useOddEvenHeaders));
      setEvenHeaderText(s.evenHeaderText || '');
      setOddHeaderText(s.oddHeaderText || '');
      setHideHeaderOnChapterPages(
        typeof s.hideHeaderOnChapterPages === 'boolean'
          ? s.hideHeaderOnChapterPages
          : true
      );
      setShowPageNumbers(
        typeof s.showPageNumbers === 'boolean' ? s.showPageNumbers : true
      );
      setDifferentFirstPage(Boolean(s.differentFirstPage));
      setPageNumberPosition(s.pageNumberPosition || 'bottom');
      setPageNumberAlign(s.pageNumberAlign || 'right');
      setPageNumberFormat(s.pageNumberFormat || 'malayalam_x_of_y');
      setLineSpacing(s.lineSpacing || '1.6');
      setLetterSpacing(s.letterSpacing || '0px');
      setFirstLineIndent(Boolean(s.firstLineIndent));
      setSpaceAfterParagraph(
        typeof s.spaceAfterParagraph === 'boolean' ? s.spaceAfterParagraph : true
      );
      setParagraphGapPt(
        typeof s.paragraphGapPt === 'number'
          ? s.paragraphGapPt
          : s.spaceAfterParagraph === false
            ? 0
            : 8
      );
      setPageBorderStyle(s.pageBorderStyle || 'double');
      setPageBorderColor(s.pageBorderColor || '#111827');
      setPageBorderPaddingMm(
        typeof s.pageBorderPaddingMm === 'number' ? s.pageBorderPaddingMm : 5
      );
      setColumnCount(s.columnCount || 1);
      setWatermarkText(s.watermarkText || '');
      setPaperTint(s.paperTint || 'white');
      setPrintBackgroundTint(Boolean(s.printBackgroundTint));
      setShowRuler(Boolean(s.showRuler));
      setShowCropMarks(Boolean(s.showCropMarks));

      const nextPrintLayout = Boolean(s.printLayout);
      const willSwitchMode = nextPrintLayout !== currentPrintLayout;
      setPrintLayout(nextPrintLayout);

      const initialHtml =
        s.htmlContent && s.htmlContent.trim().length > 0
          ? s.htmlContent
          : '<p><br/></p>';

      for (let i = 1; i < pageRefs.current.length; i++) {
        const el = pageRefs.current[i];
        if (el) el.innerHTML = '';
      }
      prevPageCountRef.current = 1;
      setPageCount(1);
      setActivePageIndex(0);
      pendingCursorOffsetRef.current =
        typeof record.cursorOffset === 'number' ? record.cursorOffset : null;

      if (!willSwitchMode && pageRefs.current[0]) {
        pageRefs.current[0].innerHTML = initialHtml;
        if (pendingCursorOffsetRef.current !== null) {
          const offset = pendingCursorOffsetRef.current;
          pendingCursorOffsetRef.current = null;
          window.setTimeout(() => {
            restoreLogicalCaretPosition([pageRefs.current[0]], {
              globalCharOffset: offset,
            });
          }, 40);
        }
      } else {
        pendingHtmlByPageRef.current = [initialHtml];
      }

      if (nextPrintLayout) {
        window.setTimeout(() => {
          schedulePaginationPass({ immediate: true, fromUserEdit: true });
        }, 60);
      } else {
        window.setTimeout(() => {
          updateDocumentMetrics();
        }, 40);
      }
    },
    [
      clearOscillationLock,
      schedulePaginationPass,
      setAllDocSelected,
      updateDocumentMetrics,
    ]
  );

  // Initial Load: Bootstrap IndexedDB Multi-Project Workspace (migrating localStorage if needed)
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { projects: loadedProjects, activeProject: initialActive, openTabIds: initialTabs } =
          await bootstrapProjectsWorkspace();
        if (cancelled) return;
        setProjects(loadedProjects);
        setActiveProjectId(initialActive.id);
        activeProjectIdRef.current = initialActive.id;
        projectsRef.current = loadedProjects;
        setOpenTabIds(initialTabs);
        hydrateProjectIntoEditor(initialActive, false);
      } catch {
        if (!cancelled && pageRefs.current[0]) {
          pageRefs.current[0].innerHTML = TEMPLATE_A5_PUBLIC_NOTICE;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Multi-Project Workspace Actions (Switch, New, Status, Duplicate, Rename, Delete, Close Tab)
  const handleSelectProject = useCallback(
    (targetId: string) => {
      if (targetId === activeProjectIdRef.current) return;
      persistToLocalStorage();
      const target = projectsRef.current.find((p) => p.id === targetId);
      if (!target) return;

      setActiveProjectId(targetId);
      activeProjectIdRef.current = targetId;
      setOpenTabIds((prev) => {
        const next = prev.includes(targetId) ? prev : [...prev, targetId];
        savePersistedWorkspaceTabMeta(next, targetId);
        return next;
      });
      hydrateProjectIntoEditor(target, printLayout);
      showToast(`തുറന്നു: ${target.state.docTitle}`);
    },
    [hydrateProjectIntoEditor, persistToLocalStorage, printLayout, showToast]
  );

  const handleCreateProject = useCallback(() => {
    persistToLocalStorage();
    const nextNum = projectsRef.current.length + 1;
    const newRecord = createNewProjectRecord(
      `പുതിയ പ്രോജക്റ്റ് ${nextNum} (Untitled ${nextNum})`,
      {
        paperSize,
        defaultDocFontId,
        printLayout: false,
      },
      'pending'
    );
    void saveProjectRecord(newRecord);
    const nextProjects = [newRecord, ...projectsRef.current];
    setProjects(nextProjects);
    projectsRef.current = nextProjects;
    setActiveProjectId(newRecord.id);
    activeProjectIdRef.current = newRecord.id;
    setOpenTabIds((prev) => {
      const next = [...prev, newRecord.id];
      savePersistedWorkspaceTabMeta(next, newRecord.id);
      return next;
    });
    setShowTabsBar(true);
    hydrateProjectIntoEditor(newRecord, printLayout);
    showToast('പുതിയ പ്രോജക്റ്റ് സൃഷ്ടിച്ചു (New Project Created)');
  }, [
    defaultDocFontId,
    hydrateProjectIntoEditor,
    paperSize,
    persistToLocalStorage,
    printLayout,
    showToast,
  ]);

  const handleToggleProjectStatus = useCallback(
    (id: string, nextStatus: ProjectStatus) => {
      const target = projectsRef.current.find((p) => p.id === id);
      if (!target) return;
      const updated: ProjectRecord = {
        ...target,
        status: nextStatus,
        updatedAt: Date.now(),
      };
      void saveProjectRecord(updated);
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      showToast(
        nextStatus === 'completed'
          ? 'Completed (പൂർത്തിയായത്) ആയി അടയാളപ്പെടുത്തി'
          : 'Pending (പെൻഡിംഗ്) ആയി മാറ്റി'
      );
    },
    [showToast]
  );

  const handleDuplicateProject = useCallback(
    (id: string) => {
      persistToLocalStorage();
      const source = projectsRef.current.find((p) => p.id === id);
      if (!source) return;
      const now = Date.now();
      const copyRecord: ProjectRecord = {
        ...source,
        id: generateProjectId(),
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        state: {
          ...source.state,
          docTitle: `${source.state.docTitle} (Copy)`,
        },
      };
      void saveProjectRecord(copyRecord);
      setProjects((prev) => [copyRecord, ...prev]);
      setActiveProjectId(copyRecord.id);
      activeProjectIdRef.current = copyRecord.id;
      setOpenTabIds((prev) => {
        const next = [...prev, copyRecord.id];
        savePersistedWorkspaceTabMeta(next, copyRecord.id);
        return next;
      });
      hydrateProjectIntoEditor(copyRecord, printLayout);
      showToast(`പകർപ്പ് സൃഷ്ടിച്ചു: ${copyRecord.state.docTitle}`);
    },
    [hydrateProjectIntoEditor, persistToLocalStorage, printLayout, showToast]
  );

  const handleRenameProject = useCallback(
    (id: string, nextTitle: string) => {
      const target = projectsRef.current.find((p) => p.id === id);
      if (!target) return;
      const updated: ProjectRecord = {
        ...target,
        updatedAt: Date.now(),
        state: {
          ...target.state,
          docTitle: nextTitle,
        },
      };
      void saveProjectRecord(updated);
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      if (id === activeProjectIdRef.current) {
        setDocTitle(nextTitle);
      }
      showToast(`പേര് മാറ്റി: ${nextTitle}`);
    },
    [showToast]
  );

  const handleDeleteProject = useCallback(
    (id: string) => {
      if (projectsRef.current.length <= 1) return;
      void deleteProjectRecord(id);
      const remaining = projectsRef.current.filter((p) => p.id !== id);
      setProjects(remaining);
      projectsRef.current = remaining;

      const nextTabs = openTabIds.filter((tid) => tid !== id);
      if (id === activeProjectIdRef.current && remaining.length > 0) {
        const fallbackId = nextTabs[0] || remaining[0].id;
        const fallbackProj =
          remaining.find((p) => p.id === fallbackId) || remaining[0];
        const finalTabs = nextTabs.includes(fallbackProj.id)
          ? nextTabs
          : [fallbackProj.id, ...nextTabs];
        setOpenTabIds(finalTabs);
        setActiveProjectId(fallbackProj.id);
        activeProjectIdRef.current = fallbackProj.id;
        savePersistedWorkspaceTabMeta(finalTabs, fallbackProj.id);
        hydrateProjectIntoEditor(fallbackProj, printLayout);
      } else {
        setOpenTabIds(nextTabs);
        savePersistedWorkspaceTabMeta(nextTabs, activeProjectIdRef.current);
      }
      showToast('പ്രോജക്റ്റ് നീക്കം ചെയ്തു (Project Deleted)');
    },
    [hydrateProjectIntoEditor, openTabIds, printLayout, showToast]
  );

  const handleCloseTab = useCallback(
    (id: string) => {
      if (openTabIds.length <= 1) return;
      if (id === activeProjectIdRef.current) {
        persistToLocalStorage();
      }
      const nextTabs = openTabIds.filter((tid) => tid !== id);
      setOpenTabIds(nextTabs);
      if (id === activeProjectIdRef.current && nextTabs.length > 0) {
        const nextActiveId = nextTabs[nextTabs.length - 1];
        const nextProj = projectsRef.current.find((p) => p.id === nextActiveId);
        if (nextProj) {
          setActiveProjectId(nextProj.id);
          activeProjectIdRef.current = nextProj.id;
          savePersistedWorkspaceTabMeta(nextTabs, nextProj.id);
          hydrateProjectIntoEditor(nextProj, printLayout);
          return;
        }
      }
      savePersistedWorkspaceTabMeta(nextTabs, activeProjectIdRef.current);
    },
    [hydrateProjectIntoEditor, openTabIds, persistToLocalStorage, printLayout]
  );

  // Keep docTitle edits synced into active IndexedDB project card & tab immediately
  useEffect(() => {
    const id = activeProjectIdRef.current;
    if (!id) return;
    const timer = window.setTimeout(() => {
      persistToLocalStorage();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [docTitle, paperSize, persistToLocalStorage]);

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

  // Helper: Toggle Google Docs-style Print Layout ON (Split Pages) / OFF (Continuous Pageless)
  const handleTogglePrintLayout = useCallback(
    (nextPrintLayout: boolean) => {
      if (nextPrintLayout === printLayout) return;

      if (paginationDebounceRef.current !== null) {
        window.clearTimeout(paginationDebounceRef.current);
        paginationDebounceRef.current = null;
      }
      if (paginationRafRef.current !== null) {
        cancelAnimationFrame(paginationRafRef.current);
        paginationRafRef.current = null;
      }
      clearOscillationLock();
      setAllDocSelected(false);

      const combinedHtml = getCombinedLogicalPagesHtml(
        pageRefs.current,
        printLayout ? pageCount : 1
      );

      pendingHtmlByPageRef.current = [combinedHtml || '<p><br/></p>'];
      prevPageCountRef.current = 1;
      setPageCount(1);
      setActivePageIndex(0);
      setPrintLayout(nextPrintLayout);

      showToast(
        nextPrintLayout
          ? `Print Layout ON (${paperSize} Page View)`
          : 'Pageless Mode ON (Fast Continuous Typing)'
      );
    },
    [
      clearOscillationLock,
      pageCount,
      paperSize,
      printLayout,
      setAllDocSelected,
      showToast,
    ]
  );

  // TRUE DOCUMENT-WIDE SELECT ALL (Across ALL Pages from Page 1 to Last Page)
  const handleSelectAllDocument = useCallback(() => {
    const activeSlots = printLayout ? pageCount : 1;
    const firstPage = pageRefs.current[0];
    const lastPage = pageRefs.current[activeSlots - 1] || firstPage;
    if (!firstPage || !lastPage) return;

    firstPage.focus();
    const sel = window.getSelection();
    if (sel) {
      try {
        const range = document.createRange();
        range.setStart(firstPage, 0);
        range.setEnd(lastPage, lastPage.childNodes.length);
        sel.removeAllRanges();
        sel.addRange(range);
        savedRangeRef.current = range.cloneRange();
      } catch {
        // Fallback: select contents of firstPage
        const fallbackRange = document.createRange();
        fallbackRange.selectNodeContents(firstPage);
        sel.removeAllRanges();
        sel.addRange(fallbackRange);
        savedRangeRef.current = fallbackRange.cloneRange();
      }
    }

    setAllDocSelected(true);
    showToast(
      printLayout && pageCount > 1
        ? `എല്ലാ ${pageCount} പേജുകളും തിരഞ്ഞെടുത്തു (All ${pageCount} pages selected)`
        : 'മുഴുവൻ ഡോക്യുമെന്റും തിരഞ്ഞെടുത്തു (All text selected)'
    );
  }, [pageCount, printLayout, setAllDocSelected, showToast]);

  const handleCopyAllDocument = useCallback(async () => {
    const activeSlots = printLayout ? pageCount : 1;
    const combinedHtml = getCombinedLogicalPagesHtml(pageRefs.current, activeSlots);
    let combinedText = '';
    for (let i = 0; i < activeSlots; i++) {
      const el = pageRefs.current[i];
      if (el) {
        combinedText += (combinedText ? '\n\n' : '') + (el.innerText || '');
      }
    }

    try {
      if (
        typeof navigator !== 'undefined' &&
        navigator.clipboard &&
        typeof ClipboardItem !== 'undefined' &&
        navigator.clipboard.write
      ) {
        const item = new ClipboardItem({
          'text/html': new Blob([combinedHtml], { type: 'text/html' }),
          'text/plain': new Blob([combinedText], { type: 'text/plain' }),
        });
        await navigator.clipboard.write([item]);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(combinedText);
      }
      showToast('മുഴുവൻ ഡോക്യുമെന്റും കോപ്പി ചെയ്തു (Copied all pages)');
    } catch {
      try {
        await navigator.clipboard.writeText(combinedText);
        showToast('മുഴുവൻ ഡോക്യുമെന്റും കോപ്പി ചെയ്തു (Copied)');
      } catch {
        showToast('Copy permission blocked — press Ctrl+C');
      }
    }
  }, [pageCount, printLayout, showToast]);

  const handleClearAllDocument = useCallback(() => {
    clearOscillationLock();
    setAllDocSelected(false);
    for (let i = 1; i < pageRefs.current.length; i++) {
      const el = pageRefs.current[i];
      if (el) el.innerHTML = '';
    }
    if (pageRefs.current[0]) {
      pageRefs.current[0].innerHTML = '<p><br/></p>';
      pageRefs.current[0].focus();
    }
    prevPageCountRef.current = 1;
    setPageCount(1);
    setActivePageIndex(0);
    updateDocumentMetrics();
    persistToLocalStorage();
    showToast('മുഴുവൻ ഡോക്യുമെന്റും മായ്ച്ചു (Cleared all pages)');
  }, [
    clearOscillationLock,
    persistToLocalStorage,
    setAllDocSelected,
    showToast,
    updateDocumentMetrics,
  ]);

  // Execute rich-text formatting commands reliably on mobile & desktop (supports multi-page Select All!)
  const handleExecCommand = useCallback(
    (cmd: string, value?: string) => {
      if (isAllDocSelectedRef.current && printLayout && pageCount > 1) {
        const sel = window.getSelection();
        for (let i = 0; i < pageCount; i++) {
          const el = pageRefs.current[i];
          if (!el || !sel) continue;
          const r = document.createRange();
          r.selectNodeContents(el);
          sel.removeAllRanges();
          sel.addRange(r);
          document.execCommand('styleWithCSS', false, 'true');
          document.execCommand(cmd, false, value);
        }
        // Re-apply spanning selection across Page 1 -> Page N
        const firstPage = pageRefs.current[0];
        const lastPage = pageRefs.current[pageCount - 1];
        if (firstPage && lastPage && sel) {
          const fullRange = document.createRange();
          fullRange.setStart(firstPage, 0);
          fullRange.setEnd(lastPage, lastPage.childNodes.length);
          sel.removeAllRanges();
          sel.addRange(fullRange);
          savedRangeRef.current = fullRange.cloneRange();
        }
        schedulePaginationPass({ fromUserEdit: true });
        return;
      }

      restoreSavedSelection();
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(cmd, false, value);
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
      schedulePaginationPass({ fromUserEdit: true });
    },
    [pageCount, printLayout, restoreSavedSelection, schedulePaginationPass]
  );

  // Apply Malayalam Font to selected text OR entire document (supports multi-page Select All!)
  const handleSelectFont = useCallback(
    (font: MalayalamFontOption) => {
      setDefaultDocFontId(font.id);
      const activeSlots = printLayout ? pageCount : 1;

      if (isAllDocSelectedRef.current) {
        for (let i = 0; i < activeSlots; i++) {
          const pageEl = pageRefs.current[i];
          if (!pageEl) continue;
          const styledNodes = pageEl.querySelectorAll<HTMLElement>(
            '[style*="font-family"]'
          );
          styledNodes.forEach((node) => {
            node.style.fontFamily = font.cssFamily;
          });
        }
        schedulePaginationPass({ fromUserEdit: true });
        showToast(`മുഴുവൻ ഡോക്യുമെന്റിലും ഫോണ്ട് മാറ്റി: ${font.name}`);
        return;
      }

      restoreSavedSelection();
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('fontName', false, font.name);
      } else {
        // When no specific range is highlighted, update all existing font-family spans to the chosen Malayalam font
        for (let i = 0; i < activeSlots; i++) {
          const pageEl = pageRefs.current[i];
          if (!pageEl) continue;
          const styledNodes = pageEl.querySelectorAll<HTMLElement>('[style*="font-family"]');
          styledNodes.forEach((node) => {
            node.style.fontFamily = font.cssFamily;
          });
        }
      }
      schedulePaginationPass({ fromUserEdit: true });
      showToast(`ഫോണ്ട് മാറ്റി: ${font.name}`);
    },
    [
      pageCount,
      printLayout,
      restoreSavedSelection,
      schedulePaginationPass,
      showToast,
    ]
  );

  // Step Font Size up/down in points (pt) — applies across all pages when Select All is active
  const handleChangeFontSize = useCallback(
    (delta: number) => {
      const nextPt = Math.min(72, Math.max(8, fontSizePt + delta));
      setFontSizePt(nextPt);

      if (isAllDocSelectedRef.current) {
        const activeSlots = printLayout ? pageCount : 1;
        for (let i = 0; i < activeSlots; i++) {
          const pageEl = pageRefs.current[i];
          if (!pageEl) continue;
          const blocks = pageEl.querySelectorAll<HTMLElement>(
            'p, li, td, th, span'
          );
          blocks.forEach((node) => {
            if (!node.closest('h1, h2, h3')) {
              node.style.fontSize = `${nextPt}pt`;
            }
          });
        }
        schedulePaginationPass({ fromUserEdit: true });
        return;
      }

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
      schedulePaginationPass({ fromUserEdit: true });
    },
    [
      fontSizePt,
      pageCount,
      printLayout,
      restoreSavedSelection,
      schedulePaginationPass,
    ]
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
      schedulePaginationPass({ fromUserEdit: true });
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

  // Image Upload & Advanced WPS-Style Image Controls (Width 20%-100%, Wrapping, Border, Caption)
  const ensureImageFigureWrapper = useCallback(
    (img: HTMLImageElement): HTMLElement => {
      const existingFig = img.closest('figure.mps-figure') as HTMLElement | null;
      if (existingFig) return existingFig;
      const fig = document.createElement('figure');
      fig.className = 'mps-figure mps-wrap-center';
      const currentW = img.style.width || '55%';
      fig.style.width = currentW.endsWith('%') ? currentW : '55%';
      img.style.width = '100%';
      img.parentNode?.insertBefore(fig, img);
      fig.appendChild(img);
      return fig;
    },
    []
  );

  const handleImageFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const imgHtml = `<figure class="mps-figure mps-wrap-center" style="width: 55%;"><img src="${dataUrl}" alt="Inserted Image" style="width: 100%; max-width: 100%; height: auto; border-radius: 4px; display: inline-block;" /></figure><p><br/></p>`;
        insertHtmlAtCursor(imgHtml);
        showToast('ചിത്രം ചേർത്തു — വലുപ്പവും Text Wrap-ഉം മാറ്റാൻ ചിത്രത്തിൽ ടാപ്പ് ചെയ്യുക');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [insertHtmlAtCursor, showToast]
  );

  const handleImageResize = useCallback(
    (widthPercent: number) => {
      if (!activeImageEl) return;
      const clamped = Math.max(20, Math.min(100, widthPercent));
      const fig = activeImageEl.closest('figure.mps-figure') as HTMLElement | null;
      if (fig) {
        fig.style.width = `${clamped}%`;
        activeImageEl.style.width = '100%';
      } else {
        activeImageEl.style.width = `${clamped}%`;
      }
      schedulePaginationPass({ fromUserEdit: true });
    },
    [activeImageEl, schedulePaginationPass]
  );

  const handleImageWrapChange = useCallback(
    (wrap: ImageWrapMode) => {
      if (!activeImageEl) return;
      const fig = ensureImageFigureWrapper(activeImageEl);
      fig.classList.remove(
        'mps-wrap-inline',
        'mps-wrap-center',
        'mps-wrap-float-left',
        'mps-wrap-float-right'
      );
      fig.classList.add(`mps-wrap-${wrap}`);
      schedulePaginationPass({ fromUserEdit: true });
    },
    [activeImageEl, ensureImageFigureWrapper, schedulePaginationPass]
  );

  const handleImageBorderChange = useCallback(
    (border: ImageBorderMode) => {
      if (!activeImageEl) return;
      activeImageEl.classList.remove(
        'mps-img-border-thin',
        'mps-img-border-frame'
      );
      if (border === 'thin') activeImageEl.classList.add('mps-img-border-thin');
      if (border === 'frame') activeImageEl.classList.add('mps-img-border-frame');
      schedulePaginationPass({ fromUserEdit: true });
    },
    [activeImageEl, schedulePaginationPass]
  );

  const handleImageCaptionChange = useCallback(
    (caption: string) => {
      if (!activeImageEl) return;
      const fig = ensureImageFigureWrapper(activeImageEl);
      let capEl = fig.querySelector('figcaption.mps-img-caption');
      if (!caption.trim()) {
        capEl?.remove();
      } else {
        if (!capEl) {
          capEl = document.createElement('figcaption');
          capEl.className = 'mps-img-caption';
          fig.appendChild(capEl);
        }
        capEl.textContent = caption;
      }
      schedulePaginationPass({ fromUserEdit: true });
    },
    [activeImageEl, ensureImageFigureWrapper, schedulePaginationPass]
  );

  const handleDeleteActiveImage = useCallback(() => {
    if (!activeImageEl) return;
    const fig = activeImageEl.closest('figure.mps-figure');
    if (fig) fig.remove();
    else activeImageEl.remove();
    setActiveImageEl(null);
    schedulePaginationPass({ fromUserEdit: true });
  }, [activeImageEl, schedulePaginationPass]);

  // =========================================================================
  // GOOGLE DOCS & WPS OFFICE FEATURE HANDLERS
  // =========================================================================

  // Document Outline Drawer
  const handleOpenOutline = useCallback(() => {
    const activeSlots = printLayout ? pageCount : 1;
    const headings = extractDocumentOutline(pageRefs.current, activeSlots);
    setOutlineHeadings(headings);
    setActiveDrawer('outline');
  }, [pageCount, printLayout]);

  const handleJumpToHeading = useCallback((item: OutlineHeadingItem) => {
    const targetPage = pageRefs.current[item.pageIndex] || pageRefs.current[0];
    if (!targetPage) return;
    const el = targetPage.querySelector<HTMLElement>(
      `[data-outline-id="${item.id}"]`
    );
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActivePageIndex(item.pageIndex);
      try {
        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(el);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
          savedRangeRef.current = range.cloneRange();
        }
      } catch {
        // Ignore selection edge case
      }
    }
  }, []);

  // Format Painter Toggle (copies inline font, size, color, weight)
  const handleToggleFormatPainter = useCallback(() => {
    if (copiedFormat) {
      setCopiedFormat(null);
      showToast('Format Painter cancelled');
      return;
    }
    restoreSavedSelection();
    const captured = captureFormatFromSelection();
    if (!captured) {
      showToast('Place cursor inside styled text first to copy its format');
      return;
    }
    setCopiedFormat(captured);
    showToast('Format copied! Tap or select target text to apply.');
  }, [copiedFormat, restoreSavedSelection, showToast]);

  // Book Drop Cap Toggle (Malayalam orthographic cluster aware)
  const handleToggleDropCap = useCallback(() => {
    restoreSavedSelection();
    const result = toggleBookDropCapOnSelection();
    if (result === 'added') {
      schedulePaginationPass({ fromUserEdit: true });
      showToast('Book Drop Cap പ്രയോഗിച്ചു (Drop Cap Added)');
    } else if (result === 'removed') {
      schedulePaginationPass({ fromUserEdit: true });
      showToast('Book Drop Cap നീക്കം ചെയ്തു (Drop Cap Removed)');
    } else {
      showToast('Place cursor inside a paragraph to apply Book Drop Cap');
    }
  }, [restoreSavedSelection, schedulePaginationPass, showToast]);

  // Styled Callout / Notice Box
  const handleInsertCalloutBox = useCallback(() => {
    insertHtmlAtCursor(buildCalloutBoxHtml());
    showToast('Callout / Notice Box ചേർത്തു');
  }, [insertHtmlAtCursor, showToast]);

  // Numbered Footnote Insertion
  const handleInsertFootnote = useCallback(() => {
    const activeSlots = printLayout ? pageCount : 1;
    let existingCount = 0;
    for (let i = 0; i < activeSlots; i++) {
      const el = pageRefs.current[i];
      if (el) existingCount += el.querySelectorAll('sup.mps-fn-ref').length;
    }
    const nextNum = existingCount + 1;
    insertHtmlAtCursor(
      `<sup class="mps-fn-ref" data-fn-id="${nextNum}">[${nextNum}]</sup>&nbsp;`
    );
    const targetPage =
      pageRefs.current[printLayout ? activePageIndex : 0] || pageRefs.current[0];
    if (targetPage) {
      let section = targetPage.querySelector<HTMLDivElement>(
        '.mps-footnotes-section'
      );
      if (!section) {
        section = document.createElement('div');
        section.className = 'mps-footnotes-section mps-no-indent';
        targetPage.appendChild(section);
      }
      const p = document.createElement('p');
      p.className = 'mps-no-indent';
      p.innerHTML = `<strong>[${nextNum}]</strong> അടിക്കുറിപ്പ് ഇവിടെ എഴുതുക (Footnote ${nextNum})`;
      section.appendChild(p);
      schedulePaginationPass({ fromUserEdit: true });
    }
    showToast(`അടിക്കുറിപ്പ് [${nextNum}] ചേർത്തു (Footnote Inserted)`);
  }, [
    activePageIndex,
    insertHtmlAtCursor,
    pageCount,
    printLayout,
    schedulePaginationPass,
    showToast,
  ]);

  // Special Symbol Insertion
  const handleInsertSymbol = useCallback(
    (symbol: string) => {
      insertHtmlAtCursor(symbol);
      showToast(`ചിഹ്നം ചേർത്തു: ${symbol}`);
    },
    [insertHtmlAtCursor, showToast]
  );

  // Quick Malayalam Print Snippets ("Quick Blocks")
  const handleInsertQuickBlock = useCallback(
    (key: QuickBlockKey) => {
      insertHtmlAtCursor(buildQuickBlockHtml(key));
      showToast('മലയാളം പ്രിന്റ് ബ്ലോക്ക് ചേർത്തു (Quick Block Inserted)');
    },
    [insertHtmlAtCursor, showToast]
  );

  // WPS One-Tap Paste & Spacing Cleaner (WhatsApp / PDF Malayalam cleanup)
  const handleCleanSpacingAndBreaks = useCallback(() => {
    const activeSlots = printLayout ? pageCount : 1;
    const { fixedSpaces, fixedBreaks } = cleanMalayalamSpacingAndBreaks(
      pageRefs.current,
      activeSlots
    );
    schedulePaginationPass({ fromUserEdit: true });
    if (fixedSpaces === 0 && fixedBreaks === 0) {
      showToast('ഡോക്യുമെന്റ് ഇതിനകം വൃത്തിയുള്ളതാണ് (Already clean!)');
    } else {
      showToast(
        `വൃത്തിയാക്കി: ${fixedSpaces} extra spaces, ${fixedBreaks} broken line wraps fixed`
      );
    }
  }, [pageCount, printLayout, schedulePaginationPass, showToast]);

  // WPS Insert Blank Page
  const handleInsertBlankPage = useCallback(() => {
    if (!printLayout) {
      insertHtmlAtCursor(
        '<div class="mps-blank-page-marker" contenteditable="false">— ശൂന്യമായ പേജ് (Blank Page) —</div><p><br/></p>'
      );
      showToast('ശൂന്യമായ പേജ് ചേർത്തു (Blank Page Inserted)');
      return;
    }

    clearOscillationLock();
    const pagesHtml: string[] = [];
    for (let i = 0; i < pageCount; i++) {
      pagesHtml.push(pageRefs.current[i]?.innerHTML || '');
    }
    const insertIdx = Math.min(pagesHtml.length, activePageIndex + 1);
    pagesHtml.splice(
      insertIdx,
      0,
      '<div class="mps-blank-page-keeper" data-blank-page="true" contenteditable="false"></div>'
    );
    pendingHtmlByPageRef.current = pagesHtml;
    setPageCount(pagesHtml.length);
    setActivePageIndex(insertIdx);
    showToast(`പേജ് ${insertIdx + 1} ശൂന്യമായ പേജായി ചേർത്തു (Blank Page Inserted)`);
  }, [
    activePageIndex,
    clearOscillationLock,
    insertHtmlAtCursor,
    pageCount,
    printLayout,
    showToast,
  ]);

  // Insert Horizontal Divider Line
  const handleInsertDivider = useCallback(() => {
    insertHtmlAtCursor('<hr class="mps-divider" /><p><br/></p>');
  }, [insertHtmlAtCursor]);

  // Insert Explicit Page Break (works in both Pageless Mode & Print Layout Mode)
  const handleInsertPageBreak = useCallback(() => {
    if (!printLayout) {
      insertHtmlAtCursor(
        '<div class="mps-page-break" contenteditable="false">— പേജ് ബ്രേക്ക് (Page Break) —</div><p><br/></p>'
      );
      showToast('പേജ് ബ്രേക്ക് ചേർത്തു (Page Break)');
      return;
    }

    clearOscillationLock();
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
      schedulePaginationPass({ immediate: true, fromUserEdit: true });
    }, 50);
    showToast(`പേജ് ${nextIdx + 1} ചേർത്തു (New Page Break)`);
  }, [
    activePageIndex,
    clearOscillationLock,
    insertHtmlAtCursor,
    printLayout,
    schedulePaginationPass,
    showToast,
  ]);

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

    const activeSlots = printLayout ? pageCount : 1;
    for (let i = 0; i < activeSlots; i++) {
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

    schedulePaginationPass({ fromUserEdit: true });
    showToast(
      `ബുക്ക് ടൈപ്പോഗ്രഫി പ്രയോഗിച്ചു (${targetFont.name} · 10.5pt · 6mm Indent)`
    );
  }, [
    defaultDocFontId,
    pageCount,
    printLayout,
    schedulePaginationPass,
    showToast,
  ]);

  // Insert Chapter Start (New Page + Styled Chapter Number & Title Block)
  const handleInsertChapterStart = useCallback(() => {
    const activeSlots = printLayout ? pageCount : 1;
    // Count existing chapter headings to assign the next sequential chapter number
    let existingChapters = 0;
    for (let i = 0; i < activeSlots; i++) {
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

    if (!printLayout) {
      setHideHeaderOnChapterPages(true);
      insertHtmlAtCursor(
        `<div class="mps-page-break" contenteditable="false">— അധ്യായം ${nextChapterNum} (New Page) —</div>${chapterHtml}`
      );
      showToast(`അധ്യായം ${nextChapterNum} ചേർത്തു (Chapter Start)`);
      return;
    }

    const activeEl = pageRefs.current[activePageIndex];
    const isActiveEmpty =
      activeEl && (activeEl.innerText || '').trim().length === 0;

    if (isActiveEmpty && activeEl) {
      activeEl.innerHTML = chapterHtml;
      activeEl.focus();
      schedulePaginationPass({ immediate: true, fromUserEdit: true });
      showToast(`അധ്യായം ${nextChapterNum} ചേർത്തു (Chapter Start)`);
      return;
    }

    // Snapshot existing pages and insert the new Chapter Opening page right after activePageIndex
    clearOscillationLock();
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
      schedulePaginationPass({ immediate: true, fromUserEdit: true });
    }, 60);
    showToast(`അധ്യായം ${nextChapterNum} പുതിയ പേജിൽ ചേർത്തു (Chapter Start)`);
  }, [
    activePageIndex,
    clearOscillationLock,
    insertHtmlAtCursor,
    pageCount,
    printLayout,
    schedulePaginationPass,
    showToast,
  ]);

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
      setHideHeaderOnChapterPages(true);

      if (!printLayout) {
        const rootEl = pageRefs.current[0];
        if (rootEl) {
          const isEmpty = (rootEl.innerText || '').trim().length === 0;
          if (isEmpty) {
            rootEl.innerHTML = selected.html;
          } else if (key === 'title-page') {
            rootEl.insertAdjacentHTML(
              'afterbegin',
              `${selected.html}<div class="mps-page-break" contenteditable="false">— പേജ് ബ്രേക്ക് (Page Break) —</div>`
            );
          } else {
            insertHtmlAtCursor(
              `<div class="mps-page-break" contenteditable="false">— പേജ് ബ്രേക്ക് (Page Break) —</div>${selected.html}`
            );
          }
          schedulePaginationPass({ fromUserEdit: true });
        }
        showToast(`${selected.label} ചേർത്തു`);
        return;
      }

      const activeEl = pageRefs.current[activePageIndex];
      const isActiveEmpty =
        activeEl && (activeEl.innerText || '').trim().length === 0;

      if (isActiveEmpty && activeEl) {
        activeEl.innerHTML = selected.html;
        activeEl.focus();
        schedulePaginationPass({ immediate: true, fromUserEdit: true });
        showToast(`${selected.label} ചേർത്തു`);
        return;
      }

      clearOscillationLock();
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
        schedulePaginationPass({ immediate: true, fromUserEdit: true });
      }, 60);
      showToast(`${selected.label} പുതിയ പേജായി ചേർത്തു`);
    },
    [
      activePageIndex,
      clearOscillationLock,
      insertHtmlAtCursor,
      pageCount,
      printLayout,
      schedulePaginationPass,
      showToast,
    ]
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

      clearOscillationLock();
      setAllDocSelected(false);
      // Reset to 1 page and populate content, then let pagination split if in Print Layout
      for (let i = 1; i < pageRefs.current.length; i++) {
        const el = pageRefs.current[i];
        if (el) el.innerHTML = '';
      }
      prevPageCountRef.current = 1;
      setPageCount(1);
      if (pageRefs.current[0]) {
        pageRefs.current[0].innerHTML = targetHtml;
      } else {
        pendingHtmlByPageRef.current = [targetHtml];
      }
      schedulePaginationPass({ immediate: true, fromUserEdit: true });
      showToast('മലയാളം ടെംപ്ലേറ്റ് ലോഡ് ചെയ്തു');
    },
    [clearOscillationLock, schedulePaginationPass, setAllDocSelected, showToast]
  );

  // Build ExportDocumentContext for PDF, Booklet Imposition, Standalone HTML, and Word (.docx)
  // Always uses selected A5/A4/Demy physical dimensions even when Print Layout view is OFF!
  const buildExportContext = useCallback((): ExportDocumentContext => {
    let pageHtmlList: string[] = [];
    if (printLayout) {
      for (let i = 0; i < pageCount; i++) {
        const el = pageRefs.current[i];
        pageHtmlList.push(el ? el.innerHTML : '');
      }
    } else {
      const continuousHtml = getCombinedLogicalPagesHtml(pageRefs.current, 1);
      pageHtmlList = paginateHtmlOffscreen(
        continuousHtml,
        getPaginationConfig(),
        {
          activeFontCssFamily: activeFont.cssFamily,
          lineSpacing,
          letterSpacing,
          firstLineIndent,
          paragraphGapPt,
          columnCount,
          mirrorMargins,
          innerMarginMm,
          outerMarginMm,
        }
      );
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
    getPaginationConfig,
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
    printLayout,
    showCropMarks,
    showHeaderFooter,
    showPageNumbers,
    spaceAfterParagraph,
    useOddEvenHeaders,
    watermarkText,
  ]);

  // 1. Standard 1-Up Vector PDF Print (supports Page Range: All / Current Page / Custom Range)
  // Uses exact A5/A4/Demy page dimensions regardless of Print Layout ON/OFF
  const handlePrintVectorPdf = useCallback(
    async (
      rangeMode: PdfPageRangeMode = 'all',
      customRange = ''
    ) => {
      setActiveDrawer('none');
      lastPdfRangeRef.current = { mode: rangeMode, custom: customRange };
      const ctx = buildExportContext();
      const totalPages = Math.max(1, ctx.pageHtmlList.length);
      const selectedIndices = resolvePdfPageIndices(
        rangeMode,
        customRange,
        activePageIndex,
        totalPages
      );
      const isSubset =
        rangeMode !== 'all' || selectedIndices.length !== totalPages;

      if (isSubset) {
        ctx.selectedPageIndices = selectedIndices;
      }

      const rangeSummary =
        rangeMode === 'current'
          ? `Page ${selectedIndices[0] + 1}`
          : rangeMode === 'custom'
            ? `Pages ${selectedIndices.map((i) => i + 1).join(', ')}`
            : `All ${totalPages} pages`;

      showToast(
        `Opening PDF Print (${rangeSummary})... If blocked in preview, tap 'Download Printable Page (.html)' below.`,
        true,
        false
      );

      if (printLayout && !isSubset) {
        window.setTimeout(async () => {
          await printVectorPdfDocument();
        }, 150);
      } else {
        window.setTimeout(async () => {
          await printPaginatedHtmlDocument(ctx);
        }, 150);
      }
    },
    [activePageIndex, buildExportContext, printLayout, showToast]
  );

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

  // 2. Download Standalone Font-Locked Printable HTML (1-Up, respects selected Page Range)
  const handleExportStandaloneHtml = useCallback(
    (rangeMode?: PdfPageRangeMode, customRange?: string) => {
      const resolvedMode = rangeMode ?? lastPdfRangeRef.current.mode;
      const resolvedCustom = customRange ?? lastPdfRangeRef.current.custom;
      const ctx = buildExportContext();
      if (resolvedMode !== 'all') {
        ctx.selectedPageIndices = resolvePdfPageIndices(
          resolvedMode,
          resolvedCustom,
          activePageIndex,
          ctx.pageHtmlList.length
        );
      }
      exportStandalonePrintableHtml(ctx);
      showToast(
        'Downloaded printable .html file! Open it in Chrome to Save as PDF.'
      );
    },
    [activePageIndex, buildExportContext, showToast]
  );

  // 3. Real Word (.docx) Export & Native Mobile Share
  const handleExportWordDocx = useCallback(
    async (preferShare: boolean) => {
      const ctx = buildExportContext();
      const combinedHtml = getCombinedLogicalPagesHtml(
        pageRefs.current,
        printLayout ? pageCount : 1
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
    [buildExportContext, pageCount, printLayout, showToast]
  );

  // 4. Save & Open Editable Draft (.mps)
  const handleSaveMpsDraft = useCallback(() => {
    const htmlContent = getCombinedLogicalPagesHtml(
      pageRefs.current,
      printLayout ? pageCount : 1
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
      printLayout,
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
    printLayout,
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

          const willSwitchMode =
            typeof parsed.printLayout === 'boolean' &&
            parsed.printLayout !== printLayout;
          if (typeof parsed.printLayout === 'boolean') {
            setPrintLayout(parsed.printLayout);
          }

          if (parsed.htmlContent) {
            clearOscillationLock();
            setAllDocSelected(false);
            for (let i = 1; i < pageRefs.current.length; i++) {
              const el = pageRefs.current[i];
              if (el) el.innerHTML = '';
            }
            prevPageCountRef.current = 1;
            setPageCount(1);
            if (!willSwitchMode && pageRefs.current[0]) {
              pageRefs.current[0].innerHTML = parsed.htmlContent;
            } else {
              pendingHtmlByPageRef.current = [parsed.htmlContent];
            }
            schedulePaginationPass({ immediate: true, fromUserEdit: true });
          }
          showToast('പ്രോജക്റ്റ് തുറന്നു (.mps loaded)');
        } catch {
          showToast('Invalid .mps project file');
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [
      clearOscillationLock,
      printLayout,
      schedulePaginationPass,
      setAllDocSelected,
      showToast,
    ]
  );

  // Find & Replace across all pages
  const handleFindNext = useCallback(() => {
    const query = findQuery.trim();
    if (!query) return;

    let totalMatches = 0;
    let firstRange: Range | null = null;
    const activeSlots = printLayout ? pageCount : 1;

    for (let i = 0; i < activeSlots; i++) {
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
  }, [findQuery, pageCount, printLayout]);

  const handleReplaceAll = useCallback(() => {
    const query = findQuery.trim();
    if (!query) return;
    let replacedCount = 0;
    const activeSlots = printLayout ? pageCount : 1;

    for (let i = 0; i < activeSlots; i++) {
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
    schedulePaginationPass({ fromUserEdit: true });
  }, [findQuery, pageCount, printLayout, replaceQuery, schedulePaginationPass]);

  // Page Keyboard Navigation + Document-Wide Ctrl+A / Cmd+A, Backspace, Copy & Cut across all pages
  const handlePageKeyDown = useCallback(
    (pageIndex: number, e: React.KeyboardEvent<HTMLDivElement>) => {
      const isMod = e.ctrlKey || e.metaKey;
      const keyLower = e.key.toLowerCase();

      // Intercept Ctrl+A / Cmd+A to select ENTIRE document from Page 1 to final page
      if (isMod && keyLower === 'a') {
        e.preventDefault();
        handleSelectAllDocument();
        return;
      }

      // Handle Delete / Backspace / Copy / Cut / Typing when ALL pages are selected in Print Layout
      if (isAllDocSelectedRef.current && printLayout && pageCount > 1) {
        if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          handleClearAllDocument();
          return;
        }
        if (isMod && keyLower === 'c') {
          e.preventDefault();
          void handleCopyAllDocument();
          return;
        }
        if (isMod && keyLower === 'x') {
          e.preventDefault();
          void handleCopyAllDocument();
          handleClearAllDocument();
          return;
        }
        if (
          e.key === 'Escape' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowDown'
        ) {
          setAllDocSelected(false);
          return;
        }
        if (!isMod && !e.altKey && e.key.length === 1) {
          e.preventDefault();
          const typedChar = e.key;
          handleClearAllDocument();
          window.setTimeout(() => {
            const firstPage = pageRefs.current[0];
            if (firstPage) {
              firstPage.innerHTML = `<p>${typedChar}</p>`;
              const sel = window.getSelection();
              if (sel) {
                const r = document.createRange();
                r.selectNodeContents(firstPage);
                r.collapse(false);
                sel.removeAllRanges();
                sel.addRange(r);
              }
              schedulePaginationPass({ fromUserEdit: true });
            }
          }, 0);
          return;
        }
      } else if (
        isAllDocSelectedRef.current &&
        !isMod &&
        !e.shiftKey &&
        e.key !== 'Meta' &&
        e.key !== 'Control'
      ) {
        setAllDocSelected(false);
      }

      if (e.key === 'Backspace' && pageIndex > 0 && printLayout) {
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
                schedulePaginationPass({ fromUserEdit: true });
              }
            }
          }
        }
      }
    },
    [
      handleClearAllDocument,
      handleCopyAllDocument,
      handleSelectAllDocument,
      pageCount,
      printLayout,
      schedulePaginationPass,
      setAllDocSelected,
    ]
  );

  // Detect clicked Image, Table Cell, or Armed Format Painter application inside a page
  const handlePageClick = useCallback(
    (pageIndex: number, e: React.MouseEvent<HTMLDivElement>) => {
      setActivePageIndex(pageIndex);
      if (isAllDocSelectedRef.current) {
        setAllDocSelected(false);
      }

      // Apply Format Painter immediately when armed
      if (copiedFormat) {
        window.setTimeout(() => {
          const applied = applyFormatPainterToSelection(copiedFormat);
          setCopiedFormat(null);
          if (applied) {
            schedulePaginationPass({ fromUserEdit: true });
            showToast('ഫോർമാറ്റ് പ്രയോഗിച്ചു (Format Painted)');
          }
        }, 10);
      }

      const target = e.target as HTMLElement;
      if (target.tagName.toLowerCase() === 'img') {
        setActiveImageEl(target as HTMLImageElement);
      } else {
        setActiveImageEl(null);
      }

      const cell = target.closest('td, th') as HTMLTableCellElement | null;
      setActiveTableCell(cell);
    },
    [copiedFormat, schedulePaginationPass, setAllDocSelected, showToast]
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
      {/* ULTRA-CLEAN GOOGLE DOCS SINGLE-ROW TOP BAR (Hidden in Reading Mode)   */}
      {/* ===================================================================== */}
      {!readingMode && (
      <header
        className={`no-print z-30 flex h-12 shrink-0 items-center justify-between border-b px-2 shadow-2xs ${
          darkMode
            ? 'border-[#3C4043] bg-[#303134] text-[#E8EAED]'
            : 'border-[#DADCE0] bg-white text-[#1F1F1F]'
        }`}
      >
        {/* Left: Projects Workspace Button, Checkmark ('✓') & Editable Title */}
        <div className="flex min-w-0 flex-1 items-center gap-1 pr-2">
          <button
            type="button"
            onClick={() => {
              persistToLocalStorage();
              setActiveDrawer(activeDrawer === 'projects' ? 'none' : 'projects');
            }}
            title="Projects (പ്രോജക്റ്റുകൾ)"
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              activeDrawer === 'projects'
                ? 'bg-[#E8F0FE] text-[#1A73E8]'
                : darkMode
                  ? 'text-gray-200 hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FolderKanban className="h-4.5 w-4.5" />
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveDrawer('none');
              persistToLocalStorage();
              showToast('പ്രോജക്റ്റ് സേവ് ചെയ്തു (Saved to IndexedDB)');
            }}
            title="Save & Done"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#1A73E8] transition-colors hover:bg-[#1A73E8]/10 active:bg-[#1A73E8]/20"
          >
            <Check className="h-4.5 w-4.5 stroke-[2.5]" />
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
              {mirrorMargins ? ' · Book' : ''} ·{' '}
              {printLayout
                ? `${pageCount} ${pageCount === 1 ? 'പേജ്' : 'പേജുകൾ'}`
                : 'Pageless'}
              {activeProject
                ? ` · ${activeProject.status === 'completed' ? 'Completed' : 'Pending'}`
                : ''}
            </span>
          </div>
        </div>

        {/* Right: Clean Action Icons + Quick Print Layout Toggle */}
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
            className={`hidden h-9 w-9 items-center justify-center rounded-full transition-colors sm:flex ${
              darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'
            }`}
          >
            <Redo2 className="h-4 w-4" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleTogglePrintLayout(!printLayout)}
            title={
              printLayout
                ? 'Print Layout ON — Tap for Pageless Typing'
                : 'Pageless Mode — Tap for Print Page View'
            }
            className={`flex h-8 items-center gap-1 rounded-full px-2 text-[11px] font-semibold transition-colors ${
              printLayout
                ? 'bg-[#E8F0FE] text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                : darkMode
                  ? 'text-gray-300 hover:bg-white/10'
                  : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {printLayout ? 'Pages' : 'Pageless'}
            </span>
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
      )}

      {/* ===================================================================== */}
      {/* WPS-STYLE DISMISSIBLE OPEN DOCUMENT TABS                              */}
      {/* ===================================================================== */}
      {!readingMode && showTabsBar && openProjects.length > 0 && (
        <OpenProjectTabs
          openProjects={openProjects}
          activeProjectId={activeProjectId}
          darkMode={darkMode}
          onSelectProject={handleSelectProject}
          onCloseTab={handleCloseTab}
          onCreateProject={handleCreateProject}
          onDismissBar={() => setShowTabsBar(false)}
        />
      )}

      {/* ===================================================================== */}
      {/* FIND & REPLACE SLIM BAR (When toggled from More menu)                 */}
      {/* ===================================================================== */}
      {!readingMode && showFindReplace && (
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
              onClick={() => handleExportStandaloneHtml()}
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
        printLayout={printLayout}
        isAllDocSelected={isAllDocSelected}
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
        readingMode={readingMode}
        onExitReadingMode={() => setReadingMode(false)}
        onPageFocus={(idx) => setActivePageIndex(idx)}
        onPageInput={() => {
          schedulePaginationPass({ fromUserEdit: true });
        }}
        onPageKeyDown={handlePageKeyDown}
        onPageClick={handlePageClick}
        onCompositionStart={() => {
          isComposingRef.current = true;
        }}
        onCompositionEnd={() => {
          isComposingRef.current = false;
          schedulePaginationPass({ fromUserEdit: true });
        }}
        onBackgroundClick={(e) => {
          if (e.target === workspaceRef.current) {
            setActiveDrawer('none');
            if (isAllDocSelectedRef.current) {
              setAllDocSelected(false);
            }
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
        printLayout={printLayout}
        onTogglePrintLayout={handleTogglePrintLayout}
        onSelectAllDocument={handleSelectAllDocument}
        isAllDocSelected={isAllDocSelected}
        onCopyAllDocument={() => {
          void handleCopyAllDocument();
        }}
        onClearAllDocument={handleClearAllDocument}
        onClearSelectionState={() => setAllDocSelected(false)}
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
        onImageWrapChange={handleImageWrapChange}
        onImageBorderChange={handleImageBorderChange}
        onImageCaptionChange={handleImageCaptionChange}
        onDeleteActiveImage={handleDeleteActiveImage}
        onClearActiveImage={() => setActiveImageEl(null)}
        isFormatPainterActive={Boolean(copiedFormat)}
        onToggleFormatPainter={handleToggleFormatPainter}
        onToggleDropCap={handleToggleDropCap}
        onInsertCalloutBox={handleInsertCalloutBox}
        onInsertFootnote={handleInsertFootnote}
        onInsertSymbol={handleInsertSymbol}
        onInsertQuickBlock={handleInsertQuickBlock}
        onInsertBlankPage={handleInsertBlankPage}
        onCleanSpacingAndBreaks={handleCleanSpacingAndBreaks}
        onOpenOutline={handleOpenOutline}
        readingMode={readingMode}
        setReadingMode={setReadingMode}
        showTabsBar={showTabsBar}
        setShowTabsBar={setShowTabsBar}
        activePageIndex={activePageIndex}
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

      {/* ===================================================================== */}
      {/* MULTI-PROJECT INDEXEDDB WORKSPACE DRAWER                              */}
      {/* ===================================================================== */}
      <ProjectsDrawer
        isOpen={activeDrawer === 'projects'}
        onClose={() => setActiveDrawer('none')}
        projects={projects}
        activeProjectId={activeProjectId}
        darkMode={darkMode}
        onSelectProject={handleSelectProject}
        onCreateProject={handleCreateProject}
        onToggleStatus={handleToggleProjectStatus}
        onDuplicateProject={handleDuplicateProject}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
      />

      {/* ===================================================================== */}
      {/* GOOGLE DOCS-STYLE DOCUMENT OUTLINE DRAWER (H1 / H2 / H3)              */}
      {/* ===================================================================== */}
      <OutlineDrawer
        isOpen={activeDrawer === 'outline'}
        onClose={() => setActiveDrawer('none')}
        headings={outlineHeadings}
        printLayout={printLayout}
        darkMode={darkMode}
        onJumpToHeading={handleJumpToHeading}
      />
    </div>
  );
}

export default App;

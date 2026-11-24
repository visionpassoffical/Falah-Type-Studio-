import React from 'react';
import {
  MarginsMm,
  PageBorderStyleKey,
  PageNumberAlign,
  PageNumberFormat,
  PageNumberPosition,
  PaperTintKey,
} from '../types';
import { PAPER_TINTS } from '../constants/fonts';
import {
  formatPageNumberLabel,
  getEffectivePageMargins,
  getScreenBorderStyle,
} from '../utils/export';

export interface PageCanvasProps {
  printLayout: boolean;
  isAllDocSelected: boolean;
  pageCount: number;
  activePageIndex: number;
  pageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  workspaceRef: React.RefObject<HTMLDivElement | null>;
  finalWidthMm: number;
  finalHeightMm: number;
  margins: MarginsMm;
  mirrorMargins: boolean;
  innerMarginMm: number;
  outerMarginMm: number;
  effectiveScale: number;
  activeFontCssFamily: string;
  lineSpacing: string;
  letterSpacing: string;
  firstLineIndent: boolean;
  spaceAfterParagraph: boolean;
  paragraphGapPt: number;
  columnCount: 1 | 2 | 3;
  pageBorderStyle: PageBorderStyleKey;
  pageBorderColor: string;
  pageBorderPaddingMm: number;
  paperTint: PaperTintKey;
  watermarkText: string;
  showCropMarks: boolean;
  showRuler: boolean;
  showHeaderFooter: boolean;
  headerText: string;
  footerText: string;
  onHeaderTextChange: (val: string) => void;
  onFooterTextChange: (val: string) => void;
  useOddEvenHeaders: boolean;
  evenHeaderText: string;
  oddHeaderText: string;
  onEvenHeaderTextChange: (val: string) => void;
  onOddHeaderTextChange: (val: string) => void;
  hideHeaderOnChapterPages: boolean;
  chapterPageFlags: boolean[];
  showPageNumbers: boolean;
  differentFirstPage: boolean;
  pageNumberPosition: PageNumberPosition;
  pageNumberAlign: PageNumberAlign;
  pageNumberFormat: PageNumberFormat;
  darkMode: boolean;
  readingMode: boolean;
  onExitReadingMode: () => void;
  onPageFocus: (pageIndex: number) => void;
  onPageInput: (pageIndex: number) => void;
  onPagePaste: (pageIndex: number, e: React.ClipboardEvent<HTMLDivElement>) => void;
  onPageKeyDown: (pageIndex: number, e: React.KeyboardEvent<HTMLDivElement>) => void;
  onPageClick: (pageIndex: number, e: React.MouseEvent<HTMLDivElement>) => void;
  onCompositionStart: () => void;
  onCompositionEnd: (pageIndex: number) => void;
  onBackgroundClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const PageCanvas: React.FC<PageCanvasProps> = ({
  printLayout,
  isAllDocSelected,
  pageCount,
  activePageIndex,
  pageRefs,
  workspaceRef,
  finalWidthMm,
  finalHeightMm,
  margins,
  mirrorMargins,
  innerMarginMm,
  outerMarginMm,
  effectiveScale,
  activeFontCssFamily,
  lineSpacing,
  letterSpacing,
  firstLineIndent,
  paragraphGapPt,
  columnCount,
  pageBorderStyle,
  pageBorderColor,
  pageBorderPaddingMm,
  paperTint,
  watermarkText,
  showCropMarks,
  showRuler,
  showHeaderFooter,
  headerText,
  footerText,
  onHeaderTextChange,
  onFooterTextChange,
  useOddEvenHeaders,
  evenHeaderText,
  oddHeaderText,
  onEvenHeaderTextChange,
  onOddHeaderTextChange,
  hideHeaderOnChapterPages,
  chapterPageFlags,
  showPageNumbers,
  differentFirstPage,
  pageNumberPosition,
  pageNumberAlign,
  pageNumberFormat,
  darkMode,
  readingMode,
  onExitReadingMode,
  onPageFocus,
  onPageInput,
  onPagePaste,
  onPageKeyDown,
  onPageClick,
  onCompositionStart,
  onCompositionEnd,
  onBackgroundClick,
}) => {
  const mmToPx = 3.7795275591;
  const unscaledPageWidthPx = finalWidthMm * mmToPx;
  const unscaledPageHeightPx = finalHeightMm * mmToPx;
  const scaledWidthPx = Math.round(unscaledPageWidthPx * effectiveScale);
  const scaledHeightPx = Math.round(unscaledPageHeightPx * effectiveScale);

  const borderStyleObj = getScreenBorderStyle(
    pageBorderStyle,
    pageBorderColor,
    pageBorderPaddingMm
  );

  // Warm eye-protection sepia paper when Reading / Proofread Mode is active
  const paperBgHex = readingMode ? '#F7F1E1' : PAPER_TINTS[paperTint].hex;

  const rulerTicks: number[] = [];
  if (showRuler && !readingMode) {
    for (let cm = 0; cm <= Math.floor(finalWidthMm / 10); cm++) {
      rulerTicks.push(cm);
    }
  }

  return (
    <div
      ref={workspaceRef}
      onClick={onBackgroundClick}
      className={`workspace-scroll relative flex-1 overflow-y-auto overflow-x-hidden px-2 pt-3 transition-colors ${
        readingMode
          ? 'bg-[#E9DEC9] pb-16'
          : darkMode
            ? 'bg-[#12151B] pb-32'
            : 'bg-[#E8EAED] pb-32'
      }`}
    >
      {readingMode && (
        <div className="no-print fixed top-3 right-3 z-40 flex items-center gap-2">
          <span className="rounded-full bg-[#3B2F22]/85 px-3 py-1.5 text-[11px] font-semibold text-[#F7F1E1] shadow-md backdrop-blur-xs">
            Sepia Proofread Mode
          </span>
          <button
            type="button"
            onClick={onExitReadingMode}
            className="rounded-full bg-[#1A73E8] px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-95"
          >
            Exit Reading Mode
          </button>
        </div>
      )}
      <style>{`
        .page-content-editable p {
          margin-top: 0;
          margin-bottom: ${paragraphGapPt}pt;
          ${firstLineIndent ? 'text-indent: 6mm;' : ''}
        }
        .page-content-editable p.mps-no-indent,
        .page-content-editable .mps-no-indent p,
        .page-content-editable .mps-chapter-start p,
        .page-content-editable p[style*="text-align: center"],
        .page-content-editable p[style*="text-align: right"] {
          text-indent: 0 !important;
        }
        .page-content-editable h1 {
          font-size: 1.65em;
          font-weight: 700;
          line-height: 1.3;
          margin: 0.25em 0 0.35em 0;
        }
        .page-content-editable h2 {
          font-size: 1.35em;
          font-weight: 700;
          line-height: 1.35;
          margin: 0.25em 0 0.3em 0;
        }
        .page-content-editable h3 {
          font-size: 1.15em;
          font-weight: 600;
          line-height: 1.4;
          margin: 0.2em 0 0.25em 0;
        }
        .page-content-editable ul {
          list-style-type: disc;
          padding-left: 1.4em;
          margin: 0.35em 0;
        }
        .page-content-editable ol {
          list-style-type: decimal;
          padding-left: 1.4em;
          margin: 0.35em 0;
        }
        .page-content-editable table:not(.mps-toc-table) {
          width: 100%;
          border-collapse: collapse;
          margin: 0.55em 0;
        }
        .page-content-editable table:not(.mps-toc-table) th,
        .page-content-editable table:not(.mps-toc-table) td {
          border: 1pt solid #374151;
          padding: 5px 8px;
          vertical-align: top;
        }
        .page-content-editable table:not(.mps-toc-table) th {
          background-color: rgba(243, 244, 246, 0.85);
          font-weight: 700;
        }
        .page-content-editable table.mps-toc-table {
          width: 100%;
          border-collapse: collapse;
          border: none;
          margin: 0.4em 0;
        }
        .page-content-editable table.mps-toc-table td {
          border: none;
        }
        .page-content-editable hr.mps-divider,
        .page-content-editable hr {
          border: none;
          border-top: 1.2pt solid #6B7280;
          margin: 0.7em 0;
        }
        .page-content-editable img {
          max-width: 100%;
          height: auto;
          border-radius: 3px;
        }
        .page-content-editable .mps-page-break {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 14px 0;
          padding: 4px 0;
          border-top: 1.5px dashed #9CA3AF;
          border-bottom: 1.5px dashed #9CA3AF;
          background-color: rgba(241, 245, 249, 0.85);
          color: #64748B;
          font-size: 8.5pt;
          font-weight: 600;
          user-select: none;
        }
      `}</style>

      {/* =================================================================== */}
      {/* PAGELESS / CONTINUOUS MODE (printLayout === false)                  */}
      {/* Lag-free single continuous sheet for fast Malayalam typing          */}
      {/* =================================================================== */}
      {!printLayout ? (
        <div className="mx-auto flex w-full max-w-[780px] flex-col items-center">
          <div
            className={`w-full rounded-xl border px-4 py-5 shadow-xs transition-shadow sm:px-8 sm:py-7 ${
              isAllDocSelected
                ? 'ring-2 ring-[#1A73E8]/70'
                : readingMode
                  ? 'border-[#D9CCB2]'
                  : darkMode
                    ? 'border-[#2E3440]'
                    : 'border-gray-200/90'
            }`}
            style={{
              backgroundColor: readingMode
                ? '#F7F1E1'
                : darkMode
                  ? '#1A1E26'
                  : paperBgHex,
              minHeight: 'calc(100dvh - 140px)',
              fontFamily: activeFontCssFamily,
            }}
          >
            <div
              key="pageless-continuous-editor"
              ref={(el) => {
                pageRefs.current[0] = el;
              }}
              contentEditable={!readingMode}
              suppressContentEditableWarning
              spellCheck={false}
              data-page-index={0}
              onFocus={() => onPageFocus(0)}
              onInput={() => onPageInput(0)}
              onPaste={(e) => onPagePaste(0, e)}
              onKeyDown={(e) => onPageKeyDown(0, e)}
              onClick={(e) => onPageClick(0, e)}
              onCompositionStart={onCompositionStart}
              onCompositionEnd={() => onCompositionEnd(0)}
              className={`page-content-editable relative min-h-[calc(100dvh-200px)] w-full text-[12pt] focus:outline-none ${
                readingMode
                  ? 'text-[#2B2318]'
                  : darkMode
                    ? 'text-gray-100'
                    : 'text-gray-900'
              }`}
              style={{
                fontFamily: activeFontCssFamily,
                lineHeight: lineSpacing,
                letterSpacing,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            />
          </div>
        </div>
      ) : (
      <div className="pages-stack mx-auto flex flex-col items-center gap-[18px]">
        {Array.from({ length: pageCount }).map((_, pageIndex) => {
          const pageNumber = pageIndex + 1;
          const isOddPage = pageNumber % 2 === 1;
          const effMargins = getEffectivePageMargins(
            pageIndex,
            margins,
            mirrorMargins,
            innerMarginMm,
            outerMarginMm
          );

          const isChapterOpening = Boolean(chapterPageFlags[pageIndex]);
          const omitOnFirstPage = differentFirstPage && pageIndex === 0;
          const omitTopForChapter = hideHeaderOnChapterPages && isChapterOpening;
          const pageLabel = formatPageNumberLabel(
            pageNumber,
            pageCount,
            pageNumberFormat
          );

          const hasTopHeaderArea =
            !omitOnFirstPage &&
            !omitTopForChapter &&
            (showHeaderFooter ||
              useOddEvenHeaders ||
              (showPageNumbers && pageNumberPosition === 'top'));

          const hasBottomFooterArea =
            !omitOnFirstPage &&
            (showHeaderFooter ||
              (showPageNumbers && pageNumberPosition === 'bottom'));

          const usablePageHeightPx = Math.max(
            120,
            Math.floor(
              unscaledPageHeightPx -
                effMargins.top * mmToPx -
                effMargins.bottom * mmToPx -
                (hasTopHeaderArea ? 30 : 0) -
                (hasBottomFooterArea ? 30 : 0) -
                (pageBorderStyle !== 'none'
                  ? pageBorderPaddingMm * 2 * mmToPx
                  : 0) -
                14
            )
          );

          const resolvedNumberAlign: 'left' | 'center' | 'right' =
            pageNumberAlign === 'outer'
              ? isOddPage
                ? 'right'
                : 'left'
              : pageNumberAlign;

          const isActivePage = activePageIndex === pageIndex;

          const currentRunningHeaderVal = useOddEvenHeaders
            ? isOddPage
              ? oddHeaderText
              : evenHeaderText
            : headerText;

          const handleRunningHeaderChange = (val: string) => {
            if (useOddEvenHeaders) {
              if (isOddPage) onOddHeaderTextChange(val);
              else onEvenHeaderTextChange(val);
            } else {
              onHeaderTextChange(val);
            }
          };

          const headerPlaceholder = useOddEvenHeaders
            ? isOddPage
              ? 'Right / Odd Page — Chapter Title (അധ്യായം)...'
              : 'Left / Even Page — Book Title (പുസ്തകത്തിന്റെ പേര്)...'
            : 'ഹെഡർ ചേർക്കുക (Header)...';

          return (
            <div
              key={`print-page-${pageIndex}`}
              className="page-scale-slot relative flex flex-col items-center"
              style={{
                width: `${scaledWidthPx}px`,
                height: `${scaledHeightPx}px`,
              }}
            >
              {mirrorMargins && (
                <div
                  className="no-print pointer-events-none absolute -top-4 left-0 flex w-full items-center justify-between px-1 text-[10px] font-medium text-gray-500 select-none"
                >
                  <span>
                    Page {pageNumber} ({isOddPage ? 'Odd / Right' : 'Even / Left'})
                  </span>
                  <span>
                    {isOddPage
                      ? `Spine Left ${innerMarginMm}mm · Outer ${outerMarginMm}mm`
                      : `Outer ${outerMarginMm}mm · Spine Right ${innerMarginMm}mm`}
                  </span>
                </div>
              )}

              {showRuler && isActivePage && (
                <div
                  className="no-print mb-1 flex h-4 w-full items-end border-b border-gray-400 bg-white/90 px-1 text-[9px] text-gray-500 select-none"
                  style={{ width: `${scaledWidthPx}px` }}
                >
                  {rulerTicks.map((cm) => (
                    <div
                      key={cm}
                      className="relative flex-1 border-l border-gray-400 pl-0.5 leading-none"
                    >
                      {cm > 0 ? cm : ''}
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`page-sheet relative flex flex-col justify-between transition-shadow ${
                  isAllDocSelected
                    ? 'ring-2 ring-[#1A73E8]/70'
                    : isActivePage
                      ? 'ring-1 ring-[#1A73E8]/40'
                      : ''
                }`}
                style={{
                  width: `${finalWidthMm}mm`,
                  height: `${finalHeightMm}mm`,
                  minHeight: `${finalHeightMm}mm`,
                  maxHeight: `${finalHeightMm}mm`,
                  paddingTop: `${effMargins.top}mm`,
                  paddingRight: `${effMargins.right}mm`,
                  paddingBottom: `${effMargins.bottom}mm`,
                  paddingLeft: `${effMargins.left}mm`,
                  backgroundColor: paperBgHex,
                  fontFamily: activeFontCssFamily,
                  transform: `scale(${effectiveScale})`,
                  transformOrigin: 'top center',
                  boxShadow: darkMode
                    ? '0 4px 16px rgba(0, 0, 0, 0.55)'
                    : '0 2px 8px rgba(0, 0, 0, 0.12)',
                  overflow: 'hidden',
                }}
              >
                {/* Visual Spine / Binding Edge Shadow Indicator on screen only when Mirror Margins is active */}
                {mirrorMargins && (
                  <div
                    className={`no-print pointer-events-none absolute top-0 bottom-0 z-0 w-3 ${
                      isOddPage
                        ? 'left-0 bg-gradient-to-r from-black/8 to-transparent'
                        : 'right-0 bg-gradient-to-l from-black/8 to-transparent'
                    }`}
                  />
                )}

                {showCropMarks && (
                  <>
                    <div className="pointer-events-none absolute top-1.5 left-1.5 h-3 w-3 border-t border-l border-gray-500" />
                    <div className="pointer-events-none absolute top-1.5 right-1.5 h-3 w-3 border-t border-r border-gray-500" />
                    <div className="pointer-events-none absolute bottom-1.5 left-1.5 h-3 w-3 border-b border-l border-gray-500" />
                    <div className="pointer-events-none absolute right-1.5 bottom-1.5 h-3 w-3 border-r border-b border-gray-500" />
                  </>
                )}

                {watermarkText.trim().length > 0 && (
                  <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden select-none">
                    <span
                      className="text-center font-extrabold tracking-widest uppercase"
                      style={{
                        fontSize: '36pt',
                        color: 'rgba(17, 24, 39, 0.065)',
                        transform: 'rotate(-32deg)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {watermarkText}
                    </span>
                  </div>
                )}

                <div
                  className="page-border-frame relative z-10 flex h-full w-full flex-col justify-between overflow-hidden"
                  style={borderStyleObj}
                >
                  {hasTopHeaderArea && (
                    <div
                      className="mb-[6px] flex shrink-0 items-center justify-between border-b border-gray-300/80 text-[8.5pt] text-gray-600"
                      style={{
                        height: '24px',
                        minHeight: '24px',
                        maxHeight: '24px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {showPageNumbers &&
                        pageNumberPosition === 'top' &&
                        resolvedNumberAlign === 'left' && (
                          <span className="mr-2 shrink-0 font-medium text-gray-600 select-none">
                            {pageLabel}
                          </span>
                        )}

                      {showHeaderFooter || useOddEvenHeaders ? (
                        <input
                          type="text"
                          value={currentRunningHeaderVal}
                          onChange={(e) =>
                            handleRunningHeaderChange(e.target.value)
                          }
                          placeholder={headerPlaceholder}
                          className="w-full bg-transparent text-[8.5pt] text-gray-700 placeholder-gray-400 focus:outline-none"
                          style={{
                            textAlign: useOddEvenHeaders
                              ? isOddPage
                                ? 'right'
                                : 'left'
                              : showPageNumbers && pageNumberPosition === 'top'
                                ? resolvedNumberAlign === 'left'
                                  ? 'right'
                                  : 'left'
                                : resolvedNumberAlign,
                          }}
                        />
                      ) : (
                        <span />
                      )}

                      {showPageNumbers &&
                        pageNumberPosition === 'top' &&
                        resolvedNumberAlign !== 'left' && (
                          <span
                            className="ml-2 shrink-0 font-medium text-gray-600 select-none"
                            style={{
                              marginLeft:
                                resolvedNumberAlign === 'center' &&
                                !showHeaderFooter &&
                                !useOddEvenHeaders
                                  ? 'auto'
                                  : undefined,
                              marginRight:
                                resolvedNumberAlign === 'center' &&
                                !showHeaderFooter &&
                                !useOddEvenHeaders
                                  ? 'auto'
                                  : undefined,
                            }}
                          >
                            {pageLabel}
                          </span>
                        )}
                    </div>
                  )}

                  <div
                    ref={(el) => {
                      pageRefs.current[pageIndex] = el;
                    }}
                    contentEditable={!readingMode}
                    suppressContentEditableWarning
                    spellCheck={false}
                    data-page-index={pageIndex}
                    onFocus={() => onPageFocus(pageIndex)}
                    onInput={() => onPageInput(pageIndex)}
                    onPaste={(e) => onPagePaste(pageIndex, e)}
                    onKeyDown={(e) => onPageKeyDown(pageIndex, e)}
                    onClick={(e) => onPageClick(pageIndex, e)}
                    onCompositionStart={onCompositionStart}
                    onCompositionEnd={() => onCompositionEnd(pageIndex)}
                    className={`page-content-editable relative flex-1 overflow-hidden text-[11.5pt] focus:outline-none ${
                      readingMode ? 'text-[#2B2318]' : 'text-gray-900'
                    }`}
                    style={{
                      maxHeight: `${usablePageHeightPx}px`,
                      fontFamily: activeFontCssFamily,
                      lineHeight: lineSpacing,
                      letterSpacing,
                      columnCount: columnCount > 1 ? columnCount : undefined,
                      columnGap: columnCount > 1 ? '6mm' : undefined,
                      columnRule:
                        columnCount > 1 ? '0.5pt solid #D1D5DB' : undefined,
                      wordBreak: 'break-word',
                      overflowWrap: 'anywhere',
                    }}
                  />

                  {hasBottomFooterArea && (
                    <div
                      className="mt-[6px] flex shrink-0 items-center justify-between border-t border-gray-300/80 text-[8.5pt] text-gray-600"
                      style={{
                        height: '24px',
                        minHeight: '24px',
                        maxHeight: '24px',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {showPageNumbers &&
                        pageNumberPosition === 'bottom' &&
                        resolvedNumberAlign === 'left' && (
                          <span className="mr-2 shrink-0 font-medium text-gray-600 select-none">
                            {pageLabel}
                          </span>
                        )}

                      {showHeaderFooter ? (
                        <input
                          type="text"
                          value={footerText}
                          onChange={(e) => onFooterTextChange(e.target.value)}
                          placeholder="ഫൂട്ടർ ചേർക്കുക (Footer)..."
                          className="w-full bg-transparent text-[8.5pt] text-gray-700 placeholder-gray-400 focus:outline-none"
                          style={{
                            textAlign:
                              showPageNumbers &&
                              pageNumberPosition === 'bottom' &&
                              resolvedNumberAlign === 'left'
                                ? 'right'
                                : 'left',
                          }}
                        />
                      ) : (
                        <span />
                      )}

                      {showPageNumbers &&
                        pageNumberPosition === 'bottom' &&
                        resolvedNumberAlign !== 'left' && (
                          <span
                            className="ml-2 shrink-0 font-medium text-gray-600 select-none"
                            style={{
                              marginLeft:
                                !showHeaderFooter &&
                                (resolvedNumberAlign === 'center' ||
                                  resolvedNumberAlign === 'right')
                                  ? 'auto'
                                  : undefined,
                              marginRight:
                                !showHeaderFooter &&
                                resolvedNumberAlign === 'center'
                                  ? 'auto'
                                  : undefined,
                            }}
                          >
                            {pageLabel}
                          </span>
                        )}
                    </div>
                  )}
                </div>

                {!showPageNumbers && (
                  <div className="no-print pointer-events-none absolute right-2 bottom-1 text-[8pt] font-medium text-gray-400 select-none">
                    {pageNumber} / {pageCount}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

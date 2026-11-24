import React from 'react';
import {
  MarginsMm,
  Orientation,
  PageBorderStyleKey,
  PageNumberAlign,
  PageNumberFormat,
  PageNumberPosition,
  PaperSizeKey,
  PaperTintKey,
  SavedProjectState,
} from '../types';
import { PAPER_SIZES, PAPER_TINTS } from '../constants/fonts';

export interface ExportDocumentContext {
  docTitle: string;
  pageHtmlList: string[];
  paperSize: PaperSizeKey;
  customWidthMm: number;
  customHeightMm: number;
  orientation: Orientation;
  margins: MarginsMm;
  mirrorMargins: boolean;
  innerMarginMm: number;
  outerMarginMm: number;
  activeFontCssFamily: string;
  lineSpacing: string;
  letterSpacing: string;
  firstLineIndent: boolean;
  spaceAfterParagraph: boolean;
  paragraphGapPt: number;
  pageBorderStyle: PageBorderStyleKey;
  pageBorderColor: string;
  pageBorderPaddingMm: number;
  columnCount: 1 | 2 | 3;
  watermarkText: string;
  paperTint: PaperTintKey;
  printBackgroundTint: boolean;
  showCropMarks: boolean;
  showHeaderFooter: boolean;
  headerText: string;
  footerText: string;
  useOddEvenHeaders: boolean;
  evenHeaderText: string;
  oddHeaderText: string;
  hideHeaderOnChapterPages: boolean;
  showPageNumbers: boolean;
  differentFirstPage: boolean;
  pageNumberPosition: PageNumberPosition;
  pageNumberAlign: PageNumberAlign;
  pageNumberFormat: PageNumberFormat;
  /** Optional 0-based page indices to include (for Current Page / Custom Page Range PDF export) */
  selectedPageIndices?: number[];
}

/**
 * Returns the effective Left/Right/Top/Bottom margins for a specific 0-based page index.
 * When Mirror Margins (Book Binding) is enabled:
 * - Odd pages (1, 3, 5... => pageIndex % 2 === 0): Inner/Gutter on LEFT, Outer on RIGHT.
 * - Even pages (2, 4, 6... => pageIndex % 2 === 1): Outer on LEFT, Inner/Gutter on RIGHT.
 */
export function getEffectivePageMargins(
  pageIndex: number,
  baseMargins: MarginsMm,
  mirrorMargins: boolean,
  innerMarginMm: number,
  outerMarginMm: number
): MarginsMm {
  if (!mirrorMargins) {
    return baseMargins;
  }
  const isOddPage = pageIndex % 2 === 0;
  return {
    top: baseMargins.top,
    bottom: baseMargins.bottom,
    left: isOddPage ? innerMarginMm : outerMarginMm,
    right: isOddPage ? outerMarginMm : innerMarginMm,
  };
}

/**
 * Formats page numbers in Malayalam (`പേജ് 1 / 2`), numeric (`1`), or English (`Page 1 of 2`).
 */
export function formatPageNumberLabel(
  pageNumber: number,
  totalPages: number,
  format: PageNumberFormat
): string {
  if (format === 'numeric_only') {
    return `${pageNumber}`;
  }
  if (format === 'english_x_of_y') {
    return `Page ${pageNumber} of ${totalPages}`;
  }
  return `പേജ് ${pageNumber} / ${totalPages}`;
}

/**
 * Returns inline React CSS properties for the 4-sided page border frame on each `.page-sheet`.
 */
export function getScreenBorderStyle(
  style: PageBorderStyleKey,
  color: string,
  paddingMm: number
): React.CSSProperties {
  if (style === 'none') {
    return { border: 'none', padding: 0 };
  }
  const pad = `${paddingMm}mm`;
  switch (style) {
    case 'thin':
      return { border: `1pt solid ${color}`, padding: pad };
    case 'double':
      return { border: `3.5pt double ${color}`, padding: pad };
    case 'thick':
      return { border: `2.5pt solid ${color}`, padding: pad };
    case 'dashed':
      return { border: `1.5pt dashed ${color}`, padding: pad };
    case 'ornamental':
      return {
        border: `2.5pt solid ${color}`,
        outline: `1pt solid ${color}`,
        outlineOffset: '-4pt',
        padding: pad,
      };
    default:
      return { border: 'none', padding: 0 };
  }
}

/**
 * Returns CSS rules string for the 4-sided page border inside standalone printable HTML.
 */
export function getPageBorderCssRules(
  style: PageBorderStyleKey,
  color: string,
  paddingMm: number
): string {
  if (style === 'none') return 'border: none; padding: 0;';
  const pad = `${paddingMm}mm`;
  switch (style) {
    case 'thin':
      return `border: 1pt solid ${color}; padding: ${pad};`;
    case 'double':
      return `border: 3.5pt double ${color}; padding: ${pad};`;
    case 'thick':
      return `border: 2.5pt solid ${color}; padding: ${pad};`;
    case 'dashed':
      return `border: 1.5pt dashed ${color}; padding: ${pad};`;
    case 'ornamental':
      return `border: 2.5pt solid ${color}; outline: 1pt solid ${color}; outline-offset: -4pt; padding: ${pad};`;
    default:
      return 'border: none; padding: 0;';
  }
}

/**
 * Combines all page DOM containers back into a single clean logical HTML string
 * (merging paragraphs that were auto-split across page boundaries).
 */
export function getCombinedLogicalPagesHtml(
  pageEls: (HTMLDivElement | null)[],
  pageCount: number
): string {
  const wrapper = document.createElement('div');
  for (let i = 0; i < pageCount; i++) {
    const el = pageEls[i];
    if (!el) continue;
    const clone = el.cloneNode(true) as HTMLDivElement;
    // Normalize any bare top-level text nodes so no text is ever dropped
    const rawNodes = Array.from(clone.childNodes);
    for (const node of rawNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        if (text.trim().length > 0) {
          const p = document.createElement('p');
          p.textContent = text;
          wrapper.appendChild(p);
        }
        continue;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) continue;
      const child = node as HTMLElement;
      const prevLast = wrapper.lastElementChild as HTMLElement | null;
      if (
        child.getAttribute('data-split-continuation') === 'true' &&
        prevLast &&
        prevLast.tagName === child.tagName &&
        !prevLast.querySelector('table, img, hr')
      ) {
        prevLast.innerHTML =
          prevLast.innerHTML.trimEnd() + ' ' + child.innerHTML.trimStart();
      } else {
        child.removeAttribute('data-split-continuation');
        wrapper.appendChild(child);
      }
    }
  }
  return wrapper.innerHTML;
}

/**
 * Generates a complete, standalone, font-locked printable HTML document string
 * with all 10 Malayalam fonts, exact `@page` size, and split `.page-sheet` cards.
 */
export function buildCleanPrintableHtmlString(
  ctx: ExportDocumentContext,
  autoPrintOnLoad: boolean
): string {
  const rawW =
    ctx.paperSize === 'Custom'
      ? ctx.customWidthMm
      : PAPER_SIZES[ctx.paperSize].widthMm;
  const rawH =
    ctx.paperSize === 'Custom'
      ? ctx.customHeightMm
      : PAPER_SIZES[ctx.paperSize].heightMm;

  const finalWidthMm = ctx.orientation === 'portrait' ? rawW : rawH;
  const finalHeightMm = ctx.orientation === 'portrait' ? rawH : rawW;

  const isStandardCssPageKeyword =
    ctx.paperSize === 'A5' ||
    ctx.paperSize === 'A4' ||
    ctx.paperSize === 'A3' ||
    ctx.paperSize === 'B5';
  const pageCssSize = isStandardCssPageKeyword
    ? `${ctx.paperSize} ${ctx.orientation}`
    : `${finalWidthMm}mm ${finalHeightMm}mm`;

  const bgHex = ctx.printBackgroundTint
    ? PAPER_TINTS[ctx.paperTint].hex
    : '#FFFFFF';

  const borderCss = getPageBorderCssRules(
    ctx.pageBorderStyle,
    ctx.pageBorderColor,
    ctx.pageBorderPaddingMm
  );

  const totalPages = Math.max(1, ctx.pageHtmlList.length);

  const renderSinglePageSheetHtml = (
    pageHtml: string,
    idx: number,
    isBlankPad = false,
    extraClass = ''
  ): string => {
    const pageNum = idx + 1;
    const isOddPage = pageNum % 2 === 1;
    const effMargins = getEffectivePageMargins(
      idx,
      ctx.margins,
      ctx.mirrorMargins,
      ctx.innerMarginMm,
      ctx.outerMarginMm
    );

    const isChapterOpening =
      !isBlankPad &&
      (pageHtml.includes('mps-chapter-start') ||
        pageHtml.includes('data-chapter-start="true"'));

    const omitHeaderFooter = isBlankPad || (ctx.differentFirstPage && idx === 0);
    const omitTopForChapter = ctx.hideHeaderOnChapterPages && isChapterOpening;
    const pageLabel = formatPageNumberLabel(
      pageNum,
      totalPages,
      ctx.pageNumberFormat
    );

    const resolvedHeaderText = ctx.useOddEvenHeaders
      ? isOddPage
        ? ctx.oddHeaderText
        : ctx.evenHeaderText
      : ctx.showHeaderFooter
        ? ctx.headerText
        : '';

    const showTopRow =
      !omitHeaderFooter &&
      !omitTopForChapter &&
      (ctx.showHeaderFooter ||
        ctx.useOddEvenHeaders ||
        (ctx.showPageNumbers && ctx.pageNumberPosition === 'top'));

    const showBottomRow =
      !omitHeaderFooter &&
      (ctx.showHeaderFooter ||
        (ctx.showPageNumbers && ctx.pageNumberPosition === 'bottom'));

    const resolvedNumberAlign: 'left' | 'center' | 'right' =
      ctx.pageNumberAlign === 'outer'
        ? isOddPage
          ? 'right'
          : 'left'
        : ctx.pageNumberAlign;

    const topRowHtml = showTopRow
      ? `<div class="page-header-row" style="justify-content: ${
          ctx.showPageNumbers && ctx.pageNumberPosition === 'top'
            ? resolvedNumberAlign === 'center' && !resolvedHeaderText
              ? 'center'
              : 'space-between'
            : ctx.useOddEvenHeaders
              ? isOddPage
                ? 'flex-end'
                : 'flex-start'
              : 'space-between'
        };">
          ${
            ctx.showPageNumbers &&
            ctx.pageNumberPosition === 'top' &&
            resolvedNumberAlign === 'left'
              ? `<span>${pageLabel}</span><span>${resolvedHeaderText}</span>`
              : `<span>${resolvedHeaderText}</span>${
                  ctx.showPageNumbers && ctx.pageNumberPosition === 'top'
                    ? `<span>${pageLabel}</span>`
                    : ''
                }`
          }
        </div>`
      : '';

    const bottomRowHtml = showBottomRow
      ? `<div class="page-footer-row" style="justify-content: ${
          !ctx.showHeaderFooter && resolvedNumberAlign === 'center'
            ? 'center'
            : !ctx.showHeaderFooter && resolvedNumberAlign === 'left'
              ? 'flex-start'
              : !ctx.showHeaderFooter && resolvedNumberAlign === 'right'
                ? 'flex-end'
                : 'space-between'
        };">
          ${
            ctx.showPageNumbers &&
            ctx.pageNumberPosition === 'bottom' &&
            resolvedNumberAlign === 'left'
              ? `<span>${pageLabel}</span>${
                  ctx.showHeaderFooter ? `<span>${ctx.footerText}</span>` : ''
                }`
              : `${
                  ctx.showHeaderFooter ? `<span>${ctx.footerText}</span>` : ''
                }${
                  ctx.showPageNumbers && ctx.pageNumberPosition === 'bottom'
                    ? `<span>${pageLabel}</span>`
                    : ''
                }`
          }
        </div>`
      : '';

    return `
      <div class="page-sheet ${extraClass}" style="padding: ${effMargins.top}mm ${effMargins.right}mm ${effMargins.bottom}mm ${effMargins.left}mm;">
        ${
          !isBlankPad && ctx.watermarkText.trim()
            ? `<div class="watermark">${ctx.watermarkText}</div>`
            : ''
        }
        <div class="page-border-frame">
          ${topRowHtml}
          <div class="page-body-content">${isBlankPad ? '' : pageHtml}</div>
          ${bottomRowHtml}
        </div>
      </div>`;
  };

  const indicesToExport =
    ctx.selectedPageIndices && ctx.selectedPageIndices.length > 0
      ? ctx.selectedPageIndices.filter(
          (i) => i >= 0 && i < ctx.pageHtmlList.length
        )
      : ctx.pageHtmlList.map((_, idx) => idx);

  const safeIndices =
    indicesToExport.length > 0 ? indicesToExport : [0];

  const pagesMarkup = safeIndices
    .map((origIdx) =>
      renderSinglePageSheetHtml(ctx.pageHtmlList[origIdx] || '', origIdx)
    )
    .join('\n');

  const paragraphGapVal = `${ctx.paragraphGapPt}pt`;

  return `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${ctx.docTitle || 'Malayalam Document'}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Anek+Malayalam:wght@400;600;700;800&family=Baloo+Chettan+2:wght@500;700;800&family=Chilanka&family=Gayathri:wght@400;700&family=Manjari:wght@400;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&family=Noto+Serif+Malayalam:wght@400;500;600;700&family=Tiro+Malayalam:ital@0;1&display=swap" rel="stylesheet" />
  <style>
    @font-face {
      font-family: 'Rachana';
      src: local('Rachana'), local('Rachana Regular'),
           url('https://smc.org.in/downloads/fonts/rachana/Rachana-Regular.woff2') format('woff2');
      font-weight: 400;
      font-display: swap;
    }
    @font-face {
      font-family: 'Meera';
      src: local('Meera'), local('Meera Regular'),
           url('https://smc.org.in/downloads/fonts/meera/Meera-Regular.woff2') format('woff2');
      font-weight: 400;
      font-display: swap;
    }
    @page {
      size: ${pageCssSize};
      margin: 0mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #E8EAED;
      font-family: ${ctx.activeFontCssFamily};
      color: #111827;
    }
    .pages-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
    }
    .page-sheet {
      position: relative;
      width: ${finalWidthMm}mm;
      height: ${finalHeightMm}mm;
      background: ${bgHex};
      box-shadow: 0 2px 10px rgba(0,0,0,0.12);
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    .page-sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .page-border-frame {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      ${borderCss}
    }
    .page-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 24px;
      min-height: 24px;
      max-height: 24px;
      overflow: hidden;
      white-space: nowrap;
      font-size: 8.5pt;
      color: #4B5563;
      border-bottom: 0.5pt solid #D1D5DB;
      margin-bottom: 6px;
      flex-shrink: 0;
    }
    .page-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 24px;
      min-height: 24px;
      max-height: 24px;
      overflow: hidden;
      white-space: nowrap;
      font-size: 8.5pt;
      color: #4B5563;
      border-top: 0.5pt solid #D1D5DB;
      margin-top: 6px;
      flex-shrink: 0;
    }
    .page-body-content {
      flex: 1;
      overflow: hidden;
      line-height: ${ctx.lineSpacing};
      letter-spacing: ${ctx.letterSpacing};
      ${
        ctx.columnCount > 1
          ? `column-count: ${ctx.columnCount}; column-gap: 7mm; column-rule: 0.5pt solid #D1D5DB;`
          : ''
      }
    }
    .page-body-content p {
      margin-top: 0;
      margin-bottom: ${paragraphGapVal};
      ${ctx.firstLineIndent ? 'text-indent: 6mm;' : ''}
    }
    .page-body-content p.mps-no-indent,
    .page-body-content .mps-no-indent p,
    .page-body-content .mps-chapter-start p,
    .page-body-content p[style*="text-align: center"],
    .page-body-content p[style*="text-align: right"] {
      text-indent: 0 !important;
    }
    .page-body-content h1, .page-body-content h2, .page-body-content h3 {
      margin-top: 0.3em;
      margin-bottom: 0.35em;
      line-height: 1.35;
    }
    .page-body-content table:not(.mps-toc-table) {
      width: 100%;
      border-collapse: collapse;
      margin: 0.6em 0;
    }
    .page-body-content table:not(.mps-toc-table) th,
    .page-body-content table:not(.mps-toc-table) td {
      border: 1pt solid #374151;
      padding: 5px 8px;
      text-align: left;
    }
    .page-body-content table:not(.mps-toc-table) th {
      background: #F3F4F6;
      font-weight: 700;
    }
    .page-body-content table.mps-toc-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
    }
    .page-body-content table.mps-toc-table td {
      border: none;
    }
    .page-body-content hr.mps-divider,
    .page-body-content hr {
      border: none;
      border-top: 1pt solid #6B7280;
      margin: 0.65em 0;
    }
    .page-body-content .mps-drop-cap-char {
      float: left;
      font-size: 3.1em;
      line-height: 0.88;
      font-weight: 700;
      padding-top: 0.08em;
      padding-right: 0.16em;
      padding-bottom: 0.04em;
      color: #111827;
    }
    .page-body-content .mps-callout-box {
      background-color: #F8FAFC;
      border: 1pt solid #94A3B8;
      border-radius: 6px;
      padding: 10px 14px;
      margin: 10px 0;
      text-indent: 0 !important;
      break-inside: avoid;
    }
    .page-body-content .mps-callout-box p {
      text-indent: 0 !important;
      margin-bottom: 4px;
    }
    .page-body-content sup.mps-fn-ref {
      font-size: 0.72em;
      font-weight: 700;
      color: #1A73E8;
      vertical-align: super;
      line-height: 0;
    }
    .page-body-content .mps-footnotes-section {
      margin-top: 14px;
      padding-top: 8px;
      border-top: 0.8pt solid #9CA3AF;
      font-size: 8.8pt;
      line-height: 1.45;
      color: #374151;
    }
    .page-body-content .mps-footnotes-section p {
      text-indent: 0 !important;
      margin-bottom: 3px;
    }
    .page-body-content figure.mps-figure {
      margin: 8px 0;
      max-width: 100%;
      break-inside: avoid;
    }
    .page-body-content figure.mps-figure.mps-wrap-center {
      display: block;
      text-align: center;
      clear: both;
      margin: 10px auto;
    }
    .page-body-content figure.mps-figure.mps-wrap-inline {
      display: inline-block;
      vertical-align: middle;
      margin: 4px 6px;
    }
    .page-body-content figure.mps-figure.mps-wrap-float-left {
      float: left;
      margin: 4px 14px 8px 0;
    }
    .page-body-content figure.mps-figure.mps-wrap-float-right {
      float: right;
      margin: 4px 0 8px 14px;
    }
    .page-body-content figcaption.mps-img-caption {
      margin-top: 4px;
      font-size: 8.8pt;
      font-style: italic;
      color: #4B5563;
      text-align: center;
    }
    .page-body-content img.mps-img-border-thin {
      border: 1pt solid #374151;
      padding: 2px;
      background: #FFFFFF;
    }
    .page-body-content img.mps-img-border-frame {
      border: 1.5pt solid #1F2937;
      padding: 4px;
      background: #FFFFFF;
    }
    .page-body-content .mps-blank-page-marker,
    .page-body-content .mps-blank-page-keeper {
      display: none !important;
    }
    .watermark {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      font-size: 40pt;
      font-weight: 800;
      color: rgba(17, 24, 39, 0.06);
      transform: rotate(-32deg);
      user-select: none;
    }
    @media print {
      html, body {
        background: #FFFFFF !important;
      }
      .pages-wrapper {
        display: block;
        padding: 0;
      }
      .page-sheet {
        box-shadow: none !important;
        margin: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="pages-wrapper">
    ${pagesMarkup}
  </div>
  ${
    autoPrintOnLoad
      ? `<script>
          window.onload = function() {
            if (document.fonts && document.fonts.ready) {
              document.fonts.ready.then(function() {
                setTimeout(function() { window.print(); }, 250);
              });
            } else {
              setTimeout(function() { window.print(); }, 400);
            }
          };
        </script>`
      : ''
  }
</body>
</html>`;
}

/**
 * Generates a Saddle-Stitch 2-Up A5 Booklet Imposition HTML document on A4 Landscape (297mm × 210mm).
 * Pads total pages to a multiple of 4 and pairs pages for double-sided folding & stapling:
 * Sheet s Front: [N - 2s, 2s + 1]  |  Sheet s Back: [2s + 2, N - 2s - 1]
 */
export function buildBookletImpositionHtmlString(
  ctx: ExportDocumentContext,
  autoPrintOnLoad: boolean
): string {
  const actualPages = Math.max(1, ctx.pageHtmlList.length);
  const signatureSheets = Math.ceil(actualPages / 4);
  const totalSlots = signatureSheets * 4;

  const bgHex = ctx.printBackgroundTint
    ? PAPER_TINTS[ctx.paperTint].hex
    : '#FFFFFF';

  const borderCss = getPageBorderCssRules(
    ctx.pageBorderStyle,
    ctx.pageBorderColor,
    ctx.pageBorderPaddingMm
  );

  const renderHalfPage = (slot1Based: number): string => {
    const idx = slot1Based - 1;
    const isBlankPad = idx >= ctx.pageHtmlList.length;
    const pageHtml = isBlankPad ? '' : ctx.pageHtmlList[idx] || '';
    const isOddPage = slot1Based % 2 === 1;
    const effMargins = getEffectivePageMargins(
      idx,
      ctx.margins,
      ctx.mirrorMargins,
      ctx.innerMarginMm,
      ctx.outerMarginMm
    );

    const isChapterOpening =
      !isBlankPad &&
      (pageHtml.includes('mps-chapter-start') ||
        pageHtml.includes('data-chapter-start="true"'));
    const omitHeaderFooter = isBlankPad || (ctx.differentFirstPage && idx === 0);
    const omitTopForChapter = ctx.hideHeaderOnChapterPages && isChapterOpening;
    const pageLabel = formatPageNumberLabel(
      slot1Based,
      actualPages,
      ctx.pageNumberFormat
    );

    const resolvedHeaderText = ctx.useOddEvenHeaders
      ? isOddPage
        ? ctx.oddHeaderText
        : ctx.evenHeaderText
      : ctx.showHeaderFooter
        ? ctx.headerText
        : '';

    const showTopRow =
      !omitHeaderFooter &&
      !omitTopForChapter &&
      (ctx.showHeaderFooter ||
        ctx.useOddEvenHeaders ||
        (ctx.showPageNumbers && ctx.pageNumberPosition === 'top'));

    const showBottomRow =
      !omitHeaderFooter &&
      (ctx.showHeaderFooter ||
        (ctx.showPageNumbers && ctx.pageNumberPosition === 'bottom'));

    const resolvedNumberAlign: 'left' | 'center' | 'right' =
      ctx.pageNumberAlign === 'outer'
        ? isOddPage
          ? 'right'
          : 'left'
        : ctx.pageNumberAlign;

    return `
      <div class="booklet-half" style="padding: ${effMargins.top}mm ${effMargins.right}mm ${effMargins.bottom}mm ${effMargins.left}mm;">
        <div class="page-border-frame">
          ${
            showTopRow
              ? `<div class="page-header-row" style="justify-content: ${
                  ctx.useOddEvenHeaders
                    ? isOddPage
                      ? 'flex-end'
                      : 'flex-start'
                    : 'space-between'
                };">
                  <span>${resolvedHeaderText}</span>
                  ${
                    ctx.showPageNumbers && ctx.pageNumberPosition === 'top'
                      ? `<span>${pageLabel}</span>`
                      : ''
                  }
                </div>`
              : ''
          }
          <div class="page-body-content">${pageHtml}</div>
          ${
            showBottomRow
              ? `<div class="page-footer-row" style="justify-content: ${
                  !ctx.showHeaderFooter && resolvedNumberAlign === 'center'
                    ? 'center'
                    : !ctx.showHeaderFooter && resolvedNumberAlign === 'left'
                      ? 'flex-start'
                      : !ctx.showHeaderFooter && resolvedNumberAlign === 'right'
                        ? 'flex-end'
                        : 'space-between'
                };">
                  ${
                    ctx.showPageNumbers &&
                    ctx.pageNumberPosition === 'bottom' &&
                    resolvedNumberAlign === 'left'
                      ? `<span>${pageLabel}</span>${
                          ctx.showHeaderFooter ? `<span>${ctx.footerText}</span>` : ''
                        }`
                      : `${
                          ctx.showHeaderFooter ? `<span>${ctx.footerText}</span>` : ''
                        }${
                          ctx.showPageNumbers && ctx.pageNumberPosition === 'bottom'
                            ? `<span>${pageLabel}</span>`
                            : ''
                        }`
                  }
                </div>`
              : ''
          }
        </div>
      </div>`;
  };

  const spreadsMarkup: string[] = [];
  for (let s = 0; s < signatureSheets; s++) {
    const frontLeft = totalSlots - 2 * s;
    const frontRight = 2 * s + 1;
    const backLeft = 2 * s + 2;
    const backRight = totalSlots - 2 * s - 1;

    spreadsMarkup.push(`
      <div class="a4-booklet-sheet" data-sheet="Sheet ${s + 1} Front">
        ${renderHalfPage(frontLeft)}
        <div class="fold-line"></div>
        ${renderHalfPage(frontRight)}
      </div>
      <div class="a4-booklet-sheet" data-sheet="Sheet ${s + 1} Back">
        ${renderHalfPage(backLeft)}
        <div class="fold-line"></div>
        ${renderHalfPage(backRight)}
      </div>
    `);
  }

  return `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8" />
  <title>${ctx.docTitle || 'Malayalam Booklet'} — 2-Up A5 Booklet (A4 Landscape)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Anek+Malayalam:wght@400;600;700;800&family=Baloo+Chettan+2:wght@500;700;800&family=Chilanka&family=Gayathri:wght@400;700&family=Manjari:wght@400;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&family=Noto+Serif+Malayalam:wght@400;500;600;700&family=Tiro+Malayalam:ital@0;1&display=swap" rel="stylesheet" />
  <style>
    @page {
      size: A4 landscape;
      margin: 0mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #E8EAED;
      font-family: ${ctx.activeFontCssFamily};
      color: #111827;
    }
    .booklet-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 16px 0;
    }
    .a4-booklet-sheet {
      position: relative;
      display: flex;
      flex-direction: row;
      width: 297mm;
      height: 210mm;
      background: ${bgHex};
      box-shadow: 0 2px 10px rgba(0,0,0,0.14);
      overflow: hidden;
      page-break-after: always;
      break-after: page;
    }
    .a4-booklet-sheet:last-child {
      page-break-after: auto;
      break-after: auto;
    }
    .booklet-half {
      width: 148.5mm;
      height: 210mm;
      overflow: hidden;
      position: relative;
    }
    .fold-line {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 148.5mm;
      width: 0;
      border-left: 0.4pt dashed rgba(156, 163, 175, 0.45);
      pointer-events: none;
    }
    .page-border-frame {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      ${borderCss}
    }
    .page-header-row {
      display: flex;
      align-items: center;
      font-size: 8.5pt;
      color: #4B5563;
      border-bottom: 0.5pt solid #D1D5DB;
      padding-bottom: 1.5mm;
      margin-bottom: 3mm;
      flex-shrink: 0;
    }
    .page-footer-row {
      display: flex;
      align-items: center;
      font-size: 8.5pt;
      color: #4B5563;
      border-top: 0.5pt solid #D1D5DB;
      padding-top: 1.5mm;
      margin-top: 3mm;
      flex-shrink: 0;
    }
    .page-body-content {
      flex: 1;
      overflow: hidden;
      line-height: ${ctx.lineSpacing};
      letter-spacing: ${ctx.letterSpacing};
    }
    .page-body-content p {
      margin-top: 0;
      margin-bottom: ${ctx.paragraphGapPt}pt;
      ${ctx.firstLineIndent ? 'text-indent: 6mm;' : ''}
    }
    .page-body-content p.mps-no-indent,
    .page-body-content .mps-no-indent p,
    .page-body-content .mps-chapter-start p,
    .page-body-content p[style*="text-align: center"],
    .page-body-content p[style*="text-align: right"] {
      text-indent: 0 !important;
    }
    .page-body-content table:not(.mps-toc-table) {
      width: 100%;
      border-collapse: collapse;
      margin: 0.6em 0;
    }
    .page-body-content table:not(.mps-toc-table) th,
    .page-body-content table:not(.mps-toc-table) td {
      border: 1pt solid #374151;
      padding: 4px 6px;
    }
    .page-body-content table.mps-toc-table {
      width: 100%;
      border-collapse: collapse;
      border: none;
    }
    .page-body-content table.mps-toc-table td {
      border: none;
    }
    @media print {
      html, body {
        background: #FFFFFF !important;
      }
      .booklet-wrapper {
        display: block;
        padding: 0;
      }
      .a4-booklet-sheet {
        box-shadow: none !important;
        margin: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="booklet-wrapper">
    ${spreadsMarkup.join('\n')}
  </div>
  ${
    autoPrintOnLoad
      ? `<script>
          window.onload = function() {
            if (document.fonts && document.fonts.ready) {
              document.fonts.ready.then(function() {
                setTimeout(function() { window.print(); }, 250);
              });
            } else {
              setTimeout(function() { window.print(); }, 400);
            }
          };
        </script>`
      : ''
  }
</body>
</html>`;
}

/**
 * Prints the 2-Up A5 Booklet Imposition on A4 Landscape using a clean hidden iframe
 * so the main 1-Up editor layout remains untouched.
 */
export async function printBookletImpositionPdf(
  ctx: ExportDocumentContext
): Promise<void> {
  const html = buildBookletImpositionHtmlString(ctx, false);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc || !iframe.contentWindow) {
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  const trigger = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      window.setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 4000);
    }
  };

  if (iframeDoc.fonts && iframeDoc.fonts.ready) {
    iframeDoc.fonts.ready.then(() => window.setTimeout(trigger, 250));
  } else {
    window.setTimeout(trigger, 450);
  }
}

/**
 * Downloads the standalone 2-Up A5 Booklet Imposition (.html) ready for A4 Landscape double-sided printing.
 */
export function exportBookletImpositionHtml(ctx: ExportDocumentContext): void {
  const html = buildBookletImpositionHtmlString(ctx, true);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const safeName =
    (ctx.docTitle || 'malayalam-booklet')
      .trim()
      .replace(/[^\u0D00-\u0D7Fa-zA-Z0-9-_ ]/g, '')
      .replace(/\s+/g, '-') || 'malayalam-booklet';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}-a5-booklet-2up-a4.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Triggers native vector PDF print via `window.print()` after fonts are ready
 * (used when Print Layout split pages are mounted on screen).
 */
export async function printVectorPdfDocument(): Promise<void> {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }
  window.print();
}

/**
 * Prints the full paginated A5/A4/Demy vector PDF via a clean hidden iframe
 * (used when Print Layout is OFF / Pageless Mode so exported PDFs always
 * render with exact physical page sizes, closed borders, mirror margins, and headers/footers).
 */
export async function printPaginatedHtmlDocument(
  ctx: ExportDocumentContext
): Promise<void> {
  const html = buildCleanPrintableHtmlString(ctx, false);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc || !iframe.contentWindow) {
    document.body.removeChild(iframe);
    await printVectorPdfDocument();
    return;
  }

  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();

  const trigger = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } finally {
      window.setTimeout(() => {
        if (iframe.parentNode) {
          iframe.parentNode.removeChild(iframe);
        }
      }, 4000);
    }
  };

  if (iframeDoc.fonts && iframeDoc.fonts.ready) {
    iframeDoc.fonts.ready.then(() => window.setTimeout(trigger, 250));
  } else {
    window.setTimeout(trigger, 450);
  }
}

/**
 * Downloads a standalone printable `.html` file that opens the PDF print dialog automatically.
 */
export function exportStandalonePrintableHtml(ctx: ExportDocumentContext): void {
  const html = buildCleanPrintableHtmlString(ctx, true);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const safeName =
    (ctx.docTitle || 'malayalam-document')
      .trim()
      .replace(/[^\u0D00-\u0D7Fa-zA-Z0-9-_ ]/g, '')
      .replace(/\s+/g, '-') || 'malayalam-document';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeName}-print.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Builds a real Microsoft Word `.docx` Blob (via `window.htmlDocx.asBlob`) with a reliable Word HTML fallback.
 */
export function buildWordDocxHtmlAndBlob(
  ctx: ExportDocumentContext,
  combinedLogicalHtml: string
): { blob: Blob; filename: string } {
  const rawW =
    ctx.paperSize === 'Custom'
      ? ctx.customWidthMm
      : PAPER_SIZES[ctx.paperSize].widthMm;
  const rawH =
    ctx.paperSize === 'Custom'
      ? ctx.customHeightMm
      : PAPER_SIZES[ctx.paperSize].heightMm;

  const finalWidthMm = ctx.orientation === 'portrait' ? rawW : rawH;
  const finalHeightMm = ctx.orientation === 'portrait' ? rawH : rawW;

  const mmToTwips = (mm: number) => Math.round(mm * 56.6929);

  const wordHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${ctx.docTitle || 'Malayalam Document'}</title>
  <style>
    @page WordSection1 {
      size: ${finalWidthMm}mm ${finalHeightMm}mm;
      mso-page-orientation: ${ctx.orientation};
      margin: ${ctx.margins.top}mm ${ctx.margins.right}mm ${ctx.margins.bottom}mm ${ctx.margins.left}mm;
    }
    div.WordSection1 {
      page: WordSection1;
      font-family: ${ctx.activeFontCssFamily};
      line-height: ${ctx.lineSpacing};
      color: #111827;
    }
    p {
      margin-top: 0pt;
      margin-bottom: ${ctx.spaceAfterParagraph ? '8pt' : '2pt'};
      line-height: ${ctx.lineSpacing};
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8pt 0;
    }
    th, td {
      border: 1pt solid #374151;
      padding: 5pt 8pt;
    }
    th {
      background-color: #F3F4F6;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="WordSection1">
    ${
      ctx.showHeaderFooter && ctx.headerText
        ? `<p style="font-size: 9pt; color: #6B7280; border-bottom: 1pt solid #E5E7EB; padding-bottom: 4pt; margin-bottom: 10pt;">${ctx.headerText}</p>`
        : ''
    }
    ${combinedLogicalHtml}
    ${
      ctx.showHeaderFooter && ctx.footerText
        ? `<p style="font-size: 9pt; color: #6B7280; border-top: 1pt solid #E5E7EB; padding-top: 4pt; margin-top: 12pt;">${ctx.footerText}</p>`
        : ''
    }
  </div>
</body>
</html>`;

  const safeBase =
    (ctx.docTitle || 'malayalam-document')
      .trim()
      .replace(/[^\u0D00-\u0D7Fa-zA-Z0-9-_ ]/g, '')
      .replace(/\s+/g, '-') || 'malayalam-document';

  if (typeof window !== 'undefined' && window.htmlDocx && typeof window.htmlDocx.asBlob === 'function') {
    try {
      const docxBlob = window.htmlDocx.asBlob(wordHtml, {
        orientation: ctx.orientation,
        margins: {
          top: mmToTwips(ctx.margins.top),
          right: mmToTwips(ctx.margins.right),
          bottom: mmToTwips(ctx.margins.bottom),
          left: mmToTwips(ctx.margins.left),
        },
      });
      return { blob: docxBlob, filename: `${safeBase}.docx` };
    } catch {
      // Fall through to Word HTML blob
    }
  }

  const fallbackBlob = new Blob(['\ufeff', wordHtml], {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  return { blob: fallbackBlob, filename: `${safeBase}.docx` };
}

/**
 * Converts the current document into a `.docx` file and immediately triggers native Web Share API
 * (`navigator.share({ files: [docxFile] })`) on mobile, or downloads the `.docx` file directly.
 */
export async function shareOrDownloadWordDocx(
  ctx: ExportDocumentContext,
  combinedLogicalHtml: string,
  preferShareSheet: boolean
): Promise<'shared' | 'downloaded'> {
  const { blob, filename } = buildWordDocxHtmlAndBlob(ctx, combinedLogicalHtml);

  if (preferShareSheet && typeof navigator !== 'undefined' && navigator.share) {
    try {
      const file = new File([blob], filename, {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      if (!navigator.canShare || navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: ctx.docTitle || 'Malayalam Document',
          text: `${ctx.docTitle || 'Malayalam Document'} (.docx)`,
          files: [file],
        });
        return 'shared';
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return 'shared';
      }
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return 'downloaded';
}

/**
 * Exports the editable `.mps` JSON draft file for saving/re-opening projects.
 */
export function exportEditableDraftMps(state: SavedProjectState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
  const safeBase =
    (state.docTitle || 'malayalam-draft')
      .trim()
      .replace(/[^\u0D00-\u0D7Fa-zA-Z0-9-_ ]/g, '')
      .replace(/\s+/g, '-') || 'malayalam-draft';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safeBase}.mps`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

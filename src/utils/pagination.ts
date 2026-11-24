import {
  MarginPresetKey,
  MarginsMm,
  Orientation,
  PageNumberPosition,
  PaperSizeKey,
} from '../types';
import { MARGIN_PRESETS, PAPER_SIZES } from '../constants/fonts';

const MM_TO_PX = 3.7795275591;

export interface PaginationConfig {
  paperSize: PaperSizeKey;
  customWidthMm: number;
  customHeightMm: number;
  orientation: Orientation;
  marginPreset: MarginPresetKey;
  customMargins: MarginsMm;
  showHeaderFooter: boolean;
  useOddEvenHeaders?: boolean;
  hideHeaderOnChapterPages?: boolean;
  showPageNumbers: boolean;
  pageNumberPosition: PageNumberPosition;
  differentFirstPage: boolean;
  hasPageBorder: boolean;
  pageBorderPaddingMm: number;
}

/**
 * Calculates the exact usable inner text height of a page in CSS pixels:
 * usableHeight = pageHeightPx - topMarginPx - bottomMarginPx - headerHeightPx - footerHeightPx - borderPaddingPx - 14px (safety buffer)
 */
export function calculateUsablePageHeightPx(
  config: PaginationConfig,
  pageIndex: number,
  isChapterOpeningPage = false
): number {
  const rawW =
    config.paperSize === 'Custom'
      ? config.customWidthMm
      : PAPER_SIZES[config.paperSize].widthMm;
  const rawH =
    config.paperSize === 'Custom'
      ? config.customHeightMm
      : PAPER_SIZES[config.paperSize].heightMm;
  const pageHeightMm = config.orientation === 'portrait' ? rawH : rawW;

  const activeMargins =
    config.marginPreset === 'custom'
      ? config.customMargins
      : MARGIN_PRESETS[config.marginPreset].margins;

  const pageHeightPx = pageHeightMm * MM_TO_PX;
  const topMarginPx = activeMargins.top * MM_TO_PX;
  const bottomMarginPx = activeMargins.bottom * MM_TO_PX;

  const isFirstPageOmitted = config.differentFirstPage && pageIndex === 0;
  const omitTopForChapter =
    Boolean(config.hideHeaderOnChapterPages) && isChapterOpeningPage;

  const hasTopBar =
    !isFirstPageOmitted &&
    !omitTopForChapter &&
    (config.showHeaderFooter ||
      Boolean(config.useOddEvenHeaders) ||
      (config.showPageNumbers && config.pageNumberPosition === 'top'));
  const hasBottomBar =
    !isFirstPageOmitted &&
    (config.showHeaderFooter ||
      (config.showPageNumbers && config.pageNumberPosition === 'bottom'));

  // Strict fixed header/footer bar height (24px bar + 6px spacing = 30px)
  // so 1-digit (9) -> 2-digit (10) page numbers NEVER alter usable height
  const headerHeightPx = hasTopBar ? 30 : 0;
  const footerHeightPx = hasBottomBar ? 30 : 0;
  const borderPaddingPx = config.hasPageBorder
    ? config.pageBorderPaddingMm * 2 * MM_TO_PX
    : 0;
  const safetyBufferPx = 14;

  const usable =
    pageHeightPx -
    topMarginPx -
    bottomMarginPx -
    headerHeightPx -
    footerHeightPx -
    borderPaddingPx -
    safetyBufferPx;

  return Math.max(120, Math.floor(usable));
}

/**
 * Measures whether a `.page-content-editable` element overflows its usable height.
 * Compares both scrollHeight and the last child's bottom bounding box against the container bottom.
 */
export function doesPageContentOverflow(
  pageEl: HTMLDivElement,
  usableHeightPx: number
): boolean {
  const maxAllowedHeight = Math.min(usableHeightPx, pageEl.clientHeight || usableHeightPx);

  if (pageEl.scrollHeight > maxAllowedHeight + 1) {
    return true;
  }

  const lastEl = pageEl.lastElementChild as HTMLElement | null;
  if (lastEl) {
    const pageRect = pageEl.getBoundingClientRect();
    const lastRect = lastEl.getBoundingClientRect();
    const scale = pageEl.offsetWidth > 0 ? pageRect.width / pageEl.offsetWidth : 1;
    const relativeBottom = (lastRect.bottom - pageRect.top) / (scale || 1);
    if (relativeBottom > maxAllowedHeight - 2) {
      return true;
    }
  }

  return false;
}

/**
 * Recursively collects all non-empty text nodes inside an element in document order.
 */
function getTextNodesIn(node: Node): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, null);
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current as Text);
    current = walker.nextNode();
  }
  return textNodes;
}

interface WordToken {
  textNode: Text;
  startOffset: number;
  endOffset: number;
}

/**
 * Collects all word boundaries across all text nodes inside a block element
 * so binary search can find the exact word where a paragraph overflows the page bottom.
 */
function collectWordTokens(blockEl: HTMLElement): WordToken[] {
  const textNodes = getTextNodesIn(blockEl);
  const tokens: WordToken[] = [];
  for (const textNode of textNodes) {
    const text = textNode.nodeValue || '';
    const regex = /\S+\s*/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      tokens.push({
        textNode,
        startOffset: match.index,
        endOffset: match.index + match[0].length,
      });
    }
  }
  return tokens;
}

/**
 * Clones a block element and keeps only the content from `0` to `keepUpToTokenCount`.
 * Preserves inline formatting tags (`<b>`, `<span>`, `<font>`, etc.) and Malayalam complex script clusters.
 */
function sliceBlockByWordTokens(
  blockEl: HTMLElement,
  tokens: WordToken[],
  keepUpToTokenCount: number
): { headEl: HTMLElement; tailEl: HTMLElement } | null {
  if (keepUpToTokenCount <= 0 || keepUpToTokenCount >= tokens.length) {
    return null;
  }

  const splitToken = tokens[keepUpToTokenCount];
  const allTextNodes = getTextNodesIn(blockEl);
  const targetNodeIndex = allTextNodes.indexOf(splitToken.textNode);
  if (targetNodeIndex === -1) return null;

  const headEl = blockEl.cloneNode(true) as HTMLElement;
  const tailEl = blockEl.cloneNode(true) as HTMLElement;

  const headTextNodes = getTextNodesIn(headEl);
  const tailTextNodes = getTextNodesIn(tailEl);

  if (
    headTextNodes.length !== allTextNodes.length ||
    tailTextNodes.length !== allTextNodes.length
  ) {
    return null;
  }

  for (let i = 0; i < headTextNodes.length; i++) {
    if (i < targetNodeIndex) {
      tailTextNodes[i].nodeValue = '';
    } else if (i === targetNodeIndex) {
      const fullVal = allTextNodes[i].nodeValue || '';
      headTextNodes[i].nodeValue = fullVal.slice(0, splitToken.startOffset).trimEnd();
      tailTextNodes[i].nodeValue = fullVal.slice(splitToken.startOffset);
    } else {
      headTextNodes[i].nodeValue = '';
    }
  }

  tailEl.setAttribute('data-split-continuation', 'true');
  return { headEl, tailEl };
}

/**
 * Splits a single overflowing paragraph/block (`<p>`, `<div>`, `<li>`, `<blockquote>`) at the exact word
 * boundary so that the first part fits strictly within `usableHeightPx` on `pageEl`, and returns the
 * continuation element to be prepended to the top of `nextPageEl`.
 */
export function splitBlockAtExactWordBoundary(
  pageEl: HTMLDivElement,
  blockEl: HTMLElement,
  usableHeightPx: number
): HTMLElement | null {
  const tagName = blockEl.tagName.toUpperCase();
  const splittableTags = new Set(['P', 'DIV', 'LI', 'BLOCKQUOTE']);
  if (!splittableTags.has(tagName)) {
    return null;
  }
  if (blockEl.querySelector('table, img, hr, svg')) {
    return null;
  }

  const tokens = collectWordTokens(blockEl);
  if (tokens.length < 4) {
    return null;
  }

  const originalHtml = blockEl.innerHTML;

  let low = 1;
  let high = tokens.length - 1;
  let bestCount = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const sliced = sliceBlockByWordTokens(blockEl, tokens, mid);
    if (!sliced) break;

    blockEl.innerHTML = sliced.headEl.innerHTML;
    const stillOverflows = doesPageContentOverflow(pageEl, usableHeightPx);
    blockEl.innerHTML = originalHtml;

    if (!stillOverflows) {
      bestCount = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  if (bestCount <= 0 || bestCount >= tokens.length) {
    blockEl.innerHTML = originalHtml;
    return null;
  }

  const finalSliced = sliceBlockByWordTokens(blockEl, tokens, bestCount);
  if (!finalSliced) {
    blockEl.innerHTML = originalHtml;
    return null;
  }

  blockEl.innerHTML = finalSliced.headEl.innerHTML;
  return finalSliced.tailEl;
}

export interface LogicalCaretBookmark {
  globalCharOffset: number;
}

/**
 * Saves the current caret offset as a global character index across all pages.
 */
export function saveLogicalCaretPosition(
  pageEls: (HTMLDivElement | null)[]
): LogicalCaretBookmark | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);

  let accumulatedChars = 0;
  for (const pageEl of pageEls) {
    if (!pageEl) continue;
    if (pageEl.contains(range.startContainer)) {
      const preRange = document.createRange();
      preRange.selectNodeContents(pageEl);
      preRange.setEnd(range.startContainer, range.startOffset);
      accumulatedChars += preRange.toString().length;
      return { globalCharOffset: accumulatedChars };
    } else {
      accumulatedChars += (pageEl.innerText || '').length;
    }
  }
  return null;
}

/**
 * Restores the caret to the exact global character offset across `.page-content-editable` elements.
 */
export function restoreLogicalCaretPosition(
  pageEls: (HTMLDivElement | null)[],
  bookmark: LogicalCaretBookmark | null
): void {
  if (!bookmark) return;
  let remaining = bookmark.globalCharOffset;

  for (const pageEl of pageEls) {
    if (!pageEl) continue;
    const walker = document.createTreeWalker(pageEl, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode() as Text | null;
    while (node) {
      const len = node.nodeValue?.length || 0;
      if (remaining <= len) {
        try {
          const sel = window.getSelection();
          if (sel) {
            const range = document.createRange();
            range.setStart(node, Math.max(0, remaining));
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          }
        } catch {
          // Ignore invalid range offset edge cases
        }
        return;
      }
      remaining -= len;
      node = walker.nextNode() as Text | null;
    }
  }
}

/**
 * Runs a full zero-cutoff pagination pass across all active `.page-content-editable` elements:
 * 1. Pushes or splits overflowing paragraphs from Page N to Page N+1 so words NEVER clip at the bottom.
 * 2. Pulls blocks up from Page N+1 to Page N when space opens up after deleting text.
 * 3. Preserves and restores the exact caret position across page splits.
 */
export function runZeroCutoffPaginationPass(
  pageEls: (HTMLDivElement | null)[],
  currentPageCount: number,
  config: PaginationConfig,
  isComposing: boolean
): { neededPageCount: number; didMutateDom: boolean } {
  if (isComposing) {
    return { neededPageCount: currentPageCount, didMutateDom: false };
  }

  let didMutateDom = false;
  let neededPageCount = currentPageCount;

  const activeEl = document.activeElement;
  const isEditorFocused = pageEls.some((el) => el && (el === activeEl || el.contains(activeEl)));
  const caretBookmark = isEditorFocused ? saveLogicalCaretPosition(pageEls) : null;

  // Normalize bare top-level text nodes into <p> tags so every child is measurable
  for (let i = 0; i < currentPageCount; i++) {
    const pageEl = pageEls[i];
    if (!pageEl) continue;
    const childNodes = Array.from(pageEl.childNodes);
    for (const node of childNodes) {
      if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim().length > 0) {
        const p = document.createElement('p');
        p.textContent = node.textContent;
        pageEl.replaceChild(p, node);
        didMutateDom = true;
      }
    }
  }

  // PASS 1: Forward overflow pass (push/split blocks from Page i to Page i+1)
  for (let i = 0; i < currentPageCount; i++) {
    const pageEl = pageEls[i];
    if (!pageEl) continue;

    // If a .mps-chapter-start, .mps-page-break, or .mps-blank-page-marker appears on this page,
    // handle explicit page boundaries cleanly
    const directChildren = Array.from(pageEl.children) as HTMLElement[];
    const explicitBreakIdx = directChildren.findIndex(
      (child, idx) =>
        (idx > 0 &&
          (child.classList.contains('mps-chapter-start') ||
            child.getAttribute('data-chapter-start') === 'true')) ||
        child.classList.contains('mps-page-break') ||
        child.classList.contains('mps-blank-page-marker')
    );
    if (explicitBreakIdx >= 0) {
      const breakEl = directChildren[explicitBreakIdx];
      const isManualBreak = breakEl.classList.contains('mps-page-break');
      const isBlankPageBreak = breakEl.classList.contains('mps-blank-page-marker');
      const startMoveIdx =
        isManualBreak || isBlankPageBreak ? explicitBreakIdx + 1 : explicitBreakIdx;
      const toMove = directChildren.slice(startMoveIdx);
      const nextPageEl = pageEls[i + 1];

      if (isBlankPageBreak) {
        // Reserve nextPageEl as an intentional blank page and move subsequent content to i+2
        const afterBlankEl = pageEls[i + 2];
        if (!nextPageEl || (toMove.length > 0 && !afterBlankEl)) {
          neededPageCount = Math.max(neededPageCount, toMove.length > 0 ? i + 3 : i + 2);
        } else {
          breakEl.remove();
          nextPageEl.innerHTML =
            '<div class="mps-blank-page-keeper" data-blank-page="true" contenteditable="false"></div>';
          if (toMove.length > 0 && afterBlankEl) {
            for (let m = toMove.length - 1; m >= 0; m--) {
              afterBlankEl.insertBefore(toMove[m], afterBlankEl.firstChild);
            }
          }
          didMutateDom = true;
        }
      } else {
        if (isManualBreak) {
          breakEl.remove();
          didMutateDom = true;
        }
        if (toMove.length > 0) {
          if (!nextPageEl) {
            neededPageCount = Math.max(neededPageCount, i + 2);
          } else {
            for (let m = toMove.length - 1; m >= 0; m--) {
              nextPageEl.insertBefore(toMove[m], nextPageEl.firstChild);
            }
            didMutateDom = true;
          }
        }
      }
    }

    const isChapterOpening = Boolean(
      pageEl.querySelector('.mps-chapter-start, [data-chapter-start="true"]')
    );
    const usableHeightPx = calculateUsablePageHeightPx(config, i, isChapterOpening);

    let guard = 0;
    while (doesPageContentOverflow(pageEl, usableHeightPx) && guard < 60) {
      guard++;
      const children = Array.from(pageEl.children) as HTMLElement[];
      if (children.length === 0) break;

      const nextPageEl = pageEls[i + 1];
      if (!nextPageEl) {
        neededPageCount = Math.max(neededPageCount, i + 2);
        break;
      }

      const lastChild = children[children.length - 1];

      // Try splitting the last block at the exact word boundary first
      const tailContinuation = splitBlockAtExactWordBoundary(pageEl, lastChild, usableHeightPx);
      if (tailContinuation) {
        const firstNextChild = nextPageEl.firstElementChild as HTMLElement | null;
        if (
          firstNextChild &&
          firstNextChild.getAttribute('data-split-continuation') === 'true' &&
          firstNextChild.tagName === tailContinuation.tagName
        ) {
          firstNextChild.innerHTML =
            tailContinuation.innerHTML.trimEnd() + ' ' + firstNextChild.innerHTML.trimStart();
        } else {
          nextPageEl.insertBefore(tailContinuation, nextPageEl.firstChild);
        }
        didMutateDom = true;
        continue;
      }

      if (children.length > 1) {
        nextPageEl.insertBefore(lastChild, nextPageEl.firstChild);
        didMutateDom = true;
      } else {
        break;
      }
    }
  }

  // PASS 2: Backward pull-up pass (when text is deleted on Page i, pull content back from Page i+1)
  for (let i = 0; i < currentPageCount - 1; i++) {
    const pageEl = pageEls[i];
    const nextPageEl = pageEls[i + 1];
    if (!pageEl || !nextPageEl) continue;

    const isChapterOpening = Boolean(
      pageEl.querySelector('.mps-chapter-start, [data-chapter-start="true"]')
    );
    const usableHeightPx = calculateUsablePageHeightPx(config, i, isChapterOpening);

    let guard = 0;
    while (nextPageEl.children.length > 0 && guard < 40) {
      guard++;
      const firstOfNext = nextPageEl.firstElementChild as HTMLElement | null;
      if (!firstOfNext) break;

      const lastOfCurrent = pageEl.lastElementChild as HTMLElement | null;
      const isNextChapterStart =
        firstOfNext.classList.contains('mps-chapter-start') ||
        firstOfNext.getAttribute('data-chapter-start') === 'true';

      const isExplicitBlank =
        Boolean(pageEl.querySelector('[data-blank-page="true"]')) ||
        Boolean(nextPageEl.querySelector('[data-blank-page="true"]'));

      if (
        isNextChapterStart ||
        isExplicitBlank ||
        (lastOfCurrent &&
          (lastOfCurrent.classList.contains('mps-page-break') ||
            firstOfNext.classList.contains('mps-page-break') ||
            firstOfNext.classList.contains('mps-blank-page-marker')))
      ) {
        break;
      }

      pageEl.appendChild(firstOfNext);

      // Hysteresis buffer (8px): only pull a block back up from Page i+1 if it fits
      // comfortably with at least 8px spare clearance, preventing 9 -> 10 -> 9 -> 10 ping-ponging
      const pullUpThresholdPx = Math.max(100, usableHeightPx - 8);
      if (!doesPageContentOverflow(pageEl, pullUpThresholdPx)) {
        if (
          firstOfNext.getAttribute('data-split-continuation') === 'true' &&
          lastOfCurrent &&
          lastOfCurrent.tagName === firstOfNext.tagName &&
          !lastOfCurrent.querySelector('table, img, hr')
        ) {
          lastOfCurrent.innerHTML =
            lastOfCurrent.innerHTML.trimEnd() + ' ' + firstOfNext.innerHTML.trimStart();
          pageEl.removeChild(firstOfNext);
        } else {
          firstOfNext.removeAttribute('data-split-continuation');
        }
        didMutateDom = true;
      } else {
        const remainder = splitBlockAtExactWordBoundary(
          pageEl,
          firstOfNext,
          pullUpThresholdPx
        );
        if (remainder) {
          firstOfNext.removeAttribute('data-split-continuation');
          nextPageEl.insertBefore(remainder, nextPageEl.firstChild);
          didMutateDom = true;
        } else {
          nextPageEl.insertBefore(firstOfNext, nextPageEl.firstChild);
        }
        break;
      }
    }
  }

  while (neededPageCount > 1) {
    const lastEl = pageEls[neededPageCount - 1];
    if (!lastEl) break;
    const text = (lastEl.innerText || '').trim();
    const hasMedia = Boolean(
      lastEl.querySelector('img, table, hr, svg, [data-blank-page="true"]')
    );
    if (text.length === 0 && !hasMedia) {
      neededPageCount--;
    } else {
      break;
    }
  }

  if (didMutateDom && isEditorFocused && caretBookmark) {
    restoreLogicalCaretPosition(pageEls, caretBookmark);
  }

  return { neededPageCount, didMutateDom };
}

export interface OffscreenPaginationStyleOptions {
  activeFontCssFamily: string;
  lineSpacing: string;
  letterSpacing: string;
  firstLineIndent: boolean;
  paragraphGapPt: number;
  columnCount: 1 | 2 | 3;
  mirrorMargins: boolean;
  innerMarginMm: number;
  outerMarginMm: number;
}

/**
 * Splits a continuous HTML string (from Pageless Mode) into exact A5/A4/Demy paginated
 * HTML page strings offscreen so PDF / Standalone HTML / Booklet exports ALWAYS use
 * the selected physical paper size regardless of whether Print Layout view is ON or OFF.
 */
export function paginateHtmlOffscreen(
  combinedHtml: string,
  config: PaginationConfig,
  styleOptions: OffscreenPaginationStyleOptions
): string[] {
  if (typeof document === 'undefined') {
    return [combinedHtml];
  }

  const rawW =
    config.paperSize === 'Custom'
      ? config.customWidthMm
      : PAPER_SIZES[config.paperSize].widthMm;
  const rawH =
    config.paperSize === 'Custom'
      ? config.customHeightMm
      : PAPER_SIZES[config.paperSize].heightMm;
  const finalWidthMm = config.orientation === 'portrait' ? rawW : rawH;
  const activeMargins =
    config.marginPreset === 'custom'
      ? config.customMargins
      : MARGIN_PRESETS[config.marginPreset].margins;

  const horizontalMarginMm = styleOptions.mirrorMargins
    ? styleOptions.innerMarginMm + styleOptions.outerMarginMm
    : activeMargins.left + activeMargins.right;
  const borderPadMm = config.hasPageBorder ? config.pageBorderPaddingMm * 2 : 0;
  const innerWidthPx = Math.max(
    180,
    Math.floor((finalWidthMm - horizontalMarginMm - borderPadMm) * MM_TO_PX)
  );

  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-100000px';
  host.style.top = '0';
  host.style.visibility = 'hidden';
  host.style.pointerEvents = 'none';
  host.style.zIndex = '-1';

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .mps-offscreen-page {
      box-sizing: border-box;
      width: ${innerWidthPx}px;
      font-family: ${styleOptions.activeFontCssFamily};
      font-size: 11.5pt;
      line-height: ${styleOptions.lineSpacing};
      letter-spacing: ${styleOptions.letterSpacing};
      word-break: break-word;
      overflow-wrap: anywhere;
      overflow: hidden;
      ${
        styleOptions.columnCount > 1
          ? `column-count: ${styleOptions.columnCount}; column-gap: 6mm;`
          : ''
      }
    }
    .mps-offscreen-page p {
      margin-top: 0;
      margin-bottom: ${styleOptions.paragraphGapPt}pt;
      ${styleOptions.firstLineIndent ? 'text-indent: 6mm;' : ''}
    }
    .mps-offscreen-page p.mps-no-indent,
    .mps-offscreen-page .mps-no-indent p,
    .mps-offscreen-page .mps-chapter-start p,
    .mps-offscreen-page p[style*="text-align: center"],
    .mps-offscreen-page p[style*="text-align: right"] {
      text-indent: 0 !important;
    }
    .mps-offscreen-page h1 { font-size: 1.65em; font-weight: 700; line-height: 1.3; margin: 0.25em 0 0.35em 0; }
    .mps-offscreen-page h2 { font-size: 1.35em; font-weight: 700; line-height: 1.35; margin: 0.25em 0 0.3em 0; }
    .mps-offscreen-page h3 { font-size: 1.15em; font-weight: 600; line-height: 1.4; margin: 0.2em 0 0.25em 0; }
    .mps-offscreen-page ul, .mps-offscreen-page ol { padding-left: 1.4em; margin: 0.35em 0; }
    .mps-offscreen-page table:not(.mps-toc-table) { width: 100%; border-collapse: collapse; margin: 0.55em 0; }
    .mps-offscreen-page table:not(.mps-toc-table) th, .mps-offscreen-page table:not(.mps-toc-table) td { border: 1pt solid #374151; padding: 5px 8px; }
    .mps-offscreen-page img { max-width: 100%; height: auto; }
    .mps-offscreen-page .mps-callout-box { border: 1pt solid #94A3B8; padding: 10px 14px; margin: 10px 0; border-radius: 6px; }
    .mps-offscreen-page .mps-drop-cap-char { float: left; font-size: 3.1em; line-height: 0.88; font-weight: 700; padding-right: 0.16em; }
    .mps-offscreen-page .mps-footnotes-section { margin-top: 14px; padding-top: 8px; border-top: 0.8pt solid #9CA3AF; font-size: 8.8pt; }
    .mps-offscreen-page figure.mps-figure { margin: 8px 0; max-width: 100%; }
  `;
  host.appendChild(styleTag);
  document.body.appendChild(host);

  try {
    const pages: HTMLDivElement[] = [];
    const createOffscreenPage = (idx: number): HTMLDivElement => {
      const div = document.createElement('div');
      div.className = 'mps-offscreen-page';
      const usableH = calculateUsablePageHeightPx(config, idx, false);
      div.style.height = `${usableH}px`;
      host.appendChild(div);
      return div;
    };

    const first = createOffscreenPage(0);
    first.innerHTML = combinedHtml || '<p><br/></p>';
    pages.push(first);

    // Iteratively allocate & paginate up to 120 pages max
    for (let pass = 0; pass < 120; pass++) {
      const { neededPageCount, didMutateDom } = runZeroCutoffPaginationPass(
        pages,
        pages.length,
        config,
        false
      );

      if (neededPageCount > pages.length) {
        while (pages.length < neededPageCount) {
          pages.push(createOffscreenPage(pages.length));
        }
        continue;
      }

      if (neededPageCount < pages.length) {
        while (pages.length > neededPageCount) {
          const removed = pages.pop();
          removed?.remove();
        }
      }

      if (!didMutateDom) {
        break;
      }
    }

    return pages.map((p) => p.innerHTML);
  } finally {
    host.remove();
  }
}

import {
  CopiedTextFormat,
  OutlineHeadingItem,
  PdfPageRangeMode,
  QuickBlockKey,
} from '../types';

export const SPECIAL_SYMBOLS_PALETTE: Array<{ char: string; label: string }> = [
  { char: '₹', label: 'Rupee' },
  { char: '©', label: 'Copyright' },
  { char: '®', label: 'Registered' },
  { char: '—', label: 'Em Dash' },
  { char: '–', label: 'En Dash' },
  { char: '•', label: 'Bullet' },
  { char: '★', label: 'Star' },
  { char: '❖', label: 'Fleuron' },
  { char: '❦', label: 'Book Leaf' },
  { char: '“ ”', label: 'Double Quotes' },
  { char: '‘ ’', label: 'Single Quotes' },
];

/**
 * Extracts a clickable Document Outline (Table of Contents) from all H1, H2, H3 headings.
 */
export function extractDocumentOutline(
  pageEls: (HTMLDivElement | null)[],
  activeSlots: number
): OutlineHeadingItem[] {
  const items: OutlineHeadingItem[] = [];
  let seq = 1;

  for (let p = 0; p < activeSlots; p++) {
    const pageEl = pageEls[p];
    if (!pageEl) continue;
    const headings = pageEl.querySelectorAll<HTMLElement>('h1, h2, h3');
    headings.forEach((h) => {
      const text = (h.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      let id = h.getAttribute('data-outline-id');
      if (!id) {
        id = `mps-heading-${p}-${seq}`;
        h.setAttribute('data-outline-id', id);
      }
      seq++;
      const tag = h.tagName.toLowerCase();
      const level: 1 | 2 | 3 = tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3;
      items.push({ id, level, text, pageIndex: p });
    });
  }

  return items;
}

/**
 * WPS-Style One-Tap Paste & Spacing Cleaner for Malayalam & English text:
 * - Preserves Malayalam ZWJ (\u200D) and ZWNJ (\u200C) for chillu letters & conjuncts.
 * - Collapses double/multiple spaces & non-breaking spaces.
 * - Fixes broken single <br> mid-sentence line wraps copied from WhatsApp/PDFs.
 * - Removes stacked empty paragraphs and stray spaces before punctuation.
 */
export function cleanMalayalamSpacingAndBreaks(
  pageEls: (HTMLDivElement | null)[],
  activeSlots: number
): { fixedSpaces: number; fixedBreaks: number } {
  let fixedSpaces = 0;
  let fixedBreaks = 0;

  for (let i = 0; i < activeSlots; i++) {
    const pageEl = pageEls[i];
    if (!pageEl) continue;

    // 1. Clean text nodes (double spaces, nbsp, stray space before punctuation)
    const walker = document.createTreeWalker(pageEl, NodeFilter.SHOW_TEXT, null);
    let node = walker.nextNode() as Text | null;
    while (node) {
      const orig = node.nodeValue || '';
      // Replace nbsp and tabs with normal spaces, collapse 2+ spaces, fix space before punctuation
      let cleaned = orig
        .replace(/[\u00A0\t]+/g, ' ')
        .replace(/ {2,}/g, ' ')
        .replace(/ +([,.;:!?])/g, '$1');

      if (cleaned !== orig) {
        fixedSpaces += Math.max(1, orig.length - cleaned.length);
        node.nodeValue = cleaned;
      }
      node = walker.nextNode() as Text | null;
    }

    // 2. Fix broken single <br> line wraps inside paragraphs (common in PDF/WhatsApp pastes)
    const paragraphs = Array.from(pageEl.querySelectorAll<HTMLParagraphElement>('p'));
    paragraphs.forEach((p) => {
      if (
        p.closest('.mps-chapter-start, .mps-quick-block, .mps-footnotes-section, table') ||
        p.style.textAlign === 'center' ||
        p.style.textAlign === 'right'
      ) {
        return;
      }

      const brs = Array.from(p.querySelectorAll('br'));
      brs.forEach((br) => {
        const prev = br.previousSibling;
        const next = br.nextSibling;
        // Skip sole placeholder <p><br/></p>
        if (!prev && !next) return;
        // Skip double <br><br> intentional breaks
        if (
          (next && next.nodeName === 'BR') ||
          (prev && prev.nodeName === 'BR')
        ) {
          return;
        }
        const prevText = (prev?.textContent || '').trimEnd();
        const nextText = (next?.textContent || '').trimStart();
        if (!prevText || !nextText) return;

        // If previous line did not end with terminal punctuation or colon, join smoothly
        if (!/[.!?:\u0964]$/.test(prevText)) {
          const spaceNode = document.createTextNode(' ');
          br.parentNode?.replaceChild(spaceNode, br);
          fixedBreaks++;
        }
      });
    });

    // 3. Remove consecutive redundant empty paragraphs (<p><br></p><p><br></p>)
    let prevWasEmpty = false;
    const directChildren = Array.from(pageEl.children) as HTMLElement[];
    directChildren.forEach((child) => {
      const isPlainEmptyP =
        child.tagName === 'P' &&
        (child.textContent || '').trim().length === 0 &&
        !child.querySelector('img, table, hr, svg');
      if (isPlainEmptyP && prevWasEmpty) {
        child.remove();
        fixedBreaks++;
      } else {
        prevWasEmpty = isPlainEmptyP;
      }
    });
  }

  return { fixedSpaces, fixedBreaks };
}

/**
 * Captures inline typography styles from the current selection for Google Docs Format Painter.
 */
export function captureFormatFromSelection(): CopiedTextFormat | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  const el =
    range.startContainer.nodeType === Node.ELEMENT_NODE
      ? (range.startContainer as HTMLElement)
      : range.startContainer.parentElement;
  if (!el) return null;

  const computed = window.getComputedStyle(el);
  return {
    fontFamily: computed.fontFamily,
    fontSize: computed.fontSize,
    color: computed.color,
    backgroundColor:
      computed.backgroundColor === 'rgba(0, 0, 0, 0)'
        ? 'transparent'
        : computed.backgroundColor,
    fontWeight: computed.fontWeight,
    fontStyle: computed.fontStyle,
    textDecoration: computed.textDecorationLine || 'none',
  };
}

/**
 * Applies a previously captured Format Painter style to the current selection (or closest word/block).
 */
export function applyFormatPainterToSelection(fmt: CopiedTextFormat): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const range = sel.getRangeAt(0);

  const applyStyles = (target: HTMLElement) => {
    target.style.fontFamily = fmt.fontFamily;
    target.style.fontSize = fmt.fontSize;
    target.style.color = fmt.color;
    if (fmt.backgroundColor && fmt.backgroundColor !== 'transparent') {
      target.style.backgroundColor = fmt.backgroundColor;
    }
    target.style.fontWeight = fmt.fontWeight;
    target.style.fontStyle = fmt.fontStyle;
    if (fmt.textDecoration && fmt.textDecoration !== 'none') {
      target.style.textDecoration = fmt.textDecoration;
    }
  };

  if (!range.collapsed) {
    const span = document.createElement('span');
    applyStyles(span);
    try {
      span.appendChild(range.extractContents());
      range.insertNode(span);
      const nextRange = document.createRange();
      nextRange.selectNodeContents(span);
      sel.removeAllRanges();
      sel.addRange(nextRange);
      return true;
    } catch {
      const parent =
        range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
          ? (range.commonAncestorContainer as HTMLElement)
          : range.commonAncestorContainer.parentElement;
      if (parent) {
        applyStyles(parent);
        return true;
      }
      return false;
    }
  }

  // Collapsed caret: apply to closest paragraph/heading/span block
  const anchorEl =
    range.startContainer.nodeType === Node.ELEMENT_NODE
      ? (range.startContainer as HTMLElement)
      : range.startContainer.parentElement;
  const block = anchorEl?.closest('p, h1, h2, h3, li, td, th') as HTMLElement | null;
  if (block) {
    applyStyles(block);
    return true;
  }
  return false;
}

/**
 * Toggles a true Malayalam-aware Book Drop Cap on the current paragraph.
 * Keeps base consonant + virama/conjunct + vowel matra together so Malayalam script never breaks!
 */
export function toggleBookDropCapOnSelection(): 'added' | 'removed' | 'none' {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 'none';
  const node = sel.anchorNode;
  if (!node) return 'none';
  const anchorEl =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as HTMLElement)
      : node.parentElement;
  const para = anchorEl?.closest('p') as HTMLParagraphElement | null;
  if (!para) return 'none';

  // If drop cap already exists, unwrap it cleanly
  const existingDropCap = para.querySelector<HTMLSpanElement>('.mps-drop-cap-char');
  if (existingDropCap) {
    const textNode = document.createTextNode(existingDropCap.textContent || '');
    existingDropCap.replaceWith(textNode);
    para.classList.remove('mps-no-indent');
    para.normalize();
    return 'removed';
  }

  // Find first non-empty text node inside the paragraph
  const walker = document.createTreeWalker(para, NodeFilter.SHOW_TEXT, null);
  let firstTextNode: Text | null = null;
  let current = walker.nextNode() as Text | null;
  while (current) {
    if ((current.nodeValue || '').trim().length > 0) {
      firstTextNode = current;
      break;
    }
    current = walker.nextNode() as Text | null;
  }
  if (!firstTextNode || !firstTextNode.nodeValue) return 'none';

  const raw = firstTextNode.nodeValue;
  const leadingSpaces = raw.match(/^\s*/)?.[0] || '';
  const body = raw.slice(leadingSpaces.length);
  if (!body) return 'none';

  // Match first Malayalam orthographic cluster (consonant + optional virama/ZWJ conjuncts + vowel sign) OR Latin char
  const clusterMatch = body.match(
    /^([\u0D00-\u0D7F](?:[\u0D4D\u200D\u200C][\u0D00-\u0D7F])*[\u0D3E-\u0D4C\u0D57\u0D02\u0D03]?|.)/
  );
  const firstCluster = clusterMatch ? clusterMatch[0] : body.charAt(0);
  const rest = body.slice(firstCluster.length);

  const dropSpan = document.createElement('span');
  dropSpan.className = 'mps-drop-cap-char';
  dropSpan.textContent = firstCluster;

  const parent = firstTextNode.parentNode;
  if (!parent) return 'none';

  const restNode = document.createTextNode(rest);
  parent.insertBefore(dropSpan, firstTextNode);
  parent.insertBefore(restNode, firstTextNode);
  parent.removeChild(firstTextNode);

  para.classList.add('mps-no-indent');
  return 'added';
}

/**
 * Builds HTML for a Styled Callout / Notice Box (all-around hairline border + soft surface).
 */
export function buildCalloutBoxHtml(): string {
  return `
<div class="mps-callout-box mps-no-indent">
  <p class="mps-no-indent" style="font-weight: 700; margin-bottom: 4px;">പ്രധാന അറിയിപ്പ് (Important Notice)</p>
  <p class="mps-no-indent">പ്രധാന വിവരങ്ങളോ പ്രത്യേക കുറിപ്പുകളോ ഇവിടെ എഴുതാവുന്നതാണ്.</p>
</div>
<p><br/></p>
`.trim();
}

/**
 * Builds HTML for Quick Malayalam Print Snippets ("Quick Blocks").
 */
export function buildQuickBlockHtml(key: QuickBlockKey): string {
  if (key === 'signature-block') {
    return `
<div class="mps-quick-block mps-no-indent" style="display: flex; justify-content: space-between; align-items: flex-end; margin: 14px 0 8px 0; padding-top: 8px;">
  <div style="text-align: left; font-size: 10.5pt; line-height: 1.6;">
    <p class="mps-no-indent" style="margin: 0;"><strong>സ്ഥലം:</strong> ....................</p>
    <p class="mps-no-indent" style="margin: 0;"><strong>തീയതി:</strong> ....................</p>
  </div>
  <div style="text-align: right; font-size: 10.5pt; line-height: 1.6;">
    <p class="mps-no-indent" style="margin: 0 0 10px 0;">വിശ്വസ്തതയോടെ,</p>
    <p class="mps-no-indent" style="margin: 0;"><strong>ഒപ്പ് / സെക്രട്ടറി</strong></p>
  </div>
</div>
<p><br/></p>
`.trim();
  }

  if (key === 'agenda-header') {
    return `
<div class="mps-quick-block mps-callout-box mps-no-indent" style="text-align: center;">
  <p class="mps-no-indent" style="font-size: 13pt; font-weight: 700; margin-bottom: 3px;">കാര്യപരിപാടികൾ (Event Agenda)</p>
  <p class="mps-no-indent" style="font-size: 9.5pt; color: #4B5563; margin-bottom: 0;">തീയതി: ................... · സമയം: ................... · വേദി: ...................</p>
</div>
<p><br/></p>
`.trim();
  }

  // chapter-ornament
  return `
<p class="mps-quick-block mps-no-indent" style="text-align: center; font-size: 13pt; letter-spacing: 0.45em; color: #374151; margin: 14px 0;">❖ ❖ ❖</p>
<p><br/></p>
`.trim();
}

/**
 * Parses PDF page range selection into sorted, unique 0-based page indices.
 */
export function resolvePdfPageIndices(
  mode: PdfPageRangeMode,
  customRangeInput: string,
  currentPageIndex: number,
  totalPages: number
): number[] {
  const safeTotal = Math.max(1, totalPages);
  if (mode === 'all') {
    return Array.from({ length: safeTotal }, (_, i) => i);
  }
  if (mode === 'current') {
    const clamped = Math.max(0, Math.min(safeTotal - 1, currentPageIndex));
    return [clamped];
  }

  // Custom range parser e.g. "1-4, 6, 8-10"
  const picked = new Set<number>();
  const parts = customRangeInput.split(',').map((s) => s.trim()).filter(Boolean);
  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const startNum = parseInt(startStr, 10);
      const endNum = parseInt(endStr, 10);
      if (!Number.isNaN(startNum) && !Number.isNaN(endNum)) {
        const lo = Math.max(1, Math.min(startNum, endNum));
        const hi = Math.min(safeTotal, Math.max(startNum, endNum));
        for (let p = lo; p <= hi; p++) {
          picked.add(p - 1);
        }
      }
    } else {
      const single = parseInt(part, 10);
      if (!Number.isNaN(single) && single >= 1 && single <= safeTotal) {
        picked.add(single - 1);
      }
    }
  }

  const sorted = Array.from(picked).sort((a, b) => a - b);
  return sorted.length > 0 ? sorted : Array.from({ length: safeTotal }, (_, i) => i);
}

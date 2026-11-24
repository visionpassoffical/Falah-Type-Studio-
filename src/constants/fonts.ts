import {
  MalayalamFontCategory,
  MalayalamFontOption,
  MarginPresetKey,
  MarginsMm,
  PageBorderStyleKey,
  PaperDimensionsMm,
  PaperSizeKey,
  PaperTintKey,
  ParagraphStyleOption,
} from '../types';

export const STORAGE_KEY = 'malayalam_print_studio_project_v5';

export const MALAYALAM_FONTS: MalayalamFontOption[] = [
  {
    id: 'noto-sans',
    name: 'Noto Sans Malayalam',
    cssFamily: "'Noto Sans Malayalam', sans-serif",
    category: 'Clean Sans-Serif (നോട്ടീസ് / ഓഫീസ്)',
    malayalamSample: 'മലയാളം അച്ചടി — Noto Sans',
    badge: 'Default Clean Print',
    weightsLabel: '400 · 500 · 600 · 700',
  },
  {
    id: 'manjari',
    name: 'Manjari',
    cssFamily: "'Manjari', 'Noto Sans Malayalam', sans-serif",
    category: 'Clean Sans-Serif (നോട്ടീസ് / ഓഫീസ്)',
    malayalamSample: 'മലയാളം അച്ചടി — മഞ്ജരി (Manjari)',
    badge: 'Rounded DTP & Notice',
    weightsLabel: '400 · 700',
  },
  {
    id: 'gayathri',
    name: 'Gayathri',
    cssFamily: "'Gayathri', 'Noto Sans Malayalam', sans-serif",
    category: 'Clean Sans-Serif (നോട്ടീസ് / ഓഫീസ്)',
    malayalamSample: 'മലയാളം അച്ചടി — ഗായത്രി (Gayathri)',
    badge: 'Brochure & Modern',
    weightsLabel: '400 · 700',
  },
  {
    id: 'noto-serif',
    name: 'Noto Serif Malayalam',
    cssFamily: "'Noto Serif Malayalam', 'Noto Sans Malayalam', serif",
    category: 'Book & Literary Serif (പുസ്തകം / സാഹിത്യം)',
    malayalamSample: 'മലയാളം അച്ചടി — Noto Serif',
    badge: 'Book & Formal Serif',
    weightsLabel: '400 · 500 · 600 · 700',
  },
  {
    id: 'tiro-malayalam',
    name: 'Tiro Malayalam',
    cssFamily: "'Tiro Malayalam', 'Noto Serif Malayalam', serif",
    category: 'Book & Literary Serif (പുസ്തകം / സാഹിത്യം)',
    malayalamSample: 'മലയാളം അച്ചടി — തിറോ (Tiro Book)',
    badge: 'Classic Book Publishing',
    weightsLabel: '400 · Italic',
  },
  {
    id: 'baloo-chettan',
    name: 'Baloo Chettan 2',
    cssFamily: "'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif",
    category: 'Poster & Bold Headlines (തലക്കെട്ടുകൾ)',
    malayalamSample: 'മലയാളം അച്ചടി — ബാലു ചേട്ടൻ 2',
    badge: 'Bold Notice Titles',
    weightsLabel: '500 · 700 · 800',
  },
  {
    id: 'anek-malayalam',
    name: 'Anek Malayalam',
    cssFamily: "'Anek Malayalam', 'Noto Sans Malayalam', sans-serif",
    category: 'Poster & Bold Headlines (തലക്കെട്ടുകൾ)',
    malayalamSample: 'മലയാളം അച്ചടി — അനേക് (Anek)',
    badge: 'Poster & Display',
    weightsLabel: '400 · 600 · 700 · 800',
  },
  {
    id: 'chilanka',
    name: 'Chilanka',
    cssFamily: "'Chilanka', 'Noto Sans Malayalam', cursive",
    category: 'Calligraphy & Invitation (ക്ഷണക്കത്ത് / കവിത)',
    malayalamSample: 'മലയാളം അച്ചടി — ചിലങ്ക (Chilanka)',
    badge: 'Invitation & Poetry',
    weightsLabel: '400 Calligraphy',
  },
  {
    id: 'rachana',
    name: 'Rachana',
    cssFamily: "'Rachana', 'Noto Serif Malayalam', serif",
    category: 'Traditional DTP (പഴയ ലിപി / തനിമ)',
    malayalamSample: 'മലയാളം അച്ചടി — രചന (പഴയ ലിപി)',
    badge: 'Traditional Lipi (SMC)',
    weightsLabel: '400 · 700',
    isTraditionalDtp: true,
  },
  {
    id: 'meera',
    name: 'Meera',
    cssFamily: "'Meera', 'Noto Sans Malayalam', sans-serif",
    category: 'Traditional DTP (പഴയ ലിപി / തനിമ)',
    malayalamSample: 'മലയാളം അച്ചടി — മീര (Meera DTP)',
    badge: 'Traditional DTP (SMC)',
    weightsLabel: '400 Regular',
    isTraditionalDtp: true,
  },
];

export const FONT_CATEGORIES: MalayalamFontCategory[] = [
  'Clean Sans-Serif (നോട്ടീസ് / ഓഫീസ്)',
  'Book & Literary Serif (പുസ്തകം / സാഹിത്യം)',
  'Poster & Bold Headlines (തലക്കെട്ടുകൾ)',
  'Calligraphy & Invitation (ക്ഷണക്കത്ത് / കവിത)',
  'Traditional DTP (പഴയ ലിപി / തനിമ)',
];

export const PAPER_SIZES: Record<Exclude<PaperSizeKey, 'Custom'>, PaperDimensionsMm> = {
  A5: {
    name: 'A5',
    malayalamDesc: 'നോട്ടീസ് / ബുക്ക്‌ലെറ്റ് (Notice / Booklet)',
    widthMm: 148,
    heightMm: 210,
    isBookSize: true,
  },
  'Demy 1/8': {
    name: 'Demy 1/8',
    malayalamDesc: 'കേരള പുസ്തക അളവ് (Standard Kerala Book)',
    widthMm: 138,
    heightMm: 216,
    isBookSize: true,
  },
  'Crown 1/8': {
    name: 'Crown 1/8',
    malayalamDesc: 'നോവൽ / പോക്കറ്റ് ബുക്ക് (Novel / Pocket Book)',
    widthMm: 120,
    heightMm: 185,
    isBookSize: true,
  },
  B5: {
    name: 'B5',
    malayalamDesc: 'പുസ്തകം / മാഗസിൻ (Book Publishing)',
    widthMm: 176,
    heightMm: 250,
    isBookSize: true,
  },
  A4: {
    name: 'A4',
    malayalamDesc: 'ഔദ്യോഗിക കത്ത് / സർക്കുലർ (Standard Office)',
    widthMm: 210,
    heightMm: 297,
  },
  A3: {
    name: 'A3',
    malayalamDesc: 'പോസ്റ്റർ / ചാർട്ട് (Poster / Large Chart)',
    widthMm: 297,
    heightMm: 420,
  },
  Letter: {
    name: 'Letter',
    malayalamDesc: 'യു.എസ് ലെറ്റർ (US Letter)',
    widthMm: 216,
    heightMm: 279,
  },
  Legal: {
    name: 'Legal',
    malayalamDesc: 'ആധാരം / ലീഗൽ രേഖകൾ (Legal Document)',
    widthMm: 216,
    heightMm: 356,
  },
  DL: {
    name: 'DL',
    malayalamDesc: 'ക്ഷണക്കത്ത് / ഫ്ലയർ (Invitation / Flyer)',
    widthMm: 99,
    heightMm: 210,
  },
};

export const MARGIN_PRESETS: Record<
  Exclude<MarginPresetKey, 'custom'>,
  { label: string; malayalamLabel: string; margins: MarginsMm }
> = {
  normal: {
    label: 'Normal (15mm)',
    malayalamLabel: 'സാധാരണ (15mm)',
    margins: { top: 15, right: 15, bottom: 15, left: 15 },
  },
  narrow: {
    label: 'Narrow (10mm)',
    malayalamLabel: 'കുറഞ്ഞ മാർജിൻ (10mm)',
    margins: { top: 10, right: 10, bottom: 10, left: 10 },
  },
  moderate: {
    label: 'Moderate (18/14mm)',
    malayalamLabel: 'ഇടത്തരം (18mm / 14mm)',
    margins: { top: 18, right: 14, bottom: 18, left: 14 },
  },
  wide: {
    label: 'Wide (25mm)',
    malayalamLabel: 'കൂടിയ മാർജിൻ (25mm)',
    margins: { top: 25, right: 25, bottom: 25, left: 25 },
  },
};

export const PAGE_BORDER_STYLES: Record<
  PageBorderStyleKey,
  { label: string; malayalamLabel: string }
> = {
  none: { label: 'None', malayalamLabel: 'ബോർഡർ ഇല്ല' },
  thin: { label: 'Single Thin', malayalamLabel: 'നേർത്ത വര' },
  double: { label: 'Double Line', malayalamLabel: 'ഇരട്ട വര (നോട്ടീസ്)' },
  thick: { label: 'Thick Frame', malayalamLabel: 'കട്ടിയുള്ള ഫ്രെയിം' },
  dashed: { label: 'Dashed Frame', malayalamLabel: 'ഡാഷ് ബോർഡർ' },
  ornamental: { label: 'Classic Ornamental', malayalamLabel: 'ക്ലാസിക് ഡബിൾ ഫ്രെയിം' },
};

export const PAGE_BORDER_COLORS = [
  { label: 'Classic Black', value: '#111827' },
  { label: 'Royal Blue', value: '#1E3A8A' },
  { label: 'Temple Crimson', value: '#881337' },
  { label: 'Forest Green', value: '#14532D' },
  { label: 'Deep Gold / Bronze', value: '#78350F' },
];

export const PAPER_TINTS: Record<
  PaperTintKey,
  { label: string; malayalamLabel: string; hex: string }
> = {
  white: { label: 'Pure White', malayalamLabel: 'വെള്ള പേപ്പർ', hex: '#FFFFFF' },
  ivory: { label: 'Cream / Ivory', malayalamLabel: 'ഐവറി / ക്രീം', hex: '#FFFDF5' },
  yellow: { label: 'Notice Yellow', malayalamLabel: 'മഞ്ഞ നോട്ടീസ് പേപ്പർ', hex: '#FEFCE8' },
  pink: { label: 'Notice Pink', malayalamLabel: 'പിങ്ക് നോട്ടീസ് പേപ്പർ', hex: '#FFF1F2' },
};

export const TEXT_COLOR_PALETTE = [
  { label: 'Ink Black', hex: '#111827' },
  { label: 'Slate Gray', hex: '#4B5563' },
  { label: 'Royal Blue', hex: '#1E3A8A' },
  { label: 'Cerulean Blue', hex: '#1A73E8' },
  { label: 'Crimson Red', hex: '#991B1B' },
  { label: 'Bright Red', hex: '#DC2626' },
  { label: 'Emerald Green', hex: '#166534' },
  { label: 'Warm Amber', hex: '#92400E' },
  { label: 'Deep Purple', hex: '#581C87' },
];

export const HIGHLIGHT_COLOR_PALETTE = [
  { label: 'None', hex: 'transparent' },
  { label: 'Soft Yellow', hex: '#FEF08A' },
  { label: 'Mint Green', hex: '#BBF7D0' },
  { label: 'Sky Blue', hex: '#BAE6FD' },
  { label: 'Rose Pink', hex: '#FECDD3' },
  { label: 'Lavender', hex: '#E9D5FF' },
];

export const LINE_SPACINGS = ['1.15', '1.35', '1.5', '1.6', '1.8', '2.0', '2.5'];

export const PARAGRAPH_STYLES: ParagraphStyleOption[] = [
  { tag: 'p', label: 'Normal text', malayalamLabel: 'സാധാരണ അക്ഷരം' },
  { tag: 'title', label: 'Title', malayalamLabel: 'പ്രധാന ശീർഷകം (Title)' },
  { tag: 'h1', label: 'Heading 1', malayalamLabel: 'തലക്കെട്ട് 1 (H1)' },
  { tag: 'h2', label: 'Heading 2', malayalamLabel: 'ഉപതലക്കെട്ട് 2 (H2)' },
  { tag: 'h3', label: 'Heading 3', malayalamLabel: 'ചെറിയ തലക്കെട്ട് 3 (H3)' },
];

export const TEMPLATE_A5_PUBLIC_NOTICE = `
<h1 style="text-align: center; font-family: 'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif;">ജനകീയ വായനശാല &amp; ഗ്രന്ഥാലയം</h1>
<h3 style="text-align: center; font-family: 'Manjari', 'Noto Sans Malayalam', sans-serif;">വാർഷിക പൊതുയോഗവും പുസ്തകോത്സവവും — അറിയിപ്പ്</h3>
<hr class="mps-divider" />
<p style="font-family: 'Manjari', 'Noto Sans Malayalam', sans-serif;">പ്രിയമുള്ളവരേ,</p>
<p style="text-align: justify; font-family: 'Manjari', 'Noto Sans Malayalam', sans-serif;">നമ്മുടെ ഗ്രാമീണ വായനശാലയുടെ ഈ വർഷത്തെ വാർഷിക പൊതുയോഗവും പുസ്തക പ്രദർശനവും വരുന്ന ഞായറാഴ്ച രാവിലെ <strong>10:00 മണിക്ക്</strong> വായനശാലാ ഹാളിൽ വെച്ച് നടത്താൻ തീരുമാനിച്ചിരിക്കുന്നു. പ്രസ്തുത യോഗത്തിൽ എല്ലാ അംഗങ്ങളും കൃത്യസമയത്ത് തന്നെ പങ്കെടുക്കണമെന്ന് വിനീതമായി അഭ്യർത്ഥിക്കുന്നു.</p>
<h3 style="font-family: 'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif;">കാര്യപരിപാടികൾ:</h3>
<ul style="font-family: 'Manjari', 'Noto Sans Malayalam', sans-serif;">
  <li>രാവിലെ 10:00 — സ്വാഗത പ്രസംഗവും ഉദ്ഘാടനവും</li>
  <li>രാവിലെ 10:30 — വാർഷിക റിപ്പോർട്ടും കണക്കവതരണവും</li>
  <li>ഉച്ചയ്ക്ക് 11:30 — പുതിയ ഭരണസമിതി തിരഞ്ഞെടുപ്പ്</li>
  <li>ഉച്ചയ്ക്ക് 12:15 — പുസ്തക പ്രദർശനവും നന്ദിപ്രകടനവും</li>
</ul>
<table class="mps-table">
  <thead>
    <tr>
      <th>തീയതി</th>
      <th>സമയം</th>
      <th>സ്ഥലം</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>2025 മെയ് 18, ഞായർ</td>
      <td>രാവിലെ 10:00 AM</td>
      <td>വായനശാലാ മെയിൻ ഹാൾ</td>
    </tr>
  </tbody>
</table>
<p style="text-align: right; font-family: 'Manjari', 'Noto Sans Malayalam', sans-serif;"><strong>സെക്രട്ടറി,</strong><br/>ജനകീയ വായനശാല</p>
`.trim();

export const TEMPLATE_A4_OFFICIAL_LETTERHEAD = `
<h1 style="text-align: center; font-family: 'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif;">കേരള സാംസ്കാരിക വേദി — തിരുവനന്തപുരം</h1>
<p style="text-align: center; font-family: 'Noto Sans Malayalam', sans-serif;">രജി. നമ്പർ: KSV/2025/108 · ഫോൺ: +91 98765 43210</p>
<hr class="mps-divider" />
<p><strong>റഫറൻസ് നമ്പർ:</strong> KSV/ADMIN/2025/42<br/><strong>തീയതി:</strong> 12 മെയ് 2025</p>
<p><strong>സ്വീകർത്താവ്:</strong><br/>ബഹുമാനപ്പെട്ട ജില്ലാ കളക്ടർ,<br/>കളക്ടറേറ്റ്, തിരുവനന്തപുരം.</p>
<p><strong>വിഷയം:</strong> സാംസ്കാരിക സമ്മേളനത്തിനും പുസ്തകോത്സവത്തിനും അനുമതി ലഭ്യമാക്കുന്നത് സംബന്ധിച്ച്.</p>
<p>ബഹുമാനപ്പെട്ട സർ,</p>
<p style="text-align: justify;">തിരുവനന്തപുരം നഗരസഭയുടെ സഹകരണത്തോടെ ഈ വരുന്ന ജൂൺ മാസം ഒന്നാം തീയതി മുതൽ അഞ്ചാം തീയതി വരെ അഞ്ചു ദിവസത്തെ മലയാള പുസ്തകോത്സവവും സാംസ്കാരിക സമ്മേളനവും സംഘടിപ്പിക്കുവാൻ ഞങ്ങളുടെ സമിതി തീരുമാനിച്ചിട്ടുണ്ട്. പ്രസ്തുത പരിപാടി നടത്തുന്നതിന് ആവശ്യമായ ഔദ്യോഗിക അനുമതി നൽകണമെന്ന് വിനീതമായി അപേക്ഷിക്കുന്നു.</p>
<table class="mps-table">
  <thead>
    <tr>
      <th>ക്രമ നമ്പർ</th>
      <th>പരിപാടിയുടെ പേര്</th>
      <th>തീയതി</th>
      <th>വേദി</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>പുസ്തകോത്സവം ഉദ്ഘാടനം</td>
      <td>01-06-2025</td>
      <td>ടൗൺ ഹാൾ ഓഡിറ്റോറിയം</td>
    </tr>
    <tr>
      <td>2</td>
      <td>സാഹിത്യ സെമിനാർ &amp; കവിസമ്മേളനം</td>
      <td>03-06-2025</td>
      <td>സെമിനാർ ഹാൾ - ബി</td>
    </tr>
  </tbody>
</table>
<p><br/></p>
<p style="text-align: right;">വിശ്വസ്തതയോടെ,<br/><br/><strong>ജനറൽ സെക്രട്ടറി</strong><br/>കേരള സാംസ്കാരിക വേദി</p>
`.trim();

export const TEMPLATE_A4_EXAM_TWO_COLUMN = `
<h1 style="text-align: center; font-family: 'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif;">വാർഷിക പരീക്ഷ — മലയാളം (പേപ്പർ I)</h1>
<p style="text-align: center;"><strong>സമയം: 2 മണിക്കൂർ</strong> &nbsp;|&nbsp; <strong>പരമാവധി മാർക്ക്: 50</strong></p>
<hr class="mps-divider" />
<h3 style="font-family: 'Noto Serif Malayalam', serif;">വിഭാഗം എ — ഒറ്റവാക്കിൽ ഉത്തരമെഴുതുക (5 × 1 = 5)</h3>
<ol style="font-family: 'Noto Serif Malayalam', serif;">
  <li>മലയാളത്തിലെ ആദ്യത്തെ ലക്ഷണമൊത്ത നോവൽ ഏതാണ്?</li>
  <li>'വീണപൂവ്' എന്ന കൃതി രചിച്ച മഹാകവി ആര്?</li>
  <li>എഴുത്തച്ഛന്റെ പ്രധാന കിളിപ്പാട്ട് കൃതികൾ ഏവ?</li>
  <li>'ജ്ഞാനപ്പാന' രചിച്ചത് ആരാണ്?</li>
  <li>മലയാള ഭാഷയുടെ പിതാവ് എന്നറിയപ്പെടുന്നത് ആര്?</li>
</ol>
<h3 style="font-family: 'Noto Serif Malayalam', serif;">വിഭാഗം ബി — ലഘു കുറിപ്പ് തയ്യാറാക്കുക (5 × 3 = 15)</h3>
<ol style="font-family: 'Noto Serif Malayalam', serif;">
  <li>മാതൃഭാഷാ പഠനത്തിന്റെ പ്രാധാന്യം വ്യക്തമാക്കുക.</li>
  <li>വായനശാലകൾ സമൂഹത്തിൽ ചെലുത്തുന്ന സ്വാധീനം വിവരിക്കുക.</li>
  <li>പരിസ്ഥിതി സംരക്ഷണത്തിൽ വിദ്യാർത്ഥികളുടെ പങ്ക്.</li>
  <li>കേരളത്തിലെ പ്രധാന കലാരൂപങ്ങളെക്കുറിച്ച് കുറിപ്പെഴുതുക.</li>
  <li>നവോത്ഥാന സാഹിത്യം മലയാളത്തിന് നൽകിയ സംഭാവനകൾ.</li>
</ol>
<h3 style="font-family: 'Noto Serif Malayalam', serif;">വിഭാഗം സി — ഉപന്യാസം തയ്യാറാക്കുക (2 × 15 = 30)</h3>
<p style="font-family: 'Noto Serif Malayalam', serif;">1. 'വായനയും ആധുനിക സാങ്കേതികവിദ്യയും' എന്ന വിഷയത്തിൽ മൂന്ന് പുറത്തിൽ കവിയാതെ ഉപന്യാസം തയ്യാറാക്കുക.</p>
<p style="font-family: 'Noto Serif Malayalam', serif;">2. മലയാള സാഹിത്യത്തിലെ കാൽപ്പനിക പ്രസ്ഥാനത്തിന്റെ സവിശേഷതകൾ ഉദാഹരണസഹിതം വിശദീകരിക്കുക.</p>
`.trim();

// =========================================================================
// BOOK PUBLISHING FRONT MATTER TEMPLATES & CHAPTER START BLOCK
// =========================================================================

export const TEMPLATE_BOOK_TITLE_PAGE = `
<div class="mps-chapter-start mps-no-indent" data-chapter-start="true" style="padding-top: 26mm; text-align: center;">
  <p class="mps-no-indent" style="text-align: center; font-size: 10pt; letter-spacing: 0.14em; color: #4B5563; margin-bottom: 6mm;">മലയാള സാഹിത്യ കൃതി · നോവൽ</p>
  <h1 style="text-align: center; font-size: 24pt; font-family: 'Noto Serif Malayalam', 'Tiro Malayalam', serif; margin-bottom: 4mm;">മഴവില്ലിന്റെ തീരത്ത്</h1>
  <p class="mps-no-indent" style="text-align: center; font-size: 12pt; font-style: italic; color: #374151; margin-bottom: 16mm;">ഓർമ്മകളും യാത്രകളും ചേർന്നൊരു കഥാസമാഹാരം</p>
  <hr class="mps-divider" style="width: 36%; margin: 0 auto 14mm auto;" />
  <p class="mps-no-indent" style="text-align: center; font-size: 13pt; font-weight: 700; margin-bottom: 24mm;">എം. ആർ. നായർ</p>
  <p class="mps-no-indent" style="text-align: center; font-size: 10.5pt; font-weight: 600; color: #1F2937;">കൈരളി ബുക്സ് &amp; പബ്ലിഷേഴ്സ്<br/><span style="font-size: 9pt; font-weight: 400; color: #6B7280;">കോട്ടയം · തിരുവനന്തപുരം · കോഴിക്കോട്</span></p>
</div>
`.trim();

export const TEMPLATE_BOOK_COPYRIGHT_PAGE = `
<div class="mps-chapter-start mps-no-indent" data-chapter-start="true" style="padding-top: 42mm; text-align: left; font-size: 9.5pt; line-height: 1.65; color: #1F2937;">
  <p class="mps-no-indent" style="font-weight: 700; font-size: 11pt; margin-bottom: 2mm;">മഴവില്ലിന്റെ തീരത്ത് (നോവൽ)</p>
  <p class="mps-no-indent" style="margin-bottom: 4mm;"><strong>രചന:</strong> എം. ആർ. നായർ<br/><strong>പകർപ്പവകാശം:</strong> © 2025 ഗ്രന്ഥകർത്താവ്</p>
  <p class="mps-no-indent" style="margin-bottom: 4mm;"><strong>ഒന്നാം പതിപ്പ്:</strong> മെയ് 2025<br/><strong>ISBN:</strong> 978-93-00000-00-0<br/><strong>വില:</strong> ₹ 180.00</p>
  <p class="mps-no-indent" style="margin-bottom: 4mm;"><strong>പ്രസാധനം:</strong> കൈരളി ബുക്സ് &amp; പബ്ലിഷേഴ്സ്, എം. ജി. റോഡ്, കോട്ടയം - 686001.<br/><strong>അച്ചടി (Printed at):</strong> കേരള ഓഫ്സെറ്റ് പ്രസ്സ്, എറണാകുളം.<br/><strong>ടൈപ്പ്സെറ്റിംഗ്:</strong> Malayalam Print Studio (Demy 1/8)</p>
  <hr class="mps-divider" style="margin: 5mm 0;" />
  <p class="mps-no-indent" style="font-size: 8.5pt; color: #4B5563;">ഈ പുസ്തകത്തിന്റെ യാതൊരു ഭാഗവും ഗ്രന്ഥകർത്താവിന്റെയോ പ്രസാധകരുടെയോ മുൻകൂർ രേഖാമൂലമുള്ള അനുമതിയില്ലാതെ പകർത്തുകയോ പുനഃപ്രസിദ്ധീകരിക്കുകയോ ചെയ്യാൻ പാടില്ല. എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.</p>
</div>
`.trim();

export const TEMPLATE_BOOK_TOC_PAGE = `
<div class="mps-chapter-start mps-no-indent" data-chapter-start="true" style="padding-top: 10mm;">
  <h2 style="text-align: center; font-size: 16pt; font-family: 'Noto Serif Malayalam', 'Tiro Malayalam', serif; margin-bottom: 3mm;">ഉള്ളടക്കം</h2>
  <hr class="mps-divider" style="width: 30%; margin: 0 auto 8mm auto;" />
</div>
<table class="mps-toc-table" style="width: 100%; border-collapse: collapse; border: none;">
  <tbody>
    <tr class="mps-toc-row">
      <td class="mps-toc-title" style="border: none; padding: 5px 4px;">ആമുഖം</td>
      <td class="mps-toc-dots" style="border: none; border-bottom: 1pt dotted #6B7280; width: 45%;"></td>
      <td class="mps-toc-page" style="border: none; padding: 5px 4px; text-align: right; font-weight: 600; width: 14%;">05</td>
    </tr>
    <tr class="mps-toc-row">
      <td class="mps-toc-title" style="border: none; padding: 5px 4px;">അധ്യായം 1 — പഴയ കടവിലെ മഴ</td>
      <td class="mps-toc-dots" style="border: none; border-bottom: 1pt dotted #6B7280; width: 45%;"></td>
      <td class="mps-toc-page" style="border: none; padding: 5px 4px; text-align: right; font-weight: 600; width: 14%;">09</td>
    </tr>
    <tr class="mps-toc-row">
      <td class="mps-toc-title" style="border: none; padding: 5px 4px;">അധ്യായം 2 — സായാഹ്നത്തിലെ യാത്രക്കാർ</td>
      <td class="mps-toc-dots" style="border: none; border-bottom: 1pt dotted #6B7280; width: 45%;"></td>
      <td class="mps-toc-page" style="border: none; padding: 5px 4px; text-align: right; font-weight: 600; width: 14%;">24</td>
    </tr>
    <tr class="mps-toc-row">
      <td class="mps-toc-title" style="border: none; padding: 5px 4px;">അധ്യായം 3 — ഓർമ്മകളുടെ പുഴയോരം</td>
      <td class="mps-toc-dots" style="border: none; border-bottom: 1pt dotted #6B7280; width: 45%;"></td>
      <td class="mps-toc-page" style="border: none; padding: 5px 4px; text-align: right; font-weight: 600; width: 14%;">41</td>
    </tr>
    <tr class="mps-toc-row">
      <td class="mps-toc-title" style="border: none; padding: 5px 4px;">അധ്യായം 4 — പുതിയ പ്രഭാതം</td>
      <td class="mps-toc-dots" style="border: none; border-bottom: 1pt dotted #6B7280; width: 45%;"></td>
      <td class="mps-toc-page" style="border: none; padding: 5px 4px; text-align: right; font-weight: 600; width: 14%;">62</td>
    </tr>
    <tr class="mps-toc-row">
      <td class="mps-toc-title" style="border: none; padding: 5px 4px;">അനുബന്ധം &amp; കുറിപ്പുകൾ</td>
      <td class="mps-toc-dots" style="border: none; border-bottom: 1pt dotted #6B7280; width: 45%;"></td>
      <td class="mps-toc-page" style="border: none; padding: 5px 4px; text-align: right; font-weight: 600; width: 14%;">78</td>
    </tr>
  </tbody>
</table>
`.trim();

export function buildChapterStartHtml(chapterNumber: number): string {
  return `
<div class="mps-chapter-start mps-no-indent" data-chapter-start="true" style="padding-top: 18mm; margin-bottom: 7mm; text-align: center;">
  <p class="mps-no-indent" style="text-align: center; font-size: 9.5pt; letter-spacing: 0.12em; color: #4B5563; margin-bottom: 2mm;">അധ്യായം ${chapterNumber}</p>
  <h1 style="text-align: center; font-size: 17pt; font-family: 'Noto Serif Malayalam', 'Tiro Malayalam', serif; margin: 0 0 3mm 0;">അധ്യായത്തിന്റെ ശീർഷകം</h1>
  <hr class="mps-divider" style="width: 24%; margin: 0 auto;" />
</div>
<p style="text-align: justify;">ഇവിടെ പുതിയ അധ്യായം എഴുതിത്തുടങ്ങാം...</p>
`.trim();
}

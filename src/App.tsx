import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Undo2,
  Redo2,
  RemoveFormatting,
  Search,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Subscript,
  Superscript,
  Palette,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  IndentIncrease,
  IndentDecrease,
  Table as TableIcon,
  Image as ImageIcon,
  Minus,
  Scissors,
  ZoomIn,
  PanelTop,
  Printer,
  Download,
  Upload,
  FileCode2,
  Plus,
  Trash2,
  X,
  ArrowUpDown,
  Info,
  Frame,
  Stamp,
  Ruler,
  Crop,
  Eye,
  EyeOff,
  LayoutTemplate,
  Pilcrow,
  MoveHorizontal,
  MoreVertical,
  SlidersHorizontal,
  PlusCircle,
  Maximize2,
  Check,
  Type,
  ChevronDown
} from 'lucide-react';

// Paper Size Definitions in mm
type PaperSizeId = 'A5' | 'A4' | 'A3' | 'B5' | 'Letter' | 'Legal' | 'Custom';

interface PaperDefinition {
  id: PaperSizeId;
  label: string;
  shortLabel: string;
  widthMm: number;
  heightMm: number;
  badge: string;
}

const PAPER_SIZES: Record<PaperSizeId, PaperDefinition> = {
  A5: { id: 'A5', label: 'A5 (148 × 210 mm)', shortLabel: 'A5 Notice', widthMm: 148, heightMm: 210, badge: 'നോട്ടീസ് / Pamphlet' },
  A4: { id: 'A4', label: 'A4 (210 × 297 mm)', shortLabel: 'A4 Standard', widthMm: 210, heightMm: 297, badge: 'ഓഫീസ് / Standard' },
  A3: { id: 'A3', label: 'A3 (297 × 420 mm)', shortLabel: 'A3 Poster', widthMm: 297, heightMm: 420, badge: 'പോസ്റ്റർ / Chart' },
  B5: { id: 'B5', label: 'B5 (176 × 250 mm)', shortLabel: 'B5 Book', widthMm: 176, heightMm: 250, badge: 'പുസ്തകം / Book' },
  Letter: { id: 'Letter', label: 'Letter (215.9 × 279.4 mm)', shortLabel: 'US Letter', widthMm: 215.9, heightMm: 279.4, badge: 'US Letter' },
  Legal: { id: 'Legal', label: 'Legal (215.9 × 355.6 mm)', shortLabel: 'Legal', widthMm: 215.9, heightMm: 355.6, badge: 'ആധാരം / Legal' },
  Custom: { id: 'Custom', label: 'Custom Size (mm)', shortLabel: 'Custom mm', widthMm: 148, heightMm: 210, badge: 'ഇഷ്ടാനുസരണം' },
};

// Essential Malayalam Print & DTP Font Suite grouped by print purpose
export interface MalayalamFontOption {
  id: string;
  name: string;
  mlName: string;
  cssFamily: string;
  specimen: string;
  category: 'Standard & Notices' | 'Books & Formal Print' | 'Bold Headlines & Posters' | 'Invitations & Calligraphy';
}

const MALAYALAM_FONTS: MalayalamFontOption[] = [
  // 1. Standard & Notices
  {
    id: 'Noto Sans Malayalam',
    name: 'Noto Sans Malayalam',
    mlName: 'നോട്ടോ സാൻസ് (Default)',
    cssFamily: "'Noto Sans Malayalam', sans-serif",
    specimen: 'മലയാളം അച്ചടി · സ്വാതന്ത്ര്യം',
    category: 'Standard & Notices',
  },
  {
    id: 'Manjari',
    name: 'Manjari',
    mlName: 'മഞ്ജരി (Manjari)',
    cssFamily: "'Manjari', 'Noto Sans Malayalam', sans-serif",
    specimen: 'മഞ്ജരി നോട്ടീസ് ഫോണ്ട് · ഉജ്ജ്വലം',
    category: 'Standard & Notices',
  },
  {
    id: 'Meera',
    name: 'Meera',
    mlName: 'മീര (Meera SMC)',
    cssFamily: "'Meera', 'Manjari', 'Noto Sans Malayalam', sans-serif",
    specimen: 'മീര ഡി.ടി.പി ഫോണ്ട് · കൃഷ്ണൻ',
    category: 'Standard & Notices',
  },

  // 2. Books & Formal Print
  {
    id: 'Tiro Malayalam',
    name: 'Tiro Malayalam',
    mlName: 'ടിറോ മലയാളം (പുസ്തക അച്ചടി)',
    cssFamily: "'Tiro Malayalam', 'Noto Serif Malayalam', serif",
    specimen: 'സാഹിത്യ പുസ്തക അച്ചടി · തത്ത്വശാസ്ത്രം',
    category: 'Books & Formal Print',
  },
  {
    id: 'Noto Serif Malayalam',
    name: 'Noto Serif Malayalam',
    mlName: 'നോട്ടോ സെറിഫ് (Formal Serif)',
    cssFamily: "'Noto Serif Malayalam', serif",
    specimen: 'ഔദ്യോഗിക പ്രസിദ്ധീകരണം · ഭർത്താവ്',
    category: 'Books & Formal Print',
  },
  {
    id: 'Rachana',
    name: 'Rachana',
    mlName: 'രചന (Rachana - പഴയ ലിപി)',
    cssFamily: "'Rachana', 'Tiro Malayalam', 'Noto Serif Malayalam', serif",
    specimen: 'രചന തനിമയാർന്ന പഴയ ലിപി · വ്യവസ്ഥിതി',
    category: 'Books & Formal Print',
  },

  // 3. Bold Headlines & Posters
  {
    id: 'Baloo Chettan 2',
    name: 'Baloo Chettan 2',
    mlName: 'ബാലു ചേട്ടൻ 2 (ഹെഡിംഗ്)',
    cssFamily: "'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif",
    specimen: 'കേരള സാഹിത്യ സമ്മേളനം · പോസ്റ്റർ',
    category: 'Bold Headlines & Posters',
  },
  {
    id: 'Anek Malayalam',
    name: 'Anek Malayalam',
    mlName: 'അനേക് മലയാളം (Display)',
    cssFamily: "'Anek Malayalam', 'Noto Sans Malayalam', sans-serif",
    specimen: 'ആധുനിക തലക്കെട്ടുകൾ · രാഷ്ട്രീയം',
    category: 'Bold Headlines & Posters',
  },
  {
    id: 'Gayathri',
    name: 'Gayathri',
    mlName: 'ഗായത്രി (Gayathri Brochure)',
    cssFamily: "'Gayathri', 'Noto Sans Malayalam', sans-serif",
    specimen: 'ഗായത്രി ബ്രോഷർ ഡിസൈൻ · മലർവാടി',
    category: 'Bold Headlines & Posters',
  },

  // 4. Invitations & Calligraphy
  {
    id: 'Chilanka',
    name: 'Chilanka',
    mlName: 'ചിലങ്ക (Chilanka - ക്ഷണക്കത്ത്)',
    cssFamily: "'Chilanka', 'Manjari', cursive",
    specimen: 'സ്നേഹപൂർവ്വം സ്വാഗതം · കൺമണി',
    category: 'Invitations & Calligraphy',
  },
  {
    id: 'Dyuthi',
    name: 'Dyuthi',
    mlName: 'ദ്യുതി (Dyuthi Calligraphy)',
    cssFamily: "'Dyuthi', 'Chilanka', 'Baloo Chettan 2', cursive",
    specimen: 'ദ്യുതി അലങ്കാര അക്ഷരങ്ങൾ · ഉത്സവം',
    category: 'Invitations & Calligraphy',
  },
];

const FONT_CATEGORIES: MalayalamFontOption['category'][] = [
  'Standard & Notices',
  'Books & Formal Print',
  'Bold Headlines & Posters',
  'Invitations & Calligraphy',
];

type MarginPresetId = 'normal' | 'narrow' | 'wide' | 'custom';

interface MarginsMm {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

const MARGIN_PRESETS: Record<Exclude<MarginPresetId, 'custom'>, { label: string; margins: MarginsMm }> = {
  narrow: { label: 'Narrow / Notice (8 mm)', margins: { top: 8, right: 8, bottom: 8, left: 8 } },
  normal: { label: 'Normal (15 mm)', margins: { top: 15, right: 15, bottom: 15, left: 15 } },
  wide: { label: 'Wide (25 mm)', margins: { top: 25, right: 25, bottom: 25, left: 25 } },
};

// Page Border Styles
type PageBorderStyle = 'none' | 'thin' | 'double' | 'thick' | 'dashed' | 'ornamental';

// Paper Preview Tint
type PaperTintId = 'white' | 'cream' | 'yellow' | 'pink';

const PAPER_TINTS: Record<PaperTintId, { label: string; mlLabel: string; hex: string }> = {
  white: { label: 'Pure White', mlLabel: 'വെള്ള', hex: '#FFFFFF' },
  cream: { label: 'Cream / Ivory', mlLabel: 'ക്രീം', hex: '#FFFDF5' },
  yellow: { label: 'Yellow Notice', mlLabel: 'മഞ്ഞ നോട്ടീസ്', hex: '#FEFCE8' },
  pink: { label: 'Pink Notice', mlLabel: 'പിങ്ക് നോട്ടീസ്', hex: '#FDF2F8' },
};

// Page Number Position & Format
type PageNumberPosition = 'bottom' | 'top';
type PageNumberAlign = 'left' | 'center' | 'right';
type PageNumberFormat = 'malayalam' | 'english' | 'simple' | 'dashed';

const FONT_SIZES_PT = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48];
const LINE_SPACINGS = ['1.0', '1.15', '1.5', '2.0', '2.5'];
const LETTER_SPACINGS = [
  { label: 'Normal (0)', value: '0px' },
  { label: 'Tight (-0.3px)', value: '-0.3px' },
  { label: 'Wide (+0.5px)', value: '0.5px' },
  { label: 'Extra (+1px)', value: '1px' },
];
const ZOOM_LEVELS = [50, 75, 100, 125, 150];

// 3 Ready-to-Edit Malayalam Print Templates showcasing multi-font DTP pairings
const TEMPLATE_A5_PUBLIC_NOTICE = `
<h1 style="text-align: center; font-size: 18pt; margin-bottom: 4px; font-family: 'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif;">കേരള സാഹിത്യ അക്കാദമി — വാർഷിക സാംസ്കാരിക സമ്മേളനം</h1>
<p style="text-align: center; font-size: 10.5pt; color: #374151; margin-bottom: 8px; font-family: 'Manjari', 'Noto Sans Malayalam', sans-serif;"><strong>ഔദ്യോഗിക അറിയിപ്പ് / പൊതുയോഗ നോട്ടീസ് (A5 Notice Specimen)</strong></p>
<hr class="mps-divider" />
<p style="text-align: justify; font-size: 10.5pt;">പ്രിയമുള്ളവരേ, മലയാള ഭാഷയുടെയും സാഹിത്യത്തിന്റെയും സമഗ്രമായ വളർച്ച ലക്ഷ്യമിട്ട് സംഘടിപ്പിക്കുന്ന വാർഷിക സാംസ്കാരിക സമ്മേളനത്തിലേക്ക് ഏവരെയും സഹർഷം സ്വാഗതം ചെയ്യുന്നു. കൂട്ടക്ഷരങ്ങളും ചില്ലക്ഷരങ്ങളും യാതൊരുവിധ ഫോണ്ട് തകരാറുകളുമില്ലാതെ അച്ചടിക്കാൻ സഹായിക്കുന്ന <strong>മലയാളം പ്രിന്റ് സ്റ്റുഡിയോ</strong> വഴിയാണ് ഈ അറിയിപ്പ് തയ്യാറാക്കിയിരിക്കുന്നത്.</p>
<h2 style="font-size: 12.5pt; margin-top: 10px; font-family: 'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif;">1. ഭാഷാശുദ്ധിയും കൂട്ടക്ഷര പരിശോധനയും</h2>
<ul>
  <li style="font-size: 10pt;"><strong>സങ്കീർണ്ണ കൂട്ടക്ഷരങ്ങൾ:</strong> സ്വാതന്ത്ര്യം, ഉജ്ജ്വലം, കൃഷ്ണൻ, ശാസ്ത്രജ്ഞൻ, തത്ത്വശാസ്ത്രം, ഭർത്താവ്, വ്യവസ്ഥിതി, ലക്ഷ്മി, രാഷ്ട്രീയം.</li>
  <li style="font-size: 10pt;"><strong>ചില്ലക്ഷരങ്ങൾ:</strong> ൻ, ൽ, ൾ, ർ, ൺ — മലയാളിത്തം നിലനിർത്താൻ തനിമയാർന്ന അക്ഷരരൂപങ്ങൾ (അവൻ, കടൽ, അവൾ, മലർ, കൺമണി).</li>
</ul>
<h2 style="font-size: 12.5pt; margin-top: 10px; font-family: 'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif;">2. കാര്യപരിപാടികളുടെ സമയക്രമം</h2>
<table class="mps-table">
  <thead>
    <tr>
      <th style="width: 25%;">സമയം</th>
      <th style="width: 43%;">പരിപാടി / വിഷയം</th>
      <th style="width: 32%;">മുഖ്യാതിഥി</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>രാവിലെ 09:30</td>
      <td>ഉദ്ഘാടന സമ്മേളനം &amp; ഭദ്രദീപം കൊളുത്തൽ</td>
      <td>ഡോ. എം. കൃഷ്ണൻ നായർ</td>
    </tr>
    <tr>
      <td>രാവിലെ 11:00</td>
      <td>ആധുനിക മലയാള കവിതയിലെ സ്വാതന്ത്ര്യബോധം</td>
      <td>പ്രൊഫ. ലക്ഷ്മി മേനോൻ</td>
    </tr>
    <tr>
      <td>ഉച്ചയ്ക്ക് 02:00</td>
      <td>സാങ്കേതികവിദ്യയും മലയാള അച്ചടിയും — ചർച്ച</td>
      <td>ശ്രീ. അരവിന്ദ് വർമ്മ</td>
    </tr>
  </tbody>
</table>
<p style="text-align: justify; font-size: 10pt; margin-top: 8px;">ഏത് പ്രിന്റ് ഷോപ്പിലും മലയാളം ഫോണ്ട് ഇൻസ്റ്റാൾ ചെയ്യാതെ തന്നെ നേരിട്ട് A5 നോട്ടീസായോ A4 സർക്കുലറായോ വ്യക്തതയോടെ പ്രിന്റ് ചെയ്തെടുക്കാം.</p>
<p style="text-align: right; font-size: 10pt; margin-top: 12px;"><strong>സെക്രട്ടറി, സംഘാടക സമിതി</strong><br/>തൃശ്ശൂർ · ഫോൺ: +91 94470 00000</p>
`.trim();

const TEMPLATE_A4_OFFICIAL_LETTERHEAD = `
<h1 style="text-align: center; font-size: 18pt; margin-bottom: 2px; font-family: 'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif;">നവകേരള സാംസ്കാരിക സമിതി (രജി. നമ്പർ: KSR/482/2026)</h1>
<p style="text-align: center; font-size: 10pt; color: #374151; margin-bottom: 8px;">ഹെഡ് ഓഫീസ്: എം.ജി. റോഡ്, തൃശ്ശൂർ - 680001 · ഇമെയിൽ: info@navakeralasamithi.org</p>
<hr class="mps-divider" />
<table class="mps-table border-none" style="margin-bottom: 12px;">
  <tbody>
    <tr>
      <td style="width: 50%; padding: 2px 0;"><strong>റഫറൻസ് നമ്പർ:</strong> NKS/2026/108</td>
      <td style="width: 50%; text-align: right; padding: 2px 0;"><strong>തീയതി:</strong> 23 നവംബർ 2026</td>
    </tr>
  </tbody>
</table>
<p style="font-size: 11pt; margin-bottom: 10px;"><strong>പ്രേഷിതൻ (From):</strong><br/>ജനറൽ സെക്രട്ടറി,<br/>നവകേരള സാംസ്കാരിക സമിതി, തൃശ്ശൂർ.</p>
<p style="font-size: 11pt; margin-bottom: 12px;"><strong>സ്വീകർത്താവ് (To):</strong><br/>ബഹുമാനപ്പെട്ട ജില്ലാ കളക്ടർ,<br/>കളക്ടറേറ്റ്, തൃശ്ശൂർ ജില്ല.</p>
<p style="font-size: 11pt; margin-bottom: 10px;"><strong>വിഷയം:</strong> ജില്ലാതല മലയാള ഭാഷാ സെമിനാറും പുസ്തകോത്സവവും സംഘടിപ്പിക്കുന്നതിനുള്ള അനുമതി സംബന്ധിച്ച്.</p>
<p style="font-size: 11pt; margin-bottom: 8px;">ബഹുമാനപ്പെട്ട സർ,</p>
<p style="text-align: justify; font-size: 11pt;">നമ്മുടെ ജില്ലയിലെ വിദ്യാർത്ഥികളിലും പൊതുജനങ്ങളിലും മാതൃഭാഷാ പഠനവും വായനാശീലവും പ്രോത്സാഹിപ്പിക്കുന്നതിനായി ഡിസംബർ 15, 16 തീയതികളിൽ ടൗൺ ഹാളിൽ വെച്ച് വിപുലമായ മലയാള പുസ്തകോത്സവവും ശാസ്ത്ര-സാഹിത്യ സെമിനാറും നടത്തുവാൻ സമിതി തീരുമാനിച്ചിരിക്കുന്നു.</p>
<p style="text-align: justify; font-size: 11pt;">പ്രസ്തുത പരിപാടിയുടെ സുഗമമായ നടത്തിപ്പിനായി ടൗൺ ഹാൾ അനുവദിച്ചു നൽകണമെന്നും ഉദ്ഘാടന സമ്മേളനത്തിൽ മുഖ്യാതിഥിയായി പങ്കെടുക്കണമെന്നും വിനീതമായി അഭ്യർത്ഥിക്കുന്നു.</p>
<p style="font-size: 11pt; margin-top: 16px;">വിശ്വസ്തതയോടെ,</p>
<table class="mps-table border-none" style="margin-top: 24px;">
  <tbody>
    <tr>
      <td style="width: 50%;">സ്ഥലം: തൃശ്ശൂർ<br/>(ഔദ്യോഗിക സീൽ)</td>
      <td style="width: 50%; text-align: right;"><strong>(ഒപ്പ്)</strong><br/><strong>ഡോ. കെ. ആർ. വേണുഗോപാൽ</strong><br/>ജനറൽ സെക്രട്ടറി</td>
    </tr>
  </tbody>
</table>
`.trim();

const TEMPLATE_A4_EXAM_QUESTION_PAPER = `
<h1 style="text-align: center; font-size: 16pt; margin-bottom: 4px; font-family: 'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif;">അർദ്ധവാർഷിക മൂല്യനിർണ്ണയ പരീക്ഷ — 2026</h1>
<p style="text-align: center; font-size: 10.5pt; margin-bottom: 8px;"><strong>വിഷയം: മലയാളം (കേരള പാഠാവലി) · ക്ലാസ്സ്: X · സമയം: 2½ മണിക്കൂർ · ആകെ സ്കോർ: 80</strong></p>
<hr class="mps-divider" />
<h2 style="font-size: 11.5pt; margin-top: 6px;">വിഭാഗം എ — ഒറ്റവാക്കിൽ ഉത്തരമെഴുതുക (1 മുതൽ 5 വരെ ചോദ്യങ്ങൾക്ക് 1 സ്കോർ വീതം)</h2>
<ol>
  <li style="font-size: 10pt;">'സ്വാതന്ത്ര്യം തന്നെ ജീവിതം' എന്ന് പ്രഖ്യാപിച്ച മലയാള കവി ആര്?</li>
  <li style="font-size: 10pt;">'ഉജ്ജ്വലം' എന്ന പദം പിരിച്ചെഴുതുക.</li>
  <li style="font-size: 10pt;">മലയാളത്തിലെ അഞ്ച് പ്രധാന ചില്ലക്ഷരങ്ങൾ ഏവ? (ൻ, ൽ, ൾ, ർ, ൺ)</li>
  <li style="font-size: 10pt;">കൃഷ്ണഗാഥയുടെ കർത്താവ് ആരാണ്?</li>
  <li style="font-size: 10pt;">'കൺമണി' എന്ന വാക്കിലെ സന്ധി ഏതെന്ന് വ്യക്തമാക്കുക.</li>
</ol>
<h2 style="font-size: 11.5pt; margin-top: 10px;">വിഭാഗം ബി — ലഘുകുറിപ്പ് തയ്യാറാക്കുക (4 സ്കോർ വീതം)</h2>
<ol>
  <li style="font-size: 10pt;">ആധുനിക മലയാള സാഹിത്യത്തിൽ ചെറുകഥാ പ്രസ്ഥാനം കൈവരിച്ച വളർച്ചയെക്കുറിച്ച് ലഘുവിവരണം തയ്യാറാക്കുക.</li>
  <li style="font-size: 10pt;">മാതൃഭാഷാ പഠനവും വിവരസാങ്കേതികവിദ്യയും എന്ന വിഷയത്തിൽ യൂണികോഡ് ഫോണ്ടുകളുടെ പ്രാധാന്യം വ്യക്തമാക്കുക.</li>
  <li style="font-size: 10pt;">പ്രകൃതിസംരക്ഷണവും സാഹിത്യവും തമ്മിലുള്ള ബന്ധം പാഠഭാഗങ്ങളെ ആസ്പദമാക്കി വിലയിരുത്തുക.</li>
</ol>
<h2 style="font-size: 11.5pt; margin-top: 10px;">വിഭാഗം സി — ഉപന്യാസം തയ്യാറാക്കുക (8 സ്കോർ)</h2>
<p style="text-align: justify; font-size: 10pt;"><strong>1. ശ്രേഷ്ഠഭാഷാ മലയാളം — വെല്ലുവിളികളും സാധ്യതകളും:</strong> അച്ചടി മാധ്യമങ്ങളിലും ഡിജിറ്റൽ മേഖലയിലും മലയാള ഭാഷ നേരിടുന്ന ഫോണ്ട് പ്രശ്നങ്ങളും പരിഹാരമാർഗ്ഗങ്ങളും ഉൾപ്പെടുത്തി സമഗ്രമായ ഉപന്യാസം തയ്യാറാക്കുക.</p>
<p style="text-align: justify; font-size: 10pt;"><strong>2. വായനയുടെ പുതുവഴികൾ:</strong> ഗ്രന്ഥശാലാ പ്രസ്ഥാനം കേരളീയ പൊതുസമൂഹത്തിൽ സൃഷ്ടിച്ച സാംസ്കാരിക നവോത്ഥാനം വിശകലനം ചെയ്യുക.</p>
`.trim();

const DEFAULT_MALAYALAM_SAMPLE = TEMPLATE_A5_PUBLIC_NOTICE;

const STORAGE_KEY = 'malayalam_print_studio_state_v3';

interface SavedProjectState {
  docTitle: string;
  htmlContent: string;
  paperSize: PaperSizeId;
  customWidthMm: number;
  customHeightMm: number;
  orientation: 'portrait' | 'landscape';
  marginPreset: MarginPresetId;
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
  pageBorderStyle: PageBorderStyle;
  pageBorderColor: string;
  pageBorderPaddingMm: number;
  columnCount: 1 | 2 | 3;
  watermarkText: string;
  paperTint: PaperTintId;
  printBackgroundTint: boolean;
  showRuler: boolean;
  showCropMarks: boolean;
}

type ActiveBottomDrawer = 'none' | 'page-print' | 'insert' | 'more' | 'font-picker';

export default function App() {
  // Document Metadata & Paper Configuration
  const [docTitle, setDocTitle] = useState<string>('വാർഷിക സാംസ്കാരിക സമ്മേളനം - അറിയിപ്പ്');
  const [paperSize, setPaperSize] = useState<PaperSizeId>('A5');
  const [customWidthMm, setCustomWidthMm] = useState<number>(148);
  const [customHeightMm, setCustomHeightMm] = useState<number>(210);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [marginPreset, setMarginPreset] = useState<MarginPresetId>('narrow');
  const [margins, setMargins] = useState<MarginsMm>({ top: 8, right: 8, bottom: 8, left: 8 });
  const [zoom, setZoom] = useState<number>(0); // 0 = Auto-Fit to mobile screen (100% on wide desktop)
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // Malayalam Print Font Suite State
  const [currentFontId, setCurrentFontId] = useState<string>('Noto Sans Malayalam');
  const [defaultDocFontId, setDefaultDocFontId] = useState<string>('Noto Sans Malayalam');

  // Page Borders & Frames
  const [pageBorderStyle, setPageBorderStyle] = useState<PageBorderStyle>('double');
  const [pageBorderColor, setPageBorderColor] = useState<string>('#111827');
  const [pageBorderPaddingMm, setPageBorderPaddingMm] = useState<number>(5);

  // Multi-Column Layout
  const [columnCount, setColumnCount] = useState<1 | 2 | 3>(1);

  // Watermark & Paper Tint
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [paperTint, setPaperTint] = useState<PaperTintId>('white');
  const [printBackgroundTint, setPrintBackgroundTint] = useState<boolean>(false);

  // Advanced Header, Footer & Page Numbering
  const [showHeaderFooter, setShowHeaderFooter] = useState<boolean>(true);
  const [headerText, setHeaderText] = useState<string>('കേരള സാഹിത്യ അക്കാദമി · ഔദ്യോഗിക അറിയിപ്പ്');
  const [footerText, setFooterText] = useState<string>('മലയാളം പ്രിന്റ് സ്റ്റുഡിയോ · Font-Locked Vector Print');
  const [showPageNumbers, setShowPageNumbers] = useState<boolean>(true);
  const [differentFirstPage, setDifferentFirstPage] = useState<boolean>(false);
  const [pageNumberPosition, setPageNumberPosition] = useState<PageNumberPosition>('bottom');
  const [pageNumberAlign, setPageNumberAlign] = useState<PageNumberAlign>('right');
  const [pageNumberFormat, setPageNumberFormat] = useState<PageNumberFormat>('malayalam');

  // Smart Typography Precision
  const [currentBlockStyle, setCurrentBlockStyle] = useState<string>('p');
  const [currentFontSizePt, setCurrentFontSizePt] = useState<number>(11);
  const [lineSpacing, setLineSpacing] = useState<string>('1.5');
  const [letterSpacing, setLetterSpacing] = useState<string>('0px');
  const [firstLineIndent, setFirstLineIndent] = useState<boolean>(false);
  const [spaceAfterParagraph, setSpaceAfterParagraph] = useState<boolean>(true);
  const [textColor, setTextColor] = useState<string>('#111827');
  const [highlightColor, setHighlightColor] = useState<string>('#FEF08A');

  // Print Ruler, Crop Marks & Clean Preview
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [showCropMarks, setShowCropMarks] = useState<boolean>(false);
  const [cleanPreviewMode, setCleanPreviewMode] = useState<boolean>(false);

  // Active Bottom Sheet Drawer ('none' | 'page-print' | 'insert' | 'more' | 'font-picker')
  const [activeDrawer, setActiveDrawer] = useState<ActiveBottomDrawer>('none');

  // Find & Replace Modal & Table Dimensions state
  const [showFindModal, setShowFindModal] = useState<boolean>(false);
  const [findQuery, setFindQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [findMatchCount, setFindMatchCount] = useState<number | null>(null);

  const [tableRowsInput, setTableRowsInput] = useState<number>(3);
  const [tableColsInput, setTableColsInput] = useState<number>(3);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [fontReadyStatus, setFontReadyStatus] = useState<'loading' | 'ready'>('loading');

  // Active DOM selection tracking for contextual Table & Image floating toolbars
  const [activeTableCell, setActiveTableCell] = useState<HTMLTableCellElement | null>(null);
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);
  const [activeImageWidthPct, setActiveImageWidthPct] = useState<number>(60);

  // Live Word & Character Counters + Estimated Pages
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [estimatedPages, setEstimatedPages] = useState<number>(1);

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const draftInputRef = useRef<HTMLInputElement>(null);

  // Show temporary notification toast
  const triggerToast = useCallback((msg: string, duration = 5500) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, duration);
  }, []);

  // Preload & verify all Malayalam Print Fonts on mount
  useEffect(() => {
    let mounted = true;
    const preloadMalayalamFonts = async () => {
      if (document.fonts && document.fonts.load) {
        try {
          await Promise.allSettled(
            MALAYALAM_FONTS.map((f) => document.fonts.load(`16px "${f.name}"`, 'മലയാളം'))
          );
          await document.fonts.ready;
        } catch {
          // Ignore network font fallback warnings
        }
      }
      if (mounted) setFontReadyStatus('ready');
    };
    preloadMalayalamFonts();
    return () => {
      mounted = false;
    };
  }, []);

  // Get active default document font object
  const activeDefaultFontObj =
    MALAYALAM_FONTS.find((f) => f.id === defaultDocFontId) || MALAYALAM_FONTS[0];
  const activeToolbarFontObj =
    MALAYALAM_FONTS.find((f) => f.id === currentFontId) || MALAYALAM_FONTS[0];

  // Compute physical paper dimensions in mm accounting for Portrait/Landscape
  const getEffectivePaperDimensions = useCallback(() => {
    const baseWidth = paperSize === 'Custom' ? Math.max(40, customWidthMm) : PAPER_SIZES[paperSize].widthMm;
    const baseHeight = paperSize === 'Custom' ? Math.max(40, customHeightMm) : PAPER_SIZES[paperSize].heightMm;
    if (orientation === 'landscape') {
      return { widthMm: baseHeight, heightMm: baseWidth };
    }
    return { widthMm: baseWidth, heightMm: baseHeight };
  }, [paperSize, customWidthMm, customHeightMm, orientation]);

  const { widthMm: effectiveWidthMm, heightMm: effectiveHeightMm } = getEffectivePaperDimensions();

  // Track viewport resize for Auto-Fit Paper to Mobile Screen
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate effective CSS zoom/scale factor so paper fits inside narrow mobile screens without cutting off edges
  const pxPerMm = 3.7795275591;
  const paperWidthPx = effectiveWidthMm * pxPerMm;
  const availableViewportPx = Math.max(240, windowWidth - 20);
  const autoFitScale = Math.min(1, Number((availableViewportPx / paperWidthPx).toFixed(3)));
  const activeScale = zoom === 0 ? autoFitScale : zoom / 100;
  const activeScalePct = Math.round(activeScale * 100);

  // Format Page Number String according to user choice
  const formatPageNumberLabel = useCallback(
    (pageIndex: number, totalPages: number) => {
      if (pageNumberFormat === 'simple') return `${pageIndex}`;
      if (pageNumberFormat === 'dashed') return `- ${pageIndex} -`;
      if (pageNumberFormat === 'english') return `Page ${pageIndex} of ${totalPages}`;
      return `പേജ് ${pageIndex} / ${totalPages}`;
    },
    [pageNumberFormat]
  );

  // Compute Malayalam word and character statistics & estimated page count
  const updateDocumentMetrics = useCallback(() => {
    const el = editorRef.current;
    if (!el) return;
    const rawText = (el.innerText || '').replace(/\u200B/g, '').trim();
    const chars = rawText.length;
    const words = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
    setCharCount(chars);
    setWordCount(words);

    const printableHeightMm = Math.max(40, effectiveHeightMm - margins.top - margins.bottom);
    const printableHeightPx = printableHeightMm * pxPerMm;
    const contentHeightPx = el.scrollHeight || 100;
    const pages = Math.max(1, Math.ceil(contentHeightPx / printableHeightPx));
    setEstimatedPages(pages);
  }, [effectiveHeightMm, margins.top, margins.bottom, pxPerMm]);

  // Apply a saved state object into React state + editor
  const applyProjectState = useCallback((parsed: Partial<SavedProjectState>) => {
    if (parsed.docTitle) setDocTitle(parsed.docTitle);
    if (parsed.paperSize && PAPER_SIZES[parsed.paperSize]) setPaperSize(parsed.paperSize);
    if (typeof parsed.customWidthMm === 'number') setCustomWidthMm(parsed.customWidthMm);
    if (typeof parsed.customHeightMm === 'number') setCustomHeightMm(parsed.customHeightMm);
    if (parsed.orientation) setOrientation(parsed.orientation);
    if (parsed.marginPreset) setMarginPreset(parsed.marginPreset);
    if (parsed.margins) setMargins(parsed.margins);
    if (parsed.defaultDocFontId) {
      setDefaultDocFontId(parsed.defaultDocFontId);
      setCurrentFontId(parsed.defaultDocFontId);
    }
    if (typeof parsed.showHeaderFooter === 'boolean') setShowHeaderFooter(parsed.showHeaderFooter);
    if (typeof parsed.headerText === 'string') setHeaderText(parsed.headerText);
    if (typeof parsed.footerText === 'string') setFooterText(parsed.footerText);
    if (typeof parsed.showPageNumbers === 'boolean') setShowPageNumbers(parsed.showPageNumbers);
    if (typeof parsed.differentFirstPage === 'boolean') setDifferentFirstPage(parsed.differentFirstPage);
    if (parsed.pageNumberPosition) setPageNumberPosition(parsed.pageNumberPosition);
    if (parsed.pageNumberAlign) setPageNumberAlign(parsed.pageNumberAlign);
    if (parsed.pageNumberFormat) setPageNumberFormat(parsed.pageNumberFormat);
    if (parsed.lineSpacing) setLineSpacing(parsed.lineSpacing);
    if (parsed.letterSpacing) setLetterSpacing(parsed.letterSpacing);
    if (typeof parsed.firstLineIndent === 'boolean') setFirstLineIndent(parsed.firstLineIndent);
    if (typeof parsed.spaceAfterParagraph === 'boolean') setSpaceAfterParagraph(parsed.spaceAfterParagraph);
    if (parsed.pageBorderStyle) setPageBorderStyle(parsed.pageBorderStyle);
    if (parsed.pageBorderColor) setPageBorderColor(parsed.pageBorderColor);
    if (typeof parsed.pageBorderPaddingMm === 'number') setPageBorderPaddingMm(parsed.pageBorderPaddingMm);
    if (parsed.columnCount === 1 || parsed.columnCount === 2 || parsed.columnCount === 3) {
      setColumnCount(parsed.columnCount);
    }
    if (typeof parsed.watermarkText === 'string') setWatermarkText(parsed.watermarkText);
    if (parsed.paperTint && PAPER_TINTS[parsed.paperTint]) setPaperTint(parsed.paperTint);
    if (typeof parsed.printBackgroundTint === 'boolean') setPrintBackgroundTint(parsed.printBackgroundTint);
    if (typeof parsed.showRuler === 'boolean') setShowRuler(parsed.showRuler);
    if (typeof parsed.showCropMarks === 'boolean') setShowCropMarks(parsed.showCropMarks);

    if (editorRef.current) {
      editorRef.current.innerHTML = parsed.htmlContent || DEFAULT_MALAYALAM_SAMPLE;
    }
  }, []);

  // Load saved state from localStorage on mount
  useEffect(() => {
    try {
      const savedRaw =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('malayalam_print_studio_state_v2') ||
        localStorage.getItem('malayalam_print_studio_state_v1');
      if (savedRaw) {
        const parsed: Partial<SavedProjectState> = JSON.parse(savedRaw);
        applyProjectState(parsed);
      } else if (editorRef.current) {
        editorRef.current.innerHTML = DEFAULT_MALAYALAM_SAMPLE;
      }
    } catch {
      if (editorRef.current) {
        editorRef.current.innerHTML = DEFAULT_MALAYALAM_SAMPLE;
      }
    }
    setTimeout(updateDocumentMetrics, 60);
  }, [applyProjectState, updateDocumentMetrics]);

  // Auto-save to localStorage whenever document or settings change
  const saveToLocalStorage = useCallback(() => {
    if (!editorRef.current) return;
    const stateToSave: SavedProjectState = {
      docTitle,
      htmlContent: editorRef.current.innerHTML,
      paperSize,
      customWidthMm,
      customHeightMm,
      orientation,
      marginPreset,
      margins,
      defaultDocFontId,
      showHeaderFooter,
      headerText,
      footerText,
      showPageNumbers,
      differentFirstPage,
      pageNumberPosition,
      pageNumberAlign,
      pageNumberFormat,
      lineSpacing,
      letterSpacing,
      firstLineIndent,
      spaceAfterParagraph,
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
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // Ignore quota errors
    }
  }, [
    docTitle,
    paperSize,
    customWidthMm,
    customHeightMm,
    orientation,
    marginPreset,
    margins,
    defaultDocFontId,
    showHeaderFooter,
    headerText,
    footerText,
    showPageNumbers,
    differentFirstPage,
    pageNumberPosition,
    pageNumberAlign,
    pageNumberFormat,
    lineSpacing,
    letterSpacing,
    firstLineIndent,
    spaceAfterParagraph,
    pageBorderStyle,
    pageBorderColor,
    pageBorderPaddingMm,
    columnCount,
    watermarkText,
    paperTint,
    printBackgroundTint,
    showRuler,
    showCropMarks,
  ]);

  useEffect(() => {
    saveToLocalStorage();
    updateDocumentMetrics();
  }, [saveToLocalStorage, updateDocumentMetrics]);

  // Save and restore selection ranges so toolbar dropdowns/modals insert at exact cursor spot
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current) {
      const range = sel.getRangeAt(0);
      if (editorRef.current.contains(range.commonAncestorContainer)) {
        savedSelectionRef.current = range.cloneRange();
      }
    }
  };

  const restoreSelection = () => {
    const sel = window.getSelection();
    if (sel && savedSelectionRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedSelectionRef.current);
    } else if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // Detect font-family at current cursor position
  const detectFontAtCursor = () => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode || !editorRef.current?.contains(sel.anchorNode)) return;
    const el =
      sel.anchorNode.nodeType === Node.ELEMENT_NODE
        ? (sel.anchorNode as HTMLElement)
        : sel.anchorNode.parentElement;
    if (!el) return;
    const computedFont = window.getComputedStyle(el).fontFamily || '';
    const matched = MALAYALAM_FONTS.find((f) =>
      computedFont.toLowerCase().includes(f.name.toLowerCase())
    );
    if (matched) {
      setCurrentFontId(matched.id);
    }
  };

  // Core Rich-Text Command Executor
  const execCmd = (command: string, value: string = '') => {
    restoreSelection();
    document.execCommand(command, false, value);
    saveSelection();
    saveToLocalStorage();
    updateDocumentMetrics();
  };

  // Apply Malayalam Font Family to selected text or current block (or whole document if requested)
  const applyMalayalamFontFamily = (fontId: string, applyToEntireDocument = false) => {
    const fontObj = MALAYALAM_FONTS.find((f) => f.id === fontId);
    if (!fontObj) return;

    setCurrentFontId(fontObj.id);

    // Preload font via FontFaceSet API immediately
    if (document.fonts && document.fonts.load) {
      document.fonts.load(`16px "${fontObj.name}"`, 'മലയാളം').catch(() => {});
    }

    if (applyToEntireDocument) {
      setDefaultDocFontId(fontObj.id);
      if (editorRef.current) {
        // Also clear inline font-family overrides if user explicitly chose "Apply to Entire Document"
        const styledNodes = editorRef.current.querySelectorAll('[style*="font-family"]');
        styledNodes.forEach((node) => {
          (node as HTMLElement).style.fontFamily = '';
        });
      }
      setActiveDrawer('none');
      saveToLocalStorage();
      updateDocumentMetrics();
      triggerToast(`Set entire document default font to ${fontObj.mlName}.`);
      return;
    }

    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setDefaultDocFontId(fontObj.id);
      setActiveDrawer('none');
      return;
    }

    if (!sel.isCollapsed) {
      // Apply to highlighted text selection using fontName marker & converting <font face="..."> to clean <span style="font-family: ...">
      document.execCommand('fontName', false, 'MPS_FONT_MARKER');
      if (editorRef.current) {
        const fontTags = editorRef.current.querySelectorAll('font[face="MPS_FONT_MARKER"]');
        fontTags.forEach((fontEl) => {
          const span = document.createElement('span');
          span.style.fontFamily = fontObj.cssFamily;
          span.innerHTML = fontEl.innerHTML;
          fontEl.parentNode?.replaceChild(span, fontEl);
        });
      }
      triggerToast(`Applied ${fontObj.mlName} to selected text.`);
    } else {
      // Cursor is collapsed: apply to current paragraph/heading block if inside editor, or set default doc font
      const anchorNode = sel.anchorNode;
      if (anchorNode && editorRef.current?.contains(anchorNode)) {
        const startEl =
          anchorNode.nodeType === Node.ELEMENT_NODE
            ? (anchorNode as HTMLElement)
            : anchorNode.parentElement;
        const blockEl = startEl?.closest('p, h1, h2, h3, li, td, th') as HTMLElement | null;
        if (blockEl && editorRef.current.contains(blockEl)) {
          blockEl.style.fontFamily = fontObj.cssFamily;
          triggerToast(`Applied ${fontObj.mlName} to current paragraph/heading.`);
        } else {
          setDefaultDocFontId(fontObj.id);
          triggerToast(`Set default document font to ${fontObj.mlName}.`);
        }
      } else {
        setDefaultDocFontId(fontObj.id);
        triggerToast(`Set default document font to ${fontObj.mlName}.`);
      }
    }

    setActiveDrawer('none');
    saveSelection();
    saveToLocalStorage();
    updateDocumentMetrics();
  };

  // Apply exact point size (8pt - 48pt) using safe DOM span wrapping
  const applyFontSizePt = (pt: number) => {
    setCurrentFontSizePt(pt);
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    if (!sel.isCollapsed) {
      document.execCommand('fontSize', false, '7');
      if (editorRef.current) {
        const fontTags = editorRef.current.querySelectorAll('font[size="7"]');
        fontTags.forEach((fontEl) => {
          const span = document.createElement('span');
          span.style.fontSize = `${pt}pt`;
          span.innerHTML = fontEl.innerHTML;
          fontEl.parentNode?.replaceChild(span, fontEl);
        });
      }
    } else {
      const anchorNode = sel.anchorNode;
      if (anchorNode && editorRef.current?.contains(anchorNode)) {
        const el =
          anchorNode.nodeType === Node.ELEMENT_NODE
            ? (anchorNode as HTMLElement)
            : anchorNode.parentElement;
        if (el && el !== editorRef.current) {
          el.style.fontSize = `${pt}pt`;
        }
      }
    }
    saveSelection();
    saveToLocalStorage();
    updateDocumentMetrics();
  };

  // Apply Block Paragraph Style (Normal, Title, H1, H2, H3)
  const applyBlockStyle = (tag: string) => {
    setCurrentBlockStyle(tag);
    restoreSelection();
    if (tag === 'title') {
      document.execCommand('formatBlock', false, 'H1');
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        const anchorEl =
          sel.anchorNode.nodeType === Node.ELEMENT_NODE
            ? (sel.anchorNode as HTMLElement)
            : sel.anchorNode.parentElement;
        const h1 = anchorEl?.closest('h1');
        if (h1) {
          h1.style.fontSize = '24pt';
          h1.style.textAlign = 'center';
        }
      }
    } else {
      document.execCommand('formatBlock', false, tag.toUpperCase());
    }
    saveSelection();
    saveToLocalStorage();
    updateDocumentMetrics();
  };

  // Handle Margin Preset Switch
  const handleMarginPresetChange = (preset: MarginPresetId) => {
    setMarginPreset(preset);
    if (preset !== 'custom') {
      setMargins({ ...MARGIN_PRESETS[preset].margins });
    }
  };

  // Handle Paper Size Switch (auto-suggests 8mm narrow margin for A5 notices if untouched)
  const handlePaperSizeChange = (newSize: PaperSizeId) => {
    setPaperSize(newSize);
    if (newSize === 'A5' && marginPreset === 'normal') {
      setMarginPreset('narrow');
      setMargins({ ...MARGIN_PRESETS.narrow.margins });
      triggerToast('Switched to A5 (148 × 210 mm) with 8 mm Notice Margins.');
    } else if (newSize === 'A4' && marginPreset === 'narrow') {
      setMarginPreset('normal');
      setMargins({ ...MARGIN_PRESETS.normal.margins });
      triggerToast('Switched to A4 (210 × 297 mm) with 15 mm Standard Margins.');
    }
  };

  // Load One-Click Malayalam Print Templates
  const handleApplyTemplate = (templateId: string) => {
    if (!templateId || !editorRef.current) return;
    if (templateId === 'a5-notice') {
      setDocTitle('വാർഷിക സാംസ്കാരിക സമ്മേളനം - അറിയിപ്പ്');
      setPaperSize('A5');
      setOrientation('portrait');
      setMarginPreset('narrow');
      setMargins({ top: 8, right: 8, bottom: 8, left: 8 });
      setPageBorderStyle('double');
      setPageBorderColor('#111827');
      setPageBorderPaddingMm(5);
      setColumnCount(1);
      setDefaultDocFontId('Noto Sans Malayalam');
      setCurrentFontId('Noto Sans Malayalam');
      setShowHeaderFooter(true);
      setHeaderText('കേരള സാഹിത്യ അക്കാദമി · ഔദ്യോഗിക അറിയിപ്പ്');
      setFooterText('മലയാളം പ്രിന്റ് സ്റ്റുഡിയോ · A5 Public Notice');
      editorRef.current.innerHTML = TEMPLATE_A5_PUBLIC_NOTICE;
      triggerToast('Loaded Template: A5 Public Notice / Meeting Agenda.');
    } else if (templateId === 'a4-letterhead') {
      setDocTitle('നവകേരള സാംസ്കാരിക സമിതി - ഔദ്യോഗിക കത്ത്');
      setPaperSize('A4');
      setOrientation('portrait');
      setMarginPreset('normal');
      setMargins({ top: 15, right: 15, bottom: 15, left: 15 });
      setPageBorderStyle('thin');
      setPageBorderColor('#1F2937');
      setPageBorderPaddingMm(7);
      setColumnCount(1);
      setDefaultDocFontId('Tiro Malayalam');
      setCurrentFontId('Tiro Malayalam');
      setShowHeaderFooter(true);
      setHeaderText('നവകേരള സാംസ്കാരിക സമിതി · ഔദ്യോഗിക ലെറ്റർഹെഡ്');
      setFooterText('തൃശ്ശൂർ - 680001 · ഫോൺ: +91 94470 00000');
      editorRef.current.innerHTML = TEMPLATE_A4_OFFICIAL_LETTERHEAD;
      triggerToast('Loaded Template: A4 Official Letterhead (Tiro Malayalam + Baloo Chettan 2).');
    } else if (templateId === 'a4-question-paper') {
      setDocTitle('അർദ്ധവാർഷിക മലയാളം ചോദ്യപേപ്പർ - 2026');
      setPaperSize('A4');
      setOrientation('portrait');
      setMarginPreset('normal');
      setMargins({ top: 12, right: 12, bottom: 12, left: 12 });
      setPageBorderStyle('ornamental');
      setPageBorderColor('#111827');
      setPageBorderPaddingMm(6);
      setColumnCount(2);
      setDefaultDocFontId('Noto Serif Malayalam');
      setCurrentFontId('Noto Serif Malayalam');
      setShowHeaderFooter(true);
      setHeaderText('പൊതുവിദ്യാഭ്യാസ വകുപ്പ് · അർദ്ധവാർഷിക പരീക്ഷ 2026');
      setFooterText('മലയാളം (കേരള പാഠാവലി) · ക്ലാസ്സ് X');
      editorRef.current.innerHTML = TEMPLATE_A4_EXAM_QUESTION_PAPER;
      triggerToast('Loaded Template: A4 Exam Question Paper (2-Column Layout).');
    }
    setActiveDrawer('none');
    setTimeout(() => {
      saveToLocalStorage();
      updateDocumentMetrics();
    }, 40);
  };

  // Insert HTML snippet at cursor
  const insertHtmlAtCursor = (html: string) => {
    restoreSelection();
    document.execCommand('insertHTML', false, html);
    saveSelection();
    saveToLocalStorage();
    updateDocumentMetrics();
  };

  // Insert custom Table (Rows × Columns)
  const handleInsertTable = () => {
    const r = Math.min(20, Math.max(1, tableRowsInput));
    const c = Math.min(10, Math.max(1, tableColsInput));
    let html = '<table class="mps-table"><thead><tr>';
    for (let j = 0; j < c; j++) {
      html += `<th>തലക്കെട്ട് ${j + 1}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (let i = 0; i < Math.max(1, r - 1); i++) {
      html += '<tr>';
      for (let j = 0; j < c; j++) {
        html += '<td>വിവരം</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br/></p>';
    insertHtmlAtCursor(html);
    setActiveDrawer('none');
    triggerToast(`Inserted ${r} × ${c} Malayalam Table.`);
  };

  // Contextual Table Manipulation (Add/Delete Rows & Columns, Border Style)
  const modifyActiveTable = (
    action:
      | 'addRow'
      | 'delRow'
      | 'addCol'
      | 'delCol'
      | 'borderStandard'
      | 'borderHeavy'
      | 'borderNone'
      | 'deleteTable'
  ) => {
    if (!activeTableCell) return;
    const table = activeTableCell.closest('table') as HTMLTableElement | null;
    const row = activeTableCell.closest('tr') as HTMLTableRowElement | null;
    if (!table || !row) return;

    const colIndex = activeTableCell.cellIndex;

    if (action === 'addRow') {
      const section = (row.parentElement as HTMLTableSectionElement | null) || table;
      const newRow = section.insertRow(row.sectionRowIndex + 1);
      if (newRow) {
        const cellCount = row.cells.length;
        for (let i = 0; i < cellCount; i++) {
          const td = newRow.insertCell(i);
          td.innerHTML = 'വിവരം';
        }
      }
    } else if (action === 'delRow') {
      const totalRows = table.rows.length;
      if (totalRows <= 1) {
        table.remove();
        setActiveTableCell(null);
      } else {
        row.remove();
        setActiveTableCell(null);
      }
    } else if (action === 'addCol') {
      Array.from(table.rows).forEach((tr) => {
        const isHeader = tr.parentElement?.tagName === 'THEAD';
        const cell = isHeader ? document.createElement('th') : document.createElement('td');
        cell.innerHTML = isHeader ? 'തലക്കെട്ട്' : 'വിവരം';
        const refCell = tr.cells[colIndex + 1] || null;
        tr.insertBefore(cell, refCell);
      });
    } else if (action === 'delCol') {
      const totalCols = row.cells.length;
      if (totalCols <= 1) {
        table.remove();
        setActiveTableCell(null);
      } else {
        Array.from(table.rows).forEach((tr) => {
          if (tr.cells[colIndex]) tr.deleteCell(colIndex);
        });
        setActiveTableCell(null);
      }
    } else if (action === 'borderStandard') {
      table.classList.remove('border-heavy', 'border-none', 'border-light');
    } else if (action === 'borderHeavy') {
      table.classList.remove('border-none', 'border-light');
      table.classList.add('border-heavy');
    } else if (action === 'borderNone') {
      table.classList.remove('border-heavy', 'border-light');
      table.classList.add('border-none');
    } else if (action === 'deleteTable') {
      table.remove();
      setActiveTableCell(null);
    }

    saveToLocalStorage();
    updateDocumentMetrics();
  };

  // Insert Image from Device
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const imgHtml = `<img src="${dataUrl}" alt="Document Graphic" style="width: 60%; max-width: 100%; height: auto; display: block; margin: 10px auto; border-radius: 2px;" /><p><br/></p>`;
      insertHtmlAtCursor(imgHtml);
      setActiveDrawer('none');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Resize or align currently selected image inside editor
  const updateSelectedImageStyle = (widthPct?: number, align?: 'left' | 'center' | 'right') => {
    if (!activeImage) return;
    if (typeof widthPct === 'number') {
      setActiveImageWidthPct(widthPct);
      activeImage.style.width = `${widthPct}%`;
    }
    if (align === 'left') {
      activeImage.style.display = 'block';
      activeImage.style.marginLeft = '0';
      activeImage.style.marginRight = 'auto';
    } else if (align === 'center') {
      activeImage.style.display = 'block';
      activeImage.style.marginLeft = 'auto';
      activeImage.style.marginRight = 'auto';
    } else if (align === 'right') {
      activeImage.style.display = 'block';
      activeImage.style.marginLeft = 'auto';
      activeImage.style.marginRight = '0';
    }
    saveToLocalStorage();
    updateDocumentMetrics();
  };

  // Insert Horizontal Divider
  const handleInsertDivider = () => {
    insertHtmlAtCursor('<hr class="mps-divider" /><p><br/></p>');
    setActiveDrawer('none');
  };

  // Insert Manual Page Break
  const handleInsertPageBreak = () => {
    insertHtmlAtCursor(
      '<div class="mps-page-break" contenteditable="false">— പേജ് ബ്രേക്ക് / Manual Page Break —</div><p><br/></p>'
    );
    setActiveDrawer('none');
  };

  // Find & Replace inside Editor
  const handleFindCount = () => {
    if (!editorRef.current || !findQuery.trim()) {
      setFindMatchCount(0);
      return;
    }
    const text = editorRef.current.innerText || '';
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = text.match(new RegExp(escaped, 'gi'));
    setFindMatchCount(matches ? matches.length : 0);

    if (typeof (window as unknown as { find?: (s: string) => boolean }).find === 'function') {
      (window as unknown as { find: (s: string) => boolean }).find(findQuery);
    }
  };

  const handleReplaceAll = () => {
    if (!editorRef.current || !findQuery) return;
    const walker = document.createTreeWalker(editorRef.current, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
      textNodes.push(currentNode as Text);
      currentNode = walker.nextNode();
    }

    let replacedCount = 0;
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');

    textNodes.forEach((node) => {
      if (node.nodeValue && regex.test(node.nodeValue)) {
        const matches = node.nodeValue.match(regex);
        if (matches) replacedCount += matches.length;
        node.nodeValue = node.nodeValue.replace(regex, replaceQuery);
      }
    });

    setFindMatchCount(0);
    saveToLocalStorage();
    updateDocumentMetrics();
    triggerToast(`Replaced ${replacedCount} occurrence(s) of "${findQuery}".`);
  };

  // Track editor clicks to detect active Table Cell, Image, or Font at cursor
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    saveSelection();
    detectFontAtCursor();
    const target = e.target as HTMLElement;

    if (target.tagName === 'IMG') {
      if (activeImage && activeImage !== target) {
        activeImage.classList.remove('mps-selected-img');
      }
      const img = target as HTMLImageElement;
      img.classList.add('mps-selected-img');
      setActiveImage(img);
      const currentW = parseInt(img.style.width || '60', 10);
      setActiveImageWidthPct(isNaN(currentW) ? 60 : currentW);
    } else if (activeImage) {
      activeImage.classList.remove('mps-selected-img');
      setActiveImage(null);
    }

    const cell = target.closest('td, th') as HTMLTableCellElement | null;
    if (cell && editorRef.current?.contains(cell)) {
      setActiveTableCell(cell);
    } else {
      setActiveTableCell(null);
    }
  };

  // Compute CSS properties for Page Border Frame (Screen & Print)
  const getPageBorderCssRules = useCallback(
    (isForPrintFixed: boolean) => {
      if (pageBorderStyle === 'none') return '';
      const insetMm = Math.max(2, margins.top - pageBorderPaddingMm);
      const posType = isForPrintFixed ? 'fixed' : 'absolute';
      let borderCss = `border: 1.5px solid ${pageBorderColor};`;
      let outlineCss = '';
      if (pageBorderStyle === 'double') {
        borderCss = `border: 4px double ${pageBorderColor};`;
      } else if (pageBorderStyle === 'thick') {
        borderCss = `border: 3px solid ${pageBorderColor};`;
      } else if (pageBorderStyle === 'dashed') {
        borderCss = `border: 1.75px dashed ${pageBorderColor};`;
      } else if (pageBorderStyle === 'ornamental') {
        borderCss = `border: 2.5px solid ${pageBorderColor};`;
        outlineCss = `outline: 1px solid ${pageBorderColor}; outline-offset: -5px;`;
      }
      return `
        position: ${posType};
        top: ${isForPrintFixed ? '0mm' : `${insetMm}mm`};
        right: ${isForPrintFixed ? '0mm' : `${insetMm}mm`};
        bottom: ${isForPrintFixed ? '0mm' : `${insetMm}mm`};
        left: ${isForPrintFixed ? '0mm' : `${insetMm}mm`};
        pointer-events: none;
        ${borderCss}
        ${outlineCss}
        z-index: 20;
      `;
    },
    [pageBorderStyle, pageBorderColor, margins.top, pageBorderPaddingMm]
  );

  // Compute inline style object for on-screen Page Border Overlay
  const getScreenBorderStyle = (): React.CSSProperties | null => {
    if (pageBorderStyle === 'none') return null;
    const insetMm = Math.max(2, Math.min(margins.top, margins.left) - pageBorderPaddingMm);
    const base: React.CSSProperties = {
      position: 'absolute',
      top: `${insetMm}mm`,
      right: `${insetMm}mm`,
      bottom: `${insetMm}mm`,
      left: `${insetMm}mm`,
      pointerEvents: 'none',
      zIndex: 15,
    };
    if (pageBorderStyle === 'thin') {
      base.border = `1.25px solid ${pageBorderColor}`;
    } else if (pageBorderStyle === 'double') {
      base.border = `4px double ${pageBorderColor}`;
    } else if (pageBorderStyle === 'thick') {
      base.border = `3px solid ${pageBorderColor}`;
    } else if (pageBorderStyle === 'dashed') {
      base.border = `1.75px dashed ${pageBorderColor}`;
    } else if (pageBorderStyle === 'ornamental') {
      base.border = `2.5px solid ${pageBorderColor}`;
      base.outline = `1px solid ${pageBorderColor}`;
      base.outlineOffset = '-5px';
    }
    return base;
  };

  const screenBorderStyle = getScreenBorderStyle();

  // CRITICAL: Font-Locked Native Vector PDF Export Engine verifying all Malayalam fonts before printing
  const handleSavePrintReadyPDF = async () => {
    setIsPrinting(true);
    setActiveDrawer('none');
    triggerToast(
      `In the print dialog, choose 'Save as PDF' and ensure Paper Size matches ${paperSize} (${effectiveWidthMm}mm × ${effectiveHeightMm}mm). Note: If running inside an embedded preview iframe where printing is blocked, open this page in Chrome (top-right menu) to save the PDF.`,
      9500
    );

    // Explicitly verify all Malayalam fonts used in the document are loaded and ready for vector glyph embedding
    if (document.fonts) {
      try {
        await Promise.allSettled(
          MALAYALAM_FONTS.flatMap((f) => [
            document.fonts.load(`400 16px "${f.name}"`, 'മലയാളം'),
            document.fonts.load(`700 16px "${f.name}"`, 'മലയാളം'),
          ])
        );
        await document.fonts.ready;
      } catch {
        // Proceed with loaded fonts
      }
    }

    if (activeImage) {
      activeImage.classList.remove('mps-selected-img');
      setActiveImage(null);
    }
    setActiveTableCell(null);

    let styleEl = document.getElementById('dynamic-print-style') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-print-style';
      document.head.appendChild(styleEl);
    }

    const activeBgColor = printBackgroundTint ? PAPER_TINTS[paperTint].hex : '#FFFFFF';
    const contentInsetForBorder = pageBorderStyle !== 'none' ? `${Math.max(3, pageBorderPaddingMm)}mm` : '0mm';

    styleEl.textContent = `
      @page {
        size: ${effectiveWidthMm}mm ${effectiveHeightMm}mm;
        margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
      }
      @media print {
        html, body {
          width: ${effectiveWidthMm}mm !important;
          min-height: ${effectiveHeightMm}mm !important;
          background: ${activeBgColor} !important;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .no-print {
          display: none !important;
        }
        #mps-workspace-container {
          padding: 0 !important;
          margin: 0 !important;
          background: ${activeBgColor} !important;
          display: block !important;
          overflow: visible !important;
        }
        #mps-paper-zoom-outer {
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
        }
        #mps-paper-zoom-wrapper {
          transform: none !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #mps-paper-sheet {
          width: 100% !important;
          min-height: auto !important;
          box-shadow: none !important;
          border: none !important;
          padding: ${contentInsetForBorder} !important;
          margin: 0 !important;
          background: ${activeBgColor} !important;
        }
        #mps-page-border-frame {
          ${getPageBorderCssRules(true)}
        }
        #mps-watermark-overlay {
          position: fixed !important;
          inset: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          pointer-events: none !important;
          z-index: 10 !important;
        }
        .malayalam-doc {
          font-family: ${activeDefaultFontObj.cssFamily} !important;
          font-feature-settings: "kern" 1, "liga" 1, "clig" 1, "calt" 1 !important;
        }
        .malayalam-doc * {
          font-feature-settings: "kern" 1, "liga" 1, "clig" 1, "calt" 1 !important;
        }
        .malayalam-doc h1, .malayalam-doc h2, .malayalam-doc h3 {
          break-after: avoid !important;
          page-break-after: avoid !important;
        }
        .malayalam-doc table.mps-table tr, .malayalam-doc img {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
        .malayalam-doc p {
          orphans: 3 !important;
          widows: 3 !important;
        }
      }
    `;

    setTimeout(() => {
      try {
        window.print();
      } catch {
        // Handled via toast note for embedded preview iframes
      }
      setIsPrinting(false);
    }, 150);
  };

  // Export Project Draft (.mps JSON file) for Mobile-to-PC transfer
  const handleExportDraftMps = () => {
    if (!editorRef.current) return;
    const payload: SavedProjectState = {
      docTitle,
      htmlContent: editorRef.current.innerHTML,
      paperSize,
      customWidthMm,
      customHeightMm,
      orientation,
      marginPreset,
      margins,
      defaultDocFontId,
      showHeaderFooter,
      headerText,
      footerText,
      showPageNumbers,
      differentFirstPage,
      pageNumberPosition,
      pageNumberAlign,
      pageNumberFormat,
      lineSpacing,
      letterSpacing,
      firstLineIndent,
      spaceAfterParagraph,
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
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (docTitle || 'malayalam-document').replace(/[^a-zA-Z0-9\u0D00-\u0D7F_-]/g, '_');
    a.href = url;
    a.download = `${safeName}.mps`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActiveDrawer('none');
    triggerToast('Saved Draft (.mps) file. You can open this file on any mobile or PC.');
  };

  // Import Project Draft (.mps JSON file)
  const handleImportDraftMps = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as Partial<SavedProjectState>;
        applyProjectState(parsed);
        setTimeout(() => {
          saveToLocalStorage();
          updateDocumentMetrics();
        }, 50);
        setActiveDrawer('none');
        triggerToast(`Loaded project draft "${file.name}" (${parsed.paperSize || 'Custom'}).`);
      } catch {
        triggerToast('Invalid .mps draft file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Download Self-Contained Standalone Single-File HTML (with all Malayalam Google Fonts + SMC @font-face + Print CSS)
  const handleExportStandaloneHtml = () => {
    if (!editorRef.current) return;
    const activeBgColor = printBackgroundTint ? PAPER_TINTS[paperTint].hex : '#FFFFFF';
    const standaloneHtml = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Anek+Malayalam:wght@400;600;700;800&family=Baloo+Chettan+2:wght@500;700;800&family=Chilanka&family=Gayathri:wght@400;700&family=Manjari:wght@400;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&family=Noto+Serif+Malayalam:wght@400;500;600;700&family=Tiro+Malayalam:ital@0;1&display=swap" rel="stylesheet" />
  <style>
    @font-face {
      font-family: 'Rachana';
      src: local('Rachana'), local('Rachana-Regular'), url('https://smc.org.in/downloads/fonts/rachana/Rachana-Regular.woff2') format('woff2');
      font-display: swap;
    }
    @font-face {
      font-family: 'Meera';
      src: local('Meera'), local('Meera-Regular'), url('https://smc.org.in/downloads/fonts/meera/Meera-Regular.woff2') format('woff2');
      font-display: swap;
    }
    @font-face {
      font-family: 'Dyuthi';
      src: local('Dyuthi'), local('Dyuthi-Regular'), url('https://smc.org.in/downloads/fonts/dyuthi/Dyuthi-Regular.woff2') format('woff2');
      font-display: swap;
    }
    @page {
      size: ${effectiveWidthMm}mm ${effectiveHeightMm}mm;
      margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
    }
    * {
      box-sizing: border-box;
      font-feature-settings: "kern" 1, "liga" 1, "clig" 1, "calt" 1;
    }
    body {
      font-family: ${activeDefaultFontObj.cssFamily};
      background: #F1F3F4;
      margin: 0;
      padding: 24px 12px;
      color: #111827;
    }
    .print-bar {
      max-width: ${effectiveWidthMm}mm;
      margin: 0 auto 14px auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #fff;
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px solid #DADCE0;
    }
    .print-btn {
      background: #1A73E8;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
    }
    .sheet {
      position: relative;
      width: ${effectiveWidthMm}mm;
      min-height: ${effectiveHeightMm}mm;
      margin: 0 auto;
      background: ${PAPER_TINTS[paperTint].hex};
      padding: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
      box-shadow: 0 2px 10px rgba(0,0,0,0.12);
      line-height: ${lineSpacing};
      letter-spacing: ${letterSpacing};
      font-family: ${activeDefaultFontObj.cssFamily};
    }
    .doc-body {
      ${columnCount > 1 ? `column-count: ${columnCount}; column-gap: 6mm; column-rule: 1px solid #E5E7EB;` : ''}
    }
    ${firstLineIndent ? '.doc-body p { text-indent: 8mm; }' : ''}
    h1, h2, h3 { break-after: avoid; page-break-after: avoid; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    tr, img { break-inside: avoid; page-break-inside: avoid; }
    th, td { border: 1px solid #4B5563; padding: 6px 8px; text-align: left; }
    th { background: #F3F4F6; }
    hr { border: 0; border-top: 1.5px solid #374151; margin: 12px 0; }
    .mps-page-break { page-break-before: always; break-before: page; height: 0; }
    @media print {
      body { background: ${activeBgColor}; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .print-bar { display: none !important; }
      .sheet { width: 100%; min-height: auto; box-shadow: none; padding: 0; background: ${activeBgColor}; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span><strong>${docTitle}</strong> (${paperSize} · ${effectiveWidthMm}×${effectiveHeightMm}mm)</span>
    <button class="print-btn" onclick="document.fonts.ready.then(() => window.print())">Print / Save as PDF</button>
  </div>
  <div class="sheet">
    ${showHeaderFooter && !differentFirstPage && headerText ? `<div style="font-size: 9pt; color: #6B7280; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; margin-bottom: 12px;">${headerText}</div>` : ''}
    <div class="doc-body">${editorRef.current.innerHTML}</div>
    ${showHeaderFooter && (footerText || (showPageNumbers && !differentFirstPage)) ? `<div style="font-size: 9pt; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 4px; margin-top: 16px; display: flex; justify-content: space-between;"><span>${footerText}</span><span>${showPageNumbers && !differentFirstPage ? formatPageNumberLabel(1, estimatedPages) : ''}</span></div>` : ''}
  </div>
</body>
</html>`;
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(docTitle || 'malayalam-print').replace(/[^a-zA-Z0-9\u0D00-\u0D7F_-]/g, '_')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setActiveDrawer('none');
    triggerToast('Downloaded single-file Print-Ready HTML with all Malayalam fonts.');
  };

  // Generate subtle horizontal page-break guide markers for multi-page preview
  const pageBreakGuides = [];
  for (let p = 1; p < estimatedPages; p++) {
    pageBreakGuides.push(p * effectiveHeightMm);
  }

  // Generate horizontal millimeter ruler ticks (every 10mm)
  const rulerTicksMm = [];
  for (let mm = 0; mm <= Math.floor(effectiveWidthMm); mm += 10) {
    rulerTicksMm.push(mm);
  }

  // Toggle between Auto-Fit and 100% actual size with 1 tap
  const handleToggleZoomFit = () => {
    if (zoom === 0) {
      setZoom(100);
      triggerToast('Zoom: 100% (Actual Print Size — swipe to pan)');
    } else {
      setZoom(0);
      triggerToast(`Zoom: Auto-Fit to Screen (${Math.round(autoFitScale * 100)}%)`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F3F4] text-[#202124] pb-16">
      {/* Hidden File Inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />
      <input
        ref={draftInputRef}
        type="file"
        accept=".mps,application/json"
        className="hidden"
        onChange={handleImportDraftMps}
      />

      {/* CLEAN PREVIEW FLOATING BAR */}
      {cleanPreviewMode && (
        <div className="no-print sticky top-0 z-50 bg-[#202124] text-white px-4 py-2.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2 text-xs">
            <Eye className="w-4 h-4 text-[#8AB4F8]" />
            <span className="font-semibold">Clean Preview</span>
            <span className="text-[#9AA0A6]">
              ({paperSize} · {effectiveWidthMm}×{effectiveHeightMm}mm)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSavePrintReadyPDF}
              className="px-3.5 py-1.5 text-xs font-semibold bg-[#1A73E8] hover:bg-[#1557B0] text-white rounded-full flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF ({paperSize})</span>
            </button>
            <button
              type="button"
              onClick={() => setCleanPreviewMode(false)}
              className="px-3 py-1.5 text-xs font-medium bg-[#3C4043] hover:bg-[#5F6368] text-white rounded-full flex items-center gap-1 cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. MINIMALIST SINGLE-ROW TOP HEADER */}
      {!cleanPreviewMode && (
        <header className="no-print bg-white border-b border-[#DADCE0] px-3 sm:px-5 h-14 flex items-center justify-between gap-2 shrink-0">
          {/* Left: App Icon + Editable Document Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div
              title={`Malayalam Print Studio — ${fontReadyStatus === 'ready' ? '11 Malayalam Print Fonts Ready' : 'Loading Malayalam Fonts...'}`}
              className="w-9 h-9 rounded-xl bg-[#1A73E8] flex items-center justify-center text-white font-bold text-base shrink-0 shadow-xs select-none"
            >
              മ
            </div>
            <div className="min-w-0 flex-1">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                aria-label="Document Title"
                placeholder="ഡോക്യുമെന്റ് പേര്..."
                className="w-full text-sm sm:text-base font-semibold text-[#202124] bg-transparent border border-transparent hover:border-[#DADCE0] focus:border-[#1A73E8] focus:bg-[#F8F9FA] rounded-lg px-2 py-1 outline-none transition-colors truncate"
                style={{ fontFamily: "'Noto Sans Malayalam', 'Plus Jakarta Sans', sans-serif" }}
              />
            </div>
          </div>

          {/* Right: Prominent PDF Export Button + Single More (⋮) Menu Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSavePrintReadyPDF}
              disabled={isPrinting}
              className="h-10 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-white bg-[#1A73E8] hover:bg-[#1557B0] active:bg-[#174EA6] rounded-full shadow-xs flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>PDF ({paperSize})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveDrawer((prev) => (prev === 'more' ? 'none' : 'more'))}
              aria-label="More Options, Templates & Drafts"
              title="Templates, Save/Open .mps Draft, Preview & Stats"
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                activeDrawer === 'more'
                  ? 'bg-[#E8F0FE] text-[#1A73E8]'
                  : 'text-[#3C4043] hover:bg-[#F1F3F4]'
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>
      )}

      {/* 2. STREAMLINED SINGLE-ROW FORMATTING TOOLBAR (With Visual Malayalam Font Family Selector right next to Font Size) */}
      {!cleanPreviewMode && (
        <div className="no-print sticky top-0 z-30 bg-white border-b border-[#DADCE0] shadow-2xs">
          <div
            onMouseDown={(e) => {
              const tag = (e.target as HTMLElement).tagName;
              if (tag !== 'SELECT' && tag !== 'INPUT') {
                e.preventDefault();
              }
            }}
            className="px-2.5 sm:px-5 py-1.5 flex items-center gap-1 overflow-x-auto toolbar-scroll"
          >
            {/* Undo & Redo */}
            <button
              type="button"
              onClick={() => execCmd('undo')}
              title="Undo"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('redo')}
              title="Redo"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Redo2 className="w-4 h-4" />
            </button>

            <div className="h-5 w-[1px] bg-[#DADCE0] mx-0.5 shrink-0" />

            {/* Text Style Selector */}
            <select
              aria-label="Text Style"
              value={currentBlockStyle}
              onMouseDown={saveSelection}
              onChange={(e) => applyBlockStyle(e.target.value)}
              className="min-h-[40px] text-xs font-medium text-[#202124] bg-[#F8F9FA] border border-[#DADCE0] rounded-lg px-2 outline-none shrink-0 cursor-pointer"
            >
              <option value="p">സാധാരണ (Normal)</option>
              <option value="title">ശീർഷകം (Title)</option>
              <option value="h1">തലക്കെട്ട് 1 (H1)</option>
              <option value="h2">തലക്കെട്ട് 2 (H2)</option>
              <option value="h3">തലക്കെട്ട് 3 (H3)</option>
            </select>

            {/* PROMINENT MALAYALAM FONT FAMILY SELECTOR (Right next to Font Size) */}
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setActiveDrawer((prev) => (prev === 'font-picker' ? 'none' : 'font-picker'));
              }}
              title="Choose Malayalam Print / DTP Font Family (Applies to selected text or paragraph)"
              style={{ fontFamily: activeToolbarFontObj.cssFamily }}
              className={`min-h-[40px] px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors whitespace-nowrap ${
                activeDrawer === 'font-picker'
                  ? 'bg-[#E8F0FE] border-[#1A73E8] text-[#1A73E8]'
                  : 'bg-[#F8F9FA] hover:bg-[#F1F3F4] border-[#DADCE0] text-[#202124]'
              }`}
            >
              <Type className="w-3.5 h-3.5 text-[#1A73E8] shrink-0" />
              <span className="max-w-[135px] truncate">{activeToolbarFontObj.mlName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#5F6368] shrink-0" />
            </button>

            {/* Font Size Selector (8pt - 48pt) */}
            <select
              aria-label="Font Size (pt)"
              value={currentFontSizePt}
              onMouseDown={saveSelection}
              onChange={(e) => applyFontSizePt(Number(e.target.value))}
              className="min-h-[40px] text-xs font-mono tabular-nums font-semibold text-[#202124] bg-[#F8F9FA] border border-[#DADCE0] rounded-lg px-2 outline-none shrink-0 cursor-pointer"
            >
              {FONT_SIZES_PT.map((pt) => (
                <option key={pt} value={pt}>
                  {pt} pt
                </option>
              ))}
            </select>

            <div className="h-5 w-[1px] bg-[#DADCE0] mx-0.5 shrink-0" />

            {/* Bold, Italic, Underline */}
            <button
              type="button"
              onClick={() => execCmd('bold')}
              title="Bold"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('italic')}
              title="Italic"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('underline')}
              title="Underline"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Underline className="w-4 h-4" />
            </button>

            {/* Text Color & Highlight Color */}
            <label
              title="Text Color"
              onMouseDown={saveSelection}
              className="relative min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] text-[#3C4043] shrink-0 cursor-pointer flex items-center justify-center"
            >
              <Palette className="w-4 h-4" style={{ color: textColor }} />
              <span
                className="w-4 h-1 rounded-full absolute bottom-1.5"
                style={{ backgroundColor: textColor }}
              />
              <input
                type="color"
                value={textColor}
                onChange={(e) => {
                  setTextColor(e.target.value);
                  execCmd('foreColor', e.target.value);
                }}
                className="sr-only"
              />
            </label>

            <label
              title="Highlight Color"
              onMouseDown={saveSelection}
              className="relative min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] text-[#3C4043] shrink-0 cursor-pointer flex items-center justify-center"
            >
              <Highlighter className="w-4 h-4" />
              <span
                className="w-4 h-1 rounded-full absolute bottom-1.5"
                style={{ backgroundColor: highlightColor }}
              />
              <input
                type="color"
                value={highlightColor}
                onChange={(e) => {
                  setHighlightColor(e.target.value);
                  execCmd('hiliteColor', e.target.value);
                }}
                className="sr-only"
              />
            </label>

            <div className="h-5 w-[1px] bg-[#DADCE0] mx-0.5 shrink-0" />

            {/* Alignment: Left, Center, Right, Justify */}
            <button
              type="button"
              onClick={() => execCmd('justifyLeft')}
              title="Align Left"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyCenter')}
              title="Align Center"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyRight')}
              title="Align Right"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyFull')}
              title="Justify"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <AlignJustify className="w-4 h-4" />
            </button>

            <div className="h-5 w-[1px] bg-[#DADCE0] mx-0.5 shrink-0" />

            {/* Lists & Indentation */}
            <button
              type="button"
              onClick={() => execCmd('insertUnorderedList')}
              title="Bulleted List"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertOrderedList')}
              title="Numbered List"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('outdent')}
              title="Decrease Indent"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <IndentDecrease className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('indent')}
              title="Increase Indent"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] active:bg-[#E8EAED] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <IndentIncrease className="w-4 h-4" />
            </button>

            <div className="h-5 w-[1px] bg-[#DADCE0] mx-0.5 shrink-0" />

            {/* Line Spacing & Extra Formatting */}
            <div className="flex items-center gap-1 bg-[#F8F9FA] border border-[#DADCE0] rounded-lg px-2 min-h-[40px] shrink-0" title="Line Spacing">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#5F6368]" />
              <select
                aria-label="Line Spacing"
                value={lineSpacing}
                onChange={(e) => setLineSpacing(e.target.value)}
                className="text-xs font-mono tabular-nums text-[#202124] bg-transparent outline-none cursor-pointer"
              >
                {LINE_SPACINGS.map((ls) => (
                  <option key={ls} value={ls}>
                    {ls}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => execCmd('strikeThrough')}
              title="Strikethrough"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('subscript')}
              title="Subscript"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Subscript className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('superscript')}
              title="Superscript"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Superscript className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('removeFormat')}
              title="Clear Formatting"
              className="min-w-[40px] min-h-[40px] rounded-lg hover:bg-[#F1F3F4] text-[#3C4043] flex items-center justify-center shrink-0 cursor-pointer"
            >
              <RemoveFormatting className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowFindModal((prev) => !prev)}
              title="Find & Replace"
              className={`min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center shrink-0 cursor-pointer ${
                showFindModal ? 'bg-[#E8F0FE] text-[#1A73E8]' : 'hover:bg-[#F1F3F4] text-[#3C4043]'
              }`}
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* CONTEXTUAL FLOATING BAR FOR TABLE EDITING */}
          {activeTableCell && (
            <div className="bg-[#E8F0FE] border-t border-[#D2E3FC] px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto toolbar-scroll">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-semibold text-[#174EA6] flex items-center gap-1 whitespace-nowrap">
                  <TableIcon className="w-3.5 h-3.5" />
                  പട്ടിക (Table):
                </span>
                <button
                  type="button"
                  onClick={() => modifyActiveTable('addRow')}
                  className="px-2.5 py-1 text-xs font-medium bg-white text-[#1A73E8] border border-[#D2E3FC] rounded-md hover:bg-[#F8FAFC] flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Row
                </button>
                <button
                  type="button"
                  onClick={() => modifyActiveTable('addCol')}
                  className="px-2.5 py-1 text-xs font-medium bg-white text-[#1A73E8] border border-[#D2E3FC] rounded-md hover:bg-[#F8FAFC] flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Col
                </button>
                <button
                  type="button"
                  onClick={() => modifyActiveTable('delRow')}
                  className="px-2.5 py-1 text-xs font-medium bg-white text-[#B91C1C] border border-[#FECACA] rounded-md hover:bg-[#FEF2F2] flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Row
                </button>
                <button
                  type="button"
                  onClick={() => modifyActiveTable('delCol')}
                  className="px-2.5 py-1 text-xs font-medium bg-white text-[#B91C1C] border border-[#FECACA] rounded-md hover:bg-[#FEF2F2] flex items-center gap-1 whitespace-nowrap cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Col
                </button>
                <div className="h-4 w-[1px] bg-[#93C5FD]" />
                <button
                  type="button"
                  onClick={() => modifyActiveTable('borderStandard')}
                  className="px-2 py-1 text-xs bg-white border border-[#D2E3FC] rounded-md text-[#1E3A8A] cursor-pointer whitespace-nowrap"
                >
                  Thin Grid
                </button>
                <button
                  type="button"
                  onClick={() => modifyActiveTable('borderHeavy')}
                  className="px-2 py-1 text-xs bg-white border border-[#D2E3FC] rounded-md text-[#1E3A8A] font-semibold cursor-pointer whitespace-nowrap"
                >
                  Bold Grid
                </button>
                <button
                  type="button"
                  onClick={() => modifyActiveTable('borderNone')}
                  className="px-2 py-1 text-xs bg-white border border-[#D2E3FC] rounded-md text-[#1E3A8A] cursor-pointer whitespace-nowrap"
                >
                  No Border
                </button>
              </div>
              <button
                type="button"
                onClick={() => modifyActiveTable('deleteTable')}
                className="px-2.5 py-1 text-xs font-medium bg-[#FEE2E2] text-[#991B1B] rounded-md hover:bg-[#FECACA] shrink-0 whitespace-nowrap cursor-pointer"
              >
                Delete Table
              </button>
            </div>
          )}

          {/* CONTEXTUAL FLOATING BAR FOR IMAGE RESIZING & ALIGNMENT */}
          {activeImage && (
            <div className="bg-[#E8F0FE] border-t border-[#D2E3FC] px-3 py-1.5 flex items-center justify-between gap-3 overflow-x-auto toolbar-scroll">
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-semibold text-[#174EA6] flex items-center gap-1 whitespace-nowrap">
                  <ImageIcon className="w-3.5 h-3.5" />
                  ചിത്രം (Image):
                </span>
                <label className="flex items-center gap-2 text-xs text-[#1E3A8A]">
                  <input
                    type="range"
                    min={15}
                    max={100}
                    value={activeImageWidthPct}
                    onChange={(e) => updateSelectedImageStyle(Number(e.target.value))}
                    className="w-28 accent-[#1A73E8] cursor-pointer"
                  />
                  <span className="font-mono tabular-nums font-semibold">{activeImageWidthPct}%</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => updateSelectedImageStyle(undefined, 'left')}
                    className="px-2 py-1 text-xs bg-white border border-[#D2E3FC] rounded-md text-[#1E3A8A] cursor-pointer"
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedImageStyle(undefined, 'center')}
                    className="px-2 py-1 text-xs bg-white border border-[#D2E3FC] rounded-md text-[#1E3A8A] cursor-pointer"
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSelectedImageStyle(undefined, 'right')}
                    className="px-2 py-1 text-xs bg-white border border-[#D2E3FC] rounded-md text-[#1E3A8A] cursor-pointer"
                  >
                    Right
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  activeImage.remove();
                  setActiveImage(null);
                  saveToLocalStorage();
                  updateDocumentMetrics();
                }}
                className="px-2.5 py-1 text-xs font-medium bg-[#FEE2E2] text-[#991B1B] rounded-md hover:bg-[#FECACA] shrink-0 cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* POPOVER MODAL: FIND & REPLACE */}
      {showFindModal && (
        <div className="no-print fixed top-28 right-4 z-50 bg-white border border-[#DADCE0] rounded-2xl shadow-xl p-4 w-80">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-[#202124] flex items-center gap-1.5">
              <Search className="w-4 h-4 text-[#1A73E8]" />
              Find &amp; Replace (തിരയുക / മാറ്റുക)
            </h3>
            <button
              type="button"
              onClick={() => setShowFindModal(false)}
              className="text-[#5F6368] hover:text-[#202124] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2.5">
            <div>
              <input
                type="text"
                value={findQuery}
                onChange={(e) => setFindQuery(e.target.value)}
                placeholder="Find word (ഉദാ: സ്വാതന്ത്ര്യം)..."
                className="w-full border border-[#DADCE0] rounded-lg px-3 py-2 text-xs text-[#202124] outline-none focus:border-[#1A73E8]"
                style={{ fontFamily: "'Noto Sans Malayalam', sans-serif" }}
              />
              {findMatchCount !== null && (
                <p className="text-[11px] text-[#5F6368] mt-1">
                  Found <strong className="font-mono tabular-nums">{findMatchCount}</strong> match(es)
                </p>
              )}
            </div>
            <div>
              <input
                type="text"
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                className="w-full border border-[#DADCE0] rounded-lg px-3 py-2 text-xs text-[#202124] outline-none focus:border-[#1A73E8]"
                style={{ fontFamily: "'Noto Sans Malayalam', sans-serif" }}
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleFindCount}
                className="flex-1 py-2 text-xs font-semibold text-[#1A73E8] bg-[#E8F0FE] hover:bg-[#D2E3FC] rounded-lg cursor-pointer"
              >
                Find
              </button>
              <button
                type="button"
                onClick={handleReplaceAll}
                className="flex-1 py-2 text-xs font-semibold text-white bg-[#1A73E8] hover:bg-[#1557B0] rounded-lg cursor-pointer"
              >
                Replace All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT TOAST / PRINT GUIDANCE BANNER */}
      {toastMessage && (
        <div className="no-print fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[92%] bg-[#202124] text-white px-4 py-3 rounded-xl shadow-xl flex items-start justify-between gap-3 border border-[#3C4043]">
          <div className="flex items-start gap-2.5 text-xs leading-relaxed">
            <Info className="w-4 h-4 text-[#8AB4F8] shrink-0 mt-0.5" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[#9AA0A6] hover:text-white shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN WORKSPACE & LIVE PHYSICAL PAPER SHEET */}
      <main
        id="mps-workspace-container"
        className="flex-1 overflow-x-auto overflow-y-auto py-4 sm:py-7 px-2 sm:px-6 flex justify-center items-start"
      >
        <div
          id="mps-paper-zoom-outer"
          style={{
            width: activeScale < 1 ? `${Math.ceil(paperWidthPx * activeScale)}px` : undefined,
          }}
          className="flex flex-col items-center max-w-full"
        >
          <div
            id="mps-paper-zoom-wrapper"
            style={{
              transform: activeScale !== 1 ? `scale(${activeScale})` : 'none',
              transformOrigin: 'top center',
              transition: 'transform 150ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className="flex flex-col items-center"
          >
            {/* Non-printed Paper Dimension Info Header above the sheet */}
            <div className="no-print w-full flex items-center justify-between text-[11px] text-[#5F6368] mb-1.5 px-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[#202124]">{PAPER_SIZES[paperSize].shortLabel}</span>
                <span>·</span>
                <span className="font-mono tabular-nums">
                  {effectiveWidthMm}×{effectiveHeightMm}mm ({orientation})
                </span>
                <span>·</span>
                <span className="text-[#1A73E8] font-medium truncate max-w-[140px]">
                  {activeDefaultFontObj.name}
                </span>
              </div>
              <div className="font-mono tabular-nums">
                {estimatedPages} Page{estimatedPages > 1 ? 's' : ''} · {wordCount} Words
              </div>
            </div>

            {/* Optional Horizontal Millimeter Ruler */}
            {showRuler && !cleanPreviewMode && (
              <div
                style={{ width: `${effectiveWidthMm}mm` }}
                className="no-print relative h-5 bg-[#F8F9FA] border border-[#DADCE0] border-b-0 select-none overflow-hidden mb-0.5"
              >
                <div
                  style={{ width: `${margins.left}mm` }}
                  className="absolute top-0 bottom-0 left-0 bg-[#E8EAED]"
                />
                <div
                  style={{ width: `${margins.right}mm` }}
                  className="absolute top-0 bottom-0 right-0 bg-[#E8EAED]"
                />
                {rulerTicksMm.map((mm) => (
                  <div
                    key={mm}
                    style={{ left: `${mm}mm` }}
                    className="absolute top-0 bottom-0 flex flex-col justify-end items-start"
                  >
                    <span className="text-[8px] font-mono tabular-nums text-[#5F6368] pl-0.5 leading-none mb-0.5">
                      {mm}
                    </span>
                    <div className="w-[1px] h-1.5 bg-[#80868B]" />
                  </div>
                ))}
              </div>
            )}

            {/* LIVE VISUAL PAPER CANVAS IN EXACT MILLIMETERS */}
            <div
              id="mps-paper-sheet"
              style={{
                width: `${effectiveWidthMm}mm`,
                minHeight: `${effectiveHeightMm}mm`,
                paddingTop: `${margins.top}mm`,
                paddingRight: `${margins.right}mm`,
                paddingBottom: `${margins.bottom}mm`,
                paddingLeft: `${margins.left}mm`,
                backgroundColor: PAPER_TINTS[paperTint].hex,
              }}
              className="relative shadow-[0_1px_3px_rgba(60,64,67,0.15),0_4px_12px_rgba(60,64,67,0.12)] border border-[#DADCE0] flex flex-col justify-between transition-all duration-150"
            >
              {/* Print Crop Marks */}
              {showCropMarks && (
                <>
                  <div className="pointer-events-none absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t border-l border-[#374151]" />
                  <div className="pointer-events-none absolute top-1.5 right-1.5 w-3.5 h-3.5 border-t border-r border-[#374151]" />
                  <div className="pointer-events-none absolute bottom-1.5 left-1.5 w-3.5 h-3.5 border-b border-l border-[#374151]" />
                  <div className="pointer-events-none absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b border-r border-[#374151]" />
                </>
              )}

              {/* Page Border Frame Overlay */}
              {screenBorderStyle && <div id="mps-page-border-frame" style={screenBorderStyle} />}

              {/* Diagonal Watermark Overlay */}
              {watermarkText.trim() !== '' && (
                <div
                  id="mps-watermark-overlay"
                  className="malayalam-watermark pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-10 select-none"
                >
                  <span
                    style={{
                      transform: 'rotate(-34deg)',
                      fontSize: effectiveWidthMm < 170 ? '30pt' : '44pt',
                      color: 'rgba(17, 24, 39, 0.085)',
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                      fontFamily: activeDefaultFontObj.cssFamily,
                    }}
                  >
                    {watermarkText}
                  </span>
                </div>
              )}

              {/* Subtle Multi-Page Height Guide Markers (Non-Printing) */}
              {pageBreakGuides.map((guideMm, idx) => (
                <div
                  key={guideMm}
                  style={{ top: `${guideMm}mm` }}
                  className="no-print pointer-events-none absolute left-0 right-0 border-t border-dashed border-[#1A73E8]/40 flex justify-end pr-2 z-20"
                >
                  <span className="text-[9px] font-mono tabular-nums text-[#1A73E8] bg-white/90 px-1.5 -mt-2">
                    End of Page {idx + 1} ({guideMm} mm)
                  </span>
                </div>
              ))}

              {/* OPTIONAL RUNNING DOCUMENT HEADER */}
              {showHeaderFooter && !differentFirstPage && (
                <div
                  style={{ fontFamily: activeDefaultFontObj.cssFamily }}
                  className="malayalam-header-footer relative z-20 mb-3 pb-1.5 border-b border-[#E5E7EB] flex items-center justify-between gap-3 text-[9.5pt] text-[#4B5563]"
                >
                  {showPageNumbers && pageNumberPosition === 'top' && pageNumberAlign === 'left' && (
                    <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                      {formatPageNumberLabel(1, estimatedPages)}
                    </span>
                  )}
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="ഹെഡർ ചേർക്കുക (Document Header)..."
                    className={`flex-1 bg-transparent outline-none focus:text-[#111827] ${
                      showPageNumbers && pageNumberPosition === 'top' && pageNumberAlign === 'center'
                        ? 'text-left'
                        : ''
                    }`}
                  />
                  {showPageNumbers && pageNumberPosition === 'top' && pageNumberAlign === 'center' && (
                    <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                      {formatPageNumberLabel(1, estimatedPages)}
                    </span>
                  )}
                  {showPageNumbers && pageNumberPosition === 'top' && pageNumberAlign === 'right' && (
                    <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                      {formatPageNumberLabel(1, estimatedPages)}
                    </span>
                  )}
                </div>
              )}

              {/* RICH-TEXT CONTENTEDITABLE MALAYALAM BODY */}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                onClick={handleEditorClick}
                onKeyUp={() => {
                  saveSelection();
                  detectFontAtCursor();
                  updateDocumentMetrics();
                }}
                onInput={() => {
                  saveToLocalStorage();
                  updateDocumentMetrics();
                }}
                style={{
                  fontFamily: activeDefaultFontObj.cssFamily,
                  lineHeight: lineSpacing,
                  letterSpacing: letterSpacing,
                }}
                className={`malayalam-doc relative z-20 flex-1 text-[11pt] ${
                  spaceAfterParagraph ? '[&_p]:mb-2.5' : '[&_p]:mb-0.5'
                } ${firstLineIndent ? 'first-line-indent' : ''} ${
                  columnCount === 2 ? 'cols-2' : columnCount === 3 ? 'cols-3' : ''
                }`}
              />

              {/* OPTIONAL RUNNING DOCUMENT FOOTER & AUTOMATIC PAGE NUMBERING */}
              {showHeaderFooter && (
                <div
                  style={{ fontFamily: activeDefaultFontObj.cssFamily }}
                  className="malayalam-header-footer relative z-20 mt-4 pt-1.5 border-t border-[#E5E7EB] flex items-center justify-between gap-4 text-[9.5pt] text-[#4B5563]"
                >
                  {showPageNumbers &&
                    !differentFirstPage &&
                    pageNumberPosition === 'bottom' &&
                    pageNumberAlign === 'left' && (
                      <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                        {formatPageNumberLabel(1, estimatedPages)}
                      </span>
                    )}
                  <input
                    type="text"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    placeholder="ഫൂട്ടർ ചേർക്കുക (Document Footer)..."
                    className="flex-1 bg-transparent outline-none focus:text-[#111827]"
                  />
                  {showPageNumbers &&
                    !differentFirstPage &&
                    pageNumberPosition === 'bottom' &&
                    pageNumberAlign === 'center' && (
                      <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                        {formatPageNumberLabel(1, estimatedPages)}
                      </span>
                    )}
                  {showPageNumbers &&
                    !differentFirstPage &&
                    pageNumberPosition === 'bottom' &&
                    pageNumberAlign === 'right' && (
                      <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                        {formatPageNumberLabel(1, estimatedPages)}
                      </span>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* SLEEK THUMB-FRIENDLY BOTTOM ACTION BAR WITH 3 PILL BUTTONS */}
      {!cleanPreviewMode && (
        <nav
          aria-label="Document & Page Actions"
          className="no-print fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DADCE0] px-3 py-2 flex items-center justify-center gap-2 sm:gap-3 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
        >
          {/* Pill 1: Page & Print Drawer */}
          <button
            type="button"
            onClick={() => setActiveDrawer((prev) => (prev === 'page-print' ? 'none' : 'page-print'))}
            className={`flex-1 max-w-[175px] h-10 px-3.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeDrawer === 'page-print'
                ? 'bg-[#1A73E8] text-white shadow-xs'
                : 'bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#202124]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" />
            <span>Page &amp; Print ({paperSize})</span>
          </button>

          {/* Pill 2: Insert Drawer */}
          <button
            type="button"
            onClick={() => {
              saveSelection();
              setActiveDrawer((prev) => (prev === 'insert' ? 'none' : 'insert'));
            }}
            className={`flex-1 max-w-[140px] h-10 px-3.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              activeDrawer === 'insert'
                ? 'bg-[#1A73E8] text-white shadow-xs'
                : 'bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#202124]'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Insert (ചേർക്കുക)</span>
          </button>

          {/* Pill 3: Zoom Fit / 100% Toggle */}
          <button
            type="button"
            onClick={handleToggleZoomFit}
            className={`flex-1 max-w-[155px] h-10 px-3.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              zoom === 100
                ? 'bg-[#E8F0FE] text-[#1A73E8] border border-[#D2E3FC]'
                : 'bg-[#F1F3F4] hover:bg-[#E8EAED] text-[#202124]'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 shrink-0" />
            <span>Zoom: {zoom === 0 ? `Fit (${activeScalePct}%)` : `${zoom}%`}</span>
          </button>
        </nav>
      )}

      {/* SLIDE-UP BOTTOM SHEET OVERLAY BACKDROP */}
      {activeDrawer !== 'none' && (
        <div
          onClick={() => setActiveDrawer('none')}
          className="no-print fixed inset-0 z-50 bg-black/35 backdrop-blur-[1px] flex items-end justify-center transition-opacity"
        >
          {/* BOTTOM SHEET CONTAINER */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl bg-white rounded-t-3xl shadow-2xl border-t border-[#DADCE0] max-h-[82vh] flex flex-col overflow-hidden"
          >
            {/* Bottom Sheet Handle & Header */}
            <div className="pt-2.5 pb-3 px-5 border-b border-[#E8EAED] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#1A73E8]" />
                <h2 className="text-sm font-bold text-[#202124]">
                  {activeDrawer === 'font-picker' && 'Malayalam Print & DTP Fonts (മലയാളം ഫോണ്ടുകൾ)'}
                  {activeDrawer === 'page-print' && 'Page & Print Setup (പേജ് ക്രമീകരണം)'}
                  {activeDrawer === 'insert' && 'Insert Elements (ഉള്ളടക്കം ചേർക്കുക)'}
                  {activeDrawer === 'more' && 'Templates, Drafts & Document Info'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrawer('none')}
                className="w-8 h-8 rounded-full bg-[#F1F3F4] hover:bg-[#E8EAED] flex items-center justify-center text-[#5F6368] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DRAWER 0: VISUAL MALAYALAM PRINT & DTP FONT FAMILY PICKER */}
            {activeDrawer === 'font-picker' && (
              <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
                <div className="bg-[#E8F0FE] text-[#174EA6] px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-2">
                  <span>
                    Tap any font below to apply to <strong>selected text / heading</strong>, or set as the{' '}
                    <strong>whole document default</strong>.
                  </span>
                </div>

                {FONT_CATEGORIES.map((category) => (
                  <div key={category} className="space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#5F6368] px-1">
                      {category}
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {MALAYALAM_FONTS.filter((f) => f.category === category).map((font) => {
                        const isSelected = currentFontId === font.id;
                        const isDocDefault = defaultDocFontId === font.id;
                        return (
                          <div
                            key={font.id}
                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-[#E8F0FE]/70 border-[#1A73E8] shadow-2xs'
                                : 'bg-[#F8F9FA] hover:bg-white border-[#E8EAED]'
                            }`}
                          >
                            {/* Left: Clickable Font Preview Specimen rendered in its actual Malayalam Typeface */}
                            <button
                              type="button"
                              onClick={() => applyMalayalamFontFamily(font.id, false)}
                              style={{ fontFamily: font.cssFamily }}
                              className="flex-1 text-left cursor-pointer min-w-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm sm:text-base font-bold text-[#202124] truncate">
                                  {font.mlName}
                                </span>
                                {isDocDefault && (
                                  <span
                                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                                    className="text-[10px] font-semibold text-[#1A73E8] bg-white px-2 py-0.5 rounded-md border border-[#D2E3FC]"
                                  >
                                    Doc Default
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-[#4B5563] mt-0.5 truncate">
                                {font.specimen}
                              </div>
                            </button>

                            {/* Right: Apply to Selection vs Set Entire Doc Default */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => applyMalayalamFontFamily(font.id, false)}
                                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#1A73E8] text-white hover:bg-[#1557B0] cursor-pointer whitespace-nowrap"
                              >
                                Apply
                              </button>
                              <button
                                type="button"
                                onClick={() => applyMalayalamFontFamily(font.id, true)}
                                title="Set as default font for the entire document"
                                className="px-2 py-1.5 rounded-lg text-[11px] font-medium bg-white border border-[#DADCE0] text-[#3C4043] hover:bg-[#F1F3F4] cursor-pointer whitespace-nowrap"
                              >
                                Whole Doc
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* DRAWER 1: PAGE & PRINT SETUP */}
            {activeDrawer === 'page-print' && (
              <div className="p-5 overflow-y-auto space-y-5 text-xs">
                {/* Section A: Paper Size Quick Cards & Orientation */}
                <div className="bg-[#F8F9FA] p-3.5 rounded-2xl border border-[#E8EAED] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#202124]">1. Paper Size (പേപ്പർ വലുപ്പം)</span>
                    <span className="font-mono text-[11px] text-[#1A73E8] font-semibold">
                      {effectiveWidthMm} × {effectiveHeightMm} mm
                    </span>
                  </div>

                  {/* Quick A5 & A4 Cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handlePaperSizeChange('A5')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        paperSize === 'A5'
                          ? 'bg-[#E8F0FE] border-[#1A73E8] text-[#174EA6] shadow-2xs'
                          : 'bg-white border-[#DADCE0] text-[#3C4043]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">A5 Notice</div>
                        <div className="text-[11px] opacity-80">148 × 210 mm · നോട്ടീസ്</div>
                      </div>
                      {paperSize === 'A5' && <Check className="w-4 h-4 text-[#1A73E8]" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePaperSizeChange('A4')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        paperSize === 'A4'
                          ? 'bg-[#E8F0FE] border-[#1A73E8] text-[#174EA6] shadow-2xs'
                          : 'bg-white border-[#DADCE0] text-[#3C4043]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">A4 Standard</div>
                        <div className="text-[11px] opacity-80">210 × 297 mm · ഓഫീസ്</div>
                      </div>
                      {paperSize === 'A4' && <Check className="w-4 h-4 text-[#1A73E8]" />}
                    </button>
                  </div>

                  {/* Other Sizes Dropdown + Orientation */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#5F6368] font-medium">All Paper Sizes</span>
                      <select
                        value={paperSize}
                        onChange={(e) => handlePaperSizeChange(e.target.value as PaperSizeId)}
                        className="h-10 bg-white border border-[#DADCE0] rounded-xl px-3 font-medium text-[#202124] outline-none"
                      >
                        {Object.values(PAPER_SIZES).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label} — {p.badge}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#5F6368] font-medium">Orientation (ദിശ)</span>
                      <div className="grid grid-cols-2 gap-1.5 bg-white p-1 border border-[#DADCE0] rounded-xl h-10">
                        <button
                          type="button"
                          onClick={() => setOrientation('portrait')}
                          className={`rounded-lg font-semibold transition-colors cursor-pointer ${
                            orientation === 'portrait'
                              ? 'bg-[#1A73E8] text-white'
                              : 'text-[#5F6368] hover:bg-[#F1F3F4]'
                          }`}
                        >
                          Portrait
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrientation('landscape')}
                          className={`rounded-lg font-semibold transition-colors cursor-pointer ${
                            orientation === 'landscape'
                              ? 'bg-[#1A73E8] text-white'
                              : 'text-[#5F6368] hover:bg-[#F1F3F4]'
                          }`}
                        >
                          Landscape
                        </button>
                      </div>
                    </div>
                  </div>

                  {paperSize === 'Custom' && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[#5F6368]">Width (mm)</span>
                        <input
                          type="number"
                          min={40}
                          max={1000}
                          value={customWidthMm}
                          onChange={(e) => setCustomWidthMm(Number(e.target.value) || 148)}
                          className="h-9 bg-white border border-[#DADCE0] rounded-lg px-2.5 font-mono"
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[11px] text-[#5F6368]">Height (mm)</span>
                        <input
                          type="number"
                          min={40}
                          max={1000}
                          value={customHeightMm}
                          onChange={(e) => setCustomHeightMm(Number(e.target.value) || 210)}
                          className="h-9 bg-white border border-[#DADCE0] rounded-lg px-2.5 font-mono"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Section B: Margins & Multi-Columns */}
                <div className="bg-[#F8F9FA] p-3.5 rounded-2xl border border-[#E8EAED] space-y-3">
                  <span className="font-bold text-[#202124] block">
                    2. Margins &amp; Columns (മാർജിനും കോളങ്ങളും)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#5F6368]">Margin Preset</span>
                      <select
                        value={marginPreset}
                        onChange={(e) => handleMarginPresetChange(e.target.value as MarginPresetId)}
                        className="h-10 bg-white border border-[#DADCE0] rounded-xl px-3 font-medium text-[#202124]"
                      >
                        <option value="narrow">Narrow / Notice (8 mm)</option>
                        <option value="normal">Normal Office (15 mm)</option>
                        <option value="wide">Wide (25 mm)</option>
                        <option value="custom">Custom Margins (mm)</option>
                      </select>
                    </label>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#5F6368]">Columns (വരികൾ)</span>
                      <div className="grid grid-cols-3 gap-1 bg-white p-1 border border-[#DADCE0] rounded-xl h-10">
                        {[1, 2, 3].map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => setColumnCount(col as 1 | 2 | 3)}
                            className={`rounded-lg font-semibold transition-colors cursor-pointer ${
                              columnCount === col
                                ? 'bg-[#1A73E8] text-white'
                                : 'text-[#5F6368] hover:bg-[#F1F3F4]'
                            }`}
                          >
                            {col} Col
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {marginPreset === 'custom' && (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                        <label key={side} className="flex flex-col gap-1">
                          <span className="text-[10px] uppercase text-[#5F6368]">{side} (mm)</span>
                          <input
                            type="number"
                            min={0}
                            max={80}
                            value={margins[side]}
                            onChange={(e) =>
                              setMargins({ ...margins, [side]: Number(e.target.value) || 0 })
                            }
                            className="h-9 bg-white border border-[#DADCE0] rounded-lg px-2 text-center font-mono"
                          />
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section C: Page Border & Certificate Frame */}
                <div className="bg-[#F8F9FA] p-3.5 rounded-2xl border border-[#E8EAED] space-y-3">
                  <span className="font-bold text-[#202124] flex items-center gap-1.5">
                    <Frame className="w-4 h-4 text-[#1A73E8]" />
                    3. Page Border &amp; Frame (പേജ് ബോർഡർ)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <label className="flex flex-col gap-1 sm:col-span-1">
                      <span className="text-[11px] text-[#5F6368]">Border Style</span>
                      <select
                        value={pageBorderStyle}
                        onChange={(e) => setPageBorderStyle(e.target.value as PageBorderStyle)}
                        className="h-10 bg-white border border-[#DADCE0] rounded-xl px-2.5 font-medium"
                      >
                        <option value="none">None (ഇല്ല)</option>
                        <option value="thin">Single Thin</option>
                        <option value="double">Double Line (Notice)</option>
                        <option value="thick">Thick Frame</option>
                        <option value="dashed">Dashed Border</option>
                        <option value="ornamental">Ornamental Double</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#5F6368]">Border Color</span>
                      <div className="h-10 bg-white border border-[#DADCE0] rounded-xl px-3 flex items-center gap-2">
                        <input
                          type="color"
                          value={pageBorderColor}
                          onChange={(e) => setPageBorderColor(e.target.value)}
                          className="w-6 h-6 cursor-pointer"
                        />
                        <span className="font-mono text-[11px]">{pageBorderColor}</span>
                      </div>
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#5F6368]">Distance (mm)</span>
                      <input
                        type="number"
                        min={2}
                        max={20}
                        value={pageBorderPaddingMm}
                        onChange={(e) => setPageBorderPaddingMm(Number(e.target.value) || 5)}
                        className="h-10 bg-white border border-[#DADCE0] rounded-xl px-3 font-mono"
                      />
                    </label>
                  </div>
                </div>

                {/* Section D: Watermark & Paper Preview Tint */}
                <div className="bg-[#F8F9FA] p-3.5 rounded-2xl border border-[#E8EAED] space-y-3">
                  <span className="font-bold text-[#202124] flex items-center gap-1.5">
                    <Stamp className="w-4 h-4 text-[#1A73E8]" />
                    4. Watermark &amp; Notice Paper Tint (വാട്ടർമാർക്ക് &amp; നിറം)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#5F6368]">Diagonal Watermark Text</span>
                      <input
                        type="text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        placeholder="ഉദാ: കരട് / DRAFT..."
                        className="h-10 bg-white border border-[#DADCE0] rounded-xl px-3 outline-none focus:border-[#1A73E8]"
                        style={{ fontFamily: "'Noto Sans Malayalam', sans-serif" }}
                      />
                    </label>

                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#5F6368]">Paper Tint Color</span>
                      <select
                        value={paperTint}
                        onChange={(e) => setPaperTint(e.target.value as PaperTintId)}
                        className="h-10 bg-white border border-[#DADCE0] rounded-xl px-3 font-medium"
                      >
                        {Object.entries(PAPER_TINTS).map(([id, cfg]) => (
                          <option key={id} value={id}>
                            {cfg.label} ({cfg.mlLabel})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setWatermarkText('കരട് (DRAFT)')}
                        className="px-2.5 py-1 text-[11px] bg-white border border-[#DADCE0] rounded-lg cursor-pointer"
                      >
                        + കരട് (DRAFT)
                      </button>
                      <button
                        type="button"
                        onClick={() => setWatermarkText('')}
                        className="px-2.5 py-1 text-[11px] text-[#B91C1C] bg-[#FEF2F2] rounded-lg cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={printBackgroundTint}
                        onChange={(e) => setPrintBackgroundTint(e.target.checked)}
                        className="accent-[#1A73E8] w-4 h-4"
                      />
                      <span className="text-[#3C4043]">Print background tint in PDF</span>
                    </label>
                  </div>
                </div>

                {/* Section E: Header, Footer, Page Numbers & Print Guides */}
                <div className="bg-[#F8F9FA] p-3.5 rounded-2xl border border-[#E8EAED] space-y-3">
                  <span className="font-bold text-[#202124] flex items-center gap-1.5">
                    <PanelTop className="w-4 h-4 text-[#1A73E8]" />
                    5. Header, Footer &amp; Page Numbers (ഹെഡറും പേജ് നമ്പറും)
                  </span>

                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showHeaderFooter}
                        onChange={(e) => setShowHeaderFooter(e.target.checked)}
                        className="accent-[#1A73E8] w-4 h-4"
                      />
                      <span className="font-medium">Show Header &amp; Footer</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPageNumbers}
                        onChange={(e) => setShowPageNumbers(e.target.checked)}
                        className="accent-[#1A73E8] w-4 h-4"
                      />
                      <span className="font-medium">Page Numbers</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={differentFirstPage}
                        onChange={(e) => setDifferentFirstPage(e.target.checked)}
                        className="accent-[#1A73E8] w-4 h-4"
                      />
                      <span>Hide on Page 1</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#5F6368]">Position</span>
                      <select
                        value={pageNumberPosition}
                        onChange={(e) => setPageNumberPosition(e.target.value as PageNumberPosition)}
                        className="h-9 bg-white border border-[#DADCE0] rounded-lg px-2"
                      >
                        <option value="bottom">Bottom</option>
                        <option value="top">Top</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#5F6368]">Alignment</span>
                      <select
                        value={pageNumberAlign}
                        onChange={(e) => setPageNumberAlign(e.target.value as PageNumberAlign)}
                        className="h-9 bg-white border border-[#DADCE0] rounded-lg px-2"
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#5F6368]">Format</span>
                      <select
                        value={pageNumberFormat}
                        onChange={(e) => setPageNumberFormat(e.target.value as PageNumberFormat)}
                        className="h-9 bg-white border border-[#DADCE0] rounded-lg px-2"
                      >
                        <option value="malayalam">പേജ് 1 / {estimatedPages}</option>
                        <option value="english">Page 1 of {estimatedPages}</option>
                        <option value="simple">1</option>
                        <option value="dashed">- 1 -</option>
                      </select>
                    </label>
                  </div>

                  {/* Typography Precision & Print Guides */}
                  <div className="pt-2 border-t border-[#E8EAED] flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFirstLineIndent((prev) => !prev)}
                      className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 cursor-pointer ${
                        firstLineIndent
                          ? 'bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8]'
                          : 'bg-white text-[#3C4043] border-[#DADCE0]'
                      }`}
                    >
                      <Pilcrow className="w-3.5 h-3.5" />
                      <span>1st Line Indent (8mm)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowRuler((prev) => !prev)}
                      className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 cursor-pointer ${
                        showRuler
                          ? 'bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8]'
                          : 'bg-white text-[#3C4043] border-[#DADCE0]'
                      }`}
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>mm Ruler</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowCropMarks((prev) => !prev)}
                      className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 cursor-pointer ${
                        showCropMarks
                          ? 'bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8]'
                          : 'bg-white text-[#3C4043] border-[#DADCE0]'
                      }`}
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Print Crop Marks</span>
                    </button>

                    <div className="flex items-center gap-1.5 bg-white border border-[#DADCE0] rounded-lg px-2.5 py-1">
                      <MoveHorizontal className="w-3.5 h-3.5 text-[#5F6368]" />
                      <select
                        aria-label="Letter Spacing"
                        value={letterSpacing}
                        onChange={(e) => setLetterSpacing(e.target.value)}
                        className="bg-transparent outline-none"
                      >
                        {LETTER_SPACINGS.map((ls) => (
                          <option key={ls.value} value={ls.value}>
                            Spacing: {ls.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DRAWER 2: INSERT ELEMENTS (Tables, Images, Dividers, Page Breaks) */}
            {activeDrawer === 'insert' && (
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                {/* Insert Table Card */}
                <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-[#E8EAED] space-y-3">
                  <div className="flex items-center gap-2 font-bold text-[#202124]">
                    <TableIcon className="w-4 h-4 text-[#1A73E8]" />
                    <span>Insert Table (പട്ടിക ചേർക്കുക)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-[#5F6368]">Rows (വരികൾ)</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={tableRowsInput}
                        onChange={(e) => setTableRowsInput(Number(e.target.value) || 3)}
                        className="h-10 bg-white border border-[#DADCE0] rounded-xl px-3 font-mono text-sm"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[#5F6368]">Columns (കോളങ്ങൾ)</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={tableColsInput}
                        onChange={(e) => setTableColsInput(Number(e.target.value) || 3)}
                        className="h-10 bg-white border border-[#DADCE0] rounded-xl px-3 font-mono text-sm"
                      />
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleInsertTable}
                    className="w-full h-10 bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Insert {tableRowsInput} × {tableColsInput} Table
                  </button>
                </div>

                {/* Quick Action Grid: Image, Horizontal Line, Manual Page Break */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="p-4 bg-[#F8F9FA] hover:bg-[#E8F0FE] border border-[#E8EAED] hover:border-[#D2E3FC] rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-6 h-6 text-[#1A73E8]" />
                    <div>
                      <div className="font-bold text-[#202124]">Image / Logo</div>
                      <div className="text-[11px] text-[#5F6368]">ചിത്രം ചേർക്കുക</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertDivider}
                    className="p-4 bg-[#F8F9FA] hover:bg-[#E8F0FE] border border-[#E8EAED] hover:border-[#D2E3FC] rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-6 h-6 text-[#1A73E8]" />
                    <div>
                      <div className="font-bold text-[#202124]">Divider Line</div>
                      <div className="text-[11px] text-[#5F6368]">വേർതിരിക്കുന്ന വര</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleInsertPageBreak}
                    className="p-4 bg-[#F8F9FA] hover:bg-[#E8F0FE] border border-[#E8EAED] hover:border-[#D2E3FC] rounded-2xl flex flex-col items-center justify-center gap-2 text-center transition-colors cursor-pointer"
                  >
                    <Scissors className="w-6 h-6 text-[#1A73E8]" />
                    <div>
                      <div className="font-bold text-[#202124]">Page Break</div>
                      <div className="text-[11px] text-[#5F6368]">പുതിയ പേജ്</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* DRAWER 3: MORE MENU (Templates, Save/Open .mps, Clean Preview, Stats & Zoom) */}
            {activeDrawer === 'more' && (
              <div className="p-5 overflow-y-auto space-y-5 text-xs">
                {/* Live Document Counters */}
                <div className="grid grid-cols-3 gap-2.5 bg-[#F8F9FA] p-3.5 rounded-2xl border border-[#E8EAED] text-center">
                  <div>
                    <div className="text-[11px] text-[#5F6368]">വാക്കുകൾ (Words)</div>
                    <div className="text-base font-bold font-mono tabular-nums text-[#202124]">{wordCount}</div>
                  </div>
                  <div className="border-x border-[#E8EAED]">
                    <div className="text-[11px] text-[#5F6368]">അക്ഷരങ്ങൾ (Chars)</div>
                    <div className="text-base font-bold font-mono tabular-nums text-[#202124]">{charCount}</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-[#5F6368]">പേജുകൾ (Pages)</div>
                    <div className="text-base font-bold font-mono tabular-nums text-[#1A73E8]">{estimatedPages}</div>
                  </div>
                </div>

                {/* Ready-to-Edit Malayalam Print Templates */}
                <div className="space-y-2">
                  <div className="font-bold text-[#202124] flex items-center gap-1.5">
                    <LayoutTemplate className="w-4 h-4 text-[#1A73E8]" />
                    <span>One-Click Malayalam Print Templates (മാതൃകകൾ)</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('a5-notice')}
                      className="p-3 bg-[#F8F9FA] hover:bg-[#E8F0FE] border border-[#E8EAED] rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-[#202124]">A5 Public Notice / Meeting Agenda</div>
                        <div className="text-[11px] text-[#5F6368]">
                          പൊതുയോഗ നോട്ടീസ് · Baloo Chettan 2 Heading + Double Frame
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#1A73E8] px-2 py-0.5 bg-white rounded-md border border-[#D2E3FC]">
                        A5
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('a4-letterhead')}
                      className="p-3 bg-[#F8F9FA] hover:bg-[#E8F0FE] border border-[#E8EAED] rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-[#202124]">A4 Official Letterhead</div>
                        <div className="text-[11px] text-[#5F6368]">
                          ഔദ്യോഗിക കത്ത് · Tiro Malayalam Book Font + To/From
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#1A73E8] px-2 py-0.5 bg-white rounded-md border border-[#D2E3FC]">
                        A4
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApplyTemplate('a4-question-paper')}
                      className="p-3 bg-[#F8F9FA] hover:bg-[#E8F0FE] border border-[#E8EAED] rounded-xl text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-[#202124]">A4 Exam Question Paper / Study Notes</div>
                        <div className="text-[11px] text-[#5F6368]">
                          ചോദ്യപേപ്പർ മാതൃക · Noto Serif 2-Column Layout
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-[#1A73E8] px-2 py-0.5 bg-white rounded-md border border-[#D2E3FC]">
                        2-Col
                      </span>
                    </button>
                  </div>
                </div>

                {/* Draft Transfer (.mps) & Clean Preview */}
                <div className="space-y-2">
                  <div className="font-bold text-[#202124]">Project Draft &amp; View Options</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={handleExportDraftMps}
                      className="p-3 bg-[#F8F9FA] hover:bg-[#E8F0FE] border border-[#E8EAED] rounded-xl flex flex-col items-center gap-1.5 text-center cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-[#1A73E8]" />
                      <span className="font-semibold text-[#202124]">Save .mps</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => draftInputRef.current?.click()}
                      className="p-3 bg-[#F8F9FA] hover:bg-[#E8F0FE] border border-[#E8EAED] rounded-xl flex flex-col items-center gap-1.5 text-center cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-[#1A73E8]" />
                      <span className="font-semibold text-[#202124]">Open .mps</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveDrawer('none');
                        setCleanPreviewMode(true);
                      }}
                      className="p-3 bg-[#F8F9FA] hover:bg-[#E8F0FE] border border-[#E8EAED] rounded-xl flex flex-col items-center gap-1.5 text-center cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-[#1A73E8]" />
                      <span className="font-semibold text-[#202124]">Clean Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportStandaloneHtml}
                      className="p-3 bg-[#F8F9FA] hover:bg-[#E8F0FE] border border-[#E8EAED] rounded-xl flex flex-col items-center gap-1.5 text-center cursor-pointer"
                    >
                      <FileCode2 className="w-4 h-4 text-[#1A73E8]" />
                      <span className="font-semibold text-[#202124]">Export HTML</span>
                    </button>
                  </div>
                </div>

                {/* Fine Zoom Level Selector */}
                <div className="flex items-center justify-between bg-[#F8F9FA] p-3 rounded-xl border border-[#E8EAED]">
                  <span className="font-medium text-[#3C4043] flex items-center gap-1.5">
                    <ZoomIn className="w-4 h-4 text-[#1A73E8]" />
                    <span>Canvas Zoom Level</span>
                  </span>
                  <select
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="h-8 bg-white border border-[#DADCE0] rounded-lg px-2.5 font-mono font-semibold"
                  >
                    <option value={0}>Auto-Fit ({activeScalePct}%)</option>
                    {ZOOM_LEVELS.map((z) => (
                      <option key={z} value={z}>
                        {z}%
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

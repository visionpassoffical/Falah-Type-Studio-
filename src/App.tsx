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
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Pencil,
  Moon,
  Sun,
  FileText,
  Hash,
  Share2
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
<h2 style="font-size: 12.5pt; margin-top: 10px; font-family: 'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif;">3. പൊതുനിർദ്ദേശങ്ങളും രജിസ്ട്രേഷൻ വിവരങ്ങളും</h2>
<p style="text-align: justify; font-size: 10pt;">സമ്മേളനത്തിൽ പങ്കെടുക്കാൻ ആഗ്രഹിക്കുന്ന പ്രതിനിധികളും വിദ്യാർത്ഥികളും രാവിലെ 09:00 മണിക്ക് മുൻപായി പ്രധാന കവാടത്തിലെ രജിസ്ട്രേഷൻ കൗണ്ടറിൽ പേര് രജിസ്റ്റർ ചെയ്യേണ്ടതാണ്. പ്രബന്ധങ്ങൾ അവതരിപ്പിക്കുന്നവർ തങ്ങളുടെ രചനകൾ യൂണികോഡ് മലയാളം ഫോണ്ടിൽ തയ്യാറാക്കി സമർപ്പിക്കുക.</p>
<p style="text-align: justify; font-size: 10pt; margin-top: 6px;">ഏത് പ്രിന്റ് ഷോപ്പിലും മലയാളം ഫോണ്ട് ഇൻസ്റ്റാൾ ചെയ്യാതെ തന്നെ നേരിട്ട് A5 നോട്ടീസായോ A4 സർക്കുലറായോ വ്യക്തതയോടെ പ്രിന്റ് ചെയ്തെടുക്കാം.</p>
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

type ActiveBottomDrawer =
  | 'none'
  | 'format'
  | 'insert'
  | 'more'
  | 'page-print'
  | 'font-picker'
  | 'share-export';
type MoreSubPanel = 'main' | 'page-setup' | 'templates' | 'word-count' | 'share-export';

interface HtmlDocxOptions {
  orientation?: 'portrait' | 'landscape';
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    header?: number;
    footer?: number;
    gutter?: number;
  };
}

interface HtmlDocxGlobal {
  asBlob: (html: string, options?: HtmlDocxOptions) => Blob;
}

declare global {
  interface Window {
    htmlDocx?: HtmlDocxGlobal;
  }
}

const QUICK_TEXT_COLORS = [
  '#111827',
  '#1A73E8',
  '#D93025',
  '#188038',
  '#9334E6',
  '#E37400',
  '#007B83',
  '#5F6368',
];

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

  // Dark / Light UI Theme (keeps printable paper white unless tinted in Page Setup)
  const [darkMode, setDarkMode] = useState<boolean>(false);

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
  const [currentAlign, setCurrentAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [lineSpacing, setLineSpacing] = useState<string>('1.15');
  const [letterSpacing, setLetterSpacing] = useState<string>('0px');
  const [firstLineIndent, setFirstLineIndent] = useState<boolean>(false);
  const [spaceAfterParagraph, setSpaceAfterParagraph] = useState<boolean>(true);
  const [textColor, setTextColor] = useState<string>('#111827');
  const [highlightColor, setHighlightColor] = useState<string>('#FEF08A');
  const [addPageBreakSwitch, setAddPageBreakSwitch] = useState<boolean>(false);

  // Print Ruler, Crop Marks & Clean Preview
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [showCropMarks, setShowCropMarks] = useState<boolean>(false);
  const [cleanPreviewMode, setCleanPreviewMode] = useState<boolean>(false);

  // Active Drawer ('none' | 'format' | 'insert' | 'more') & More Drawer Sub-Panel
  const [activeDrawer, setActiveDrawer] = useState<ActiveBottomDrawer>('none');
  const [moreSubPanel, setMoreSubPanel] = useState<MoreSubPanel>('main');

  // Bottom Toolbar Popups (Vertical Alignment Stack & Text Color Picker)
  const [showAlignPopup, setShowAlignPopup] = useState<boolean>(false);
  const [showBottomColorPopup, setShowBottomColorPopup] = useState<boolean>(false);

  // Insert Bottom Sheet expandable items
  const [showInsertTableConfig, setShowInsertTableConfig] = useState<boolean>(false);
  const [showInsertPageNumConfig, setShowInsertPageNumConfig] = useState<boolean>(false);

  // Find & Replace Modal & Table Dimensions state
  const [showFindModal, setShowFindModal] = useState<boolean>(false);
  const [findQuery, setFindQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [findMatchCount, setFindMatchCount] = useState<number | null>(null);

  const [tableRowsInput, setTableRowsInput] = useState<number>(3);
  const [tableColsInput, setTableColsInput] = useState<number>(3);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExportActionsInToast, setShowExportActionsInToast] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Active DOM selection tracking for contextual Table & Image floating toolbars
  const [activeTableCell, setActiveTableCell] = useState<HTMLTableCellElement | null>(null);
  const [activeImage, setActiveImage] = useState<HTMLImageElement | null>(null);
  const [activeImageWidthPct, setActiveImageWidthPct] = useState<number>(60);

  // Live Word & Character Counters + Active Split Pages Count
  const [wordCount, setWordCount] = useState<number>(0);
  const [charCount, setCharCount] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(1);
  const [estimatedPages, setEstimatedPages] = useState<number>(1);

  // Refs for Multi-Page Split Sheets & Malayalam IME Composition Safety
  const editorRef = useRef<HTMLDivElement | null>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activePageIndexRef = useRef<number>(0);
  const isComposingRef = useRef<boolean>(false);
  const isPaginatingRef = useRef<boolean>(false);
  const paginationTimerRef = useRef<number | null>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const draftInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedRef = useRef<boolean>(false);
  const toastTimerRef = useRef<number | null>(null);

  // Mount active pages + 3 staging buffer sheets so overflowing blocks flow synchronously without unmounting DOM nodes
  const mountedSheetCount = Math.min(35, pageCount + 3);

  // Check if a page body container has any visible content or manual break start
  const isPageElementNonEmpty = useCallback((el: HTMLDivElement | null | undefined): boolean => {
    if (!el) return false;
    const text = (el.innerText || '').replace(/\u200B/g, '').trim();
    if (text.length > 0) return true;
    if (el.querySelector('img, table, hr')) return true;
    if (el.firstElementChild?.getAttribute('data-manual-page-start') === 'true') return true;
    return false;
  }, []);

  // Serialize all active split pages into a single HTML string (preserving manual page breaks)
  const getCombinedPagesHtml = useCallback((): string => {
    let lastIdx = 0;
    for (let i = 0; i < pageRefs.current.length; i++) {
      if (isPageElementNonEmpty(pageRefs.current[i])) {
        lastIdx = i;
      }
    }
    const parts: string[] = [];
    for (let i = 0; i <= lastIdx; i++) {
      const el = pageRefs.current[i];
      if (!el) continue;
      if (i > 0 && el.firstElementChild?.getAttribute('data-manual-page-start') === 'true') {
        parts.push(
          '<div class="mps-page-break" contenteditable="false">— പേജ് ബ്രേക്ക് / Manual Page Break —</div>'
        );
      }
      parts.push(el.innerHTML);
    }
    return parts.join('');
  }, [isPageElementNonEmpty]);

  // Show temporary notification toast (with optional export actions for One-Tap Printable HTML & Native Share)
  const triggerToast = useCallback((msg: string, duration = 6500, withExportActions = false) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    setShowExportActionsInToast(withExportActions);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      setShowExportActionsInToast(false);
      toastTimerRef.current = null;
    }, duration);
  }, []);

  // Preload & verify all Malayalam Print Fonts on mount
  useEffect(() => {
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
    };
    preloadMalayalamFonts();
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
  const paperHeightPx = effectiveHeightMm * pxPerMm;
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

  // SMOOTH AUTO-PAGINATION ENGINE WITH MALAYALAM IME SAFETY (Flows overflowing blocks Page i -> Page i+1 and pulls back when deleted)
  const runPaginationPass = useCallback(() => {
    // CRITICAL: Never interrupt active Android/Malayalam IME composition
    if (isComposingRef.current || isPaginatingRef.current) return;
    isPaginatingRef.current = true;

    try {
      const maxMounted = pageRefs.current.length;
      let morePagesNeeded = false;

      // PASS 1: Forward Overflow & Manual Page Break Split (Page i -> Page i + 1)
      for (let i = 0; i < maxMounted - 1; i++) {
        const pageEl = pageRefs.current[i];
        const nextPageEl = pageRefs.current[i + 1];
        if (!pageEl || !nextPageEl) continue;

        // 1A. Handle explicit manual page break (.mps-page-break) inside Page i
        const manualBreakEl = pageEl.querySelector('.mps-page-break') as HTMLElement | null;
        if (manualBreakEl) {
          let breakTopChild: HTMLElement | null = manualBreakEl;
          while (
            breakTopChild &&
            breakTopChild.parentElement &&
            breakTopChild.parentElement !== pageEl
          ) {
            breakTopChild = breakTopChild.parentElement;
          }
          if (breakTopChild && breakTopChild.parentElement === pageEl) {
            const siblingsAfter: Node[] = [];
            let curr = breakTopChild.nextSibling;
            while (curr) {
              siblingsAfter.push(curr);
              curr = curr.nextSibling;
            }
            breakTopChild.remove();

            if (siblingsAfter.length === 0) {
              const emptyP = document.createElement('p');
              emptyP.innerHTML = '<br/>';
              emptyP.setAttribute('data-manual-page-start', 'true');
              nextPageEl.insertBefore(emptyP, nextPageEl.firstChild);
            } else {
              const refFirst = nextPageEl.firstChild;
              siblingsAfter.forEach((node, idx) => {
                if (idx === 0 && node.nodeType === Node.ELEMENT_NODE) {
                  (node as HTMLElement).setAttribute('data-manual-page-start', 'true');
                }
                nextPageEl.insertBefore(node, refFirst);
              });
            }

            activePageIndexRef.current = i + 1;
            editorRef.current = nextPageEl;
            setTimeout(() => {
              nextPageEl.focus();
              const sel = window.getSelection();
              if (sel && nextPageEl.firstChild) {
                try {
                  const r = document.createRange();
                  r.setStart(nextPageEl.firstChild, 0);
                  r.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(r);
                } catch {
                  // ignore
                }
              }
            }, 10);
          }
        }

        // 1B. If pageEl overflows, wrap any bare top-level text nodes into <p> so block elements can move cleanly
        if (pageEl.scrollHeight > pageEl.clientHeight + 2) {
          Array.from(pageEl.childNodes).forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && (node.textContent || '').trim().length > 0) {
              const p = document.createElement('p');
              pageEl.insertBefore(p, node);
              p.appendChild(node);
            }
          });
        }

        // 1C. Push overflowing bottom blocks from Page i to the top of Page i + 1
        let guard = 0;
        while (pageEl.scrollHeight > pageEl.clientHeight + 2 && guard < 120) {
          guard++;
          if (pageEl.children.length > 1) {
            const lastChild = pageEl.lastElementChild as HTMLElement | null;
            if (!lastChild) break;

            const sel = window.getSelection();
            let savedAnchorNode: Node | null = null;
            let savedAnchorOffset = 0;
            let savedFocusNode: Node | null = null;
            let savedFocusOffset = 0;
            const hadSelectionInside =
              sel && sel.rangeCount > 0 && sel.anchorNode && lastChild.contains(sel.anchorNode);

            if (hadSelectionInside && sel) {
              savedAnchorNode = sel.anchorNode;
              savedAnchorOffset = sel.anchorOffset;
              savedFocusNode = sel.focusNode;
              savedFocusOffset = sel.focusOffset;
            }

            nextPageEl.insertBefore(lastChild, nextPageEl.firstChild);

            if (hadSelectionInside && sel && savedAnchorNode && savedFocusNode) {
              activePageIndexRef.current = i + 1;
              editorRef.current = nextPageEl;
              try {
                const newRange = document.createRange();
                newRange.setStart(savedAnchorNode, savedAnchorOffset);
                newRange.setEnd(savedFocusNode, savedFocusOffset);
                sel.removeAllRanges();
                sel.addRange(newRange);
              } catch {
                // ignore
              }
            }
          } else if (pageEl.children.length === 1) {
            // Single very tall paragraph: split at word boundary so overflowing lines move to Page i + 1
            const onlyChild = pageEl.firstElementChild as HTMLElement | null;
            if (
              onlyChild &&
              (onlyChild.tagName === 'P' || onlyChild.tagName === 'DIV') &&
              !onlyChild.querySelector('table, img')
            ) {
              const fullText = onlyChild.innerText || '';
              const tokens = fullText.split(/(\s+)/);
              if (tokens.length > 6) {
                const movedTokens: string[] = [];
                let splitGuard = 0;
                while (
                  pageEl.scrollHeight > pageEl.clientHeight + 2 &&
                  tokens.length > 2 &&
                  splitGuard < 400
                ) {
                  splitGuard++;
                  const popped = tokens.pop();
                  if (popped !== undefined) movedTokens.unshift(popped);
                  onlyChild.innerText = tokens.join('');
                }
                if (movedTokens.length > 0) {
                  const overflowP = document.createElement('p');
                  overflowP.style.cssText = onlyChild.style.cssText;
                  overflowP.innerText = movedTokens.join('').trimStart();
                  nextPageEl.insertBefore(overflowP, nextPageEl.firstChild);
                }
              }
            }
            break;
          } else {
            break;
          }
        }

        if (i === maxMounted - 2 && isPageElementNonEmpty(nextPageEl)) {
          morePagesNeeded = true;
        }
      }

      // PASS 2: Backward Pull-Back (Pull blocks from Page i + 1 back onto Page i when text is deleted)
      for (let i = 0; i < maxMounted - 1; i++) {
        const pageEl = pageRefs.current[i];
        const nextPageEl = pageRefs.current[i + 1];
        if (!pageEl || !nextPageEl) continue;

        let pullGuard = 0;
        while (nextPageEl.firstElementChild && pullGuard < 80) {
          pullGuard++;
          const candidate = nextPageEl.firstElementChild as HTMLElement;
          if (
            candidate.getAttribute('data-manual-page-start') === 'true' &&
            isPageElementNonEmpty(pageEl)
          ) {
            break;
          }

          const sel = window.getSelection();
          let savedAnchorNode: Node | null = null;
          let savedAnchorOffset = 0;
          let savedFocusNode: Node | null = null;
          let savedFocusOffset = 0;
          const hadSelectionInside =
            sel && sel.rangeCount > 0 && sel.anchorNode && candidate.contains(sel.anchorNode);

          if (hadSelectionInside && sel) {
            savedAnchorNode = sel.anchorNode;
            savedAnchorOffset = sel.anchorOffset;
            savedFocusNode = sel.focusNode;
            savedFocusOffset = sel.focusOffset;
          }

          pageEl.appendChild(candidate);

          if (pageEl.scrollHeight <= pageEl.clientHeight + 2) {
            if (candidate.getAttribute('data-manual-page-start') === 'true') {
              candidate.removeAttribute('data-manual-page-start');
            }
            if (hadSelectionInside && sel && savedAnchorNode && savedFocusNode) {
              activePageIndexRef.current = i;
              editorRef.current = pageEl;
              try {
                const newRange = document.createRange();
                newRange.setStart(savedAnchorNode, savedAnchorOffset);
                newRange.setEnd(savedFocusNode, savedFocusOffset);
                sel.removeAllRanges();
                sel.addRange(newRange);
              } catch {
                // ignore
              }
            }
          } else {
            // Candidate doesn't fit on Page i; restore to top of Page i + 1 and stop pulling for Page i
            nextPageEl.insertBefore(candidate, nextPageEl.firstChild);
            if (hadSelectionInside && sel && savedAnchorNode && savedFocusNode) {
              try {
                const newRange = document.createRange();
                newRange.setStart(savedAnchorNode, savedAnchorOffset);
                newRange.setEnd(savedFocusNode, savedFocusOffset);
                sel.removeAllRanges();
                sel.addRange(newRange);
              } catch {
                // ignore
              }
            }
            break;
          }
        }
      }

      // Compute active page count & total word/character counts across all active pages
      let lastActiveIdx = 0;
      for (let i = 0; i < maxMounted; i++) {
        if (isPageElementNonEmpty(pageRefs.current[i])) {
          lastActiveIdx = i;
        }
      }
      const nextTotalPages = Math.max(1, lastActiveIdx + 1 + (morePagesNeeded ? 1 : 0));
      setPageCount((prev) => (prev === nextTotalPages ? prev : nextTotalPages));
      setEstimatedPages((prev) => (prev === nextTotalPages ? prev : nextTotalPages));

      let combinedText = '';
      for (let i = 0; i <= lastActiveIdx; i++) {
        const t = (pageRefs.current[i]?.innerText || '').replace(/\u200B/g, '').trim();
        if (t) combinedText += (combinedText ? ' ' : '') + t;
      }
      const chars = combinedText.length;
      const words = combinedText ? combinedText.split(/\s+/).filter(Boolean).length : 0;
      setCharCount((prev) => (prev === chars ? prev : chars));
      setWordCount((prev) => (prev === words ? prev : words));
    } finally {
      isPaginatingRef.current = false;
    }
  }, [isPageElementNonEmpty]);

  // Schedule debounced IME-safe pagination pass
  const schedulePagination = useCallback(
    (delayMs = 25) => {
      if (paginationTimerRef.current) {
        window.clearTimeout(paginationTimerRef.current);
      }
      paginationTimerRef.current = window.setTimeout(() => {
        paginationTimerRef.current = null;
        if (!isComposingRef.current) {
          runPaginationPass();
        }
      }, delayMs);
    },
    [runPaginationPass]
  );

  // Compute Malayalam word and character statistics & trigger auto-pagination
  const updateDocumentMetrics = useCallback(() => {
    schedulePagination(20);
  }, [schedulePagination]);

  // Populate HTML content across split .page-sheet editors and auto-paginate
  const loadHtmlIntoPages = useCallback(
    (rawHtml: string) => {
      const cleanHtml = rawHtml || DEFAULT_MALAYALAM_SAMPLE;
      const segments = cleanHtml
        .split(/<div[^>]*class=["'][^"']*mps-page-break[^"']*["'][^>]*>[\s\S]*?<\/div>/i)
        .map((s) => s.trim())
        .filter((s, idx, arr) => s.length > 0 || arr.length === 1);

      pageRefs.current.forEach((el) => {
        if (el) el.innerHTML = '';
      });

      segments.forEach((segHtml, idx) => {
        const targetEl = pageRefs.current[idx] || pageRefs.current[0];
        if (targetEl) {
          if (idx === 0 || targetEl === pageRefs.current[idx]) {
            targetEl.innerHTML = segHtml || '<p><br/></p>';
            if (idx > 0 && targetEl.firstElementChild) {
              targetEl.firstElementChild.setAttribute('data-manual-page-start', 'true');
            }
          } else {
            targetEl.innerHTML += `<div class="mps-page-break"></div>${segHtml}`;
          }
        }
      });

      activePageIndexRef.current = 0;
      if (pageRefs.current[0]) {
        editorRef.current = pageRefs.current[0];
      }
      setPageCount(Math.max(1, segments.length));
      schedulePagination(30);
      schedulePagination(180);
    },
    [schedulePagination]
  );

  // Re-paginate whenever paper size, orientation, margins, font, line spacing, columns, or pageCount changes
  useEffect(() => {
    if (!hasInitializedRef.current) return;
    schedulePagination(35);
  }, [
    pageCount,
    effectiveWidthMm,
    effectiveHeightMm,
    margins.top,
    margins.right,
    margins.bottom,
    margins.left,
    defaultDocFontId,
    lineSpacing,
    letterSpacing,
    firstLineIndent,
    spaceAfterParagraph,
    columnCount,
    showHeaderFooter,
    differentFirstPage,
    schedulePagination,
  ]);

  // Apply a saved state object into React state + multi-page split editor
  const applyProjectState = useCallback(
    (parsed: Partial<SavedProjectState>) => {
      if (parsed.docTitle) setDocTitle(parsed.docTitle);
      if (parsed.paperSize && PAPER_SIZES[parsed.paperSize]) setPaperSize(parsed.paperSize);
      if (typeof parsed.customWidthMm === 'number') setCustomWidthMm(parsed.customWidthMm);
      if (typeof parsed.customHeightMm === 'number') setCustomHeightMm(parsed.customHeightMm);
      if (parsed.orientation) setOrientation(parsed.orientation);
      if (parsed.marginPreset) setMarginPreset(parsed.marginPreset);
      if (parsed.margins) {
        const m = parsed.margins;
        setMargins((prev) =>
          prev.top === m.top &&
          prev.right === m.right &&
          prev.bottom === m.bottom &&
          prev.left === m.left
            ? prev
            : { top: m.top, right: m.right, bottom: m.bottom, left: m.left }
        );
      }
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

      loadHtmlIntoPages(parsed.htmlContent || DEFAULT_MALAYALAM_SAMPLE);
    },
    [loadHtmlIntoPages]
  );

  // Load saved state from localStorage strictly once on mount
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;
    try {
      const savedRaw =
        localStorage.getItem(STORAGE_KEY) ||
        localStorage.getItem('malayalam_print_studio_state_v2') ||
        localStorage.getItem('malayalam_print_studio_state_v1');
      if (savedRaw) {
        const parsed: Partial<SavedProjectState> = JSON.parse(savedRaw);
        applyProjectState(parsed);
      } else {
        loadHtmlIntoPages(DEFAULT_MALAYALAM_SAMPLE);
      }
    } catch {
      loadHtmlIntoPages(DEFAULT_MALAYALAM_SAMPLE);
    }
    setTimeout(updateDocumentMetrics, 60);
  }, [applyProjectState, loadHtmlIntoPages, updateDocumentMetrics]);

  // Auto-save to localStorage whenever document or settings change
  const saveToLocalStorage = useCallback(() => {
    if (!pageRefs.current[0] || !hasInitializedRef.current) return;
    const stateToSave: SavedProjectState = {
      docTitle,
      htmlContent: getCombinedPagesHtml(),
      paperSize,
      customWidthMm,
      customHeightMm,
      orientation,
      marginPreset,
      margins: {
        top: margins.top,
        right: margins.right,
        bottom: margins.bottom,
        left: margins.left,
      },
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
    getCombinedPagesHtml,
    paperSize,
    customWidthMm,
    customHeightMm,
    orientation,
    marginPreset,
    margins.top,
    margins.right,
    margins.bottom,
    margins.left,
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
    if (!hasInitializedRef.current) return;
    saveToLocalStorage();
    updateDocumentMetrics();
  }, [saveToLocalStorage, updateDocumentMetrics]);

  // Save and restore selection ranges across any active .page-sheet body so toolbar actions apply at exact cursor spot
  const saveSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    for (let i = 0; i < pageRefs.current.length; i++) {
      const pEl = pageRefs.current[i];
      if (pEl && pEl.contains(range.commonAncestorContainer)) {
        activePageIndexRef.current = i;
        editorRef.current = pEl;
        savedSelectionRef.current = range.cloneRange();
        break;
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
    } else if (pageRefs.current[0]) {
      pageRefs.current[0].focus();
    }
  };

  // Detect font-family at current cursor position across any active page
  const detectFontAtCursor = () => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return;
    const isInsideAnyPage = pageRefs.current.some((pEl) => pEl && pEl.contains(sel.anchorNode));
    if (!isInsideAnyPage) return;
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
    schedulePagination(20);
    saveToLocalStorage();
  };

  // Apply Malayalam Font Family to selected text or current block (or whole document across all pages if requested)
  const applyMalayalamFontFamily = (fontId: string, applyToEntireDocument = false) => {
    const fontObj = MALAYALAM_FONTS.find((f) => f.id === fontId);
    if (!fontObj) return;

    setCurrentFontId(fontObj.id);

    if (document.fonts && document.fonts.load) {
      document.fonts.load(`16px "${fontObj.name}"`, 'മലയാളം').catch(() => {});
    }

    if (applyToEntireDocument) {
      setDefaultDocFontId(fontObj.id);
      pageRefs.current.forEach((pEl) => {
        if (!pEl) return;
        const styledNodes = pEl.querySelectorAll('[style*="font-family"]');
        styledNodes.forEach((node) => {
          (node as HTMLElement).style.fontFamily = '';
        });
      });
      if (activeDrawer === 'font-picker') setActiveDrawer('none');
      schedulePagination(30);
      saveToLocalStorage();
      triggerToast(`Set entire document default font to ${fontObj.mlName}.`);
      return;
    }

    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      setDefaultDocFontId(fontObj.id);
      if (activeDrawer === 'font-picker') setActiveDrawer('none');
      return;
    }

    if (!sel.isCollapsed) {
      document.execCommand('fontName', false, 'MPS_FONT_MARKER');
      pageRefs.current.forEach((pEl) => {
        if (!pEl) return;
        const fontTags = pEl.querySelectorAll('font[face="MPS_FONT_MARKER"]');
        fontTags.forEach((fontEl) => {
          const span = document.createElement('span');
          span.style.fontFamily = fontObj.cssFamily;
          span.innerHTML = fontEl.innerHTML;
          fontEl.parentNode?.replaceChild(span, fontEl);
        });
      });
      triggerToast(`Applied ${fontObj.mlName} to selected text.`);
    } else {
      const anchorNode = sel.anchorNode;
      const activeContainer =
        pageRefs.current.find((pEl) => pEl && anchorNode && pEl.contains(anchorNode)) ||
        editorRef.current;
      if (anchorNode && activeContainer && activeContainer.contains(anchorNode)) {
        const startEl =
          anchorNode.nodeType === Node.ELEMENT_NODE
            ? (anchorNode as HTMLElement)
            : anchorNode.parentElement;
        const blockEl = startEl?.closest('p, h1, h2, h3, li, td, th') as HTMLElement | null;
        if (blockEl && activeContainer.contains(blockEl)) {
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

    if (activeDrawer === 'font-picker') setActiveDrawer('none');
    saveSelection();
    schedulePagination(25);
    saveToLocalStorage();
  };

  // Apply exact point size (8pt - 48pt) using safe DOM span wrapping across split pages
  const applyFontSizePt = (pt: number) => {
    setCurrentFontSizePt(pt);
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    if (!sel.isCollapsed) {
      document.execCommand('fontSize', false, '7');
      pageRefs.current.forEach((pEl) => {
        if (!pEl) return;
        const fontTags = pEl.querySelectorAll('font[size="7"]');
        fontTags.forEach((fontEl) => {
          const span = document.createElement('span');
          span.style.fontSize = `${pt}pt`;
          span.innerHTML = fontEl.innerHTML;
          fontEl.parentNode?.replaceChild(span, fontEl);
        });
      });
    } else {
      const anchorNode = sel.anchorNode;
      const activeContainer =
        pageRefs.current.find((pEl) => pEl && anchorNode && pEl.contains(anchorNode)) ||
        editorRef.current;
      if (anchorNode && activeContainer && activeContainer.contains(anchorNode)) {
        const el =
          anchorNode.nodeType === Node.ELEMENT_NODE
            ? (anchorNode as HTMLElement)
            : anchorNode.parentElement;
        if (el && el !== activeContainer) {
          el.style.fontSize = `${pt}pt`;
        }
      }
    }
    saveSelection();
    schedulePagination(25);
    saveToLocalStorage();
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
    schedulePagination(25);
    saveToLocalStorage();
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

  // Load One-Click Malayalam Print Templates across split pages
  const handleApplyTemplate = (templateId: string) => {
    if (!templateId || !pageRefs.current[0]) return;
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
      loadHtmlIntoPages(TEMPLATE_A5_PUBLIC_NOTICE);
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
      loadHtmlIntoPages(TEMPLATE_A4_OFFICIAL_LETTERHEAD);
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
      loadHtmlIntoPages(TEMPLATE_A4_EXAM_QUESTION_PAPER);
      triggerToast('Loaded Template: A4 Exam Question Paper (2-Column Layout).');
    }
    setActiveDrawer('none');
    setTimeout(() => {
      runPaginationPass();
      saveToLocalStorage();
    }, 60);
  };

  // Insert HTML snippet at cursor
  const insertHtmlAtCursor = (html: string) => {
    restoreSelection();
    document.execCommand('insertHTML', false, html);
    saveSelection();
    schedulePagination(20);
    saveToLocalStorage();
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

    schedulePagination(25);
    saveToLocalStorage();
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
    schedulePagination(25);
    saveToLocalStorage();
  };

  // Insert Horizontal Divider
  const handleInsertDivider = () => {
    insertHtmlAtCursor('<hr class="mps-divider" /><p><br/></p>');
    setActiveDrawer('none');
  };

  // Insert Manual Page Break (splits onto next distinct .page-sheet card immediately)
  const handleInsertPageBreak = () => {
    insertHtmlAtCursor(
      '<div class="mps-page-break" contenteditable="false">— പേജ് ബ്രേക്ക് / Manual Page Break —</div><p><br/></p>'
    );
    setActiveDrawer('none');
    setTimeout(() => {
      runPaginationPass();
      saveToLocalStorage();
    }, 25);
  };

  // Find & Replace across all active split pages
  const handleFindCount = () => {
    if (!findQuery.trim()) {
      setFindMatchCount(0);
      return;
    }
    let fullText = '';
    for (let i = 0; i < pageCount; i++) {
      fullText += ' ' + (pageRefs.current[i]?.innerText || '');
    }
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matches = fullText.match(new RegExp(escaped, 'gi'));
    setFindMatchCount(matches ? matches.length : 0);

    if (typeof (window as unknown as { find?: (s: string) => boolean }).find === 'function') {
      (window as unknown as { find: (s: string) => boolean }).find(findQuery);
    }
  };

  const handleReplaceAll = () => {
    if (!findQuery) return;
    let replacedCount = 0;
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');

    for (let i = 0; i < pageCount; i++) {
      const pEl = pageRefs.current[i];
      if (!pEl) continue;
      const walker = document.createTreeWalker(pEl, NodeFilter.SHOW_TEXT);
      const textNodes: Text[] = [];
      let currentNode = walker.nextNode();
      while (currentNode) {
        textNodes.push(currentNode as Text);
        currentNode = walker.nextNode();
      }

      textNodes.forEach((node) => {
        if (node.nodeValue && regex.test(node.nodeValue)) {
          const matches = node.nodeValue.match(regex);
          if (matches) replacedCount += matches.length;
          node.nodeValue = node.nodeValue.replace(regex, replaceQuery);
        }
      });
    }

    setFindMatchCount(0);
    schedulePagination(25);
    saveToLocalStorage();
    triggerToast(`Replaced ${replacedCount} occurrence(s) of "${findQuery}".`);
  };

  // Handle Backspace at the very start of Page i > 0 to merge back onto Page i - 1 smoothly
  const handlePageKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, pageIdx: number) => {
    if (isComposingRef.current || e.nativeEvent.isComposing) return;
    if (e.key === 'Backspace' && pageIdx > 0) {
      const pageEl = pageRefs.current[pageIdx];
      const prevPageEl = pageRefs.current[pageIdx - 1];
      const sel = window.getSelection();
      if (!pageEl || !prevPageEl || !sel || !sel.isCollapsed || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      const testRange = document.createRange();
      testRange.selectNodeContents(pageEl);
      testRange.setEnd(range.startContainer, range.startOffset);

      if (testRange.toString().replace(/\u200B/g, '').length === 0) {
        if (pageEl.firstElementChild?.getAttribute('data-manual-page-start') === 'true') {
          pageEl.firstElementChild.removeAttribute('data-manual-page-start');
        }
        // Move caret to end of previous page and let pagination pull content back
        const lastBlock = (prevPageEl.lastElementChild || prevPageEl) as HTMLElement;
        activePageIndexRef.current = pageIdx - 1;
        editorRef.current = prevPageEl;
        prevPageEl.focus();
        try {
          const endRange = document.createRange();
          endRange.selectNodeContents(lastBlock);
          endRange.collapse(false);
          sel.removeAllRanges();
          sel.addRange(endRange);
        } catch {
          // ignore
        }
        schedulePagination(15);
      }
    }
  };

  // Track editor clicks on any .page-sheet to detect active Table Cell, Image, or Font at cursor
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>, pageIdx: number) => {
    activePageIndexRef.current = pageIdx;
    if (pageRefs.current[pageIdx]) {
      editorRef.current = pageRefs.current[pageIdx];
    }
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
    if (cell && pageRefs.current[pageIdx]?.contains(cell)) {
      setActiveTableCell(cell);
    } else {
      setActiveTableCell(null);
    }
  };

  // Compute CSS properties for Closed 4-Sided Page Border Frame on each .page-sheet (Screen & Print)
  const getPageBorderCssRules = useCallback(() => {
    if (pageBorderStyle === 'none') return '';
    const insetMm = Math.max(2, Math.min(margins.top, margins.left) - pageBorderPaddingMm);
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
      position: absolute;
      top: ${insetMm}mm;
      right: ${insetMm}mm;
      bottom: ${insetMm}mm;
      left: ${insetMm}mm;
      pointer-events: none;
      ${borderCss}
      ${outlineCss}
      z-index: 20;
    `;
  }, [pageBorderStyle, pageBorderColor, margins.top, margins.left, pageBorderPaddingMm]);

  // Compute inline style object for on-screen Closed 4-Sided Page Border Overlay per .page-sheet
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

  // Build Clean, Standalone, Read-Only Printable HTML containing ONLY the formatted document, all Malayalam Google Fonts, exact @page A5/A4 size, and distinct split .page-sheet cards with independent closed 4-sided borders
  const buildCleanPrintableHtmlString = (): string => {
    const activeBgColor = printBackgroundTint ? PAPER_TINTS[paperTint].hex : '#FFFFFF';
    const pagesHtmlArray: string[] = [];

    for (let idx = 0; idx < pageCount; idx++) {
      const pageNumber = idx + 1;
      const shouldShowNumOnThisPage =
        showPageNumbers && !(differentFirstPage && pageNumber === 1);
      const shouldShowHeaderFooterOnThisPage =
        showHeaderFooter && !(differentFirstPage && pageNumber === 1);

      const topPageNumHtml =
        shouldShowNumOnThisPage && pageNumberPosition === 'top'
          ? `<span style="font-weight:500;color:#374151;white-space:nowrap;">${formatPageNumberLabel(pageNumber, pageCount)}</span>`
          : '';
      const bottomPageNumHtml =
        shouldShowNumOnThisPage && pageNumberPosition === 'bottom'
          ? `<span style="font-weight:500;color:#374151;white-space:nowrap;">${formatPageNumberLabel(pageNumber, pageCount)}</span>`
          : '';

      const pageBodyHtml = pageRefs.current[idx]?.innerHTML || '<p><br/></p>';

      pagesHtmlArray.push(`
  <div class="page-sheet">
    ${pageBorderStyle !== 'none' ? '<div class="page-border-frame"></div>' : ''}
    ${
      watermarkText.trim() !== ''
        ? `<div class="watermark-overlay"><span style="transform:rotate(-34deg);font-size:${
            effectiveWidthMm < 170 ? '30pt' : '44pt'
          };color:rgba(17,24,39,0.085);font-weight:700;letter-spacing:0.06em;white-space:nowrap;">${watermarkText}</span></div>`
        : ''
    }
    ${
      shouldShowHeaderFooterOnThisPage && (headerText || topPageNumHtml)
        ? `<div style="position:relative;z-index:20;font-size:9.5pt;color:#4B5563;border-bottom:1px solid #E5E7EB;padding-bottom:4px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-shrink:0;">${
            pageNumberAlign === 'left' ? topPageNumHtml : ''
          }<span style="flex:1;">${headerText}</span>${
            pageNumberAlign !== 'left' ? topPageNumHtml : ''
          }</div>`
        : ''
    }
    <div class="doc-body">${pageBodyHtml}</div>
    ${
      (shouldShowHeaderFooterOnThisPage && footerText) || bottomPageNumHtml
        ? `<div style="position:relative;z-index:20;font-size:9.5pt;color:#4B5563;border-top:1px solid #E5E7EB;padding-top:4px;margin-top:auto;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-shrink:0;">${
            pageNumberAlign === 'left' ? bottomPageNumHtml : ''
          }<span style="flex:1;">${shouldShowHeaderFooterOnThisPage ? footerText : ''}</span>${
            pageNumberAlign !== 'left' ? bottomPageNumHtml : ''
          }</div>`
        : ''
    }
  </div>`);
    }

    return `<!DOCTYPE html>
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
      margin: 0mm;
    }
    * {
      box-sizing: border-box;
      font-feature-settings: "kern" 1, "liga" 1, "clig" 1, "calt" 1;
      -webkit-font-smoothing: antialiased;
    }
    html, body {
      margin: 0;
      padding: 0;
      font-family: ${activeDefaultFontObj.cssFamily};
      background: #E8EAED;
      color: #111827;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-top-bar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #202124;
      color: #FFFFFF;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: sans-serif;
      font-size: 13px;
    }
    .print-top-bar button {
      background: #1A73E8;
      color: #FFFFFF;
      border: none;
      padding: 7px 16px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
    }
    .pages-stack {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      padding: 18px 0;
    }
    .page-sheet {
      position: relative;
      width: ${effectiveWidthMm}mm;
      height: ${effectiveHeightMm}mm;
      background: ${PAPER_TINTS[paperTint].hex};
      padding: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
      line-height: ${lineSpacing};
      letter-spacing: ${letterSpacing};
      font-family: ${activeDefaultFontObj.cssFamily};
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      overflow: hidden;
    }
    .page-border-frame {
      ${getPageBorderCssRules()}
    }
    .watermark-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      overflow: hidden;
      z-index: 10;
    }
    .doc-body {
      position: relative;
      z-index: 20;
      flex: 1;
      font-size: 11pt;
      overflow: hidden;
      ${columnCount > 1 ? `column-count: ${columnCount}; column-gap: 6mm; column-rule: 1px solid #E5E7EB;` : ''}
    }
    .doc-body p {
      margin: 0 0 ${spaceAfterParagraph ? '0.65em' : '0.15em'} 0;
      orphans: 3;
      widows: 3;
      ${firstLineIndent ? 'text-indent: 8mm;' : ''}
    }
    h1, h2, h3 {
      break-after: avoid;
      page-break-after: avoid;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    tr, img {
      break-inside: avoid;
      page-break-inside: avoid;
    }
    th, td {
      border: 1px solid #4B5563;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #F3F4F6;
      font-weight: 600;
    }
    hr {
      border: 0;
      border-top: 1.5px solid #374151;
      margin: 12px 0;
    }
    .mps-page-break {
      display: none !important;
    }
    @media print {
      .print-top-bar {
        display: none !important;
      }
      html, body {
        width: ${effectiveWidthMm}mm !important;
        background: ${activeBgColor} !important;
      }
      .pages-stack {
        display: block !important;
        gap: 0 !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      .page-sheet {
        width: ${effectiveWidthMm}mm !important;
        height: ${effectiveHeightMm}mm !important;
        margin: 0 !important;
        padding: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm !important;
        background: ${activeBgColor} !important;
        box-shadow: none !important;
        border: none !important;
        overflow: hidden !important;
      }
      .page-sheet:not(:last-child) {
        break-after: page !important;
        page-break-after: always !important;
      }
      .page-border-frame {
        ${getPageBorderCssRules()}
      }
    }
  </style>
  <script>
    window.onload = () => {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          setTimeout(() => window.print(), 120);
        });
      } else {
        setTimeout(() => window.print(), 250);
      }
    };
  </script>
</head>
<body>
  <div class="print-top-bar">
    <span><strong>${docTitle}</strong> (${paperSize} · ${effectiveWidthMm}×${effectiveHeightMm}mm · ${pageCount} ${pageCount === 1 ? 'Page' : 'Pages'}) — Choose "Save as PDF"</span>
    <button onclick="window.print()">Save / Print as PDF</button>
  </div>
  <div class="pages-stack">
    ${pagesHtmlArray.join('\n')}
  </div>
</body>
</html>`;
  };

  // CRITICAL: Reliable One-Tap Font-Locked Vector PDF Export Engine (Works in normal browser tab AND inside sandboxed preview iframe)
  const handleSavePrintReadyPDF = async () => {
    setIsPrinting(true);
    setActiveDrawer('none');

    if (activeImage) {
      activeImage.classList.remove('mps-selected-img');
      setActiveImage(null);
    }
    setActiveTableCell(null);

    // Check if running inside an embedded preview iframe (window.self !== window.top)
    let isInIframe = false;
    try {
      isInIframe = window.self !== window.top;
    } catch {
      isInIframe = true;
    }

    // If inside a sandboxed preview iframe where window.print() is blocked, open a clean new browser tab synchronously on user tap
    if (isInIframe) {
      try {
        const printWin = window.open('', '_blank');
        if (printWin) {
          const printableHtml = buildCleanPrintableHtmlString();
          printWin.document.open();
          printWin.document.write(printableHtml);
          printWin.document.close();
          setIsPrinting(false);
          triggerToast(
            `Opened clean print tab for ${paperSize} (${effectiveWidthMm}mm × ${effectiveHeightMm}mm · ${pageCount} ${pageCount === 1 ? 'page' : 'pages'}). In the print dialog, choose 'Save as PDF'.`,
            8000,
            true
          );
          return;
        }
      } catch {
        // Fall through to in-window print + toast download button if popup was blocked
      }
    }

    triggerToast(
      `In the print dialog, choose 'Save as PDF' and ensure Paper Size matches ${paperSize} (${effectiveWidthMm}mm × ${effectiveHeightMm}mm).`,
      12000,
      true
    );

    // Wait for document.fonts.ready in normal browser tab
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

    let styleEl = document.getElementById('dynamic-print-style') as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-print-style';
      document.head.appendChild(styleEl);
    }

    const activeBgColor = printBackgroundTint ? PAPER_TINTS[paperTint].hex : '#FFFFFF';

    styleEl.textContent = `
      @page {
        size: ${effectiveWidthMm}mm ${effectiveHeightMm}mm;
        margin: 0mm;
      }
      @media print {
        html, body {
          width: ${effectiveWidthMm}mm !important;
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
        .pages-stack {
          display: block !important;
          gap: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .page-sheet {
          width: ${effectiveWidthMm}mm !important;
          height: ${effectiveHeightMm}mm !important;
          min-height: ${effectiveHeightMm}mm !important;
          max-height: ${effectiveHeightMm}mm !important;
          box-shadow: none !important;
          border: none !important;
          padding: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm !important;
          margin: 0 !important;
          background: ${activeBgColor} !important;
          overflow: hidden !important;
        }
        .page-sheet:not(:last-child) {
          break-after: page !important;
          page-break-after: always !important;
        }
        .page-sheet-staging {
          display: none !important;
        }
        .page-border-frame {
          ${getPageBorderCssRules()}
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
        // Fallback if window.print() throws
      }
      setIsPrinting(false);
    }, 120);
  };

  // Helper to trigger a direct file download from a Blob
  const triggerBlobDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  };

  // Build Word-compatible HTML document with exact A5/A4 page dimensions in twips (1 mm = 56.6929134 twips), preserving Malayalam fonts, sizes, alignment, tables, and multi-page breaks
  const buildWordDocxHtmlAndBlob = (): { blob: Blob; fileName: string } => {
    const MM_TO_TWIPS = 56.6929134;
    const widthTwips = Math.round(effectiveWidthMm * MM_TO_TWIPS);
    const heightTwips = Math.round(effectiveHeightMm * MM_TO_TWIPS);
    const topTwips = Math.round(margins.top * MM_TO_TWIPS);
    const rightTwips = Math.round(margins.right * MM_TO_TWIPS);
    const bottomTwips = Math.round(margins.bottom * MM_TO_TWIPS);
    const leftTwips = Math.round(margins.left * MM_TO_TWIPS);

    const primaryFontName = activeDefaultFontObj.name;
    const headerBlockHtml =
      showHeaderFooter && !differentFirstPage && headerText
        ? `<p style="font-family:'${primaryFontName}', 'Noto Sans Malayalam', sans-serif; font-size:9.5pt; color:#4B5563; border-bottom:1pt solid #E5E7EB; padding-bottom:4pt; margin-bottom:10pt;">${headerText}</p>`
        : '';
    const footerBlockHtml =
      showHeaderFooter && footerText
        ? `<p style="font-family:'${primaryFontName}', 'Noto Sans Malayalam', sans-serif; font-size:9.5pt; color:#4B5563; border-top:1pt solid #E5E7EB; padding-top:4pt; margin-top:14pt;">${footerText}</p>`
        : '';

    const combinedPagesForWord: string[] = [];
    for (let i = 0; i < pageCount; i++) {
      const el = pageRefs.current[i];
      if (el) {
        combinedPagesForWord.push(el.innerHTML);
      }
    }
    const wordBodyHtml = combinedPagesForWord.join(
      '<br clear="all" style="mso-special-character:line-break; page-break-before:always;" />'
    );

    const wordHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40"
      lang="ml">
<head>
  <meta charset="UTF-8" />
  <title>${docTitle}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Anek+Malayalam:wght@400;600;700;800&family=Baloo+Chettan+2:wght@500;700;800&family=Chilanka&family=Gayathri:wght@400;700&family=Manjari:wght@400;700&family=Noto+Sans+Malayalam:wght@400;500;600;700&family=Noto+Serif+Malayalam:wght@400;500;600;700&family=Tiro+Malayalam:ital@0;1&display=swap" rel="stylesheet" />
  <style>
    @page WordSection1 {
      size: ${effectiveWidthMm}mm ${effectiveHeightMm}mm;
      mso-page-size-w: ${widthTwips};
      mso-page-size-h: ${heightTwips};
      mso-page-orientation: ${orientation};
      margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
    }
    div.WordSection1 {
      page: WordSection1;
      font-family: '${primaryFontName}', 'Noto Sans Malayalam', sans-serif;
      mso-ascii-font-family: '${primaryFontName}';
      mso-hansi-font-family: '${primaryFontName}';
      mso-bidi-font-family: '${primaryFontName}';
      font-size: 11pt;
      line-height: ${lineSpacing};
      color: #111827;
    }
    body, p, div, span, li, td, th {
      font-family: '${primaryFontName}', 'Noto Sans Malayalam', sans-serif;
      mso-bidi-font-family: '${primaryFontName}';
    }
    p {
      margin: 0 0 ${spaceAfterParagraph ? '6pt' : '2pt'} 0;
      line-height: ${lineSpacing};
      ${firstLineIndent ? 'text-indent: 8mm;' : ''}
    }
    h1 {
      font-size: 18pt;
      font-weight: 700;
      margin: 8pt 0 4pt 0;
    }
    h2 {
      font-size: 14pt;
      font-weight: 700;
      margin: 6pt 0 3pt 0;
    }
    h3 {
      font-size: 12pt;
      font-weight: 600;
      margin: 5pt 0 2pt 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8pt 0;
      border: 1pt solid #374151;
    }
    th, td {
      border: 1pt solid #374151;
      padding: 5pt 7pt;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #F3F4F6;
      font-weight: 700;
    }
    hr {
      border: 0;
      border-top: 1pt solid #4B5563;
      margin: 8pt 0;
    }
  </style>
</head>
<body>
  <div class="WordSection1">
    ${headerBlockHtml}
    ${wordBodyHtml}
    ${footerBlockHtml}
  </div>
</body>
</html>`;

    let docxBlob: Blob;
    if (typeof window !== 'undefined' && window.htmlDocx && typeof window.htmlDocx.asBlob === 'function') {
      try {
        docxBlob = window.htmlDocx.asBlob(wordHtml, {
          orientation,
          margins: {
            top: topTwips,
            right: rightTwips,
            bottom: bottomTwips,
            left: leftTwips,
          },
        });
      } catch {
        // Built-in Word-HTML .doc/.docx blob fallback
        docxBlob = new Blob(['\ufeff', wordHtml], {
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
      }
    } else {
      // Built-in Word-HTML .doc/.docx blob fallback if CDN is offline
      docxBlob = new Blob(['\ufeff', wordHtml], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
    }

    const safeName = (docTitle || 'malayalam-document').replace(/[^a-zA-Z0-9\u0D00-\u0D7F_-]/g, '_');
    const fileName = `${safeName}-${paperSize}.docx`;
    return { blob: docxBlob, fileName };
  };

  // DIRECT ONE-TAP WORD (.docx) EXPORT & SHARE: Converts to .docx File object, triggers navigator.share({ files: [docxFile], title: docTitle }) on mobile, and triggers direct file download as fallback
  const handleSendAsWordDocx = async () => {
    if (!pageRefs.current[0]) return;
    setActiveDrawer('none');

    const { blob: docxBlob, fileName } = buildWordDocxHtmlAndBlob();
    const docxFile = new File([docxBlob], fileName, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          files: [docxFile],
          title: docTitle,
        });
        triggerToast(`Shared Word document "${fileName}" (${paperSize}).`);
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') {
          return;
        }
        // Fall through to direct .docx file download if file sharing is blocked in current browser/iframe context
      }
    }

    // Direct .docx file download fallback
    triggerBlobDownload(docxBlob, fileName);
    triggerToast(
      `Downloaded Word file "${fileName}" (${paperSize} · ${effectiveWidthMm}×${effectiveHeightMm}mm). Compatible with Microsoft Word & Google Docs.`,
      7000
    );
  };

  // Build Project Draft (.mps JSON payload)
  const buildDraftMpsPayload = (): SavedProjectState => ({
    docTitle,
    htmlContent: getCombinedPagesHtml(),
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
  });

  // Export Project Draft (.mps JSON file) for Mobile-to-PC transfer
  const handleExportDraftMps = () => {
    if (!pageRefs.current[0]) return;
    const payload = buildDraftMpsPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const safeName = (docTitle || 'malayalam-document').replace(/[^a-zA-Z0-9\u0D00-\u0D7F_-]/g, '_');
    triggerBlobDownload(blob, `${safeName}.mps`);
    setActiveDrawer('none');
    triggerToast('Saved editable draft (.mps) file to device.');
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

  // One-Tap Printable File Export (.html) that bypasses preview print blocks and auto-opens Save as PDF in Chrome
  const handleExportStandaloneHtml = () => {
    if (!pageRefs.current[0]) return;
    const standaloneHtml = buildCleanPrintableHtmlString();
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const safeName = (docTitle || 'malayalam-print').replace(/[^a-zA-Z0-9\u0D00-\u0D7F_-]/g, '_');
    triggerBlobDownload(blob, `${safeName}-${paperSize}.html`);
    setActiveDrawer('none');
    triggerToast(
      `Downloaded "${safeName}-${paperSize}.html". Open this file in Chrome to automatically open the Save as PDF dialog (${paperSize}).`,
      8000
    );
  };

  // Generate horizontal millimeter ruler ticks (every 10mm)
  const rulerTicksMm = [];
  for (let mm = 0; mm <= Math.floor(effectiveWidthMm); mm += 10) {
    rulerTicksMm.push(mm);
  }

  // Top-left Checkmark (✓) button: saves draft and dismisses active menus/keyboard
  const handleCheckmarkDone = () => {
    saveToLocalStorage();
    updateDocumentMetrics();
    setActiveDrawer('none');
    setShowAlignPopup(false);
    setShowBottomColorPopup(false);
    setActiveTableCell(null);
    if (activeImage) {
      activeImage.classList.remove('mps-selected-img');
      setActiveImage(null);
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    triggerToast('Draft saved ✓', 2400);
  };

  // Font Size Stepper (- 11 +)
  const handleStepFontSize = (delta: number) => {
    const nextPt = Math.min(72, Math.max(8, currentFontSizePt + delta));
    applyFontSizePt(nextPt);
  };

  // Line Spacing Stepper (- 1.15 +)
  const handleStepLineSpacing = (direction: -1 | 1) => {
    const currentIndex = LINE_SPACINGS.indexOf(lineSpacing);
    const baseIndex = currentIndex === -1 ? 1 : currentIndex;
    const nextIndex = Math.min(LINE_SPACINGS.length - 1, Math.max(0, baseIndex + direction));
    setLineSpacing(LINE_SPACINGS[nextIndex]);
  };

  // Alignment handler (Left, Center, Right, Justify)
  const handleApplyAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    setCurrentAlign(align);
    if (align === 'left') execCmd('justifyLeft');
    if (align === 'center') execCmd('justifyCenter');
    if (align === 'right') execCmd('justifyRight');
    if (align === 'justify') execCmd('justifyFull');
    setShowAlignPopup(false);
  };

  // Toggle "Add page break" switch inside Format sheet — splits document onto a new .page-sheet
  const handleToggleAddPageBreakSwitch = () => {
    const nextVal = !addPageBreakSwitch;
    setAddPageBreakSwitch(nextVal);
    if (nextVal) {
      handleInsertPageBreak();
      setTimeout(() => setAddPageBreakSwitch(false), 600);
    }
  };

  // Theme palette classes for Google Docs Android Light / Dark UI Chrome
  const surfaceBg = darkMode ? 'bg-[#1E1F22] text-[#E3E3E3]' : 'bg-white text-[#1F1F1F]';
  const borderCol = darkMode ? 'border-[#33353A]' : 'border-[#E0E2E5]';
  const canvasBg = darkMode ? 'bg-[#121316]' : 'bg-[#E8EAED]';
  const iconBtnHover = darkMode
    ? 'text-[#E3E3E3] hover:bg-[#2B2D31] active:bg-[#383A40]'
    : 'text-[#444746] hover:bg-[#F1F3F4] active:bg-[#E4E7EB]';
  const cardBg = darkMode
    ? 'bg-[#282A2E] border-[#383A40] text-[#E3E3E3]'
    : 'bg-[#F8F9FA] border-[#E8EAED] text-[#1F1F1F]';
  const mutedText = darkMode ? 'text-[#9AA0A6]' : 'text-[#5F6368]';

  return (
    <div className={`min-h-screen flex flex-col ${canvasBg} select-none transition-colors duration-150`}>
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
            <span className="font-semibold">Clean Print Preview</span>
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
              <span>PDF</span>
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

      {/* 1. ULTRA-CLEAN SINGLE-ROW TOP BAR (Google Docs Android Layout: Left ✓ + Right 6 Clean Buttons) */}
      {!cleanPreviewMode && (
        <header
          className={`no-print sticky top-0 z-30 h-13 px-2.5 sm:px-4 border-b ${surfaceBg} ${borderCol} flex items-center justify-between shrink-0`}
        >
          {/* Left: Circular Checkmark (✓) Button (Saves draft & dismisses active menus/keyboard) */}
          <button
            type="button"
            onClick={handleCheckmarkDone}
            aria-label="Save draft and dismiss menus"
            title="Save draft & dismiss menus"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#004A77] text-[#C2E7FF] hover:bg-[#005B94]'
                : 'bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#D2E3FC]'
            }`}
          >
            <Check className="w-5 h-5 stroke-[2.25]" />
          </button>

          {/* Right: Strictly 6 Clean Buttons: Undo (↩), Redo (↪), Insert (+), Format (A), Compact PDF, More (⋮) */}
          <div
            onMouseDown={(e) => e.preventDefault()}
            className="flex items-center gap-0.5 sm:gap-1.5"
          >
            {/* 1. Undo (↩) */}
            <button
              type="button"
              onClick={() => execCmd('undo')}
              aria-label="Undo"
              title="Undo"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${iconBtnHover}`}
            >
              <Undo2 className="w-[19px] h-[19px]" />
            </button>

            {/* 2. Redo (↪) */}
            <button
              type="button"
              onClick={() => execCmd('redo')}
              aria-label="Redo"
              title="Redo"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${iconBtnHover}`}
            >
              <Redo2 className="w-[19px] h-[19px]" />
            </button>

            {/* 3. Insert (+) */}
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowAlignPopup(false);
                setShowBottomColorPopup(false);
                setActiveDrawer((prev) => (prev === 'insert' ? 'none' : 'insert'));
              }}
              aria-label="Insert"
              title="Insert (+)"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                activeDrawer === 'insert'
                  ? 'bg-[#E8F0FE] text-[#1A73E8]'
                  : iconBtnHover
              }`}
            >
              <Plus className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* 4. Format (A) */}
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowAlignPopup(false);
                setShowBottomColorPopup(false);
                setActiveDrawer((prev) => (prev === 'format' ? 'none' : 'format'));
              }}
              aria-label="Format"
              title="Format (A)"
              className={`w-9 h-9 rounded-full flex items-center justify-center font-serif font-bold text-[17px] transition-colors cursor-pointer ${
                activeDrawer === 'format'
                  ? 'bg-[#E8F0FE] text-[#1A73E8]'
                  : iconBtnHover
              }`}
            >
              <span className="leading-none underline decoration-2 underline-offset-2">A</span>
            </button>

            {/* 5. Compact PDF Button */}
            <button
              type="button"
              onClick={handleSavePrintReadyPDF}
              disabled={isPrinting}
              aria-label={`Save Print-Ready PDF (${paperSize})`}
              title={`Save / Print as PDF (${paperSize} · ${effectiveWidthMm}×${effectiveHeightMm}mm)`}
              className="h-8 px-2.5 mx-0.5 rounded-full bg-[#1A73E8] hover:bg-[#1557B0] active:bg-[#174EA6] text-white text-xs font-bold tracking-wide flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>

            {/* 6. Prominent Send / Export Button (Opens Clean Share & Export Bottom Sheet) */}
            <button
              type="button"
              onClick={() => {
                setShowAlignPopup(false);
                setShowBottomColorPopup(false);
                setActiveDrawer((prev) => (prev === 'share-export' ? 'none' : 'share-export'));
              }}
              aria-label="Send and Export (PDF or Word .docx)"
              title="Send / Export (PDF or Word .docx)"
              className={`h-8 px-2.5 rounded-full text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                activeDrawer === 'share-export'
                  ? 'bg-[#1A73E8] text-white'
                  : darkMode
                    ? 'bg-[#004A77] text-[#C2E7FF] hover:bg-[#005B94]'
                    : 'bg-[#E8F0FE] text-[#1A73E8] hover:bg-[#D2E3FC]'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Send</span>
            </button>

            {/* 7. More (⋮) */}
            <button
              type="button"
              onClick={() => {
                setShowAlignPopup(false);
                setShowBottomColorPopup(false);
                setMoreSubPanel('main');
                setActiveDrawer((prev) => (prev === 'more' ? 'none' : 'more'));
              }}
              aria-label="More options"
              title="More (⋮)"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                activeDrawer === 'more'
                  ? 'bg-[#E8F0FE] text-[#1A73E8]'
                  : iconBtnHover
              }`}
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </header>
      )}

      {/* POPOVER MODAL: FIND & REPLACE */}
      {showFindModal && (
        <div
          className={`no-print fixed top-15 right-3 z-50 border rounded-2xl shadow-2xl p-4 w-80 ${surfaceBg} ${borderCol}`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold flex items-center gap-1.5">
              <Search className="w-4 h-4 text-[#1A73E8]" />
              Find &amp; Replace (തിരയുക / മാറ്റുക)
            </h3>
            <button
              type="button"
              onClick={() => setShowFindModal(false)}
              className={`${mutedText} hover:opacity-80 cursor-pointer`}
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
                className={`w-full border ${borderCol} bg-transparent rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1A73E8]`}
                style={{ fontFamily: "'Noto Sans Malayalam', sans-serif" }}
              />
              {findMatchCount !== null && (
                <p className={`text-[11px] ${mutedText} mt-1`}>
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
                className={`w-full border ${borderCol} bg-transparent rounded-lg px-3 py-2 text-xs outline-none focus:border-[#1A73E8]`}
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

      {/* EXPORT TOAST / PRINT GUIDANCE BANNER WITH ONE-TAP PRINTABLE HTML & WORD (.DOCX) BUTTONS */}
      {toastMessage && (
        <div className="no-print fixed bottom-16 left-1/2 -translate-x-1/2 z-50 max-w-xl w-[94%] bg-[#202124] text-white px-4 py-3 rounded-2xl shadow-2xl flex flex-col gap-2.5 border border-[#3C4043]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5 text-xs leading-relaxed">
              <Info className="w-4 h-4 text-[#8AB4F8] shrink-0 mt-0.5" />
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setToastMessage(null);
                setShowExportActionsInToast(false);
              }}
              className="text-[#9AA0A6] hover:text-white shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {showExportActionsInToast && (
            <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-[#3C4043]">
              <button
                type="button"
                onClick={handleExportStandaloneHtml}
                className="flex-1 min-w-[180px] py-2 px-3 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <FileCode2 className="w-4 h-4 shrink-0" />
                <span>Download Printable Page (.html)</span>
              </button>
              <button
                type="button"
                onClick={handleSendAsWordDocx}
                className="py-2 px-3 rounded-xl bg-[#3C4043] hover:bg-[#5F6368] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span>Send as Word (.docx)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. AUTO-FIT PAPER CANVAS (90% of screen is the distraction-free paper sheet) */}
      <main
        id="mps-workspace-container"
        onClick={() => {
          if (showAlignPopup) setShowAlignPopup(false);
          if (showBottomColorPopup) setShowBottomColorPopup(false);
        }}
        className="flex-1 overflow-x-auto overflow-y-auto pt-3 pb-20 px-2 sm:px-6 flex justify-center items-start"
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
            {/* Optional Horizontal Millimeter Ruler (Toggled from Page Setup) */}
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

            {/* TRUE GOOGLE DOCS-STYLE SPLIT PAGE SHEETS (.pages-stack with 18px vertical gap between .page-sheet cards) */}
            <div id="mps-pages-stack" className="pages-stack">
              {Array.from({ length: mountedSheetCount }).map((_, pageIdx) => {
                const isVisiblePage = pageIdx < pageCount;
                const pageNumber = pageIdx + 1;
                const shouldShowHeaderFooterOnThisPage =
                  showHeaderFooter && !(differentFirstPage && pageNumber === 1);
                const shouldShowNumOnThisPage =
                  showPageNumbers && !(differentFirstPage && pageNumber === 1);

                const baseSheetStyle: React.CSSProperties = {
                  width: `${effectiveWidthMm}mm`,
                  height: `${effectiveHeightMm}mm`,
                  minHeight: `${effectiveHeightMm}mm`,
                  maxHeight: `${effectiveHeightMm}mm`,
                  paddingTop: `${margins.top}mm`,
                  paddingRight: `${margins.right}mm`,
                  paddingBottom: `${margins.bottom}mm`,
                  paddingLeft: `${margins.left}mm`,
                  backgroundColor: PAPER_TINTS[paperTint].hex,
                  color: '#111827',
                };

                const sheetStyle: React.CSSProperties = isVisiblePage
                  ? baseSheetStyle
                  : {
                      ...baseSheetStyle,
                      position: 'fixed',
                      left: '-9999px',
                      top: 0,
                      visibility: 'hidden',
                      pointerEvents: 'none',
                    };

                return (
                  <div
                    key={pageIdx}
                    data-page-index={pageIdx}
                    style={sheetStyle}
                    className={`page-sheet ${
                      isVisiblePage ? '' : 'page-sheet-staging no-print'
                    } shadow-[0_2px_10px_rgba(0,0,0,0.14)] border border-[#DADCE0] select-text`}
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

                    {/* Independent Closed 4-Sided Page Border / Outline Per Page */}
                    {screenBorderStyle && (
                      <div className="page-border-frame" style={screenBorderStyle} />
                    )}

                    {/* Diagonal Watermark Overlay Per Page */}
                    {watermarkText.trim() !== '' && (
                      <div className="malayalam-watermark pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-10 select-none">
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

                    {/* Independent Running Document Header Per Page */}
                    {((shouldShowHeaderFooterOnThisPage && headerText !== undefined && showHeaderFooter) ||
                      (shouldShowNumOnThisPage && pageNumberPosition === 'top')) &&
                      !(differentFirstPage && pageNumber === 1) && (
                        <div
                          style={{ fontFamily: activeDefaultFontObj.cssFamily }}
                          className="malayalam-header-footer relative z-20 mb-2.5 pb-1.5 border-b border-[#E5E7EB] flex items-center justify-between gap-3 text-[9.5pt] text-[#4B5563] shrink-0"
                        >
                          {shouldShowNumOnThisPage &&
                            pageNumberPosition === 'top' &&
                            pageNumberAlign === 'left' && (
                              <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                                {formatPageNumberLabel(pageNumber, pageCount)}
                              </span>
                            )}
                          {showHeaderFooter ? (
                            <input
                              ref={pageIdx === 0 ? headerInputRef : undefined}
                              type="text"
                              value={headerText}
                              onChange={(e) => setHeaderText(e.target.value)}
                              placeholder="ഹെഡർ ചേർക്കുക (Header)..."
                              className={`flex-1 bg-transparent outline-none focus:text-[#111827] ${
                                shouldShowNumOnThisPage &&
                                pageNumberPosition === 'top' &&
                                pageNumberAlign === 'center'
                                  ? 'text-left'
                                  : ''
                              }`}
                            />
                          ) : (
                            <span className="flex-1" />
                          )}
                          {shouldShowNumOnThisPage &&
                            pageNumberPosition === 'top' &&
                            pageNumberAlign === 'center' && (
                              <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                                {formatPageNumberLabel(pageNumber, pageCount)}
                              </span>
                            )}
                          {shouldShowNumOnThisPage &&
                            pageNumberPosition === 'top' &&
                            pageNumberAlign === 'right' && (
                              <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                                {formatPageNumberLabel(pageNumber, pageCount)}
                              </span>
                            )}
                        </div>
                      )}

                    {/* Rich-Text ContentEditable Malayalam Body for This Page Sheet */}
                    <div
                      ref={(el) => {
                        pageRefs.current[pageIdx] = el;
                      }}
                      contentEditable={isVisiblePage}
                      suppressContentEditableWarning
                      spellCheck={false}
                      onFocus={() => {
                        activePageIndexRef.current = pageIdx;
                      }}
                      onClick={(e) => handleEditorClick(e, pageIdx)}
                      onCompositionStart={() => {
                        isComposingRef.current = true;
                      }}
                      onCompositionEnd={() => {
                        isComposingRef.current = false;
                        schedulePagination(45);
                        saveToLocalStorage();
                        updateDocumentMetrics();
                      }}
                      onKeyDown={(e) => handlePageKeyDown(e, pageIdx)}
                      onKeyUp={(e) => {
                        saveSelection();
                        detectFontAtCursor();
                        if (!e.nativeEvent.isComposing && !isComposingRef.current) {
                          updateDocumentMetrics();
                        }
                      }}
                      onInput={(e) => {
                        const nativeEvt = e.nativeEvent as InputEvent;
                        if (nativeEvt.isComposing || isComposingRef.current) {
                          return;
                        }
                        schedulePagination(25);
                        saveToLocalStorage();
                        updateDocumentMetrics();
                      }}
                      style={{
                        fontFamily: activeDefaultFontObj.cssFamily,
                        lineHeight: lineSpacing,
                        letterSpacing: letterSpacing,
                      }}
                      className={`malayalam-doc relative z-20 flex-1 min-h-0 overflow-hidden text-[11pt] outline-none ${
                        spaceAfterParagraph ? '[&_p]:mb-2.5' : '[&_p]:mb-0.5'
                      } ${firstLineIndent ? 'first-line-indent' : ''} ${
                        columnCount === 2 ? 'cols-2' : columnCount === 3 ? 'cols-3' : ''
                      }`}
                    />

                    {/* Independent Running Document Footer & Automatic Page Numbering Per Page */}
                    {(showHeaderFooter ||
                      (shouldShowNumOnThisPage && pageNumberPosition === 'bottom')) && (
                      <div
                        style={{ fontFamily: activeDefaultFontObj.cssFamily }}
                        className="malayalam-header-footer relative z-20 mt-auto pt-1.5 border-t border-[#E5E7EB] flex items-center justify-between gap-4 text-[9.5pt] text-[#4B5563] shrink-0"
                      >
                        {shouldShowNumOnThisPage &&
                          pageNumberPosition === 'bottom' &&
                          pageNumberAlign === 'left' && (
                            <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                              {formatPageNumberLabel(pageNumber, pageCount)}
                            </span>
                          )}
                        {showHeaderFooter && !(differentFirstPage && pageNumber === 1) ? (
                          <input
                            type="text"
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            placeholder="ഫൂട്ടർ ചേർക്കുക (Footer)..."
                            className="flex-1 bg-transparent outline-none focus:text-[#111827]"
                          />
                        ) : (
                          <span className="flex-1" />
                        )}
                        {shouldShowNumOnThisPage &&
                          pageNumberPosition === 'bottom' &&
                          pageNumberAlign === 'center' && (
                            <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                              {formatPageNumberLabel(pageNumber, pageCount)}
                            </span>
                          )}
                        {shouldShowNumOnThisPage &&
                          pageNumberPosition === 'bottom' &&
                          pageNumberAlign === 'right' && (
                            <span className="shrink-0 font-medium text-[#374151] whitespace-nowrap">
                              {formatPageNumberLabel(pageNumber, pageCount)}
                            </span>
                          )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* CONTEXTUAL FLOATING PILL BAR FOR TABLE OR IMAGE EDITING (Right above bottom toolbar when active) */}
      {!cleanPreviewMode && (activeTableCell || activeImage) && (
        <div
          className={`no-print fixed bottom-13 left-1/2 -translate-x-1/2 z-30 max-w-[96vw] px-3 py-1.5 rounded-full shadow-lg border ${surfaceBg} ${borderCol} flex items-center gap-1.5 overflow-x-auto toolbar-scroll`}
        >
          {activeTableCell && (
            <>
              <span className="text-[11px] font-bold text-[#1A73E8] px-1 whitespace-nowrap">Table:</span>
              <button
                type="button"
                onClick={() => modifyActiveTable('addRow')}
                className="px-2 py-1 text-[11px] font-medium bg-[#E8F0FE] text-[#1A73E8] rounded-full whitespace-nowrap cursor-pointer"
              >
                +Row
              </button>
              <button
                type="button"
                onClick={() => modifyActiveTable('addCol')}
                className="px-2 py-1 text-[11px] font-medium bg-[#E8F0FE] text-[#1A73E8] rounded-full whitespace-nowrap cursor-pointer"
              >
                +Col
              </button>
              <button
                type="button"
                onClick={() => modifyActiveTable('delRow')}
                className="px-2 py-1 text-[11px] font-medium bg-[#FEE2E2] text-[#B91C1C] rounded-full whitespace-nowrap cursor-pointer"
              >
                -Row
              </button>
              <button
                type="button"
                onClick={() => modifyActiveTable('delCol')}
                className="px-2 py-1 text-[11px] font-medium bg-[#FEE2E2] text-[#B91C1C] rounded-full whitespace-nowrap cursor-pointer"
              >
                -Col
              </button>
              <button
                type="button"
                onClick={() => modifyActiveTable('borderStandard')}
                className={`px-2 py-1 text-[11px] rounded-full border ${borderCol} whitespace-nowrap cursor-pointer`}
              >
                Grid
              </button>
              <button
                type="button"
                onClick={() => modifyActiveTable('borderNone')}
                className={`px-2 py-1 text-[11px] rounded-full border ${borderCol} whitespace-nowrap cursor-pointer`}
              >
                No Border
              </button>
              <button
                type="button"
                onClick={() => modifyActiveTable('deleteTable')}
                className="p-1 text-[#B91C1C] hover:bg-[#FEE2E2] rounded-full cursor-pointer"
                title="Delete Table"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {activeImage && (
            <>
              <span className="text-[11px] font-bold text-[#1A73E8] px-1 whitespace-nowrap">Image:</span>
              <input
                type="range"
                min={15}
                max={100}
                value={activeImageWidthPct}
                onChange={(e) => updateSelectedImageStyle(Number(e.target.value))}
                className="w-24 accent-[#1A73E8] cursor-pointer"
              />
              <span className="text-[11px] font-mono">{activeImageWidthPct}%</span>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle(undefined, 'left')}
                className={`px-2 py-0.5 text-[11px] rounded-full border ${borderCol} cursor-pointer`}
              >
                L
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle(undefined, 'center')}
                className={`px-2 py-0.5 text-[11px] rounded-full border ${borderCol} cursor-pointer`}
              >
                C
              </button>
              <button
                type="button"
                onClick={() => updateSelectedImageStyle(undefined, 'right')}
                className={`px-2 py-0.5 text-[11px] rounded-full border ${borderCol} cursor-pointer`}
              >
                R
              </button>
              <button
                type="button"
                onClick={() => {
                  activeImage.remove();
                  setActiveImage(null);
                  saveToLocalStorage();
                  updateDocumentMetrics();
                }}
                className="p-1 text-[#B91C1C] hover:bg-[#FEE2E2] rounded-full cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      )}

      {/* 2. SLIM GOOGLE DOCS-STYLE BOTTOM TOOLBAR (Fixed single row: B, I, U, S, A color, Alignment vertical stack, Bullet List, A≡) */}
      {!cleanPreviewMode && (
        <div
          onMouseDown={(e) => {
            const tag = (e.target as HTMLElement).tagName;
            if (tag !== 'INPUT') e.preventDefault();
          }}
          className={`no-print fixed bottom-0 left-0 right-0 z-30 h-12 border-t ${surfaceBg} ${borderCol} px-2 flex items-center justify-around sm:justify-center sm:gap-3 shadow-[0_-1px_6px_rgba(0,0,0,0.05)]`}
        >
          {/* B (Bold) */}
          <button
            type="button"
            onClick={() => execCmd('bold')}
            aria-label="Bold"
            title="Bold"
            className={`w-10 h-9 rounded-lg flex items-center justify-center cursor-pointer ${iconBtnHover}`}
          >
            <Bold className="w-[18px] h-[18px]" />
          </button>

          {/* I (Italic) */}
          <button
            type="button"
            onClick={() => execCmd('italic')}
            aria-label="Italic"
            title="Italic"
            className={`w-10 h-9 rounded-lg flex items-center justify-center cursor-pointer ${iconBtnHover}`}
          >
            <Italic className="w-[18px] h-[18px]" />
          </button>

          {/* U (Underline) */}
          <button
            type="button"
            onClick={() => execCmd('underline')}
            aria-label="Underline"
            title="Underline"
            className={`w-10 h-9 rounded-lg flex items-center justify-center cursor-pointer ${iconBtnHover}`}
          >
            <Underline className="w-[18px] h-[18px]" />
          </button>

          {/* S (Strikethrough) */}
          <button
            type="button"
            onClick={() => execCmd('strikeThrough')}
            aria-label="Strikethrough"
            title="Strikethrough"
            className={`w-10 h-9 rounded-lg flex items-center justify-center cursor-pointer ${iconBtnHover}`}
          >
            <Strikethrough className="w-[18px] h-[18px]" />
          </button>

          {/* A (Text Color Picker with Popover right above it) */}
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowAlignPopup(false);
                setShowBottomColorPopup((prev) => !prev);
              }}
              aria-label="Text color"
              title="Text Color"
              className={`w-10 h-9 rounded-lg flex flex-col items-center justify-center cursor-pointer ${
                showBottomColorPopup ? 'bg-[#E8F0FE] text-[#1A73E8]' : iconBtnHover
              }`}
            >
              <span className="font-serif font-bold text-[15px] leading-none">A</span>
              <span
                className="w-4 h-1 rounded-full mt-0.5"
                style={{ backgroundColor: textColor }}
              />
            </button>

            {/* Quick Text Color Popover above "A" */}
            {showBottomColorPopup && (
              <div
                className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-50 p-2 rounded-2xl shadow-xl border ${surfaceBg} ${borderCol} flex items-center gap-1.5`}
              >
                {QUICK_TEXT_COLORS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => {
                      setTextColor(hex);
                      execCmd('foreColor', hex);
                      setShowBottomColorPopup(false);
                    }}
                    style={{ backgroundColor: hex }}
                    className={`w-6 h-6 rounded-full border border-black/15 shrink-0 cursor-pointer transition-transform hover:scale-110 ${
                      textColor === hex ? 'ring-2 ring-[#1A73E8] ring-offset-1' : ''
                    }`}
                  />
                ))}
                <label
                  title="Custom Color"
                  className="w-6 h-6 rounded-full border border-dashed border-[#5F6368] flex items-center justify-center text-[10px] font-bold cursor-pointer shrink-0"
                >
                  +
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => {
                      setTextColor(e.target.value);
                      execCmd('foreColor', e.target.value);
                      setShowBottomColorPopup(false);
                    }}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Alignment Button (Tapping pops up a clean vertical stack of Left, Center, Right, Justify icons right above it) */}
          <div className="relative flex items-center justify-center">
            <button
              type="button"
              onClick={() => {
                saveSelection();
                setShowBottomColorPopup(false);
                setShowAlignPopup((prev) => !prev);
              }}
              aria-label="Alignment"
              title="Alignment"
              className={`w-10 h-9 rounded-lg flex items-center justify-center cursor-pointer ${
                showAlignPopup ? 'bg-[#E8F0FE] text-[#1A73E8]' : iconBtnHover
              }`}
            >
              {currentAlign === 'left' && <AlignLeft className="w-[18px] h-[18px]" />}
              {currentAlign === 'center' && <AlignCenter className="w-[18px] h-[18px]" />}
              {currentAlign === 'right' && <AlignRight className="w-[18px] h-[18px]" />}
              {currentAlign === 'justify' && <AlignJustify className="w-[18px] h-[18px]" />}
            </button>

            {/* Clean Vertical Stack of Left, Center, Right, Justify right above the Alignment button */}
            {showAlignPopup && (
              <div
                className={`absolute bottom-12 left-1/2 -translate-x-1/2 z-50 p-1.5 rounded-2xl shadow-xl border ${surfaceBg} ${borderCol} flex flex-col items-center gap-1`}
              >
                <button
                  type="button"
                  onClick={() => handleApplyAlignment('left')}
                  title="Align Left"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                    currentAlign === 'left' ? 'bg-[#E8F0FE] text-[#1A73E8]' : iconBtnHover
                  }`}
                >
                  <AlignLeft className="w-[18px] h-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAlignment('center')}
                  title="Align Center"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                    currentAlign === 'center' ? 'bg-[#E8F0FE] text-[#1A73E8]' : iconBtnHover
                  }`}
                >
                  <AlignCenter className="w-[18px] h-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAlignment('right')}
                  title="Align Right"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                    currentAlign === 'right' ? 'bg-[#E8F0FE] text-[#1A73E8]' : iconBtnHover
                  }`}
                >
                  <AlignRight className="w-[18px] h-[18px]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAlignment('justify')}
                  title="Justify"
                  className={`w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                    currentAlign === 'justify' ? 'bg-[#E8F0FE] text-[#1A73E8]' : iconBtnHover
                  }`}
                >
                  <AlignJustify className="w-[18px] h-[18px]" />
                </button>
              </div>
            )}
          </div>

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => execCmd('insertUnorderedList')}
            aria-label="Bullet list"
            title="Bullet List"
            className={`w-10 h-9 rounded-lg flex items-center justify-center cursor-pointer ${iconBtnHover}`}
          >
            <List className="w-[18px] h-[18px]" />
          </button>

          {/* A≡ (Opens full Format Bottom Sheet) */}
          <button
            type="button"
            onClick={() => {
              saveSelection();
              setShowAlignPopup(false);
              setShowBottomColorPopup(false);
              setActiveDrawer((prev) => (prev === 'format' ? 'none' : 'format'));
            }}
            aria-label="Open full Format panel"
            title="Full Format Sheet (A≡)"
            className={`h-9 px-2.5 rounded-lg flex items-center justify-center gap-0.5 font-semibold text-xs cursor-pointer ${
              activeDrawer === 'format' ? 'bg-[#E8F0FE] text-[#1A73E8]' : iconBtnHover
            }`}
          >
            <span className="font-serif font-bold text-[15px] leading-none">A</span>
            <span className="text-[13px] leading-none font-mono">≡</span>
          </button>
        </div>
      )}

      {/* 3. SLIDE-UP "FORMAT" BOTTOM SHEET (Triggered by top `A` or bottom `A≡`) */}
      {activeDrawer === 'format' && (
        <div
          onClick={() => setActiveDrawer('none')}
          className="no-print fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-t-3xl shadow-2xl border-t ${surfaceBg} ${borderCol} max-h-[84vh] flex flex-col overflow-hidden`}
          >
            {/* Drag Handle + Header with X close button */}
            <div className={`pt-2.5 pb-2.5 px-5 border-b ${borderCol} flex flex-col items-center shrink-0`}>
              <div className="w-9 h-1 rounded-full bg-[#9AA0A6]/50 mb-2" />
              <div className="w-full flex items-center justify-between">
                <span className="text-sm font-bold">Format</span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer('none')}
                  aria-label="Close Format sheet"
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Format Sheet Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
              {/* Row 1: Paragraph Style Dropdown (Normal text, Title, Heading 1, Heading 2, Heading 3) */}
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-semibold w-14 shrink-0">Style</label>
                <select
                  aria-label="Paragraph Style"
                  value={currentBlockStyle}
                  onMouseDown={saveSelection}
                  onChange={(e) => applyBlockStyle(e.target.value)}
                  className={`flex-1 h-10 rounded-xl border px-3 font-medium outline-none cursor-pointer ${cardBg}`}
                >
                  <option value="p">Normal text (സാധാരണ)</option>
                  <option value="title">Title (ശീർഷകം)</option>
                  <option value="h1">Heading 1 (തലക്കെട്ട് 1)</option>
                  <option value="h2">Heading 2 (തലക്കെട്ട് 2)</option>
                  <option value="h3">Heading 3 (തലക്കെട്ട് 3)</option>
                </select>
              </div>

              {/* Row 2: Malayalam Font Family Dropdown next to `- 11 +` Font Size Stepper */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  {/* Malayalam Font Family Dropdown */}
                  <div className="flex-1 min-w-0">
                    <select
                      aria-label="Malayalam Font Family"
                      value={currentFontId}
                      onMouseDown={saveSelection}
                      onChange={(e) => applyMalayalamFontFamily(e.target.value, false)}
                      style={{ fontFamily: activeToolbarFontObj.cssFamily }}
                      className={`w-full h-10 rounded-xl border px-3 font-semibold outline-none truncate cursor-pointer ${cardBg}`}
                    >
                      {FONT_CATEGORIES.map((category) => (
                        <optgroup key={category} label={category}>
                          {MALAYALAM_FONTS.filter((f) => f.category === category).map((font) => (
                            <option key={font.id} value={font.id}>
                              {font.name} — {font.mlName}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* `- 11 +` Font Size Stepper */}
                  <div
                    className={`h-10 rounded-xl border ${cardBg} flex items-center shrink-0 overflow-hidden`}
                  >
                    <button
                      type="button"
                      onClick={() => handleStepFontSize(-1)}
                      aria-label="Decrease font size"
                      className={`w-9 h-full flex items-center justify-center font-bold text-sm cursor-pointer ${iconBtnHover}`}
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-mono tabular-nums font-bold text-xs">
                      {currentFontSizePt}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepFontSize(1)}
                      aria-label="Increase font size"
                      className={`w-9 h-full flex items-center justify-center font-bold text-sm cursor-pointer ${iconBtnHover}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Quick option to set the chosen Malayalam font as Whole-Document Default */}
                <div className="flex items-center justify-between px-1">
                  <span
                    style={{ fontFamily: activeToolbarFontObj.cssFamily }}
                    className={`text-[11px] truncate ${mutedText}`}
                  >
                    {activeToolbarFontObj.specimen}
                  </span>
                  <button
                    type="button"
                    onClick={() => applyMalayalamFontFamily(currentFontId, true)}
                    className="text-[11px] font-semibold text-[#1A73E8] hover:underline shrink-0 cursor-pointer"
                  >
                    {defaultDocFontId === currentFontId ? '✓ Default Doc Font' : 'Set as Whole Doc Font'}
                  </button>
                </div>
              </div>

              {/* Row 3: Toggle Row: B, I, U, S, X², X₂ */}
              <div className={`grid grid-cols-6 gap-1 p-1 rounded-2xl border ${cardBg}`}>
                <button
                  type="button"
                  onClick={() => execCmd('bold')}
                  title="Bold (B)"
                  className={`h-9 rounded-xl font-bold flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('italic')}
                  title="Italic (I)"
                  className={`h-9 rounded-xl flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('underline')}
                  title="Underline (U)"
                  className={`h-9 rounded-xl flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <Underline className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('strikeThrough')}
                  title="Strikethrough (S)"
                  className={`h-9 rounded-xl flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <Strikethrough className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('superscript')}
                  title="Superscript (X²)"
                  className={`h-9 rounded-xl font-semibold flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <span>X²</span>
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('subscript')}
                  title="Subscript (X₂)"
                  className={`h-9 rounded-xl font-semibold flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <span>X₂</span>
                </button>
              </div>

              {/* Row 4: Two Side-by-Side Color Pills: Text color & Highlight color */}
              <div className="grid grid-cols-2 gap-2.5">
                <label
                  onMouseDown={saveSelection}
                  className={`h-10 px-3.5 rounded-full border ${cardBg} flex items-center justify-between cursor-pointer`}
                >
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#1A73E8]" />
                    <span className="font-semibold">Text</span>
                  </div>
                  <span
                    className="w-5 h-5 rounded-full border border-black/20 shrink-0"
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
                  onMouseDown={saveSelection}
                  className={`h-10 px-3.5 rounded-full border ${cardBg} flex items-center justify-between cursor-pointer`}
                >
                  <div className="flex items-center gap-2">
                    <Highlighter className="w-4 h-4 text-[#1A73E8]" />
                    <span className="font-semibold">Highlight</span>
                  </div>
                  <span
                    className="w-5 h-5 rounded-full border border-black/20 shrink-0"
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
              </div>

              {/* Row 5: Alignment & Indent Row (Left, Center, Right, Justify, Decrease Indent, Increase Indent) + Bullet & Numbered List */}
              <div className={`grid grid-cols-8 gap-1 p-1 rounded-2xl border ${cardBg}`}>
                <button
                  type="button"
                  onClick={() => handleApplyAlignment('left')}
                  title="Align Left"
                  className={`h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                    currentAlign === 'left' ? 'bg-[#E8F0FE] text-[#1A73E8]' : iconBtnHover
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAlignment('center')}
                  title="Align Center"
                  className={`h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                    currentAlign === 'center' ? 'bg-[#E8F0FE] text-[#1A73E8]' : iconBtnHover
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAlignment('right')}
                  title="Align Right"
                  className={`h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                    currentAlign === 'right' ? 'bg-[#E8F0FE] text-[#1A73E8]' : iconBtnHover
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyAlignment('justify')}
                  title="Justify"
                  className={`h-9 rounded-xl flex items-center justify-center cursor-pointer ${
                    currentAlign === 'justify' ? 'bg-[#E8F0FE] text-[#1A73E8]' : iconBtnHover
                  }`}
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('outdent')}
                  title="Decrease Indent"
                  className={`h-9 rounded-xl flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <IndentDecrease className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('indent')}
                  title="Increase Indent"
                  className={`h-9 rounded-xl flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <IndentIncrease className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('insertUnorderedList')}
                  title="Bullet List"
                  className={`h-9 rounded-xl flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => execCmd('insertOrderedList')}
                  title="Numbered List"
                  className={`h-9 rounded-xl flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <ListOrdered className="w-4 h-4" />
                </button>
              </div>

              {/* Row 6: Line Spacing `- 1.15 +` Stepper and `Add page break` Switch */}
              <div className={`p-3 rounded-2xl border ${cardBg} space-y-3`}>
                {/* Line spacing stepper */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium">
                    <ArrowUpDown className="w-4 h-4 text-[#1A73E8]" />
                    <span>Line spacing</span>
                  </div>
                  <div
                    className={`h-9 rounded-xl border ${borderCol} ${surfaceBg} flex items-center overflow-hidden`}
                  >
                    <button
                      type="button"
                      onClick={() => handleStepLineSpacing(-1)}
                      aria-label="Decrease line spacing"
                      className={`w-9 h-full flex items-center justify-center font-bold text-sm cursor-pointer ${iconBtnHover}`}
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-mono tabular-nums font-bold text-xs">
                      {lineSpacing}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStepLineSpacing(1)}
                      aria-label="Increase line spacing"
                      className={`w-9 h-full flex items-center justify-center font-bold text-sm cursor-pointer ${iconBtnHover}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add page break switch */}
                <div className={`pt-2.5 border-t ${borderCol} flex items-center justify-between`}>
                  <div className="flex items-center gap-2 font-medium">
                    <Scissors className="w-4 h-4 text-[#1A73E8]" />
                    <span>Add page break</span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={addPageBreakSwitch}
                    onClick={handleToggleAddPageBreakSwitch}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                      addPageBreakSwitch ? 'bg-[#1A73E8] justify-end' : 'bg-[#9AA0A6]/50 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* Clear formatting button */}
                <div className={`pt-2 border-t ${borderCol} flex items-center justify-between`}>
                  <span className={`text-[11px] ${mutedText}`}>Reset selected text formatting</span>
                  <button
                    type="button"
                    onClick={() => execCmd('removeFormat')}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#1A73E8] hover:bg-[#E8F0FE] flex items-center gap-1 cursor-pointer"
                  >
                    <RemoveFormatting className="w-3.5 h-3.5" />
                    <span>Clear formatting</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. SLIDE-UP "INSERT" BOTTOM SHEET (Triggered by `+` in Top Bar) */}
      {activeDrawer === 'insert' && (
        <div
          onClick={() => setActiveDrawer('none')}
          className="no-print fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-t-3xl shadow-2xl border-t ${surfaceBg} ${borderCol} max-h-[82vh] flex flex-col overflow-hidden`}
          >
            {/* Drag Handle + Header with X close button */}
            <div className={`pt-2.5 pb-2.5 px-5 border-b ${borderCol} flex flex-col items-center shrink-0`}>
              <div className="w-9 h-1 rounded-full bg-[#9AA0A6]/50 mb-2" />
              <div className="w-full flex items-center justify-between">
                <span className="text-sm font-bold">Insert</span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer('none')}
                  aria-label="Close Insert sheet"
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Clean Vertical Icon List: Image, Table, Horizontal line, Page break, Page number, Header & Footer */}
            <div className="py-2 px-3 overflow-y-auto divide-y divide-transparent space-y-1 text-xs">
              {/* 1. Image */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className={`w-full px-3.5 py-3 rounded-2xl flex items-center gap-3.5 text-left transition-colors cursor-pointer ${iconBtnHover}`}
              >
                <div className="w-9 h-9 rounded-full bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Image</div>
                  <div className={`text-[11px] ${mutedText}`}>ചിത്രം / ലോഗോ ചേർക്കുക</div>
                </div>
              </button>

              {/* 2. Table (with expandable Rows × Columns selector) */}
              <div className="rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowInsertTableConfig((prev) => !prev)}
                  className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3.5 text-left transition-colors cursor-pointer ${iconBtnHover}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center shrink-0">
                      <TableIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Table</div>
                      <div className={`text-[11px] ${mutedText}`}>
                        പട്ടിക ചേർക്കുക ({tableRowsInput} × {tableColsInput})
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showInsertTableConfig ? 'rotate-180' : ''}`}
                  />
                </button>

                {showInsertTableConfig && (
                  <div className={`mx-3 mb-2 p-3 rounded-2xl border ${cardBg} space-y-3`}>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Rows</span>
                        <div className={`h-8 rounded-lg border ${borderCol} ${surfaceBg} flex items-center`}>
                          <button
                            type="button"
                            onClick={() => setTableRowsInput((r) => Math.max(1, r - 1))}
                            className="w-7 h-full font-bold cursor-pointer"
                          >
                            −
                          </button>
                          <span className="w-7 text-center font-mono font-bold">{tableRowsInput}</span>
                          <button
                            type="button"
                            onClick={() => setTableRowsInput((r) => Math.min(20, r + 1))}
                            className="w-7 h-full font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium">Columns</span>
                        <div className={`h-8 rounded-lg border ${borderCol} ${surfaceBg} flex items-center`}>
                          <button
                            type="button"
                            onClick={() => setTableColsInput((c) => Math.max(1, c - 1))}
                            className="w-7 h-full font-bold cursor-pointer"
                          >
                            −
                          </button>
                          <span className="w-7 text-center font-mono font-bold">{tableColsInput}</span>
                          <button
                            type="button"
                            onClick={() => setTableColsInput((c) => Math.min(10, c + 1))}
                            className="w-7 h-full font-bold cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleInsertTable}
                      className="w-full py-2 rounded-xl bg-[#1A73E8] hover:bg-[#1557B0] text-white font-semibold cursor-pointer"
                    >
                      Insert {tableRowsInput} × {tableColsInput} Table
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Horizontal line */}
              <button
                type="button"
                onClick={handleInsertDivider}
                className={`w-full px-3.5 py-3 rounded-2xl flex items-center gap-3.5 text-left transition-colors cursor-pointer ${iconBtnHover}`}
              >
                <div className="w-9 h-9 rounded-full bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center shrink-0">
                  <Minus className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Horizontal line</div>
                  <div className={`text-[11px] ${mutedText}`}>വേർതിരിക്കുന്ന വര ചേർക്കുക</div>
                </div>
              </button>

              {/* 4. Page break */}
              <button
                type="button"
                onClick={handleInsertPageBreak}
                className={`w-full px-3.5 py-3 rounded-2xl flex items-center gap-3.5 text-left transition-colors cursor-pointer ${iconBtnHover}`}
              >
                <div className="w-9 h-9 rounded-full bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Page break</div>
                  <div className={`text-[11px] ${mutedText}`}>പുതിയ പേജ് തുടങ്ങുക</div>
                </div>
              </button>

              {/* 5. Page number */}
              <div className="rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowInsertPageNumConfig((prev) => !prev)}
                  className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3.5 text-left transition-colors cursor-pointer ${iconBtnHover}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-full bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center shrink-0">
                      <Hash className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm">Page number</div>
                      <div className={`text-[11px] ${mutedText}`}>
                        {showPageNumbers
                          ? `Active (${formatPageNumberLabel(1, estimatedPages)} · ${pageNumberPosition})`
                          : 'Off — Tap to enable page numbers'}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${showInsertPageNumConfig ? 'rotate-180' : ''}`}
                  />
                </button>

                {showInsertPageNumConfig && (
                  <div className={`mx-3 mb-2 p-3 rounded-2xl border ${cardBg} space-y-2.5`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Show Page Numbers</span>
                      <input
                        type="checkbox"
                        checked={showPageNumbers}
                        onChange={(e) => {
                          setShowPageNumbers(e.target.checked);
                          if (e.target.checked) setShowHeaderFooter(true);
                        }}
                        className="w-4 h-4 accent-[#1A73E8]"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={pageNumberPosition}
                        onChange={(e) => setPageNumberPosition(e.target.value as PageNumberPosition)}
                        className={`h-8 rounded-lg border px-2 ${surfaceBg} ${borderCol}`}
                      >
                        <option value="bottom">Bottom</option>
                        <option value="top">Top</option>
                      </select>
                      <select
                        value={pageNumberAlign}
                        onChange={(e) => setPageNumberAlign(e.target.value as PageNumberAlign)}
                        className={`h-8 rounded-lg border px-2 ${surfaceBg} ${borderCol}`}
                      >
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                      </select>
                      <select
                        value={pageNumberFormat}
                        onChange={(e) => setPageNumberFormat(e.target.value as PageNumberFormat)}
                        className={`h-8 rounded-lg border px-2 ${surfaceBg} ${borderCol}`}
                      >
                        <option value="malayalam">പേജ് 1 / {estimatedPages}</option>
                        <option value="english">Page 1 of {estimatedPages}</option>
                        <option value="simple">1</option>
                        <option value="dashed">- 1 -</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Header & Footer */}
              <button
                type="button"
                onClick={() => {
                  const next = !showHeaderFooter;
                  setShowHeaderFooter(next);
                  setActiveDrawer('none');
                  if (next) {
                    setTimeout(() => headerInputRef.current?.focus(), 80);
                    triggerToast('Header & Footer enabled on sheet', 2500);
                  } else {
                    triggerToast('Header & Footer hidden', 2500);
                  }
                }}
                className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3.5 text-left transition-colors cursor-pointer ${iconBtnHover}`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-full bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center shrink-0">
                    <PanelTop className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Header &amp; Footer</div>
                    <div className={`text-[11px] ${mutedText}`}>
                      ഹെഡറും ഫൂട്ടറും ({showHeaderFooter ? 'Visible' : 'Hidden'})
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    showHeaderFooter ? 'bg-[#E8F0FE] text-[#1A73E8]' : mutedText
                  }`}
                >
                  {showHeaderFooter ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. RIGHT-SIDE SLIDE-OVER "MORE (⋮)" DRAWER */}
      {activeDrawer === 'more' && (
        <div
          onClick={() => setActiveDrawer('none')}
          className="no-print fixed inset-0 z-50 bg-black/40 flex justify-end"
        >
          <aside
            onClick={(e) => e.stopPropagation()}
            className={`w-85 max-w-[90vw] h-full shadow-2xl border-l ${surfaceBg} ${borderCol} flex flex-col overflow-hidden`}
          >
            {/* Top Header of Right Slide-Over Drawer: Editable Document Title with Pencil (✎) Icon */}
            <div className={`p-4 border-b ${borderCol} shrink-0`}>
              {moreSubPanel === 'main' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${mutedText}`}>
                      Malayalam Print Studio
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveDrawer('none')}
                      className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Editable Document Title with Pencil (✎) Icon */}
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${cardBg} focus-within:border-[#1A73E8]`}
                  >
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      aria-label="Document Title"
                      placeholder="ഡോക്യുമെന്റ് പേര്..."
                      style={{ fontFamily: "'Noto Sans Malayalam', 'Plus Jakarta Sans', sans-serif" }}
                      className="flex-1 bg-transparent text-sm font-bold outline-none min-w-0"
                    />
                    <button
                      type="button"
                      onClick={() => titleInputRef.current?.focus()}
                      title="Edit Document Title"
                      className="text-[#1A73E8] hover:opacity-80 shrink-0 cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                  </div>
                  <div className={`flex items-center justify-between text-[11px] px-1 ${mutedText}`}>
                    <span>
                      {PAPER_SIZES[paperSize].shortLabel} ({effectiveWidthMm}×{effectiveHeightMm}mm)
                    </span>
                    <span>
                      {estimatedPages} Page{estimatedPages > 1 ? 's' : ''} · {wordCount} Words
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setMoreSubPanel('main')}
                    className="flex items-center gap-2 text-sm font-bold text-[#1A73E8] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>
                      {moreSubPanel === 'page-setup' && 'Page setup'}
                      {moreSubPanel === 'templates' && 'Templates (മാതൃകകൾ)'}
                      {moreSubPanel === 'word-count' && 'Word count'}
                      {moreSubPanel === 'share-export' && 'Share and export'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer('none')}
                    className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* MAIN MENU LIST INSIDE RIGHT-SIDE DRAWER */}
            {moreSubPanel === 'main' && (
              <div className="p-3 overflow-y-auto flex-1 space-y-1 text-xs">
                {/* 1. Dark / Light UI theme toggle switch */}
                <div
                  className={`px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3 ${iconBtnHover}`}
                >
                  <div className="flex items-center gap-3">
                    {darkMode ? (
                      <Moon className="w-4 h-4 text-[#8AB4F8]" />
                    ) : (
                      <Sun className="w-4 h-4 text-[#1A73E8]" />
                    )}
                    <div>
                      <div className="font-semibold text-sm">Dark / Light UI theme</div>
                      <div className={`text-[11px] ${mutedText}`}>
                        {darkMode ? 'Dark UI (Paper stays white)' : 'Light UI'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={darkMode}
                    onClick={() => setDarkMode((prev) => !prev)}
                    className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                      darkMode ? 'bg-[#1A73E8] justify-end' : 'bg-[#9AA0A6]/50 justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
                  </button>
                </div>

                {/* 2. Page setup */}
                <button
                  type="button"
                  onClick={() => setMoreSubPanel('page-setup')}
                  className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3 text-left cursor-pointer ${iconBtnHover}`}
                >
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal className="w-4 h-4 text-[#1A73E8]" />
                    <div>
                      <div className="font-semibold text-sm">Page setup</div>
                      <div className={`text-[11px] ${mutedText}`}>
                        {paperSize} · {orientation} · Borders · Columns · Watermark
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>

                {/* 3. Templates (മാതൃകകൾ) */}
                <button
                  type="button"
                  onClick={() => setMoreSubPanel('templates')}
                  className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3 text-left cursor-pointer ${iconBtnHover}`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutTemplate className="w-4 h-4 text-[#1A73E8]" />
                    <div>
                      <div className="font-semibold text-sm">Templates (മാതൃകകൾ)</div>
                      <div className={`text-[11px] ${mutedText}`}>
                        A5 Notice, A4 Letterhead, A4 2-Col Exam
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>

                {/* 4. Find and replace */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveDrawer('none');
                    setShowFindModal(true);
                  }}
                  className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3 text-left cursor-pointer ${iconBtnHover}`}
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-[#1A73E8]" />
                    <div>
                      <div className="font-semibold text-sm">Find and replace</div>
                      <div className={`text-[11px] ${mutedText}`}>വാക്കുകൾ തിരയുക / മാറ്റുക</div>
                    </div>
                  </div>
                </button>

                {/* 5. Word count */}
                <button
                  type="button"
                  onClick={() => setMoreSubPanel('word-count')}
                  className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3 text-left cursor-pointer ${iconBtnHover}`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#1A73E8]" />
                    <div>
                      <div className="font-semibold text-sm">Word count</div>
                      <div className={`text-[11px] ${mutedText}`}>
                        {wordCount} words · {charCount} characters
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>

                {/* 6. Share and export (Send / Export Bottom Sheet) */}
                <button
                  type="button"
                  onClick={() => setActiveDrawer('share-export')}
                  className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3 text-left cursor-pointer ${iconBtnHover}`}
                >
                  <div className="flex items-center gap-3">
                    <Share2 className="w-4 h-4 text-[#1A73E8]" />
                    <div>
                      <div className="font-semibold text-sm">Share &amp; Export / Send</div>
                      <div className={`text-[11px] ${mutedText}`}>
                        Save / Print as PDF or Send as Word File (.docx)
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>

                {/* Clean Print Preview Mode Quick Toggle */}
                <div className={`pt-2 mt-2 border-t ${borderCol}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveDrawer('none');
                      setCleanPreviewMode(true);
                    }}
                    className={`w-full px-3.5 py-3 rounded-2xl flex items-center justify-between gap-3 text-left cursor-pointer ${iconBtnHover}`}
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-[#1A73E8]" />
                      <div>
                        <div className="font-semibold text-sm">Print preview</div>
                        <div className={`text-[11px] ${mutedText}`}>
                          Full-screen distraction-free view
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* SUB-PANEL A: PAGE SETUP (A5/A4/A3/B5/Letter/Legal/Custom, Orientation, Margins, Borders, Columns, Watermark, Crop Marks) */}
            {moreSubPanel === 'page-setup' && (
              <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* Paper Size & Quick A5/A4 Buttons */}
                <div className={`p-3.5 rounded-2xl border ${cardBg} space-y-2.5`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold">Paper size</span>
                    <span className="font-mono text-[11px] text-[#1A73E8] font-semibold">
                      {effectiveWidthMm}×{effectiveHeightMm}mm
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePaperSizeChange('A5')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                        paperSize === 'A5'
                          ? 'bg-[#E8F0FE] border-[#1A73E8] text-[#174EA6] font-bold'
                          : `${surfaceBg} ${borderCol}`
                      }`}
                    >
                      <div>A5 Notice</div>
                      <div className="text-[10px] opacity-75">148 × 210 mm</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaperSizeChange('A4')}
                      className={`p-2.5 rounded-xl border text-left cursor-pointer ${
                        paperSize === 'A4'
                          ? 'bg-[#E8F0FE] border-[#1A73E8] text-[#174EA6] font-bold'
                          : `${surfaceBg} ${borderCol}`
                      }`}
                    >
                      <div>A4 Standard</div>
                      <div className="text-[10px] opacity-75">210 × 297 mm</div>
                    </button>
                  </div>

                  <select
                    value={paperSize}
                    onChange={(e) => handlePaperSizeChange(e.target.value as PaperSizeId)}
                    className={`w-full h-9 rounded-xl border px-2.5 font-medium ${surfaceBg} ${borderCol}`}
                  >
                    {Object.values(PAPER_SIZES).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} — {p.badge}
                      </option>
                    ))}
                  </select>

                  {paperSize === 'Custom' && (
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px]">Width (mm)</span>
                        <input
                          type="number"
                          min={40}
                          max={1000}
                          value={customWidthMm}
                          onChange={(e) => setCustomWidthMm(Number(e.target.value) || 148)}
                          className={`h-8 rounded-lg border px-2 font-mono ${surfaceBg} ${borderCol}`}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-[10px]">Height (mm)</span>
                        <input
                          type="number"
                          min={40}
                          max={1000}
                          value={customHeightMm}
                          onChange={(e) => setCustomHeightMm(Number(e.target.value) || 210)}
                          className={`h-8 rounded-lg border px-2 font-mono ${surfaceBg} ${borderCol}`}
                        />
                      </label>
                    </div>
                  )}

                  {/* Orientation */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setOrientation('portrait')}
                      className={`py-2 rounded-xl font-semibold border cursor-pointer ${
                        orientation === 'portrait'
                          ? 'bg-[#1A73E8] text-white border-[#1A73E8]'
                          : `${surfaceBg} ${borderCol}`
                      }`}
                    >
                      Portrait
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrientation('landscape')}
                      className={`py-2 rounded-xl font-semibold border cursor-pointer ${
                        orientation === 'landscape'
                          ? 'bg-[#1A73E8] text-white border-[#1A73E8]'
                          : `${surfaceBg} ${borderCol}`
                      }`}
                    >
                      Landscape
                    </button>
                  </div>
                </div>

                {/* Margins & Columns */}
                <div className={`p-3.5 rounded-2xl border ${cardBg} space-y-2.5`}>
                  <span className="font-bold block">Margins &amp; Columns</span>
                  <select
                    value={marginPreset}
                    onChange={(e) => handleMarginPresetChange(e.target.value as MarginPresetId)}
                    className={`w-full h-9 rounded-xl border px-2.5 font-medium ${surfaceBg} ${borderCol}`}
                  >
                    <option value="narrow">Narrow / Notice (8 mm)</option>
                    <option value="normal">Normal Office (15 mm)</option>
                    <option value="wide">Wide (25 mm)</option>
                    <option value="custom">Custom Margins (mm)</option>
                  </select>

                  {marginPreset === 'custom' && (
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
                        <label key={side} className="flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase">{side}</span>
                          <input
                            type="number"
                            min={0}
                            max={80}
                            value={margins[side]}
                            onChange={(e) =>
                              setMargins({ ...margins, [side]: Number(e.target.value) || 0 })
                            }
                            className={`h-8 rounded-lg border px-1.5 text-center font-mono ${surfaceBg} ${borderCol}`}
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {[1, 2, 3].map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setColumnCount(col as 1 | 2 | 3)}
                        className={`py-1.5 rounded-xl font-semibold border cursor-pointer ${
                          columnCount === col
                            ? 'bg-[#1A73E8] text-white border-[#1A73E8]'
                            : `${surfaceBg} ${borderCol}`
                        }`}
                      >
                        {col} Col
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page Borders */}
                <div className={`p-3.5 rounded-2xl border ${cardBg} space-y-2.5`}>
                  <span className="font-bold flex items-center gap-1.5">
                    <Frame className="w-3.5 h-3.5 text-[#1A73E8]" />
                    Page Border
                  </span>
                  <select
                    value={pageBorderStyle}
                    onChange={(e) => setPageBorderStyle(e.target.value as PageBorderStyle)}
                    className={`w-full h-9 rounded-xl border px-2.5 font-medium ${surfaceBg} ${borderCol}`}
                  >
                    <option value="none">None (ഇല്ല)</option>
                    <option value="thin">Single Thin</option>
                    <option value="double">Double Line (Notice)</option>
                    <option value="thick">Thick Frame</option>
                    <option value="dashed">Dashed Border</option>
                    <option value="ornamental">Ornamental Double</option>
                  </select>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px]">Border Color</span>
                      <div
                        className={`h-8 rounded-lg border px-2 flex items-center gap-2 ${surfaceBg} ${borderCol}`}
                      >
                        <input
                          type="color"
                          value={pageBorderColor}
                          onChange={(e) => setPageBorderColor(e.target.value)}
                          className="w-5 h-5 cursor-pointer"
                        />
                        <span className="font-mono text-[10px]">{pageBorderColor}</span>
                      </div>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[10px]">Padding (mm)</span>
                      <input
                        type="number"
                        min={2}
                        max={20}
                        value={pageBorderPaddingMm}
                        onChange={(e) => setPageBorderPaddingMm(Number(e.target.value) || 5)}
                        className={`h-8 rounded-lg border px-2 font-mono ${surfaceBg} ${borderCol}`}
                      />
                    </label>
                  </div>
                </div>

                {/* Watermark & Paper Tint */}
                <div className={`p-3.5 rounded-2xl border ${cardBg} space-y-2.5`}>
                  <span className="font-bold flex items-center gap-1.5">
                    <Stamp className="w-3.5 h-3.5 text-[#1A73E8]" />
                    Watermark &amp; Paper Tint
                  </span>
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => setWatermarkText(e.target.value)}
                    placeholder="Watermark text (ഉദാ: കരട് / DRAFT)..."
                    style={{ fontFamily: "'Noto Sans Malayalam', sans-serif" }}
                    className={`w-full h-9 rounded-xl border px-3 outline-none ${surfaceBg} ${borderCol}`}
                  />
                  <select
                    value={paperTint}
                    onChange={(e) => setPaperTint(e.target.value as PaperTintId)}
                    className={`w-full h-9 rounded-xl border px-2.5 font-medium ${surfaceBg} ${borderCol}`}
                  >
                    {Object.entries(PAPER_TINTS).map(([id, cfg]) => (
                      <option key={id} value={id}>
                        {cfg.label} ({cfg.mlLabel})
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer pt-0.5">
                    <input
                      type="checkbox"
                      checked={printBackgroundTint}
                      onChange={(e) => setPrintBackgroundTint(e.target.checked)}
                      className="accent-[#1A73E8] w-4 h-4"
                    />
                    <span>Include paper tint in printed PDF</span>
                  </label>
                </div>

                {/* Crop Marks, Ruler & Canvas Zoom */}
                <div className={`p-3.5 rounded-2xl border ${cardBg} space-y-2.5`}>
                  <span className="font-bold block">Guides &amp; Zoom</span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCropMarks((p) => !p)}
                      className={`px-2.5 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 cursor-pointer ${
                        showCropMarks
                          ? 'bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8]'
                          : `${surfaceBg} ${borderCol}`
                      }`}
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>Crop Marks</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRuler((p) => !p)}
                      className={`px-2.5 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 cursor-pointer ${
                        showRuler
                          ? 'bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8]'
                          : `${surfaceBg} ${borderCol}`
                      }`}
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>mm Ruler</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFirstLineIndent((p) => !p)}
                      className={`px-2.5 py-1.5 rounded-xl border font-medium flex items-center gap-1.5 cursor-pointer ${
                        firstLineIndent
                          ? 'bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8]'
                          : `${surfaceBg} ${borderCol}`
                      }`}
                    >
                      <Pilcrow className="w-3.5 h-3.5" />
                      <span>1st Line Indent</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span>Canvas Zoom</span>
                    <select
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                      className={`h-8 rounded-lg border px-2 font-mono font-semibold ${surfaceBg} ${borderCol}`}
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
              </div>
            )}

            {/* SUB-PANEL B: TEMPLATES (മാതൃകകൾ) */}
            {moreSubPanel === 'templates' && (
              <div className="p-4 overflow-y-auto flex-1 space-y-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleApplyTemplate('a5-notice')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer ${cardBg} hover:border-[#1A73E8]`}
                >
                  <div>
                    <div className="font-bold text-sm">A5 Public Notice</div>
                    <div className={`text-[11px] ${mutedText} mt-0.5`}>
                      പൊതുയോഗ നോട്ടീസ് · Baloo Chettan 2 + Double Border
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#E8F0FE] text-[#1A73E8] font-bold">
                    A5
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyTemplate('a4-letterhead')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer ${cardBg} hover:border-[#1A73E8]`}
                >
                  <div>
                    <div className="font-bold text-sm">A4 Official Letterhead</div>
                    <div className={`text-[11px] ${mutedText} mt-0.5`}>
                      ഔദ്യോഗിക കത്ത് · Tiro Malayalam Book Font
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#E8F0FE] text-[#1A73E8] font-bold">
                    A4
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApplyTemplate('a4-question-paper')}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between cursor-pointer ${cardBg} hover:border-[#1A73E8]`}
                >
                  <div>
                    <div className="font-bold text-sm">A4 2-Column Exam / Notes</div>
                    <div className={`text-[11px] ${mutedText} mt-0.5`}>
                      ചോദ്യപേപ്പർ മാതൃക · Noto Serif 2-Column Layout
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-[#E8F0FE] text-[#1A73E8] font-bold">
                    2-Col
                  </span>
                </button>
              </div>
            )}

            {/* SUB-PANEL C: WORD COUNT */}
            {moreSubPanel === 'word-count' && (
              <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs">
                <div className={`p-4 rounded-2xl border ${cardBg} space-y-3`}>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#9AA0A6]/20">
                    <span className={mutedText}>Words (വാക്കുകൾ)</span>
                    <span className="text-base font-bold font-mono tabular-nums">{wordCount}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#9AA0A6]/20">
                    <span className={mutedText}>Characters (അക്ഷരങ്ങൾ)</span>
                    <span className="text-base font-bold font-mono tabular-nums">{charCount}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[#9AA0A6]/20">
                    <span className={mutedText}>Estimated Pages (പേജുകൾ)</span>
                    <span className="text-base font-bold font-mono tabular-nums text-[#1A73E8]">
                      {estimatedPages}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className={mutedText}>Paper Dimension</span>
                    <span className="font-mono font-semibold">
                      {paperSize} ({effectiveWidthMm} × {effectiveHeightMm} mm)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-PANEL D: SHARE AND EXPORT */}
            {moreSubPanel === 'share-export' && (
              <div className="p-4 overflow-y-auto flex-1 space-y-3 text-xs">
                {/* Option 1: Save / Print as PDF */}
                <button
                  type="button"
                  onClick={handleSavePrintReadyPDF}
                  className="w-full p-4 rounded-2xl bg-[#1A73E8] hover:bg-[#1557B0] text-white text-left flex items-center gap-3.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Save / Print as PDF (ഫോണ്ട് മാറാത്ത PDF)</div>
                    <div className="text-[11px] opacity-90">
                      Best for print shops (A5/A4 font-locked vector PDF)
                    </div>
                  </div>
                </button>

                {/* Option 2: Send as Word File (.docx) */}
                <button
                  type="button"
                  onClick={handleSendAsWordDocx}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center gap-3.5 cursor-pointer ${cardBg} hover:border-[#1A73E8]`}
                >
                  <FileText className="w-5 h-5 text-[#1A73E8] shrink-0" />
                  <div>
                    <div className="font-bold text-sm">Send as Word File (.docx)</div>
                    <div className={`text-[11px] ${mutedText}`}>
                      Editable Microsoft Word &amp; Google Docs document
                    </div>
                  </div>
                </button>

                {/* Secondary small link row: Save / Open Editable Draft (.mps) */}
                <div className={`pt-3 mt-1 border-t ${borderCol} flex items-center justify-between text-[11px] ${mutedText}`}>
                  <span>Save / Open Editable Draft (.mps):</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleExportDraftMps}
                      className="text-[#1A73E8] hover:underline font-medium cursor-pointer"
                    >
                      Save .mps
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => draftInputRef.current?.click()}
                      className="text-[#1A73E8] hover:underline font-medium cursor-pointer"
                    >
                      Open .mps
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* 7. CLEAN GOOGLE DOCS-STYLE "SHARE & EXPORT" BOTTOM SHEET (Triggered by Top Bar Send/Export or More Menu) */}
      {activeDrawer === 'share-export' && (
        <div
          onClick={() => setActiveDrawer('none')}
          className="no-print fixed inset-0 z-50 bg-black/45 flex items-end justify-center"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-lg rounded-t-3xl shadow-2xl border-t ${surfaceBg} ${borderCol} flex flex-col overflow-hidden`}
          >
            {/* Drag Handle + Header with X close button */}
            <div className={`pt-2.5 pb-2.5 px-5 border-b ${borderCol} flex flex-col items-center shrink-0`}>
              <div className="w-9 h-1 rounded-full bg-[#9AA0A6]/50 mb-2" />
              <div className="w-full flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold block">Share &amp; Export</span>
                  <span className={`text-[11px] ${mutedText}`}>
                    {docTitle} ({paperSize} · {effectiveWidthMm}×{effectiveHeightMm}mm)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDrawer('none')}
                  aria-label="Close Share and Export sheet"
                  className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer ${iconBtnHover}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Two Big Direct Action Cards + Small Secondary .mps Draft Link at Bottom */}
            <div className="p-4 space-y-3">
              {/* Option 1: Save / Print as PDF (ഫോണ്ട് മാറാത്ത PDF) */}
              <button
                type="button"
                onClick={handleSavePrintReadyPDF}
                className="w-full p-4 rounded-2xl bg-[#1A73E8] hover:bg-[#1557B0] active:bg-[#174EA6] text-white text-left flex items-center gap-4 shadow-md transition-colors cursor-pointer"
              >
                <div className="w-11 h-11 rounded-2xl bg-white/18 flex items-center justify-center shrink-0">
                  <Printer className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-bold text-sm sm:text-base leading-snug"
                    style={{ fontFamily: "'Noto Sans Malayalam', 'Plus Jakarta Sans', sans-serif" }}
                  >
                    Save / Print as PDF (ഫോണ്ട് മാറാത്ത PDF)
                  </div>
                  <div className="text-xs text-white/90 mt-0.5">
                    Best for print shops ({paperSize} font-locked vector PDF)
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-white/80 shrink-0" />
              </button>

              {/* Option 2: Send as Word File (.docx) */}
              <button
                type="button"
                onClick={handleSendAsWordDocx}
                className={`w-full p-4 rounded-2xl border-2 text-left flex items-center gap-4 transition-colors cursor-pointer ${
                  darkMode
                    ? 'bg-[#282A2E] border-[#3C4043] hover:border-[#8AB4F8]'
                    : 'bg-[#F8FAFD] border-[#D2E3FC] hover:border-[#1A73E8] hover:bg-[#E8F0FE]/50'
                }`}
              >
                <div className="w-11 h-11 rounded-2xl bg-[#E8F0FE] text-[#1A73E8] flex items-center justify-center shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm sm:text-base leading-snug">
                    Send as Word File (.docx)
                  </div>
                  <div className={`text-xs ${mutedText} mt-0.5`}>
                    Editable Microsoft Word &amp; Google Docs document
                  </div>
                </div>
                <Share2 className="w-5 h-5 text-[#1A73E8] shrink-0" />
              </button>

              {/* Small Secondary Link at Bottom: Save / Open Editable Draft (.mps) */}
              <div
                className={`pt-3 mt-1 border-t ${borderCol} flex flex-wrap items-center justify-between gap-2 text-[11px] ${mutedText}`}
              >
                <span>Save / Open Editable Draft (.mps)</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleExportDraftMps}
                    className="text-[#1A73E8] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>Save .mps</span>
                  </button>
                  <span className="opacity-40">|</span>
                  <button
                    type="button"
                    onClick={() => draftInputRef.current?.click()}
                    className="text-[#1A73E8] hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Open .mps</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

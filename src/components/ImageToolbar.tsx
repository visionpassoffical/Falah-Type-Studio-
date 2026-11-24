import React, { useEffect, useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Frame,
  Image as ImageIcon,
  MessageSquareText,
  Trash2,
  X,
} from 'lucide-react';
import { ImageBorderMode, ImageWrapMode } from '../types';

export interface ImageToolbarProps {
  activeImageEl: HTMLImageElement;
  darkMode: boolean;
  onWidthChange: (widthPercent: number) => void;
  onWrapChange: (wrap: ImageWrapMode) => void;
  onBorderChange: (border: ImageBorderMode) => void;
  onCaptionChange: (caption: string) => void;
  onDelete: () => void;
  onClose: () => void;
}

function readCurrentWidthPercent(img: HTMLImageElement): number {
  const inline = img.style.width || '';
  if (inline.endsWith('%')) {
    const parsed = parseInt(inline, 10);
    if (!Number.isNaN(parsed)) return Math.max(20, Math.min(100, parsed));
  }
  const fig = img.closest('figure.mps-figure') as HTMLElement | null;
  if (fig && fig.style.width.endsWith('%')) {
    const parsed = parseInt(fig.style.width, 10);
    if (!Number.isNaN(parsed)) return Math.max(20, Math.min(100, parsed));
  }
  return 50;
}

function readCurrentWrapMode(img: HTMLImageElement): ImageWrapMode {
  const fig = img.closest('figure.mps-figure');
  if (fig) {
    if (fig.classList.contains('mps-wrap-float-left')) return 'float-left';
    if (fig.classList.contains('mps-wrap-float-right')) return 'float-right';
    if (fig.classList.contains('mps-wrap-inline')) return 'inline';
    return 'center';
  }
  if (img.style.float === 'left') return 'float-left';
  if (img.style.float === 'right') return 'float-right';
  return 'center';
}

function readCurrentBorderMode(img: HTMLImageElement): ImageBorderMode {
  if (img.classList.contains('mps-img-border-frame')) return 'frame';
  if (img.classList.contains('mps-img-border-thin')) return 'thin';
  return 'none';
}

function readCurrentCaption(img: HTMLImageElement): string {
  const fig = img.closest('figure.mps-figure');
  const cap = fig?.querySelector('figcaption.mps-img-caption');
  return cap?.textContent || '';
}

export const ImageToolbar: React.FC<ImageToolbarProps> = ({
  activeImageEl,
  darkMode,
  onWidthChange,
  onWrapChange,
  onBorderChange,
  onCaptionChange,
  onDelete,
  onClose,
}) => {
  const [widthPct, setWidthPct] = useState<number>(() =>
    readCurrentWidthPercent(activeImageEl)
  );
  const [wrapMode, setWrapMode] = useState<ImageWrapMode>(() =>
    readCurrentWrapMode(activeImageEl)
  );
  const [borderMode, setBorderMode] = useState<ImageBorderMode>(() =>
    readCurrentBorderMode(activeImageEl)
  );
  const [captionText, setCaptionText] = useState<string>(() =>
    readCurrentCaption(activeImageEl)
  );
  const [showCaptionInput, setShowCaptionInput] = useState<boolean>(
    () => readCurrentCaption(activeImageEl).length > 0
  );

  useEffect(() => {
    setWidthPct(readCurrentWidthPercent(activeImageEl));
    setWrapMode(readCurrentWrapMode(activeImageEl));
    setBorderMode(readCurrentBorderMode(activeImageEl));
    const cap = readCurrentCaption(activeImageEl);
    setCaptionText(cap);
    setShowCaptionInput(cap.length > 0);
  }, [activeImageEl]);

  const preventFocusLoss = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className={`no-print fixed right-2 bottom-14 left-2 z-30 mx-auto max-w-xl rounded-2xl border p-3 shadow-xl ${
        darkMode
          ? 'border-gray-700 bg-[#1E222B] text-gray-100'
          : 'border-blue-200 bg-white text-gray-800'
      }`}
    >
      {/* Top row: Title + Width Slider (20%–100%) + Delete/Close */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1A73E8]">
          <ImageIcon className="h-3.5 w-3.5" />
          <span>Image Controls</span>
        </div>

        <div className="flex flex-1 items-center gap-2 px-1">
          <input
            type="range"
            min={20}
            max={100}
            step={5}
            value={widthPct}
            onChange={(e) => {
              const val = Number(e.target.value);
              setWidthPct(val);
              onWidthChange(val);
            }}
            aria-label="Image width percentage"
            className="w-full accent-[#1A73E8]"
          />
          <span className="w-10 text-right text-[11px] font-bold tabular-nums">
            {widthPct}%
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={onDelete}
            title="Delete Image"
            className="rounded-lg bg-red-50 p-1.5 text-red-600 hover:bg-red-100 dark:bg-red-950/50 dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={onClose}
            title="Close Image Toolbar"
            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Wrapping + Border + Caption buttons */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-semibold">
        {/* Text Wrapping Modes */}
        <div className="flex items-center gap-1">
          {(
            [
              { key: 'inline', label: 'Inline', icon: null },
              { key: 'center', label: 'Center', icon: AlignCenter },
              { key: 'float-left', label: 'Float L', icon: AlignLeft },
              { key: 'float-right', label: 'Float R', icon: AlignRight },
            ] as const
          ).map((opt) => {
            const Icon = opt.icon;
            const active = wrapMode === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onMouseDown={preventFocusLoss}
                onClick={() => {
                  setWrapMode(opt.key);
                  onWrapChange(opt.key);
                }}
                className={`flex items-center gap-1 rounded-lg border px-2 py-1 transition ${
                  active
                    ? 'border-[#1A73E8] bg-blue-50 text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                    : darkMode
                      ? 'border-gray-700 bg-gray-800 text-gray-300'
                      : 'border-gray-200 bg-gray-50 text-gray-700'
                }`}
              >
                {Icon && <Icon className="h-3 w-3" />}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Border Cycle + Caption Toggle */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => {
              const next: ImageBorderMode =
                borderMode === 'none'
                  ? 'thin'
                  : borderMode === 'thin'
                    ? 'frame'
                    : 'none';
              setBorderMode(next);
              onBorderChange(next);
            }}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 transition ${
              borderMode !== 'none'
                ? 'border-[#1A73E8] bg-blue-50 text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                : darkMode
                  ? 'border-gray-700 bg-gray-800 text-gray-300'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
            }`}
          >
            <Frame className="h-3 w-3" />
            <span>
              Border: {borderMode === 'none' ? 'Off' : borderMode === 'thin' ? 'Thin' : 'Frame'}
            </span>
          </button>

          <button
            type="button"
            onMouseDown={preventFocusLoss}
            onClick={() => setShowCaptionInput((prev) => !prev)}
            className={`flex items-center gap-1 rounded-lg border px-2 py-1 transition ${
              showCaptionInput || captionText
                ? 'border-[#1A73E8] bg-blue-50 text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300'
                : darkMode
                  ? 'border-gray-700 bg-gray-800 text-gray-300'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
            }`}
          >
            <MessageSquareText className="h-3 w-3" />
            <span>Caption</span>
          </button>
        </div>
      </div>

      {/* Caption Editor */}
      {showCaptionInput && (
        <div className="mt-2 flex items-center gap-1.5">
          <input
            type="text"
            value={captionText}
            onChange={(e) => {
              setCaptionText(e.target.value);
              onCaptionChange(e.target.value);
            }}
            placeholder="ചിത്രത്തിന്റെ അടിക്കുറിപ്പ് (Image caption)..."
            className={`flex-1 rounded-lg border px-2.5 py-1.5 text-xs focus:border-[#1A73E8] focus:outline-none ${
              darkMode
                ? 'border-gray-600 bg-gray-800 text-white'
                : 'border-gray-300 bg-gray-50 text-gray-900'
            }`}
          />
          {captionText && (
            <button
              type="button"
              onClick={() => {
                setCaptionText('');
                onCaptionChange('');
                setShowCaptionInput(false);
              }}
              className="rounded-lg border border-gray-300 px-2 py-1 text-[11px] font-semibold text-gray-600 dark:border-gray-600 dark:text-gray-300"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
};

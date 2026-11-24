import React from 'react';
import { ListTree, X } from 'lucide-react';
import { OutlineHeadingItem } from '../types';

export interface OutlineDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  headings: OutlineHeadingItem[];
  printLayout: boolean;
  darkMode: boolean;
  onJumpToHeading: (item: OutlineHeadingItem) => void;
}

export const OutlineDrawer: React.FC<OutlineDrawerProps> = ({
  isOpen,
  onClose,
  headings,
  printLayout,
  darkMode,
  onJumpToHeading,
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="no-print fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
      />
      <aside
        aria-label="Document Outline"
        className={`no-print fixed top-0 right-0 bottom-0 z-50 flex w-[86vw] max-w-sm flex-col border-l shadow-2xl ${
          darkMode
            ? 'border-gray-700 bg-[#1B1F27] text-gray-100'
            : 'border-gray-200 bg-white text-gray-900'
        }`}
      >
        <div
          className={`flex items-center justify-between border-b px-4 py-3.5 ${
            darkMode ? 'border-gray-800' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-[#1A73E8] dark:bg-blue-950/60 dark:text-blue-300">
              <ListTree className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">
                Document Outline (ഉള്ളടക്കം)
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {headings.length}{' '}
                {headings.length === 1 ? 'heading' : 'headings'} (H1 · H2 · H3)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Document Outline"
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {headings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center dark:border-gray-700">
              <ListTree className="mx-auto mb-2 h-7 w-7 text-gray-400" />
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                No headings found yet
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400">
                Format chapter titles with Heading 1, Heading 2, or Heading 3
                inside the Format (A) sheet to auto-build a clickable Table of
                Contents.
              </p>
            </div>
          ) : (
            <nav className="space-y-1">
              {headings.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onJumpToHeading(item);
                    onClose();
                  }}
                  className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition ${
                    darkMode
                      ? 'hover:bg-gray-800 text-gray-200'
                      : 'hover:bg-blue-50/70 text-gray-800'
                  } ${
                    item.level === 1
                      ? 'font-bold text-xs'
                      : item.level === 2
                        ? 'pl-6 font-semibold text-xs'
                        : 'pl-9 font-medium text-[11.5px] text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <span className="truncate">{item.text}</span>
                  {printLayout && (
                    <span className="shrink-0 text-[10.5px] font-medium text-gray-400 tabular-nums">
                      P.{item.pageIndex + 1}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          )}
        </div>
      </aside>
    </>
  );
};

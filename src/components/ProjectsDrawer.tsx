import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Copy,
  FilePlus2,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { ProjectFilterTab, ProjectRecord, ProjectStatus } from '../types';
import { formatRelativeTime } from '../utils/projectsDb';

export interface ProjectsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectRecord[];
  activeProjectId: string;
  darkMode: boolean;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onToggleStatus: (id: string, nextStatus: ProjectStatus) => void;
  onDuplicateProject: (id: string) => void;
  onRenameProject: (id: string, nextTitle: string) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsDrawer: React.FC<ProjectsDrawerProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  darkMode,
  onSelectProject,
  onCreateProject,
  onToggleStatus,
  onDuplicateProject,
  onRenameProject,
  onDeleteProject,
}) => {
  const [filterTab, setFilterTab] = useState<ProjectFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const counts = useMemo(() => {
    let pending = 0;
    let completed = 0;
    for (const p of projects) {
      if (p.status === 'completed') completed++;
      else pending++;
    }
    return { all: projects.length, pending, completed };
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return projects.filter((p) => {
      if (filterTab === 'pending' && p.status !== 'pending') return false;
      if (filterTab === 'completed' && p.status !== 'completed') return false;
      if (q) {
        const titleMatch = (p.state.docTitle || '').toLowerCase().includes(q);
        const sizeMatch = (p.state.paperSize || '').toLowerCase().includes(q);
        return titleMatch || sizeMatch;
      }
      return true;
    });
  }, [filterTab, projects, searchQuery]);

  if (!isOpen) return null;

  const commitRename = (id: string) => {
    const trimmed = renameDraft.trim();
    if (trimmed) {
      onRenameProject(id, trimmed);
    }
    setRenamingId(null);
    setRenameDraft('');
  };

  return (
    <>
      <div
        onClick={onClose}
        className="no-print fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px]"
      />
      <aside
        aria-label="Projects Workspace"
        className={`no-print fixed top-0 bottom-0 left-0 z-50 flex w-[92vw] max-w-md flex-col border-r shadow-2xl ${
          darkMode
            ? 'border-gray-700 bg-[#1B1F27] text-gray-100'
            : 'border-gray-200 bg-white text-gray-900'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between border-b px-4 py-3.5 ${
            darkMode ? 'border-gray-800' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1A73E8] text-white">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">
                Projects (പ്രോജക്റ്റുകൾ)
              </h2>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                IndexedDB Local Workspace · {projects.length}{' '}
                {projects.length === 1 ? 'file' : 'files'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onCreateProject();
                onClose();
              }}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-[#1A73E8] px-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700 active:scale-98 whitespace-nowrap shrink-0"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>+ New</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Projects"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search & Filter Tabs */}
        <div className="space-y-2.5 border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects (പ്രോജക്റ്റ് തിരയുക)..."
              className={`w-full rounded-xl border py-2 pr-8 pl-9 text-xs focus:border-[#1A73E8] focus:outline-none ${
                darkMode
                  ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400'
                  : 'border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-500'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-full p-0.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div
            className={`grid grid-cols-3 gap-1 rounded-xl p-1 text-xs font-semibold ${
              darkMode ? 'bg-gray-800' : 'bg-gray-100'
            }`}
          >
            {(
              [
                { key: 'all', label: `All (${counts.all})` },
                { key: 'pending', label: `Pending (${counts.pending})` },
                { key: 'completed', label: `Completed (${counts.completed})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterTab(tab.key)}
                className={`rounded-lg py-1.5 text-center text-[11px] transition whitespace-nowrap ${
                  filterTab === tab.key
                    ? darkMode
                      ? 'bg-gray-700 text-white shadow-xs'
                      : 'bg-white text-[#1A73E8] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Project Cards List */}
        <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
          {filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 px-4 py-10 text-center dark:border-gray-700">
              <FolderKanban className="mb-2 h-8 w-8 text-gray-400" />
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                No projects match this filter
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilterTab('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs font-semibold text-[#1A73E8] hover:underline"
              >
                Show all projects
              </button>
            </div>
          ) : (
            filteredProjects.map((project) => {
              const isActive = project.id === activeProjectId;
              const isCompleted = project.status === 'completed';
              const isRenaming = renamingId === project.id;
              const isConfirmingDelete = confirmDeleteId === project.id;

              return (
                <div
                  key={project.id}
                  className={`rounded-2xl border p-3.5 transition ${
                    isActive
                      ? darkMode
                        ? 'border-[#1A73E8] bg-blue-950/30'
                        : 'border-[#1A73E8] bg-[#E8F0FE]/45'
                      : darkMode
                        ? 'border-gray-700/80 bg-gray-800/50 hover:border-gray-600'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Title + One-Tap Status Pill */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {isRenaming ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            autoFocus
                            value={renameDraft}
                            onChange={(e) => setRenameDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename(project.id);
                              if (e.key === 'Escape') {
                                setRenamingId(null);
                                setRenameDraft('');
                              }
                            }}
                            className={`w-full rounded-lg border px-2 py-1 text-xs font-semibold focus:border-[#1A73E8] focus:outline-none ${
                              darkMode
                                ? 'border-gray-600 bg-gray-900 text-white'
                                : 'border-blue-300 bg-white text-gray-900'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => commitRename(project.id)}
                            className="rounded-lg bg-[#1A73E8] px-2.5 py-1 text-[11px] font-bold text-white"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectProject(project.id);
                            onClose();
                          }}
                          className="w-full text-left"
                        >
                          <div className="truncate text-sm font-bold leading-snug">
                            {project.state.docTitle || 'Untitled Document'}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-gray-500 tabular-nums dark:text-gray-400">
                            <span className="font-semibold text-gray-700 dark:text-gray-200">
                              {project.state.paperSize}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {project.pageCount}{' '}
                              {project.pageCount === 1 ? 'page' : 'pages'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{project.wordCount} words</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatRelativeTime(project.updatedAt)}</span>
                          </div>
                        </button>
                      )}
                    </div>

                    {/* One-Tap Pending / Completed Interactive Status Toggle */}
                    <button
                      type="button"
                      onClick={() =>
                        onToggleStatus(
                          project.id,
                          isCompleted ? 'pending' : 'completed'
                        )
                      }
                      title="Tap to toggle Pending / Completed status"
                      className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold transition active:scale-95 whitespace-nowrap ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950/70 dark:text-amber-300'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Completed (പൂർത്തിയായത്)</span>
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          <span>Pending (പെൻഡിംഗ്)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-2.5 flex items-center justify-between border-t border-gray-200/70 pt-2 dark:border-gray-700/70">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectProject(project.id);
                        onClose();
                      }}
                      className={`text-xs font-semibold ${
                        isActive
                          ? 'text-[#1A73E8] dark:text-blue-300'
                          : 'text-gray-600 hover:text-[#1A73E8] dark:text-gray-300'
                      }`}
                    >
                      {isActive ? 'Active in Editor' : 'Open Document'}
                    </button>

                    {isConfirmingDelete ? (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="font-semibold text-red-600">Delete?</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteProject(project.id);
                            setConfirmDeleteId(null);
                          }}
                          className="rounded-lg bg-red-600 px-2 py-0.5 font-bold text-white"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-lg border border-gray-300 px-2 py-0.5 font-semibold dark:border-gray-600"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setRenamingId(project.id);
                            setRenameDraft(project.state.docTitle || '');
                          }}
                          title="Rename Project"
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDuplicateProject(project.id)}
                          title="Duplicate Project"
                          className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        {projects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(project.id)}
                            title="Delete Project"
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};

export interface OpenProjectTabsProps {
  openProjects: ProjectRecord[];
  activeProjectId: string;
  darkMode: boolean;
  onSelectProject: (id: string) => void;
  onCloseTab: (id: string) => void;
  onCreateProject: () => void;
  onDismissBar: () => void;
}

export const OpenProjectTabs: React.FC<OpenProjectTabsProps> = ({
  openProjects,
  activeProjectId,
  darkMode,
  onSelectProject,
  onCloseTab,
  onCreateProject,
  onDismissBar,
}) => {
  if (openProjects.length === 0) return null;

  return (
    <div
      className={`no-print toolbar-scroll z-20 flex h-9 shrink-0 items-center justify-between gap-1 overflow-x-auto border-b px-2 ${
        darkMode
          ? 'border-[#3C4043] bg-[#25272B] text-gray-200'
          : 'border-[#DADCE0] bg-[#F1F3F4] text-gray-700'
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
        {openProjects.map((proj) => {
          const isActive = proj.id === activeProjectId;
          const isCompleted = proj.status === 'completed';

          return (
            <div
              key={proj.id}
              className={`group flex h-7 max-w-[190px] shrink-0 items-center gap-1.5 rounded-lg border px-2 text-[11px] transition ${
                isActive
                  ? darkMode
                    ? 'border-blue-500/70 bg-[#303134] font-bold text-white shadow-2xs'
                    : 'border-blue-300 bg-white font-bold text-[#1A73E8] shadow-2xs'
                  : darkMode
                    ? 'border-transparent bg-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    : 'border-transparent bg-transparent text-gray-600 hover:bg-white/70 hover:text-gray-900'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectProject(proj.id)}
                className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                title={`${proj.state.docTitle} (${proj.state.paperSize} · ${
                  isCompleted ? 'Completed' : 'Pending'
                })`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Clock className="h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400" />
                )}
                <span className="truncate">{proj.state.docTitle || 'Untitled'}</span>
              </button>

              {openProjects.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(proj.id);
                  }}
                  aria-label={`Close tab ${proj.state.docTitle}`}
                  className="rounded p-0.5 opacity-70 hover:bg-black/10 hover:opacity-100 dark:hover:bg-white/10"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={onCreateProject}
          title="New Project Tab (+)"
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition ${
            darkMode
              ? 'text-gray-300 hover:bg-white/10'
              : 'text-gray-600 hover:bg-white'
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <button
        type="button"
        onClick={onDismissBar}
        title="Hide Open Tabs Bar"
        className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 hover:bg-black/5 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-white/10"
      >
        Hide
      </button>
    </div>
  );
};

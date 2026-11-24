import { ProjectRecord, ProjectStatus, SavedProjectState } from '../types';
import { STORAGE_KEY, TEMPLATE_A5_PUBLIC_NOTICE } from '../constants/fonts';

const DB_NAME = 'MalayalamPrintStudioDB';
const DB_VERSION = 1;
const STORE_PROJECTS = 'projects';
const OPEN_TABS_KEY = 'mps_open_project_tabs_v1';
const ACTIVE_PROJECT_KEY = 'mps_active_project_id_v1';

export function generateProjectId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `mps-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createDefaultSavedState(
  overrides?: Partial<SavedProjectState>
): SavedProjectState {
  return {
    docTitle: 'പുതിയ മലയാളം പ്രോജക്റ്റ് (Untitled)',
    htmlContent: '<p><br/></p>',
    paperSize: 'A5',
    customWidthMm: 148,
    customHeightMm: 210,
    orientation: 'portrait',
    marginPreset: 'normal',
    margins: { top: 15, right: 15, bottom: 15, left: 15 },
    defaultDocFontId: 'manjari',
    showHeaderFooter: false,
    headerText: '',
    footerText: '',
    showPageNumbers: true,
    differentFirstPage: false,
    pageNumberPosition: 'bottom',
    pageNumberAlign: 'right',
    pageNumberFormat: 'malayalam_x_of_y',
    lineSpacing: '1.6',
    letterSpacing: '0px',
    firstLineIndent: false,
    spaceAfterParagraph: true,
    paragraphGapPt: 8,
    pageBorderStyle: 'double',
    pageBorderColor: '#111827',
    pageBorderPaddingMm: 5,
    columnCount: 1,
    watermarkText: '',
    paperTint: 'white',
    printBackgroundTint: false,
    showRuler: false,
    showCropMarks: false,
    mirrorMargins: false,
    innerMarginMm: 20,
    outerMarginMm: 13,
    useOddEvenHeaders: false,
    evenHeaderText: '',
    oddHeaderText: '',
    hideHeaderOnChapterPages: true,
    printLayout: false,
    ...overrides,
  };
}

export function countWordsFromHtml(html: string): number {
  if (typeof document === 'undefined') return 0;
  const div = document.createElement('div');
  div.innerHTML = html || '';
  const text = (div.textContent || '').trim();
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PROJECTS)) {
        const store = db.createObjectStore(STORE_PROJECTS, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
  });
}

export async function getAllProjects(): Promise<ProjectRecord[]> {
  try {
    const db = await openDatabase();
    return await new Promise<ProjectRecord[]>((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.getAll();
      req.onsuccess = () => {
        const rows = (req.result as ProjectRecord[]) || [];
        rows.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(rows);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function getProjectById(id: string): Promise<ProjectRecord | null> {
  try {
    const db = await openDatabase();
    return await new Promise<ProjectRecord | null>((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readonly');
      const store = tx.objectStore(STORE_PROJECTS);
      const req = store.get(id);
      req.onsuccess = () => resolve((req.result as ProjectRecord) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function saveProjectRecord(record: ProjectRecord): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Graceful fallback: localStorage still mirrors active project
  }
}

export async function deleteProjectRecord(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_PROJECTS, 'readwrite');
      const store = tx.objectStore(STORE_PROJECTS);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}

export function loadPersistedWorkspaceTabMeta(): {
  openTabIds: string[];
  activeProjectId: string | null;
} {
  try {
    const rawTabs = localStorage.getItem(OPEN_TABS_KEY);
    const activeId = localStorage.getItem(ACTIVE_PROJECT_KEY);
    const parsedTabs = rawTabs ? (JSON.parse(rawTabs) as string[]) : [];
    return {
      openTabIds: Array.isArray(parsedTabs) ? parsedTabs : [],
      activeProjectId: activeId || null,
    };
  } catch {
    return { openTabIds: [], activeProjectId: null };
  }
}

export function savePersistedWorkspaceTabMeta(
  openTabIds: string[],
  activeProjectId: string | null
): void {
  try {
    localStorage.setItem(OPEN_TABS_KEY, JSON.stringify(openTabIds));
    if (activeProjectId) {
      localStorage.setItem(ACTIVE_PROJECT_KEY, activeProjectId);
    }
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Bootstraps IndexedDB on initial app launch:
 * - Returns existing IndexedDB projects if present.
 * - Otherwise seamlessly migrates any saved localStorage document into Project #1,
 *   or seeds the starter A5 Malayalam Public Notice project.
 */
export async function bootstrapProjectsWorkspace(): Promise<{
  projects: ProjectRecord[];
  activeProject: ProjectRecord;
  openTabIds: string[];
}> {
  let projects = await getAllProjects();
  const now = Date.now();

  if (projects.length === 0) {
    let migratedState: SavedProjectState | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SavedProjectState>;
        migratedState = createDefaultSavedState({
          ...parsed,
          docTitle: parsed.docTitle || 'മലയാളം നോട്ടീസ് (A5 Notice)',
          htmlContent:
            parsed.htmlContent && parsed.htmlContent.trim().length > 0
              ? parsed.htmlContent
              : TEMPLATE_A5_PUBLIC_NOTICE,
        });
      }
    } catch {
      migratedState = null;
    }

    const starterState =
      migratedState ||
      createDefaultSavedState({
        docTitle: 'മലയാളം നോട്ടീസ് (A5 Notice)',
        htmlContent: TEMPLATE_A5_PUBLIC_NOTICE,
      });

    const initialProject: ProjectRecord = {
      id: generateProjectId(),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      wordCount: countWordsFromHtml(starterState.htmlContent),
      pageCount: 1,
      state: starterState,
    };

    await saveProjectRecord(initialProject);
    projects = [initialProject];
  }

  const meta = loadPersistedWorkspaceTabMeta();
  const validIds = new Set(projects.map((p) => p.id));

  let openTabIds = meta.openTabIds.filter((id) => validIds.has(id));
  let activeProject =
    (meta.activeProjectId && projects.find((p) => p.id === meta.activeProjectId)) ||
    projects[0];

  if (!openTabIds.includes(activeProject.id)) {
    openTabIds = [activeProject.id, ...openTabIds];
  }

  savePersistedWorkspaceTabMeta(openTabIds, activeProject.id);

  return { projects, activeProject, openTabIds };
}

export function createNewProjectRecord(
  title: string,
  overrides?: Partial<SavedProjectState>,
  status: ProjectStatus = 'pending'
): ProjectRecord {
  const now = Date.now();
  const state = createDefaultSavedState({
    docTitle: title,
    ...overrides,
  });
  return {
    id: generateProjectId(),
    status,
    createdAt: now,
    updatedAt: now,
    wordCount: countWordsFromHtml(state.htmlContent),
    pageCount: 1,
    state,
  };
}

export function formatRelativeTime(ts: number): string {
  const diffSec = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diffSec < 45) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(ts).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  });
}

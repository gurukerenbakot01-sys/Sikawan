import { Teacher, Submission, StoredFile } from '../types';
import { PERMANENT_DEFAULT_TEACHERS } from '../data/defaultTeachers';

export const DEFAULT_TEACHERS: Teacher[] = PERMANENT_DEFAULT_TEACHERS;

const TEACHERS_STORAGE_KEY = 'sikawan_teachers_v3';
const SUBMISSIONS_STORAGE_KEY = 'sikawan_submissions_v3';
const DB_NAME = 'sikawan_offline_db';
const DB_VERSION = 1;

// In-memory runtime cache for instantaneous synchronous access
let memoryTeachers: Teacher[] = [];
let memorySubmissions: Submission[] = [];
let isInitialized = false;

/**
 * IndexedDB helper for high-capacity offline storage (bypasses 5MB localStorage limit)
 */
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('teachers')) {
        db.createObjectStore('teachers', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('submissions')) {
        db.createObjectStore('submissions', { keyPath: 'id' });
      }
    };
    request.onsuccess = (e: any) => resolve(e.target.result);
    request.onerror = (e: any) => reject(e.target.error);
  });
}

async function saveToIndexedDB(storeName: 'teachers' | 'submissions', items: any[]): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.clear();
    items.forEach(item => {
      if (item && item.id) {
        store.put(item);
      }
    });
    return new Promise(resolve => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (e) {
    // Silently continue
  }
}

async function loadFromIndexedDB(storeName: 'teachers' | 'submissions'): Promise<any[]> {
  try {
    const db = await openIndexedDB();
    return new Promise(resolve => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

/**
 * Safe LocalStorage writer that strips heavy base64 dataUrls if browser quota is exceeded
 */
function safeSetLocalStorage(key: string, data: any[]) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    // If quota exceeded, strip large dataUrl strings for localStorage only
    // Full dataUrl is still preserved in Memory, IndexedDB, and Server!
    try {
      if (key === SUBMISSIONS_STORAGE_KEY) {
        const lightweight = data.map((sub: Submission) => ({
          ...sub,
          files: (sub.files || []).map(f => ({
            ...f,
            dataUrl: f.dataUrl && f.dataUrl.length > 500 ? '' : f.dataUrl
          }))
        }));
        localStorage.setItem(key, JSON.stringify(lightweight));
      }
    } catch (innerErr) {
      console.warn('LocalStorage save skipped due to storage limits', innerErr);
    }
  }
}

export class DatabaseService {
  private static listeners: Array<() => void> = [];
  private static syncStatusListeners: Array<(status: 'connected' | 'connecting' | 'offline') => void> = [];
  private static currentSyncStatus: 'connected' | 'connecting' | 'offline' = 'connecting';
  private static eventSource: EventSource | null = null;
  private static reconnectTimeout: any = null;

  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static subscribeSyncStatus(listener: (status: 'connected' | 'connecting' | 'offline') => void) {
    this.syncStatusListeners.push(listener);
    listener(this.currentSyncStatus);
    return () => {
      this.syncStatusListeners = this.syncStatusListeners.filter(l => l !== listener);
    };
  }

  private static setSyncStatus(status: 'connected' | 'connecting' | 'offline') {
    if (this.currentSyncStatus !== status) {
      this.currentSyncStatus = status;
      this.syncStatusListeners.forEach(cb => {
        try {
          cb(status);
        } catch (e) {}
      });
    }
  }

  private static notify() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error('Listener callback error', e);
      }
    });
  }

  // --- REAL-TIME EVENT STREAM (SSE) ---
  static connectEventStream() {
    if (typeof window === 'undefined') return;
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (e) {}
    }

    try {
      this.setSyncStatus('connecting');
      const es = new EventSource('/api/events');
      this.eventSource = es;

      es.onopen = () => {
        this.setSyncStatus('connected');
      };

      es.addEventListener('connected', () => {
        this.setSyncStatus('connected');
        this.fetchFromServer();
      });

      es.addEventListener('submissions_updated', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            memorySubmissions = data;
            safeSetLocalStorage(SUBMISSIONS_STORAGE_KEY, data);
            saveToIndexedDB('submissions', data);
            this.notify();
          }
        } catch (e) {}
      });

      es.addEventListener('teachers_updated', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data)) {
            memoryTeachers = data;
            safeSetLocalStorage(TEACHERS_STORAGE_KEY, data);
            saveToIndexedDB('teachers', data);
            this.notify();
          }
        } catch (e) {}
      });

      es.addEventListener('clear_all', () => {
        memoryTeachers = [];
        memorySubmissions = [];
        safeSetLocalStorage(TEACHERS_STORAGE_KEY, []);
        safeSetLocalStorage(SUBMISSIONS_STORAGE_KEY, []);
        saveToIndexedDB('teachers', []);
        saveToIndexedDB('submissions', []);
        this.notify();
      });

      es.onerror = () => {
        this.setSyncStatus('offline');
        try {
          es.close();
        } catch (e) {}
        this.eventSource = null;

        // Auto-reconnect after 3 seconds
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => {
          this.connectEventStream();
        }, 3000);
      };
    } catch (e) {
      this.setSyncStatus('offline');
    }
  }

  // --- INITIALIZATION ---
  static async init(): Promise<{ teachers: Teacher[]; submissions: Submission[] }> {
    if (!isInitialized) {
      // 1. First populate from localStorage / Defaults
      this.getTeachers();
      this.getSubmissions();

      // 2. Load any IndexedDB offline data
      try {
        const [idbTeachers, idbSubmissions] = await Promise.all([
          loadFromIndexedDB('teachers'),
          loadFromIndexedDB('submissions')
        ]);
        if (Array.isArray(idbTeachers) && idbTeachers.length > 0) {
          memoryTeachers = idbTeachers;
        }
        if (Array.isArray(idbSubmissions) && idbSubmissions.length > 0) {
          memorySubmissions = idbSubmissions;
        }
      } catch (e) {}

      isInitialized = true;
    }

    // 3. Connect real-time event stream
    this.connectEventStream();

    // 4. Fetch canonical data from the persistent server
    await this.fetchFromServer();
    return { teachers: memoryTeachers, submissions: memorySubmissions };
  }

  // --- TEACHERS CRUD ---
  static getTeachers(): Teacher[] {
    if (memoryTeachers.length > 0) {
      return [...memoryTeachers].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
    }

    try {
      const data = localStorage.getItem(TEACHERS_STORAGE_KEY);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          memoryTeachers = parsed;
          return memoryTeachers.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
        }
      }
      // If storage is empty, initialize with permanent default 39 teachers
      if (PERMANENT_DEFAULT_TEACHERS.length > 0) {
        memoryTeachers = [...PERMANENT_DEFAULT_TEACHERS];
        safeSetLocalStorage(TEACHERS_STORAGE_KEY, PERMANENT_DEFAULT_TEACHERS);
        saveToIndexedDB('teachers', PERMANENT_DEFAULT_TEACHERS);
        return [...PERMANENT_DEFAULT_TEACHERS].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
      }
      return [];
    } catch (e) {
      memoryTeachers = [...PERMANENT_DEFAULT_TEACHERS];
      return memoryTeachers;
    }
  }

  static getTeacherById(id: string): Teacher | undefined {
    const teachers = this.getTeachers();
    return teachers.find(t => t.id === id);
  }

  static saveTeacher(teacher: Teacher): Teacher[] {
    const teachers = this.getTeachers();
    const existingIndex = teachers.findIndex(
      t => t.id === teacher.id || (teacher.nip && teacher.nip !== '-' && t.nip === teacher.nip)
    );

    let updated: Teacher[];
    if (existingIndex >= 0) {
      updated = [...teachers];
      updated[existingIndex] = { ...teachers[existingIndex], ...teacher };
    } else {
      updated = [teacher, ...teachers];
    }

    const sorted = updated.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
    memoryTeachers = sorted;
    safeSetLocalStorage(TEACHERS_STORAGE_KEY, sorted);
    saveToIndexedDB('teachers', sorted);
    this.notify();
    this.syncToServer('teachers', sorted);
    return sorted;
  }

  static saveBulkTeachers(newTeachers: Teacher[], replaceAll = false): Teacher[] {
    let updated: Teacher[];
    if (replaceAll) {
      updated = [...newTeachers];
    } else {
      const existing = this.getTeachers();
      const map = new Map<string, Teacher>();
      existing.forEach(t => map.set(t.nip && t.nip !== '-' ? t.nip : t.name, t));
      newTeachers.forEach(t => {
        const key = t.nip && t.nip !== '-' ? t.nip : t.name;
        map.set(key, t);
      });
      updated = Array.from(map.values());
    }

    const sorted = updated.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
    memoryTeachers = sorted;
    safeSetLocalStorage(TEACHERS_STORAGE_KEY, sorted);
    saveToIndexedDB('teachers', sorted);
    this.notify();
    this.syncToServer('teachers', sorted);
    return sorted;
  }

  static deleteTeacher(id: string): Teacher[] {
    const teachers = this.getTeachers();
    const updated = teachers.filter(t => t.id !== id);
    memoryTeachers = updated;
    safeSetLocalStorage(TEACHERS_STORAGE_KEY, updated);
    saveToIndexedDB('teachers', updated);
    this.notify();
    
    // Call server delete endpoint
    try {
      fetch(`/api/teachers/${id}`, { method: 'DELETE' }).catch(() => {
        this.syncToServer('teachers', updated);
      });
    } catch (e) {
      this.syncToServer('teachers', updated);
    }
    return updated;
  }

  static loadDefaultTeachersTemplate(): Teacher[] {
    const defaults = [...PERMANENT_DEFAULT_TEACHERS];
    memoryTeachers = defaults;
    safeSetLocalStorage(TEACHERS_STORAGE_KEY, defaults);
    saveToIndexedDB('teachers', defaults);
    this.notify();
    try {
      fetch('/api/teachers/reset-baku', { method: 'POST' }).catch(() => {
        this.syncToServer('teachers', defaults);
      });
    } catch (e) {
      this.syncToServer('teachers', defaults);
    }
    return defaults;
  }

  static clearAllTeachers(): Teacher[] {
    memoryTeachers = [];
    safeSetLocalStorage(TEACHERS_STORAGE_KEY, []);
    saveToIndexedDB('teachers', []);
    this.notify();
    try {
      fetch('/api/teachers/clear', { method: 'POST' }).catch(() => {});
    } catch (e) {}
    return [];
  }

  static clearAllData(): { teachers: Teacher[]; submissions: Submission[] } {
    memoryTeachers = [];
    memorySubmissions = [];
    safeSetLocalStorage(TEACHERS_STORAGE_KEY, []);
    safeSetLocalStorage(SUBMISSIONS_STORAGE_KEY, []);
    saveToIndexedDB('teachers', []);
    saveToIndexedDB('submissions', []);
    this.notify();
    try {
      fetch('/api/clear-all', { method: 'POST' }).catch(() => {});
    } catch (e) {}
    return { teachers: [], submissions: [] };
  }

  // --- SUBMISSIONS CRUD ---
  static getSubmissions(): Submission[] {
    if (memorySubmissions.length > 0) {
      return memorySubmissions;
    }

    try {
      const data = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (data !== null) {
        const list = JSON.parse(data);
        if (Array.isArray(list)) {
          memorySubmissions = list;
          return list;
        }
      }
      return [];
    } catch (e) {
      return memorySubmissions;
    }
  }

  static addSubmission(submission: Submission): Submission[] {
    const current = this.getSubmissions();
    const existingIndex = current.findIndex(s => s.id === submission.id);
    let updated: Submission[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = submission;
    } else {
      updated = [submission, ...current];
    }

    memorySubmissions = updated;
    safeSetLocalStorage(SUBMISSIONS_STORAGE_KEY, updated);
    saveToIndexedDB('submissions', updated);

    // Auto-ensure teacher is registered in teachers table
    if (submission.teacherName) {
      const existingTeachers = this.getTeachers();
      const exists = existingTeachers.some(
        t => t.id === submission.teacherId || (submission.nip && t.nip === submission.nip)
      );

      if (!exists) {
        const newTeacherRecord: Teacher = {
          id: submission.teacherId || `guru-${Date.now()}`,
          name: submission.teacherName,
          nip: submission.nip || '-',
          jabatan: submission.jabatan || 'Guru',
          pangkatGolongan: submission.pangkatGolongan || '-',
          statusKepegawaian: 'PNS',
          jenisKelamin: 'P'
        };
        this.saveTeacher(newTeacherRecord);
      }
    }

    this.notify();

    // Persist permanently to server as single atomic record
    this.syncToServer('submissions', submission);
    return updated;
  }

  static deleteSubmission(id: string): Submission[] {
    const current = this.getSubmissions();
    const updated = current.filter(s => s.id !== id);
    memorySubmissions = updated;
    safeSetLocalStorage(SUBMISSIONS_STORAGE_KEY, updated);
    saveToIndexedDB('submissions', updated);
    this.notify();

    try {
      fetch(`/api/submissions/${id}`, { method: 'DELETE' }).catch(() => {
        this.syncToServer('submissions', updated);
      });
    } catch (e) {
      this.syncToServer('submissions', updated);
    }
    return updated;
  }

  static clearAllSubmissions(): Submission[] {
    memorySubmissions = [];
    safeSetLocalStorage(SUBMISSIONS_STORAGE_KEY, []);
    saveToIndexedDB('submissions', []);
    this.notify();
    try {
      fetch('/api/submissions/clear', { method: 'POST' }).catch(() => {});
    } catch (e) {}
    return [];
  }

  static updateSubmissionStatus(id: string, status: Submission['status']): Submission[] {
    const current = this.getSubmissions();
    const updated = current.map(s => (s.id === id ? { ...s, status } : s));
    memorySubmissions = updated;
    safeSetLocalStorage(SUBMISSIONS_STORAGE_KEY, updated);
    saveToIndexedDB('submissions', updated);
    this.notify();

    try {
      fetch(`/api/submissions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(() => {
        this.syncToServer('submissions', updated);
      });
    } catch (e) {
      this.syncToServer('submissions', updated);
    }
    return updated;
  }

  // --- SERVER SYNCHRONIZATION ---
  private static async syncToServer(type: 'teachers' | 'submissions', payload: any, retries = 3): Promise<boolean> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const res = await fetch(`/api/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          return true;
        }
      } catch (e) {
        if (attempt < retries - 1) {
          await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    }
    return false;
  }

  static async fetchFromServer(): Promise<{ teachers?: Teacher[]; submissions?: Submission[] }> {
    const result: { teachers?: Teacher[]; submissions?: Submission[] } = {};
    let hasChanges = false;

    try {
      const resTeachers = await fetch('/api/teachers');
      if (resTeachers.ok) {
        const data = await resTeachers.json();
        if (Array.isArray(data) && data.length > 0) {
          result.teachers = data;
          memoryTeachers = data;
          safeSetLocalStorage(TEACHERS_STORAGE_KEY, data);
          saveToIndexedDB('teachers', data);
          hasChanges = true;
        }
      }
    } catch (e) {}

    try {
      const resSubmissions = await fetch('/api/submissions');
      if (resSubmissions.ok) {
        const data = await resSubmissions.json();
        if (Array.isArray(data)) {
          result.submissions = data;
          memorySubmissions = data;
          safeSetLocalStorage(SUBMISSIONS_STORAGE_KEY, data);
          saveToIndexedDB('submissions', data);
          hasChanges = true;
        }
      }
    } catch (e) {}

    if (hasChanges) {
      this.notify();
    }

    return result;
  }

  // --- ALL STORED FILES ARSIP AGGREGATOR ---
  static getAllStoredFiles(): Array<StoredFile & { submission: Submission }> {
    const submissions = this.getSubmissions();
    const result: Array<StoredFile & { submission: Submission }> = [];
    submissions.forEach(sub => {
      if (Array.isArray(sub.files)) {
        sub.files.forEach(file => {
          result.push({
            ...file,
            submission: sub
          });
        });
      }
    });
    return result;
  }

  // --- EXPORT & BACKUP DATABASE ---
  static exportBackup(): string {
    const data = {
      app: 'Sikawan SD NEGERI BABELAN KOTA 01',
      version: '2026.2.0',
      exportedAt: new Date().toISOString(),
      teachers: this.getTeachers(),
      submissions: this.getSubmissions()
    };
    return JSON.stringify(data, null, 2);
  }

  static importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.teachers)) {
        memoryTeachers = data.teachers;
        safeSetLocalStorage(TEACHERS_STORAGE_KEY, data.teachers);
        saveToIndexedDB('teachers', data.teachers);
        this.syncToServer('teachers', data.teachers);
      }
      if (Array.isArray(data.submissions)) {
        memorySubmissions = data.submissions;
        safeSetLocalStorage(SUBMISSIONS_STORAGE_KEY, data.submissions);
        saveToIndexedDB('submissions', data.submissions);
        this.syncToServer('submissions', data.submissions);
      }
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  }
}


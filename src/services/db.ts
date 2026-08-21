import { Teacher, Submission, StoredFile } from '../types';
import { PERMANENT_DEFAULT_TEACHERS } from '../data/defaultTeachers';

export const DEFAULT_TEACHERS: Teacher[] = PERMANENT_DEFAULT_TEACHERS;

const TEACHERS_STORAGE_KEY = 'sikawan_teachers_v3';
const OLD_TEACHERS_STORAGE_KEY_V2 = 'sikawan_teachers_v2';
const SUBMISSIONS_STORAGE_KEY = 'sikawan_submissions_v3';
const OLD_SUBMISSIONS_STORAGE_KEY_V2 = 'sikawan_submissions_v2';

export class DatabaseService {
  private static listeners: Array<() => void> = [];

  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
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

  // --- TEACHERS CRUD ---
  static getTeachers(): Teacher[] {
    try {
      const data = localStorage.getItem(TEACHERS_STORAGE_KEY);
      if (data !== null) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
        }
      }
      // If storage is empty or not yet set, initialize with permanent default teachers
      if (PERMANENT_DEFAULT_TEACHERS.length > 0) {
        localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(PERMANENT_DEFAULT_TEACHERS));
        this.syncToServer('teachers', PERMANENT_DEFAULT_TEACHERS);
        return [...PERMANENT_DEFAULT_TEACHERS].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
      }
      return [];
    } catch (e) {
      console.error('Error fetching teachers from storage', e);
      return [...PERMANENT_DEFAULT_TEACHERS];
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
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(sorted));
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
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(sorted));
    this.notify();
    this.syncToServer('teachers', sorted);
    return sorted;
  }

  static deleteTeacher(id: string): Teacher[] {
    const teachers = this.getTeachers();
    const updated = teachers.filter(t => t.id !== id);
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updated));
    this.notify();
    this.syncToServer('teachers', updated);
    return updated;
  }

  static loadDefaultTeachersTemplate(): Teacher[] {
    const defaults = [...PERMANENT_DEFAULT_TEACHERS];
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(defaults));
    this.notify();
    this.syncToServer('teachers', defaults);
    return defaults;
  }

  static clearAllTeachers(): Teacher[] {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem(OLD_TEACHERS_STORAGE_KEY_V2);
    this.notify();
    this.syncToServer('teachers', []);
    return [];
  }

  static clearAllData(): { teachers: Teacher[]; submissions: Submission[] } {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem(OLD_TEACHERS_STORAGE_KEY_V2);
    localStorage.removeItem(OLD_SUBMISSIONS_STORAGE_KEY_V2);
    this.notify();
    try {
      fetch('/api/clear-all', { method: 'POST' }).catch(() => {});
    } catch (e) {}
    return { teachers: [], submissions: [] };
  }

  // --- SUBMISSIONS CRUD ---
  static getSubmissions(): Submission[] {
    try {
      const data = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (data !== null) {
        const list = JSON.parse(data);
        return Array.isArray(list) ? list : [];
      }
      return [];
    } catch (e) {
      console.error('Error fetching submissions from storage', e);
      return [];
    }
  }

  static addSubmission(submission: Submission): Submission[] {
    const current = this.getSubmissions();
    const updated = [submission, ...current];
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));

    // Auto-ensure teacher is saved in the teachers table as well if present
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
    this.syncToServer('submissions', updated);
    return updated;
  }

  static deleteSubmission(id: string): Submission[] {
    const current = this.getSubmissions();
    const updated = current.filter(s => s.id !== id);
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    this.notify();
    this.syncToServer('submissions', updated);
    return updated;
  }

  static clearAllSubmissions(): Submission[] {
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem(OLD_SUBMISSIONS_STORAGE_KEY_V2);
    this.notify();
    this.syncToServer('submissions', []);
    return [];
  }

  static updateSubmissionStatus(id: string, status: Submission['status']): Submission[] {
    const current = this.getSubmissions();
    const updated = current.map(s => (s.id === id ? { ...s, status } : s));
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    this.notify();
    this.syncToServer('submissions', updated);
    return updated;
  }

  // --- SERVER SYNCHRONIZATION ---
  private static async syncToServer(type: 'teachers' | 'submissions', payload: any) {
    try {
      await fetch(`/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      // Offline or client-only mode
    }
  }

  static async fetchFromServer(): Promise<{ teachers?: Teacher[]; submissions?: Submission[] }> {
    const result: { teachers?: Teacher[]; submissions?: Submission[] } = {};
    try {
      const resTeachers = await fetch('/api/teachers');
      if (resTeachers.ok) {
        const data = await resTeachers.json();
        if (Array.isArray(data)) {
          result.teachers = data;
          localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(data));
        }
      }
    } catch (e) {
      // server offline
    }

    try {
      const resSubmissions = await fetch('/api/submissions');
      if (resSubmissions.ok) {
        const data = await resSubmissions.json();
        if (Array.isArray(data)) {
          result.submissions = data;
          localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(data));
        }
      }
    } catch (e) {
      // server offline
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
        localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(data.teachers));
        this.syncToServer('teachers', data.teachers);
      }
      if (Array.isArray(data.submissions)) {
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(data.submissions));
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

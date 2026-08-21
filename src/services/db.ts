import { Teacher, Submission, StoredFile } from '../types';

// Default Master Data Guru & Tenaga Kependidikan SD NEGERI BABELAN KOTA 01 (Kosong - Diisi Manual Secara Permanen)
export const DEFAULT_TEACHERS: Teacher[] = [];

const TEACHERS_STORAGE_KEY = 'sikawan_teachers_v2';
const OLD_TEACHERS_STORAGE_KEY = 'sikawan_teachers_v1';
const SUBMISSIONS_STORAGE_KEY = 'sikawan_submissions_v2';
const OLD_SUBMISSIONS_STORAGE_KEY = 'sikawan_submissions_v1';

// Seed initial empty list for submissions
const INITIAL_SUBMISSIONS: Submission[] = [];

// Built-in mock IDs to filter out if migrating from older version
const LEGACY_MOCK_TEACHER_IDS = new Set([
  'guru-001', 'guru-002', 'guru-003', 'guru-004', 'guru-005', 'guru-006',
  'guru-007', 'guru-008', 'guru-009', 'guru-010', 'guru-011', 'guru-012'
]);

export class DatabaseService {
  // --- TEACHERS CRUD ---
  static getTeachers(): Teacher[] {
    try {
      const data = localStorage.getItem(TEACHERS_STORAGE_KEY);
      let list: Teacher[] = [];

      if (data !== null) {
        list = JSON.parse(data);
      } else {
        // Check if there was custom data in the old storage key, filtering out default mock entries
        const oldData = localStorage.getItem(OLD_TEACHERS_STORAGE_KEY);
        if (oldData) {
          try {
            const oldList: Teacher[] = JSON.parse(oldData);
            // Keep only teachers that were NOT from the initial built-in mock list
            list = oldList.filter(t => !LEGACY_MOCK_TEACHER_IDS.has(t.id));
          } catch (e) {
            list = [];
          }
        } else {
          list = [];
        }
        localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(list));
      }

      if (!Array.isArray(list)) {
        list = [];
      }

      return list.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
    } catch (e) {
      console.error('Error fetching teachers from storage', e);
      return [];
    }
  }

  static getTeacherById(id: string): Teacher | undefined {
    const teachers = this.getTeachers();
    return teachers.find(t => t.id === id);
  }

  static saveTeacher(teacher: Teacher): Teacher[] {
    const teachers = this.getTeachers();
    // Check by ID first, or by exact NIP if id is different
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

    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updated));
    return updated.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
  }

  static saveBulkTeachers(newTeachers: Teacher[], replaceAll = false): Teacher[] {
    let updated: Teacher[];
    if (replaceAll) {
      updated = [...newTeachers];
    } else {
      const existing = this.getTeachers();
      const map = new Map<string, Teacher>();
      existing.forEach(t => map.set(t.nip !== '-' ? t.nip : t.name, t));
      newTeachers.forEach(t => {
        const key = t.nip !== '-' ? t.nip : t.name;
        map.set(key, t);
      });
      updated = Array.from(map.values());
    }

    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updated));
    return updated.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'id'));
  }

  static deleteTeacher(id: string): Teacher[] {
    const teachers = this.getTeachers();
    const updated = teachers.filter(t => t.id !== id);
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  static clearAllTeachers(): Teacher[] {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  static resetTeachers(): Teacher[] {
    localStorage.setItem(TEACHERS_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  // --- SUBMISSIONS CRUD ---
  static getSubmissions(): Submission[] {
    try {
      const data = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
      if (data !== null) {
        const list = JSON.parse(data);
        return Array.isArray(list) ? list : [];
      }

      // Check old submissions
      const oldData = localStorage.getItem(OLD_SUBMISSIONS_STORAGE_KEY);
      if (oldData) {
        try {
          const oldList: Submission[] = JSON.parse(oldData);
          // Filter out mock submissions tied to default mock teachers
          const filtered = oldList.filter(s => !LEGACY_MOCK_TEACHER_IDS.has(s.teacherId));
          localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(filtered));
          return filtered;
        } catch (e) {
          // ignore
        }
      }

      localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify([]));
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

    // Auto-ensure teacher is permanently saved in the teachers table as well
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

    return updated;
  }

  static deleteSubmission(id: string): Submission[] {
    const current = this.getSubmissions();
    const updated = current.filter(s => s.id !== id);
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }

  static updateSubmissionStatus(id: string, status: Submission['status']): Submission[] {
    const current = this.getSubmissions();
    const updated = current.map(s => (s.id === id ? { ...s, status } : s));
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
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
      }
      if (Array.isArray(data.submissions)) {
        localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(data.submissions));
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  }
}

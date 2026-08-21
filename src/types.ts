export type ReportType = 'harian' | 'bulanan' | 'keduanya';

export type SubmissionStatus = 'Terkirim' | 'Diverifikasi' | 'Perlu Perbaikan';

export type StatusKepegawaian = 'PNS' | 'ASN' | 'PPPK' | 'PPPK PW' | 'Honorer / GTT' | 'Tenaga Kependidikan';

export interface Teacher {
  id: string;
  name: string;
  nip: string;
  jabatan: string;
  pangkatGolongan?: string;
  statusKepegawaian: StatusKepegawaian;
  jenisKelamin: 'L' | 'P';
  mataPelajaranAtauKelas?: string;
  email?: string;
  telepon?: string;
}

export interface StoredFile {
  id: string;
  category: 'harian' | 'bulanan';
  originalName: string;
  storedFileName: string;
  folderPath: string;
  fileSize: number;
  mimeType: string;
  dataUrl?: string; // base64 or blob url for preview and download
  uploadDate: string;
}

export interface Submission {
  id: string;
  teacherId: string;
  teacherName: string;
  nip: string;
  jabatan: string;
  pangkatGolongan?: string;
  reportType: ReportType;
  tanggalKinerja: string; // YYYY-MM-DD
  bulanPeriode: string; // e.g. "Januari", "Februari", etc.
  tahunPeriode: number; // 2026
  uraianKinerja?: string;
  targetKinerja?: string;
  capaian?: string;
  keteranganTambahan?: string;
  status: SubmissionStatus;
  submittedAt: string; // ISO string
  files: StoredFile[];
}

export interface FilterOptions {
  teacherId: string;
  reportType: string;
  bulan: string;
  searchQuery: string;
  status: string;
}

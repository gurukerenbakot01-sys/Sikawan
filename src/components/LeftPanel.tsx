import React, { useState, useEffect, useRef } from 'react';
import { Teacher, Submission, ReportType, StoredFile } from '../types';
import { 
  generateStoredFileName, 
  generateFolderPath, 
  MONTH_NAMES_2026, 
  formatBytes 
} from '../utils/formatters';
import { 
  User, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  Sparkles, 
  Send, 
  RotateCcw, 
  X, 
  FileCheck, 
  Info,
  ChevronDown,
  FileSpreadsheet
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LeftPanelProps {
  teachers: Teacher[];
  onSubmitSuccess: (newSubmission: Submission) => void;
  onOpenTeacherModal: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  teachers,
  onSubmitSuccess,
  onOpenTeacherModal
}) => {
  // Selected Teacher State
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');

  // Form State
  const [tanggalKinerja, setTanggalKinerja] = useState<string>('2026-08-19');
  const [bulanPeriode, setBulanPeriode] = useState<string>('Agustus');

  // Upload Files State
  const [harianFile, setHarianFile] = useState<File | null>(null);
  const [bulananFile, setBulananFile] = useState<File | null>(null);
  const [harianFileDataUrl, setHarianFileDataUrl] = useState<string>('');
  const [bulananFileDataUrl, setBulananFileDataUrl] = useState<string>('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const harianInputRef = useRef<HTMLInputElement>(null);
  const bulananInputRef = useRef<HTMLInputElement>(null);

  // Sort teachers alphabetically by name (A to Z)
  const sortedTeachers = [...teachers].sort((a, b) => a.name.localeCompare(b.name, 'id'));

  // Sync default selected teacher when teacher list updates
  useEffect(() => {
    if (teachers.length > 0) {
      if (!selectedTeacherId || !teachers.some(t => t.id === selectedTeacherId)) {
        setSelectedTeacherId(sortedTeachers[0]?.id || '');
      }
    } else {
      setSelectedTeacherId('');
    }
  }, [teachers, selectedTeacherId, sortedTeachers]);

  // Selected teacher details
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId) || null;

  // File Handlers
  const handleHarianFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHarianFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setHarianFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrorMessage('');
    }
  };

  const handleBulananFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBulananFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setBulananFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrorMessage('');
    }
  };

  const handleHarianDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setHarianFile(file);
      const reader = new FileReader();
      reader.onload = () => setHarianFileDataUrl(reader.result as string);
      reader.readAsDataURL(file);
      setErrorMessage('');
    }
  };

  const handleBulananDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setBulananFile(file);
      const reader = new FileReader();
      reader.onload = () => setBulananFileDataUrl(reader.result as string);
      reader.readAsDataURL(file);
      setErrorMessage('');
    }
  };

  // Real-time Preview of Target File Names based on selected teacher
  const teacherNameForNaming = selectedTeacher ? selectedTeacher.name : 'Nama Guru';
  
  const generatedHarianFileName = generateStoredFileName(
    teacherNameForNaming,
    'harian',
    tanggalKinerja,
    harianFile ? harianFile.name : 'laporan-kinerja.pdf'
  );

  const generatedBulananFileName = generateStoredFileName(
    teacherNameForNaming,
    'bulanan',
    bulanPeriode,
    bulananFile ? bulananFile.name : 'laporan-kinerja.pdf'
  );

  const harianFolderPath = generateFolderPath(teacherNameForNaming, 'harian');
  const bulananFolderPath = generateFolderPath(teacherNameForNaming, 'bulanan');

  // Form Reset
  const handleReset = () => {
    setHarianFile(null);
    setBulananFile(null);
    setHarianFileDataUrl('');
    setBulananFileDataUrl('');
    setErrorMessage('');
    setSuccessMessage('');
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (teachers.length === 0) {
      setErrorMessage('Database guru masih kosong. Silakan buka Kelola Master untuk mengimpor format Excel guru.');
      return;
    }

    if (!selectedTeacher) {
      setErrorMessage('Silakan pilih Nama Guru dari database terlebih dahulu.');
      return;
    }

    // Require at least one file to be uploaded (Harian or Bulanan)
    if (!harianFile && !bulananFile) {
      setErrorMessage('Silakan unggah setidaknya salah satu berkas: File Laporan Harian atau File Laporan Bulanan.');
      return;
    }

    setIsSubmitting(true);

    try {
      const storedFiles: StoredFile[] = [];
      const timestamp = new Date().toISOString();

      let detectedReportType: ReportType = 'harian';
      if (harianFile && bulananFile) {
        detectedReportType = 'keduanya';
      } else if (bulananFile) {
        detectedReportType = 'bulanan';
      } else {
        detectedReportType = 'harian';
      }

      if (harianFile) {
        storedFiles.push({
          id: `file-harian-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          category: 'harian',
          originalName: harianFile.name,
          storedFileName: generateStoredFileName(
            selectedTeacher.name,
            'harian',
            tanggalKinerja,
            harianFile.name
          ),
          folderPath: generateFolderPath(selectedTeacher.name, 'harian'),
          fileSize: harianFile.size,
          mimeType: harianFile.type || 'application/pdf',
          dataUrl: harianFileDataUrl,
          uploadDate: timestamp
        });
      }

      if (bulananFile) {
        storedFiles.push({
          id: `file-bulanan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          category: 'bulanan',
          originalName: bulananFile.name,
          storedFileName: generateStoredFileName(
            selectedTeacher.name,
            'bulanan',
            bulanPeriode,
            bulananFile.name
          ),
          folderPath: generateFolderPath(selectedTeacher.name, 'bulanan'),
          fileSize: bulananFile.size,
          mimeType: bulananFile.type || 'application/pdf',
          dataUrl: bulananFileDataUrl,
          uploadDate: timestamp
        });
      }

      const newSubmission: Submission = {
        id: `sub-${Date.now()}`,
        teacherId: selectedTeacher.id,
        teacherName: selectedTeacher.name,
        nip: selectedTeacher.nip,
        jabatan: selectedTeacher.jabatan,
        pangkatGolongan: selectedTeacher.pangkatGolongan,
        reportType: detectedReportType,
        tanggalKinerja,
        bulanPeriode,
        tahunPeriode: 2026,
        uraianKinerja: `Laporan kinerja ${detectedReportType === 'keduanya' ? 'Harian & Bulanan' : detectedReportType === 'harian' ? 'Harian' : 'Bulanan'} telah diunggah dan terverifikasi.`,
        targetKinerja: 'Tuntas sesuai tupoksi',
        capaian: '100% terlaksana',
        status: 'Terkirim',
        submittedAt: timestamp,
        files: storedFiles
      };

      // Trigger Confetti Celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.log('Confetti error ignored', err);
      }

      onSubmitSuccess(newSubmission);
      setSuccessMessage('BERHASIL DI SIMPAN');
      handleReset();
    } catch (err) {
      console.error(err);
      setErrorMessage('Terjadi kendala saat menyimpan laporan. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="sikawan-left-panel" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 px-5 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center border border-emerald-500/40 text-emerald-200">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                Input Laporan Sikawan
              </h2>
              <p className="text-xs text-emerald-200/90 font-normal">
                Pilih Guru dari Database & Unggah Berkas Kinerja
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 text-[11px] font-semibold border border-emerald-400/30">
            Tahun 2026
          </span>
        </div>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-5 space-y-5 flex-1 overflow-y-auto">
        
        {/* Alerts */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in shadow-md shadow-emerald-700/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 flex-shrink-0 text-white" />
              <span className="tracking-wide uppercase text-sm font-black">{successMessage}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setSuccessMessage('')}
              className="text-white/80 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 1. SELEKSI GURU DARI MASTER DATABASE EXCEL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pilih Guru / Pegawai</span>
              <span className="text-rose-500 font-bold">*</span>
            </label>
            <button
              type="button"
              onClick={onOpenTeacherModal}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
              <span>Kelola Master ({teachers.length})</span>
            </button>
          </div>

          {teachers.length === 0 ? (
            /* Empty Teachers Database Banner */
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2.5 text-center">
              <p className="text-xs text-amber-900 font-semibold">
                Database Guru masih kosong.
              </p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Silakan unduh format Excel dan impor data guru melalui menu Kelola Master.
              </p>
              <button
                type="button"
                onClick={onOpenTeacherModal}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Buka Kelola Master (Format Excel)</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in">
              <div className="relative">
                <select
                  id="select-nama-guru"
                  value={selectedTeacherId}
                  onChange={e => setSelectedTeacherId(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all cursor-pointer shadow-xs"
                >
                  <option value="" disabled>-- Pilih Nama Guru --</option>
                  {sortedTeachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name} ({teacher.statusKepegawaian} - {teacher.jabatan})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              {/* Auto-filled details */}
              {selectedTeacher && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">NIP Pegawai</span>
                    <p className="font-mono font-bold text-xs text-slate-900">
                      {selectedTeacher.nip || '-'}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Jabatan / Tugas</span>
                    <p className="font-medium text-xs text-slate-900 truncate">
                      {selectedTeacher.jabatan || '-'}
                    </p>
                  </div>
                  <div className="sm:col-span-2 pt-1.5 border-t border-slate-200 flex flex-wrap gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      Status: <strong>{selectedTeacher.statusKepegawaian}</strong>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      Pangkat: <strong>{selectedTeacher.pangkatGolongan || '-'}</strong>
                    </span>
                    {selectedTeacher.mataPelajaranAtauKelas && (
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        Mapel: <strong>{selectedTeacher.mataPelajaranAtauKelas}</strong>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. DUA KOLOM UNGGAH BERKAS: LAPORAN HARIAN & LAPORAN BULANAN */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>Unggah Berkas Kinerja</span>
            </h3>
            <span className="text-[11px] text-slate-500">
              PDF / Gambar (Maks 10MB)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* KOLOM KIRI: LAPORAN HARIAN */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>1. Laporan Harian</span>
                </span>
                <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-1.5 py-0.5 rounded font-semibold">
                  Opsional / Fleksibel
                </span>
              </div>

              {/* Tanggal Kinerja Harian */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-600" />
                  <span>Tanggal Kinerja:</span>
                </label>
                <input
                  type="date"
                  value={tanggalKinerja}
                  onChange={e => setTanggalKinerja(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleHarianDrop}
                onClick={() => harianInputRef.current?.click()}
                className={`p-3 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                  harianFile 
                    ? 'border-emerald-500 bg-emerald-100/60' 
                    : 'border-slate-300 hover:border-emerald-400 bg-white hover:bg-emerald-50/40'
                }`}
              >
                <input
                  ref={harianInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleHarianFileChange}
                  className="hidden"
                />

                {harianFile ? (
                  <div className="space-y-1">
                    <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-emerald-950 truncate max-w-[200px] mx-auto">
                      {harianFile.name}
                    </p>
                    <p className="text-[10px] text-emerald-800">
                      {formatBytes(harianFile.size)} • Siap Disimpan
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHarianFile(null);
                        setHarianFileDataUrl('');
                      }}
                      className="text-[10px] text-rose-600 hover:underline pt-1 cursor-pointer"
                    >
                      Hapus Berkas
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-slate-500">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Pilih / Seret Berkas Harian</p>
                    <p className="text-[10px] text-slate-400">PDF, JPG, PNG</p>
                  </div>
                )}
              </div>

              {/* Preview Naming Harian */}
              <div className="p-2 bg-white rounded-lg border border-emerald-200/80 text-[10px] text-slate-600 space-y-0.5">
                <span className="font-semibold text-emerald-900 block">Nama Berkas Resmi Tersimpan:</span>
                <p className="font-mono text-emerald-900 font-bold truncate" title={generatedHarianFileName}>
                  {generatedHarianFileName}
                </p>
                <span className="text-[9px] text-slate-400 font-mono block truncate">
                  Lokasi: {harianFolderPath}
                </span>
              </div>
            </div>

            {/* KOLOM KANAN: LAPORAN BULANAN */}
            <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-950 flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>2. Laporan Bulanan</span>
                </span>
                <span className="text-[10px] bg-teal-200/60 text-teal-900 px-1.5 py-0.5 rounded font-semibold">
                  Opsional / Fleksibel
                </span>
              </div>

              {/* Periode Bulan */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-teal-600" />
                  <span>Periode Bulan (2026):</span>
                </label>
                <select
                  value={bulanPeriode}
                  onChange={e => setBulanPeriode(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                >
                  {MONTH_NAMES_2026.map(m => (
                    <option key={m} value={m}>{m} 2026</option>
                  ))}
                </select>
              </div>

              {/* Upload Dropzone Bulanan */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleBulananDrop}
                onClick={() => bulananInputRef.current?.click()}
                className={`p-3 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                  bulananFile 
                    ? 'border-teal-500 bg-teal-100/60' 
                    : 'border-slate-300 hover:border-teal-400 bg-white hover:bg-teal-50/40'
                }`}
              >
                <input
                  ref={bulananInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleBulananFileChange}
                  className="hidden"
                />

                {bulananFile ? (
                  <div className="space-y-1">
                    <CheckCircle className="w-6 h-6 text-teal-600 mx-auto" />
                    <p className="text-xs font-bold text-teal-950 truncate max-w-[200px] mx-auto">
                      {bulananFile.name}
                    </p>
                    <p className="text-[10px] text-teal-800">
                      {formatBytes(bulananFile.size)} • Siap Disimpan
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBulananFile(null);
                        setBulananFileDataUrl('');
                      }}
                      className="text-[10px] text-rose-600 hover:underline pt-1 cursor-pointer"
                    >
                      Hapus Berkas
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-slate-500">
                    <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">Pilih / Seret Berkas Bulanan</p>
                    <p className="text-[10px] text-slate-400">PDF, JPG, PNG</p>
                  </div>
                )}
              </div>

              {/* Preview Naming Bulanan */}
              <div className="p-2 bg-white rounded-lg border border-teal-200/80 text-[10px] text-slate-600 space-y-0.5">
                <span className="font-semibold text-teal-900 block">Nama Berkas Resmi Tersimpan:</span>
                <p className="font-mono text-teal-900 font-bold truncate" title={generatedBulananFileName}>
                  {generatedBulananFileName}
                </p>
                <span className="text-[9px] text-slate-400 font-mono block truncate">
                  Lokasi: {bulananFolderPath}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Naming Rule Notice Info Box */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">Format Penamaan & Folder Otomatis:</strong>
            <p className="mt-0.5 text-slate-500 leading-relaxed">
              Berkas yang dikirimkan secara otomatis diatur dan disimpan ke folder arsip per guru dengan format: <code className="text-emerald-700 bg-white px-1 py-0.2 rounded border border-slate-200 font-mono font-bold">[Nama Guru]_Laporan -kinerja-pegawai-harian dan bulanan</code>.
            </p>
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            id="btn-submit-laporan"
            type="submit"
            disabled={isSubmitting || teachers.length === 0}
            className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-98"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan Laporan...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Kirim Laporan Kinerja Sikawan</span>
              </>
            )}
          </button>

          <button
            id="btn-reset-form"
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Reset Isian Form"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Reset</span>
          </button>
        </div>

      </form>
    </div>
  );
};

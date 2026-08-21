import React, { useState, useRef } from 'react';
import { Teacher } from '../types';
import { 
  Users, 
  Trash2, 
  X, 
  Search, 
  Check, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  AlertCircle, 
  FileCheck, 
  Sparkles,
  Clipboard,
  RefreshCw,
  Info,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { 
  downloadTeacherExcelTemplate, 
  downloadTeacherCSVTemplate, 
  exportTeachersToExcel,
  parseTeachersFromText,
  TEMPLATE_SAMPLE_TEACHERS
} from '../utils/excelTemplate';

interface TeacherDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  onSaveTeacher?: (teacher: Teacher) => void;
  onSaveBulkTeachers: (newTeachers: Teacher[], replaceAll?: boolean) => void;
  onDeleteTeacher: (id: string) => void;
  onClearAllTeachers?: () => void;
  onLoadDefaultTeachers?: () => void;
  onClearAllData?: () => void;
}

export const TeacherDatabaseModal: React.FC<TeacherDatabaseModalProps> = ({
  isOpen,
  onClose,
  teachers,
  onSaveBulkTeachers,
  onDeleteTeacher,
  onClearAllTeachers,
  onLoadDefaultTeachers,
  onClearAllData
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'list' | 'import'>('list');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [showLoadBakuConfirm, setShowLoadBakuConfirm] = useState<boolean>(false);
  
  // Import States
  const [importMethod, setImportMethod] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState<string>('');
  const [parsedPreviewTeachers, setParsedPreviewTeachers] = useState<Teacher[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('replace');
  const [importSuccessMessage, setImportSuccessMessage] = useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    setImportErrors([]);
    setImportSuccessMessage('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const result = parseTeachersFromText(content);
        setParsedPreviewTeachers(result.teachers);
        setImportErrors(result.errors);
      } catch (err) {
        setImportErrors(['Gagal membaca file. Pastikan format file teks/CSV/Excel valid.']);
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.onerror = () => {
      setImportErrors(['Terjadi kesalahan saat membaca file.']);
      setIsProcessingFile(false);
    };

    reader.readAsText(file, 'UTF-8');
  };

  // Handle drag and drop
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setIsProcessingFile(true);
      setImportErrors([]);
      setImportSuccessMessage('');

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const result = parseTeachersFromText(content);
          setParsedPreviewTeachers(result.teachers);
          setImportErrors(result.errors);
        } catch (err) {
          setImportErrors(['Gagal membaca file. Pastikan format file valid.']);
        } finally {
          setIsProcessingFile(false);
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  // Handle parse from pasted text
  const handleParsePasted = () => {
    if (!pastedText.trim()) {
      setImportErrors(['Silakan tempel (paste) data dari tabel Excel terlebih dahulu.']);
      return;
    }
    const result = parseTeachersFromText(pastedText);
    setParsedPreviewTeachers(result.teachers);
    setImportErrors(result.errors);
  };

  // Confirm Import & Save as Master Database Baku
  const handleApplyImport = () => {
    if (parsedPreviewTeachers.length === 0) return;

    onSaveBulkTeachers(parsedPreviewTeachers, importMode === 'replace');
    setImportSuccessMessage(`Berhasil menyimpan permanen ${parsedPreviewTeachers.length} data pegawai sebagai Master Database Baku!`);
    setParsedPreviewTeachers([]);
    setPastedText('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => {
      setActiveTab('list');
      setImportSuccessMessage('');
    }, 1200);
  };

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nip.includes(searchQuery) ||
    t.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.pangkatGolongan && t.pangkatGolongan.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center border border-emerald-400/30 overflow-hidden shadow-xs flex-shrink-0">
              <img 
                src="https://i.ibb.co.com/yBq5zBnX/logo-bakot-01.png" 
                alt="Logo SDN Babelan Kota 01" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Kelola Master Database Guru</h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                  Format Excel
                </span>
              </div>
              <p className="text-xs text-emerald-200/90">
                SD NEGERI BABELAN KOTA 01 • Pengelolaan Database via Format Excel & CSV
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs & Action Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Daftar Guru ({teachers.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Impor File Excel / CSV</span>
            </button>
          </div>

          {/* Download Template Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="btn-download-format-excel"
              onClick={downloadTeacherExcelTemplate}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 border border-emerald-600"
              title="Unduh format template Excel resmi (.xls)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>Unduh Format Excel (.xls)</span>
            </button>

            <button
              id="btn-download-format-csv"
              onClick={downloadTeacherCSVTemplate}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border border-slate-300 transition-all cursor-pointer"
              title="Unduh format template dalam format CSV (.csv)"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Format CSV</span>
            </button>

            {teachers.length > 0 && (
              <button
                onClick={() => exportTeachersToExcel(teachers)}
                className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold inline-flex items-center gap-1 border border-teal-200 transition-all cursor-pointer"
                title="Ekspor daftar guru terdaftar saat ini ke Excel"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Ekspor Guru Aktif ({teachers.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: DAFTAR GURU TERDAFTAR */}
          {activeTab === 'list' && (
            <div className="space-y-4 animate-in fade-in">
              
              {/* Header Box & Instructions */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Format Database Master Guru Berbasis Excel
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Sesuai arahan, pengisian database guru dilakukan dengan mengunduh template Excel dan mengimpor file secara massal. Input manual telah dinonaktifkan.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('import')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <Upload className="w-4 h-4" />
                  <span>+ Impor Data Baru</span>
                </button>
              </div>

              {/* Toolbar & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari nama guru, NIP, atau jabatan..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  {teachers.length > 0 && (
                    <>
                      {showClearConfirm ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1.5 rounded-xl animate-in fade-in">
                          <span className="text-[11px] font-bold text-rose-700 px-1">Kosongkan semua guru?</span>
                          <button
                            onClick={() => {
                              if (onClearAllTeachers) {
                                onClearAllTeachers();
                              } else {
                                onSaveBulkTeachers([], true);
                              }
                              setShowClearConfirm(false);
                            }}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Ya, Kosongkan
                          </button>
                          <button
                            onClick={() => setShowClearConfirm(false)}
                            className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs cursor-pointer"
                          >
                            Batal
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowClearConfirm(true)}
                          className="px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50 border border-rose-300 bg-rose-50/40 rounded-xl font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                          title="Kosongkan seluruh data guru dari database"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Kosongkan Database</span>
                        </button>
                      )}
                    </>
                  )}

                  {showLoadBakuConfirm ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 p-1.5 rounded-xl animate-in fade-in">
                      <span className="text-[11px] font-bold text-emerald-900 px-1">Muat Master 39 Pegawai Resmi SDN Babelan Kota 01?</span>
                      <button
                        onClick={() => {
                          if (onLoadDefaultTeachers) {
                            onLoadDefaultTeachers();
                          }
                          setShowLoadBakuConfirm(false);
                        }}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        Ya, Muat
                      </button>
                      <button
                        onClick={() => setShowLoadBakuConfirm(false)}
                        className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowLoadBakuConfirm(true)}
                      className="px-3 py-1.5 text-xs text-emerald-900 hover:bg-emerald-100/70 border border-emerald-300 bg-emerald-50 rounded-xl font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      title="Muat master database 39 guru & tendik resmi SD Negeri Babelan Kota 01"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Muat Master Baku (39 Pegawai)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table of Teachers or Empty State */}
              {teachers.length === 0 ? (
                <div className="border-2 border-dashed border-emerald-300/80 rounded-2xl p-8 text-center bg-emerald-50/30 space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="font-bold text-slate-900 text-sm">Database Master Pegawai Masih Kosong</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Silakan unduh format template Excel resmi, isi dengan daftar guru/pegawai yang aktif, lalu impor kembali. Data yang Anda impor akan <strong>otomatis tersimpan permanen sebagai Master Database Baku</strong> dan aktif pada seluruh formulir.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={downloadTeacherExcelTemplate}
                      className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Download className="w-4 h-4 text-emerald-200" />
                      <span>1. Unduh Format Template Excel (.xls)</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('import')}
                      className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
                    >
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>2. Impor Berkas Guru & Simpan Baku</span>
                    </button>

                    <button
                      onClick={() => {
                        if (onLoadDefaultTeachers) {
                          onLoadDefaultTeachers();
                        }
                      }}
                      className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4 text-emerald-700" />
                      <span>Muat Master 39 Pegawai Baku</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3 w-10 text-center">No</th>
                          <th className="p-3">Nama Lengkap & Gelar</th>
                          <th className="p-3">NIP</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Jabatan & Tugas</th>
                          <th className="p-3">Pangkat / Gol.</th>
                          <th className="p-3 text-center">L/P</th>
                          <th className="p-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTeachers.map((teacher, index) => (
                          <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 text-center text-slate-400 font-mono text-[11px]">
                              {index + 1}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{teacher.name}</div>
                              <div className="text-[10px] text-slate-500">{teacher.mataPelajaranAtauKelas || teacher.jabatan}</div>
                            </td>
                            <td className="p-3 font-mono font-semibold text-slate-800">
                              {teacher.nip}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                teacher.statusKepegawaian === 'PNS' || teacher.statusKepegawaian === 'ASN'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : teacher.statusKepegawaian === 'PPPK' || teacher.statusKepegawaian === 'PPPK PW'
                                  ? 'bg-teal-100 text-teal-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {teacher.statusKepegawaian}
                              </span>
                            </td>
                            <td className="p-3 text-slate-700">
                              {teacher.jabatan}
                            </td>
                            <td className="p-3 text-slate-600 text-[11px]">
                              {teacher.pangkatGolongan || '-'}
                            </td>
                            <td className="p-3 text-center font-bold text-slate-600">
                              {teacher.jenisKelamin || '-'}
                            </td>
                            <td className="p-3 text-right">
                              {deleteConfirmId === teacher.id ? (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => {
                                      onDeleteTeacher(teacher.id);
                                      setDeleteConfirmId(null);
                                    }}
                                    className="px-2 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    Hapus
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] cursor-pointer"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setDeleteConfirmId(teacher.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer transition-colors"
                                  title="Hapus data guru"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: IMPOR FILE EXCEL / CSV */}
          {activeTab === 'import' && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Instructions Banner */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">
                        Panduan Impor Format Excel Guru
                      </h4>
                      <p className="text-xs text-emerald-900/80 mt-0.5 leading-relaxed">
                        Gunakan tombol di bawah untuk mengunduh template Excel resmi, isi data seluruh guru/tendik SD Negeri Babelan Kota 01, kemudian unggah atau tempelkan data ke dalam kotak di bawah ini.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={downloadTeacherExcelTemplate}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs whitespace-nowrap cursor-pointer flex-shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Unduh Template (.xls)</span>
                  </button>
                </div>

                {/* Column Structure reference */}
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/80 text-[11px] text-slate-700">
                  <span className="font-bold text-emerald-900 block mb-1">Susunan Kolom Template Excel:</span>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">1. NO</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">2. NAMA LENGKAP & GELAR</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">3. NIP</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">4. STATUS KEPEGAWAIAN (PNS/PPPK/dll)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">5. JABATAN</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">6. PANGKAT & GOLONGAN</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">7. L/P</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">8. MAPEL / KELAS</span>
                  </div>
                </div>
              </div>

              {/* Import Method Toggle (Upload File vs Paste Text) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setImportMethod('file')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      importMethod === 'file'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Unggah Berkas (.xls / .csv)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImportMethod('paste')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                      importMethod === 'paste'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Clipboard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tempel / Salin dari Excel</span>
                  </button>
                </div>
              </div>

              {/* File Upload Dropzone */}
              {importMethod === 'file' ? (
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60 p-8 rounded-2xl text-center cursor-pointer transition-all space-y-3"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xls,.xlsx,.csv,.tsv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {isProcessingFile ? 'Sedang Memproses Berkas...' : 'Pilih atau Seret Berkas Excel / CSV Guru'}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Mendukung format <strong>.xls</strong>, <strong>.xlsx</strong>, <strong>.csv</strong>, dan <strong>.txt</strong>
                    </p>
                  </div>
                </div>
              ) : (
                /* Paste Text Area */
                <div className="space-y-2">
                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={e => setPastedText(e.target.value)}
                    placeholder="Salin (Copy) baris data dari Microsoft Excel atau Google Sheets, lalu Tempel (Paste) di sini..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleParsePasted}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Proses Teks Hasil Salin</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error messages if any */}
              {importErrors.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Peringatan Impor:</span>
                  </div>
                  {importErrors.map((err, i) => (
                    <p key={i} className="pl-5 text-rose-700">{err}</p>
                  ))}
                </div>
              )}

              {/* Success Feedback */}
              {importSuccessMessage && (
                <div className="p-3.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>{importSuccessMessage}</span>
                </div>
              )}

              {/* PREVIEW OF PARSED TEACHERS */}
              {parsedPreviewTeachers.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        Pratinjau Hasil Impor ({parsedPreviewTeachers.length} Guru Terdeteksi)
                      </h4>
                    </div>

                    {/* Append vs Replace Mode selector */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-[11px] font-semibold">
                      <label className="flex items-center gap-1.5 px-2 py-1 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="text-emerald-600"
                        />
                        <span>Tambahkan / Perbarui Data</span>
                      </label>
                      <label className="flex items-center gap-1.5 px-2 py-1 cursor-pointer">
                        <input
                          type="radio"
                          name="importMode"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="text-rose-600"
                        />
                        <span>Ganti Seluruh Data ({teachers.length} saat ini)</span>
                      </label>
                    </div>
                  </div>

                  {/* Preview Table */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                        <tr>
                          <th className="p-2.5 w-10 text-center">No</th>
                          <th className="p-2.5">Nama Lengkap & Gelar</th>
                          <th className="p-2.5">NIP</th>
                          <th className="p-2.5">Status</th>
                          <th className="p-2.5">Jabatan</th>
                          <th className="p-2.5">Golongan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedPreviewTeachers.map((t, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 text-center text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                            <td className="p-2.5 font-bold text-slate-900">{t.name}</td>
                            <td className="p-2.5 font-mono text-slate-800">{t.nip}</td>
                            <td className="p-2.5">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                {t.statusKepegawaian}
                              </span>
                            </td>
                            <td className="p-2.5 text-slate-700">{t.jabatan}</td>
                            <td className="p-2.5 text-slate-500 text-[11px]">{t.pangkatGolongan || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Final Apply Button */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setParsedPreviewTeachers([]);
                        setPastedText('');
                      }}
                      className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Batal
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyImport}
                      className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-md shadow-emerald-800/20 cursor-pointer active:scale-95 transition-all"
                    >
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Simpan Permanen {parsedPreviewTeachers.length} Data Pegawai (Aktifkan Baku)</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Total: <strong>{teachers.length} Guru / Pegawai Terdaftar</strong> di Database Sikawan</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

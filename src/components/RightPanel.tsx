import React, { useState } from 'react';
import { Submission, Teacher, FilterOptions, StoredFile } from '../types';
import { 
  formatIndonesianDate, 
  formatIndonesianDateTime, 
  formatBytes, 
  MONTH_NAMES_2026 
} from '../utils/formatters';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText, 
  FolderArchive, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  Printer, 
  Folder, 
  FileCheck, 
  Sparkles, 
  ChevronRight, 
  ShieldCheck, 
  Building2,
  Calendar,
  AlertTriangle,
  FileSpreadsheet,
  X
} from 'lucide-react';

interface RightPanelProps {
  submissions: Submission[];
  teachers: Teacher[];
  onDeleteSubmission: (id: string) => void;
  onUpdateStatus: (id: string, status: Submission['status']) => void;
  onPreviewFile: (file: StoredFile, teacherName: string) => void;
  onPrintReceipt: (submission: Submission) => void;
  onOpenFileExplorer: (teacherName?: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  submissions,
  teachers,
  onDeleteSubmission,
  onUpdateStatus,
  onPreviewFile,
  onPrintReceipt,
  onOpenFileExplorer
}) => {
  // Tabs: 'riwayat' | 'folder-view' | 'rekap-guru'
  const [activeTab, setActiveTab] = useState<'riwayat' | 'folder-view' | 'rekap-guru'>('riwayat');

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTeacherId, setFilterTeacherId] = useState<string>('all');
  const [filterReportType, setFilterReportType] = useState<string>('all');
  const [filterBulan, setFilterBulan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filter Logic
  const filteredSubmissions = submissions.filter(item => {
    // Search query matches teacher name, nip, or uraian
    const matchesSearch = 
      item.teacherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nip.includes(searchQuery) ||
      item.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uraianKinerja.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Filter teacher
    if (filterTeacherId !== 'all' && item.teacherId !== filterTeacherId) {
      return false;
    }

    // Filter report type
    if (filterReportType !== 'all') {
      if (filterReportType === 'harian' && item.reportType !== 'harian' && item.reportType !== 'keduanya') return false;
      if (filterReportType === 'bulanan' && item.reportType !== 'bulanan' && item.reportType !== 'keduanya') return false;
      if (filterReportType === 'keduanya' && item.reportType !== 'keduanya') return false;
    }

    // Filter bulan
    if (filterBulan !== 'all' && item.bulanPeriode !== filterBulan) {
      return false;
    }

    // Filter status
    if (filterStatus !== 'all' && item.status !== filterStatus) {
      return false;
    }

    return true;
  });

  // Handle direct simulated file download
  const handleDownloadFile = (file: StoredFile) => {
    if (file.dataUrl) {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.storedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Create a mock text/pdf content blob to allow download with exact required name
      const content = `LAPORAN KINERJA PEGAWAI SIKAWAN TAHUN 2026\nSD NEGERI BABELAN KOTA 01\n\nNama Berkas: ${file.storedFileName}\nKategori: ${file.category}\nLokasi Folder: ${file.folderPath}\nWaktu Unggah: ${formatIndonesianDateTime(file.uploadDate)}\n\nStatus Berkas: Tervalidasi Resmi dalam Sistem Sikawan SDN Babelan Kota 01.`;
      const blob = new Blob([content], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.storedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Grouping by Teacher for "Folder Arsip Guru" tab
  const teacherFolderGroups = teachers.map(teacher => {
    const teacherSubmissions = submissions.filter(
      s =>
        s.teacherId === teacher.id ||
        (teacher.nip && teacher.nip !== '-' && s.nip === teacher.nip) ||
        s.teacherName.trim().toLowerCase() === teacher.name.trim().toLowerCase()
    );
    const files: StoredFile[] = [];
    teacherSubmissions.forEach(s => {
      files.push(...s.files);
    });
    return {
      teacher,
      submissionsCount: teacherSubmissions.length,
      files,
      lastSubmitted: teacherSubmissions[0]?.submittedAt || null
    };
  });

  const resetFilters = () => {
    setSearchQuery('');
    setFilterTeacherId('all');
    setFilterReportType('all');
    setFilterBulan('all');
    setFilterStatus('all');
  };

  const hasActiveFilter = 
    searchQuery !== '' || 
    filterTeacherId !== 'all' || 
    filterReportType !== 'all' || 
    filterBulan !== 'all' || 
    filterStatus !== 'all';

  return (
    <div id="sikawan-right-panel" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* Panel Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-5 py-4 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/80 flex items-center justify-center border border-emerald-400/40 text-white">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Riwayat Pengiriman & Folder Berkas
              </h2>
              <p className="text-xs text-slate-300 font-normal">
                Laporan Terkirim, Status Kinerja, dan Berkas Hasil Kiriman
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              id="tab-riwayat-pengiriman"
              onClick={() => setActiveTab('riwayat')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'riwayat'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Riwayat ({filteredSubmissions.length})</span>
            </button>

            <button
              id="tab-folder-arsip"
              onClick={() => setActiveTab('folder-view')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'folder-view'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
              <span>Folder Guru</span>
            </button>

            <button
              id="tab-rekap-guru"
              onClick={() => setActiveTab('rekap-guru')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'rekap-guru'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-teal-300" />
              <span>Rekap</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar Area */}
      <div className="p-4 bg-slate-50/90 border-b border-slate-200 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          
          {/* Search Box */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari guru, NIP, kegiatan..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Teacher */}
          <div className="sm:col-span-3">
            <select
              value={filterTeacherId}
              onChange={e => setFilterTeacherId(e.target.value)}
              className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">Semua Guru ({teachers.length})</option>
              {[...teachers]
                .sort((a, b) => a.name.localeCompare(b.name, 'id'))
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Filter by Report Type */}
          <div className="sm:col-span-2">
            <select
              value={filterReportType}
              onChange={e => setFilterReportType(e.target.value)}
              className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">Semua Jenis</option>
              <option value="harian">Harian</option>
              <option value="bulanan">Bulanan</option>
              <option value="keduanya">Keduanya</option>
            </select>
          </div>

          {/* Filter by Month */}
          <div className="sm:col-span-2">
            <select
              value={filterBulan}
              onChange={e => setFilterBulan(e.target.value)}
              className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">Semua Bulan 2026</option>
              {MONTH_NAMES_2026.map(m => (
                <option key={m} value={m}>
                  {m} 2026
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filter Button */}
          <div className="sm:col-span-1 flex items-center">
            {hasActiveFilter ? (
              <button
                onClick={resetFilters}
                className="w-full py-2 px-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1 border border-rose-200"
                title="Reset Semua Filter"
              >
                <X className="w-3.5 h-3.5" />
                <span className="sm:hidden">Reset</span>
              </button>
            ) : (
              <div className="w-full py-2 text-center text-slate-400 text-xs hidden sm:block">
                <Filter className="w-3.5 h-3.5 mx-auto" />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main List Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        {/* TAB 1: RIWAYAT PENGIRIMAN LIST */}
        {activeTab === 'riwayat' && (
          <>
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Belum Ada Laporan Yang Sesuai Filter
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  {hasActiveFilter 
                    ? 'Coba sesuaikan kata kunci pencarian atau reset filter untuk melihat data lainnya.'
                    : 'Gunakan formulir di sebelah kiri untuk mengirimkan laporan kinerja harian atau bulanan.'}
                </p>
                {hasActiveFilter && (
                  <button
                    onClick={resetFilters}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline"
                  >
                    Reset Filter
                  </button>
                )}
              </div>
            ) : (
              filteredSubmissions.map(submission => (
                <div
                  key={submission.id}
                  id={`submission-card-${submission.id}`}
                  className="bg-white rounded-xl border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Card Header: Teacher info + Badges */}
                  <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs">
                        {submission.teacherName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">
                            {submission.teacherName}
                          </h4>
                          {/* Report Type Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              submission.reportType === 'harian'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : submission.reportType === 'bulanan'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                                : 'bg-purple-100 text-purple-800 border border-purple-300'
                            }`}
                          >
                            {submission.reportType === 'harian'
                              ? 'Kinerja Harian'
                              : submission.reportType === 'bulanan'
                              ? 'Kinerja Bulanan'
                              : 'Harian & Bulanan'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mt-0.5 flex-wrap">
                          <span>NIP. {submission.nip}</span>
                          <span>•</span>
                          <span className="font-sans font-medium text-slate-600">{submission.jabatan}</span>
                        </div>
                      </div>
                    </div>

                    {/* Timestamp & Status Pill */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {/* Status Verifikasi Toggle */}
                      <button
                        onClick={() => 
                          onUpdateStatus(
                            submission.id, 
                            submission.status === 'Diverifikasi' ? 'Terkirim' : 'Diverifikasi'
                          )
                        }
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
                          submission.status === 'Diverifikasi'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                        }`}
                        title="Klik untuk mengubah status verifikasi laporan"
                      >
                        {submission.status === 'Diverifikasi' ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Diverifikasi</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Terkirim</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Card Body: Periode, Uraian & Capaian */}
                  <div className="p-4 space-y-3">
                    
                    {/* Meta bar: Tanggal & Bulan */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tanggal Kinerja: <strong className="text-slate-900">{formatIndonesianDate(submission.tanggalKinerja)}</strong></span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div>
                        <span>Periode: <strong className="text-slate-900">{submission.bulanPeriode} 2026</strong></span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="text-slate-500 text-[11px]">
                        Waktu Kirim: {formatIndonesianDateTime(submission.submittedAt)}
                      </div>
                    </div>

                    {/* Uraian Kinerja (if provided) */}
                    {submission.uraianKinerja && (
                      <div className="text-xs text-slate-800 leading-relaxed bg-white">
                        <p className="font-semibold text-slate-700 mb-0.5">Catatan Laporan Pegawai:</p>
                        <p className="whitespace-pre-line text-slate-600 pl-2 border-l-2 border-emerald-500 text-[11.5px]">
                          {submission.uraianKinerja}
                        </p>
                      </div>
                    )}

                    {/* Stored Files (Saved according to user format & folder path) */}
                    <div className="space-y-2 pt-1 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                        <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
                        <span>Berkas File Tersimpan ({submission.files.length}):</span>
                      </p>

                      <div className="grid grid-cols-1 gap-2">
                        {submission.files.map(file => (
                          <div
                            key={file.id}
                            className="bg-slate-50/90 hover:bg-emerald-50/40 p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  file.category === 'harian' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-indigo-100 text-indigo-800'
                                }`}>
                                  {file.category}
                                </span>
                                <p className="text-xs font-mono font-bold text-slate-900 truncate" title={file.storedFileName}>
                                  {file.storedFileName}
                                </p>
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1 truncate">
                                <Folder className="w-3 h-3 text-amber-500 flex-shrink-0" />
                                <span>{file.folderPath}</span>
                                <span>•</span>
                                <span>{formatBytes(file.fileSize)}</span>
                              </p>
                            </div>

                            {/* File Actions */}
                            <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center">
                              <button
                                onClick={() => onPreviewFile(file, submission.teacherName)}
                                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 shadow-2xs transition-colors flex items-center gap-1"
                                title="Lihat Pratinjau Dokumen"
                              >
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Lihat</span>
                              </button>

                              <button
                                onClick={() => handleDownloadFile(file)}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                                title={`Unduh File: ${file.storedFileName}`}
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Unduh</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Card Footer: Receipt & Actions */}
                  <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onPrintReceipt(submission)}
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-800 font-semibold hover:text-emerald-950 hover:underline"
                    >
                      <Printer className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cetak Bukti Tanda Terima Sikawan</span>
                    </button>

                    {/* Delete with Confirmation */}
                    {deleteConfirmId === submission.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-rose-700 font-medium">Hapus?</span>
                        <button
                          onClick={() => {
                            onDeleteSubmission(submission.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-rose-600 text-white rounded-md text-[11px] font-bold hover:bg-rose-700"
                        >
                          Ya
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded-md text-[11px] hover:bg-slate-300"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(submission.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Hapus Laporan Kinerja"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              ))
            )}
          </>
        )}

        {/* TAB 2: FOLDER ARSIP GURU VIEW */}
        {activeTab === 'folder-view' && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <FolderArchive className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Repositori Folder Sikawan 2026:</strong>
                <p className="text-amber-800/90 text-[11px] mt-0.5">
                  Setiap guru memiliki folder terstruktur dengan sub-folder Harian dan Bulanan. Klik folder untuk meninjau atau membuka arsip berkas secara lengkap.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {teacherFolderGroups.map(group => (
                <div
                  key={group.teacher.id}
                  className="bg-white rounded-xl border border-slate-200 hover:border-emerald-400 p-3.5 transition-all shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
                        <Folder className="w-5 h-5 fill-amber-400 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {group.teacher.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Folder: /Arsip_2026/SDN_Babelan_Kota_01/{group.teacher.name}/
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                        {group.files.length} Berkas
                      </span>
                      <button
                        onClick={() => onOpenFileExplorer(group.teacher.name)}
                        className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 rounded-lg border border-slate-200"
                        title="Buka Folder Ini"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* List of files in this teacher's folder */}
                  {group.files.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                      {group.files.slice(0, 3).map(f => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 hover:bg-slate-100"
                        >
                          <span className="font-mono text-slate-700 truncate max-w-xs text-[11px]">
                            📄 {f.storedFileName}
                          </span>
                          <button
                            onClick={() => handleDownloadFile(f)}
                            className="text-emerald-700 hover:text-emerald-900 font-medium text-[11px] flex items-center gap-0.5 flex-shrink-0 ml-2"
                          >
                            <Download className="w-3 h-3" /> Unduh
                          </button>
                        </div>
                      ))}
                      {group.files.length > 3 && (
                        <p className="text-[10px] text-slate-400 italic pl-1">
                          + {group.files.length - 3} berkas lainnya di dalam folder...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REKAP KINERJA GURU 2026 */}
        {activeTab === 'rekap-guru' && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Rekapitulasi Kinerja Guru SDN Babelan Kota 01 Tahun 2026
                </h4>
                <span className="text-xs font-medium text-emerald-700">
                  Total Guru: {teachers.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">No</th>
                      <th className="p-2.5">Nama Guru & NIP</th>
                      <th className="p-2.5">Jabatan</th>
                      <th className="p-2.5 text-center">Harian</th>
                      <th className="p-2.5 text-center">Bulanan</th>
                      <th className="p-2.5 text-center">Total File</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teachers.map((teacher, idx) => {
                      const teacherSubs = submissions.filter(s => s.teacherId === teacher.id);
                      const harianSubs = teacherSubs.filter(s => s.reportType === 'harian' || s.reportType === 'keduanya').length;
                      const bulananSubs = teacherSubs.filter(s => s.reportType === 'bulanan' || s.reportType === 'keduanya').length;
                      const totalFiles = teacherSubs.reduce((acc, curr) => acc + curr.files.length, 0);

                      return (
                        <tr key={teacher.id} className="hover:bg-slate-50/80">
                          <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="p-2.5">
                            <div className="font-bold text-slate-900">{teacher.name}</div>
                            <div className="text-[10px] text-slate-500 font-mono">NIP. {teacher.nip}</div>
                          </td>
                          <td className="p-2.5 text-slate-600">{teacher.jabatan}</td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold text-[11px]">
                              {harianSubs}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-bold text-[11px]">
                              {bulananSubs}
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-bold text-slate-800">
                            {totalFiles}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

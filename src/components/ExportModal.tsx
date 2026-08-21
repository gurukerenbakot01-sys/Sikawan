import React, { useState } from 'react';
import { Submission, Teacher } from '../types';
import { DatabaseService } from '../services/db';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Database,
  Calendar,
  Sparkles
} from 'lucide-react';
import { formatIndonesianDate, formatIndonesianDateTime } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: Submission[];
  teachers: Teacher[];
  onDataImported: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  submissions,
  teachers,
  onDataImported
}) => {
  const [importStatus, setImportStatus] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Export to CSV format (Excel compatible)
  const handleExportCSV = () => {
    const headers = [
      'No',
      'ID Laporan',
      'Nama Guru',
      'NIP',
      'Jabatan',
      'Pangkat/Golongan',
      'Jenis Laporan',
      'Tanggal Kinerja',
      'Bulan Periode',
      'Tahun',
      'Uraian Kinerja',
      'Jumlah File',
      'Nama File Tersimpan',
      'Lokasi Folder Arsip',
      'Status Verifikasi',
      'Waktu Pengiriman'
    ];

    const rows = submissions.map((s, idx) => [
      idx + 1,
      s.id,
      `"${s.teacherName.replace(/"/g, '""')}"`,
      `'${s.nip}`,
      `"${s.jabatan.replace(/"/g, '""')}"`,
      `"${s.pangkatGolongan || '-'}"`,
      s.reportType.toUpperCase(),
      s.tanggalKinerja,
      s.bulanPeriode,
      s.tahunPeriode,
      `"${(s.uraianKinerja || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      s.files.length,
      `"${s.files.map(f => f.storedFileName).join('; ')}"`,
      `"${s.files.map(f => f.folderPath).join('; ')}"`,
      s.status,
      `"${formatIndonesianDateTime(s.submittedAt)}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekapitulasi_Sikawan_SDN_Babelan_Kota_01_Tahun_2026_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backup = DatabaseService.exportBackup();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Backup_Database_Sikawan_Babelan01_2026.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import JSON Backup
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const success = DatabaseService.importBackup(text);
        if (success) {
          setIsSuccess(true);
          setImportStatus('Data berhasil diimpor ke dalam sistem!');
          onDataImported();
        } else {
          setIsSuccess(false);
          setImportStatus('Format berkas JSON tidak valid.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-xl w-full flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Rekapitulasi & Ekspor Laporan Sikawan</h3>
              <p className="text-xs text-emerald-300">
                SD NEGERI BABELAN KOTA 01 • Tahun 2026
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs">
          
          {importStatus && (
            <div className={`p-3 rounded-xl border flex items-center gap-2 ${
              isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              {isSuccess ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{importStatus}</span>
            </div>
          )}

          {/* Option 1: Export CSV/Excel */}
          <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <div>
                  <h4 className="font-bold text-slate-900">Unduh Rekapitulasi Excel / CSV</h4>
                  <p className="text-[11px] text-slate-500">
                    Ekspor seluruh data laporan kinerja tahun 2026 ke format spreadsheet lengkap.
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={handleExportCSV}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Rekap Data ({submissions.length} Laporan)</span>
              </button>
            </div>
          </div>

          {/* Option 2: Database Backup JSON */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-slate-700" />
              <div>
                <h4 className="font-bold text-slate-900">Cadangkan / Pulihkan Database</h4>
                <p className="text-[11px] text-slate-500">
                  Simpan cadangan database guru & laporan atau pulihkan dari file cadangan sebelumnya.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={handleExportJSON}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cadangkan JSON</span>
              </button>

              <label className="py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold flex items-center justify-center gap-1.5 cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5" />
                <span>Pulihkan JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 text-xs"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

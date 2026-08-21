import React from 'react';
import { Submission } from '../types';
import { 
  CheckCircle2, 
  X, 
  Printer, 
  FolderCheck, 
  FileCheck, 
  Calendar, 
  User, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatIndonesianDate, formatIndonesianDateTime, formatBytes } from '../utils/formatters';

interface SuccessPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  onPrintReceipt: (sub: Submission) => void;
}

export const SuccessPopupModal: React.FC<SuccessPopupModalProps> = ({
  isOpen,
  onClose,
  submission,
  onPrintReceipt
}) => {
  if (!isOpen || !submission) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-emerald-300 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Top Celebration Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white text-emerald-600 mx-auto flex items-center justify-center shadow-lg mb-3">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-xs">
            BERHASIL DI SIMPAN
          </h2>
          <p className="text-xs text-emerald-100 mt-1 font-medium">
            Laporan Kinerja Sikawan SD NEGERI BABELAN KOTA 01 Tahun 2026
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs bg-slate-50/50">
          
          {/* Identity Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Rincian Laporan Pegawai
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Status: Terkirim
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Nama Guru</span>
              <span className="col-span-2 font-bold text-slate-900">: {submission.teacherName}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">NIP Pegawai</span>
              <span className="col-span-2 font-mono font-bold text-slate-900">: {submission.nip}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Jabatan</span>
              <span className="col-span-2 text-slate-800">: {submission.jabatan}</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Periode</span>
              <span className="col-span-2 text-slate-800 font-semibold">: {submission.bulanPeriode} 2026</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="text-slate-500 font-medium">Waktu Kirim</span>
              <span className="col-span-2 text-slate-700 font-mono">: {formatIndonesianDateTime(submission.submittedAt)}</span>
            </div>
          </div>

          {/* Stored Files */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
              <FolderCheck className="w-4 h-4 text-emerald-600" />
              <span>Berkas Tersimpan ({submission.files.length} File):</span>
            </div>

            <div className="space-y-1.5">
              {submission.files.map((file, idx) => (
                <div key={file.id} className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200/80 text-[11px] space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="truncate">{idx + 1}. {file.storedFileName}</span>
                    <span className="font-mono text-emerald-800 text-[10px] ml-2 flex-shrink-0">
                      {formatBytes(file.fileSize)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Folder: {file.folderPath}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="bg-white px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            onClick={() => {
              onClose();
              onPrintReceipt(submission);
            }}
            className="w-full sm:flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Bukti Tanda Terima</span>
          </button>
          
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { Submission } from '../types';
import { 
  formatIndonesianDate, 
  formatIndonesianDateTime, 
  formatBytes 
} from '../utils/formatters';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  QrCode,
  FileCheck,
  Calendar,
  User,
  Briefcase,
  FolderArchive
} from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  submission
}) => {
  if (!isOpen || !submission) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = `SIKAWAN/BK01/${submission.tahunPeriode}/${submission.id.replace('sub-', '')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Top Action Bar (hidden on print) */}
        <div className="bg-slate-900 px-6 py-3 text-white flex items-center justify-between print:hidden">
          <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Pratinjau Bukti Tanda Terima Sikawan 2026</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Document */}
        <div id="printable-receipt" className="p-8 overflow-y-auto flex-1 bg-white text-slate-900 font-sans space-y-6">
          
          {/* Official Letterhead (KOP SURAT RESMI) */}
          <div className="border-b-4 border-double border-slate-900 pb-4 text-center relative">
            <div className="flex items-center justify-center gap-4">
              <div className="w-18 h-18 rounded-xl bg-white p-1 flex items-center justify-center flex-shrink-0 border-2 border-slate-900 shadow-xs overflow-hidden">
                <img 
                  src="https://i.ibb.co.com/yBq5zBnX/logo-bakot-01.png" 
                  alt="Logo SD Negeri Babelan Kota 01" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-widest uppercase text-slate-700">
                  PEMERINTAH KABUPATEN BEKASI • DINAS PENDIDIKAN
                </h4>
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 uppercase">
                  SD NEGERI BABELAN KOTA 01
                </h2>
                <p className="text-[11px] text-slate-600">
                  Jl. Raya Babelan Kota No. 01, Kec. Babelan, Kabupaten Bekasi, Jawa Barat 17610
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  NPSN: 20219135 • Akreditasi A • Email: sdn.babelankota01@bekasikab.go.id
                </p>
              </div>
            </div>
          </div>

          {/* Receipt Title & Verification Code */}
          <div className="text-center space-y-1">
            <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-slate-900 underline decoration-2 underline-offset-4">
              TANDA TERIMA PENYAMPAIAN LAPORAN KINERJA PEGAWAI (SIKAWAN)
            </h3>
            <p className="text-xs font-mono font-bold text-emerald-800">
              No. Registrasi: {receiptNumber}
            </p>
            <p className="text-[11px] text-slate-500">
              Tahun Anggaran 2026
            </p>
          </div>

          {/* Data Pegawai Table */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-300">
              I. IDENTITAS PEGAWAI / GURU
            </div>
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Nama Lengkap</span>
                <span className="col-span-2 font-bold text-slate-900">: {submission.teacherName}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">NIP Pegawai</span>
                <span className="col-span-2 font-mono font-bold text-slate-900">: {submission.nip}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Jabatan / Tugas</span>
                <span className="col-span-2 text-slate-800">: {submission.jabatan}</span>
              </div>
              {submission.pangkatGolongan && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Pangkat / Golongan</span>
                  <span className="col-span-2 text-slate-800">: {submission.pangkatGolongan}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Unit Kerja</span>
                <span className="col-span-2 text-slate-800">: SD NEGERI BABELAN KOTA 01</span>
              </div>
            </div>
          </div>

          {/* Rincian Laporan Kinerja */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-300">
              II. RINCIAN LAPORAN KINERJA SIKAWAN
            </div>
            <div className="p-3 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Jenis Laporan</span>
                <span className="col-span-2 font-bold uppercase text-emerald-800">
                  : {submission.reportType === 'harian' ? 'Laporan Kinerja Harian' : submission.reportType === 'bulanan' ? 'Laporan Kinerja Bulanan' : 'Laporan Harian & Bulanan'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Tanggal Kinerja</span>
                <span className="col-span-2 font-semibold text-slate-800">: {formatIndonesianDate(submission.tanggalKinerja)}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Bulan Periode</span>
                <span className="col-span-2 text-slate-800">: {submission.bulanPeriode} {submission.tahunPeriode}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500 font-medium">Waktu Pengiriman</span>
                <span className="col-span-2 font-mono text-slate-700">: {formatIndonesianDateTime(submission.submittedAt)}</span>
              </div>
              {submission.uraianKinerja && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-slate-500 font-medium">Uraian Ringkas</span>
                  <span className="col-span-2 text-slate-700 whitespace-pre-line">: {submission.uraianKinerja}</span>
                </div>
              )}
            </div>
          </div>

          {/* Berkas Hasil Kiriman & Folder Path */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-slate-800 border-b border-slate-300">
              III. BERKAS DOKUMEN TERSIMPAN DI REPOSITORI
            </div>
            <div className="p-3 space-y-2">
              {submission.files.map((f, idx) => (
                <div key={f.id} className="p-2 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 font-mono">
                      {idx + 1}. {f.storedFileName}
                    </span>
                    <span className="font-mono text-slate-500 text-[10px]">
                      {formatBytes(f.fileSize)}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Lokasi Folder: {f.folderPath}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legalitas, QR Verification & Signatures */}
          <div className="pt-4 flex items-end justify-between text-xs">
            
            {/* Digital Stamp & QR */}
            <div className="space-y-1.5 text-center sm:text-left">
              <div className="w-20 h-20 border-2 border-dashed border-slate-400 rounded-lg flex items-center justify-center p-1 bg-slate-50">
                <QrCode className="w-16 h-16 text-slate-800" />
              </div>
              <p className="text-[9px] text-slate-400 font-mono uppercase">
                Validasi Sistem Sikawan 2026
              </p>
            </div>

            {/* Signature Box */}
            <div className="text-center w-56 space-y-12">
              <div>
                <p className="text-slate-600 text-[11px]">Babelan, {formatIndonesianDate(submission.tanggalKinerja)}</p>
                <p className="font-bold text-slate-900">Kepala Sekolah / Verifikator,</p>
              </div>

              <div>
                <p className="font-bold text-slate-900 underline">Lailatul Fajriah, S.Pd.SD.</p>
                <p className="text-[10px] text-slate-500 font-mono">NIP. 197808202008012005</p>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 print:hidden">
          <span>Format tanda terima resmi sesuai tata kelola persuratan sekolah</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};

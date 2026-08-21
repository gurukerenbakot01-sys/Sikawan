import React from 'react';
import { StoredFile } from '../types';
import { 
  Eye, 
  X, 
  Download, 
  FileText, 
  FolderArchive, 
  Calendar, 
  ShieldCheck,
  Building2,
  HardDrive
} from 'lucide-react';
import { formatBytes, formatIndonesianDateTime } from '../utils/formatters';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: StoredFile | null;
  teacherName?: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  teacherName
}) => {
  if (!isOpen || !file) return null;

  const handleDownload = () => {
    if (file.dataUrl) {
      const link = document.createElement('a');
      link.href = file.dataUrl;
      link.download = file.storedFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const content = `LAPORAN KINERJA PEGAWAI SIKAWAN 2026\nSD NEGERI BABELAN KOTA 01\n\nNama Berkas: ${file.storedFileName}\nFolder: ${file.folderPath}\nWaktu Unggah: ${formatIndonesianDateTime(file.uploadDate)}`;
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

  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType.includes('pdf') || file.storedFileName.endsWith('.pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm sm:text-base font-bold truncate">
                {file.storedFileName}
              </h3>
              <p className="text-xs text-emerald-300 font-mono">
                {file.folderPath}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-100">
          
          {/* Metadata Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Kategori</span>
              <span className="font-bold text-emerald-800 uppercase">{file.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Ukuran File</span>
              <span className="font-mono font-bold text-slate-800">{formatBytes(file.fileSize)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Waktu Pengunggahan</span>
              <span className="text-slate-800">{formatIndonesianDateTime(file.uploadDate)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Status Verifikasi</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            </div>
          </div>

          {/* Document Render Area */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 min-h-[300px] flex flex-col items-center justify-center text-center">
            {isImage && file.dataUrl ? (
              <img 
                src={file.dataUrl} 
                alt={file.storedFileName} 
                className="max-h-[400px] max-w-full rounded-lg object-contain border border-slate-200 shadow-sm"
              />
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {file.storedFileName}
                  </h4>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    Nama Asli: {file.originalName}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 text-left">
                  <p className="font-bold">Dokumen Terarsip Resmi:</p>
                  <p className="text-[11px] mt-0.5 text-emerald-800">
                    File ini telah tersimpan dalam repositori digital SD NEGERI BABELAN KOTA 01 Tahun 2026. Anda dapat mengunduh berkas fisik dokumen secara langsung.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono">
            {file.folderPath}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas Ini</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

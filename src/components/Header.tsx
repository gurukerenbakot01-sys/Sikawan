import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  FolderArchive, 
  FileSpreadsheet, 
  Sparkles,
  Award,
  RefreshCw
} from 'lucide-react';

interface HeaderProps {
  onOpenTeacherModal: () => void;
  onOpenFileExplorer: () => void;
  onOpenExportModal: () => void;
  totalTeachers: number;
  totalSubmissions: number;
  syncStatus?: 'connected' | 'connecting' | 'offline';
}

export const Header: React.FC<HeaderProps> = ({
  onOpenTeacherModal,
  onOpenFileExplorer,
  onOpenExportModal,
  totalTeachers,
  totalSubmissions,
  syncStatus = 'connected'
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) + ' WIB'
      );
      setCurrentDate(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header id="sikawan-main-header" className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border-b border-emerald-800/40 shadow-lg sticky top-0 z-30">
      {/* Top Notification Stripe */}
      <div className="bg-emerald-700/80 px-4 py-1 text-xs text-center text-emerald-50 flex items-center justify-center gap-2 font-medium tracking-wide">
        <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
        <span>Portal Resmi Sikawan (Sistem Informasi Kinerja Pegawai) • Dinas Pendidikan Kab. Bekasi • Oleh. Samsudin</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & School Identity */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex-shrink-0">
              <div className="w-13 h-13 rounded-xl bg-white/95 p-1 flex items-center justify-center shadow-md shadow-emerald-950/50 border border-emerald-400/40 overflow-hidden">
                <img 
                  src="https://i.ibb.co.com/yBq5zBnX/logo-bakot-01.png" 
                  alt="Logo SD Negeri Babelan Kota 01" 
                  className="w-full h-full object-contain drop-shadow-xs"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 border-2 border-slate-900 shadow-xs" title="Tahun 2026">
                26
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded text-[11px] font-semibold tracking-wider uppercase">
                  SIKAWAN 2026
                </span>
                <span className="text-xs text-slate-300 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  NPSN: 20219135 • Akreditasi A
                </span>
                {/* Live Real-Time Indicator */}
                <span 
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                    syncStatus === 'connected' 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' 
                      : syncStatus === 'connecting'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                      : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                  }`}
                  title={
                    syncStatus === 'connected'
                      ? 'Tersambung Real-Time ke Server Terpusat • Semua Laporan & Folder Tersimpan Permanen'
                      : syncStatus === 'connecting'
                      ? 'Sedang menghubungkan ke server real-time...'
                      : 'Mode Offline • Data disimpan di perangkat & akan disinkron saat online'
                  }
                >
                  <span className={`w-2 h-2 rounded-full ${
                    syncStatus === 'connected' 
                      ? 'bg-emerald-400 animate-pulse' 
                      : syncStatus === 'connecting'
                      ? 'bg-amber-400 animate-ping'
                      : 'bg-rose-400'
                  }`} />
                  <span>{syncStatus === 'connected' ? 'LIVE REAL-TIME' : syncStatus === 'connecting' ? 'CONNECTING...' : 'OFFLINE'}</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2 mt-0.5">
                SD NEGERI BABELAN KOTA 01
              </h1>
              <p className="text-xs sm:text-sm text-emerald-200/80 font-normal">
                Laporan Kinerja Harian & Bulanan Guru dan Tenaga Kependidikan
              </p>
            </div>
          </div>

          {/* Right Section: Live Time & Quick Management Navigation */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Clock Widget */}
            <div className="hidden lg:flex flex-col items-end px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-right">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>{currentDate || '19 Agustus 2026'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300">
                <Clock className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
                <span>{currentTime || '08:00:00 WIB'}</span>
              </div>
            </div>

            {/* Quick Action: Master Data Guru */}
            <button
              id="btn-open-teacher-db"
              onClick={onOpenTeacherModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/80 text-emerald-100 text-xs font-medium border border-emerald-600/40 transition-all shadow-sm active:scale-95"
              title="Kelola Master Data Guru & NIP"
            >
              <Users className="w-4 h-4 text-emerald-300" />
              <span>Database Guru</span>
              <span className="ml-1 px-1.5 py-0.2 bg-emerald-500/30 rounded-full text-[10px] font-bold text-white">
                {totalTeachers}
              </span>
            </button>

            {/* Quick Action: Virtual Folder Arsip */}
            <button
              id="btn-open-folder-explorer"
              onClick={onOpenFileExplorer}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600/50 transition-all shadow-sm active:scale-95"
              title="Lihat Struktur Folder Penyimpanan File"
            >
              <FolderArchive className="w-4 h-4 text-amber-400" />
              <span>Folder Arsip</span>
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded-full text-[10px] font-bold">
                {totalSubmissions} File
              </span>
            </button>

            {/* Quick Action: Rekap / Export */}
            <button
              id="btn-open-export-modal"
              onClick={onOpenExportModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-600/50 transition-all shadow-sm active:scale-95"
              title="Rekapitulasi Kinerja Guru 2026"
            >
              <FileSpreadsheet className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline">Rekap Data</span>
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
